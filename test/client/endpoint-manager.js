/* global describe, it, beforeEach */

const proxyquire = require('proxyquire')
const assert = require('assert')
const TModel = require('t-model')

const stubs = require('../stubs')

const EndpointInfo = require('../../lib/util/endpoint-info')
const ObjectInfo = require('../../lib/util/object-info')
const SetInfo = require('../../lib/util/set-info')
const TafProtocolClient = require('../../lib/protocols/taf/client')
const RequestMessage = require('../../lib/util/request-message')
const { ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf
const { RpcError, ClientNoAdapterError } = require('../../lib/util/rpc-error')

describe('EndpointManager', () => {
  const EndpointManager = proxyquire('../../lib/client/endpoint-manager', {
    net: stubs.net
  })
  let endpoint = new EndpointInfo({
    protocolName: 'tcp',
    host: 'host',
    port: 1,
    timeout: 1000
  })
  let endpoint2 = new EndpointInfo({
    protocolName: 'tcp',
    host: 'host2',
    port: 2,
    timeout: 2000
  })
  let requestId = 1
  let funcName = 'funcName'
  let servantName = 'servantName'
  let appBuffer = Buffer.from([1, 43, 44535, 345, 3])
  let property = { context: { foo: 'bar', she: 'foo' } }
  let packetType = 2
  let requestMessage = new RequestMessage({
    requestId,
    servantName,
    funcName,
    appBuffer,
    property,
    packetType
  })
  let requestMessageWithHash = new RequestMessage({
    requestId,
    servantName,
    funcName,
    appBuffer,
    property: { hashCode: 0 },
    packetType
  })
  let iVersion = 1
  let cPacketType = 1
  let iRequestId = 1
  let iMessageType = 3
  let iRet = 0
  let sBuffer = Buffer.from([32, 234234, 42342, 32, 32421, 3242])
  let status = { foo: 'bar', bar: 'foo' }
  let sResultDesc = 'sResultDesc'
  let context = { foo: 'foo', bar: 'bar' }
  let responsePacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId, iMessageType, iRet, sBuffer, status, sResultDesc, context
  })
  let os = new TModel.TOutputStream()
  responsePacket.writeTo(os, os.tBuffer)
  let responseBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  responseBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(responseBuffer, 4)

  let objectInfo = new ObjectInfo({
    objName: 'objName',
    endpoints: [endpoint, endpoint2]
  })
  let objectInfoNeedRegistry = new ObjectInfo({ objName: 'objName' })
  let setInfo = new SetInfo({})

  beforeEach(() => stubs.clear())

  let registryResponseBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x3d, 0x10, 0x01, 0x2c, 0x30,
    0x01, 0x4c, 0x5c, 0x6d, 0x00, 0x00, 0x2a, 0x0c,
    0x29, 0x00, 0x01, 0x0a, 0x06, 0x0e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x32, 0x2e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x11, 0x42, 0x69, 0x22,
    0x00, 0x00, 0xea, 0x60, 0x30, 0x01, 0x4c, 0x50,
    0xff, 0x60, 0xff, 0x76, 0x00, 0x8c, 0x0b, 0x39,
    0x0c, 0x78, 0x0c, 0x86, 0x00
  ])
  let registryResponseBuffer2 = Buffer.from([
    0x00, 0x00, 0x00, 0x3d, 0x10, 0x01, 0x2c, 0x30,
    0x02, 0x4c, 0x5c, 0x6d, 0x00, 0x00, 0x2a, 0x0c,
    0x29, 0x00, 0x01, 0x0a, 0x06, 0x0e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x32, 0x2e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x11, 0x42, 0x6a, 0x22,
    0x00, 0x00, 0xea, 0x60, 0x30, 0x01, 0x4c, 0x50,
    0xff, 0x60, 0xff, 0x76, 0x00, 0x8c, 0x0b, 0x39,
    0x0c, 0x78, 0x0c, 0x86, 0x00
  ])
  let registryResponseBuffer3 = Buffer.from([
    0x00, 0x00, 0x00, 0x3d, 0x10, 0x01, 0x2c, 0x30,
    0x03, 0x4c, 0x5c, 0x6d, 0x00, 0x00, 0x2a, 0x0c,
    0x29, 0x00, 0x01, 0x0a, 0x06, 0x0e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x32, 0x2e, 0x32, 0x32,
    0x32, 0x2e, 0x32, 0x32, 0x11, 0x42, 0x69, 0x22,
    0x00, 0x00, 0xea, 0x60, 0x30, 0x01, 0x4c, 0x50,
    0xff, 0x60, 0xff, 0x76, 0x00, 0x8c, 0x0b, 0x39,
    0x0c, 0x78, 0x0c, 0x86, 0x00
  ])

  let registryEmptyResponseBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x10, 0x01, 0x2c, 0x30,
    0x01, 0x4c, 0x5c, 0x6d, 0x00, 0x00, 0x05, 0x0c,
    0x29, 0x0c, 0x39, 0x0c, 0x78, 0x0c, 0x86, 0x00
  ])

  let errorResponseBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x15, 0x10, 0x01, 0x2c, 0x30,
    0x01, 0x4c, 0x50, 0xfd, 0x6d, 0x00, 0x0c, 0x78,
    0x0c, 0x86, 0x00, 0x98, 0x0c
  ])

  it('test', done => {
    let endpointManager = new EndpointManager(objectInfo, setInfo, TafProtocolClient)
    endpointManager.selectAdapterProxy(requestMessage).then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessage)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      let socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [endpoint.port, endpoint.host])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 100)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 200)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessage)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        return Promise.resolve()
      })
    }).then(() => {
      return endpointManager.selectAdapterProxy(requestMessage)
    }).then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessage)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 2)
      let socketStub = socketStubs[1]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [endpoint2.port, endpoint2.host])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 100)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 200)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessage)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        return Promise.resolve()
      })
    }).then(done).catch(done)
  })
  it('select adapter with hash', done => {
    let endpointManager = new EndpointManager(objectInfo, setInfo, TafProtocolClient)
    endpointManager.selectAdapterProxy(requestMessageWithHash).then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessageWithHash)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      let socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [endpoint.port, endpoint.host])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 100)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 200)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessageWithHash)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        return Promise.resolve()
      })
    }).then(() => {
      return endpointManager.selectAdapterProxy(requestMessageWithHash)
    }).then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessageWithHash)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      let socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [endpoint.port, endpoint.host])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 100)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 200)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessageWithHash)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        return Promise.resolve()
      })
    }).then(done).catch(done)
  })
  it('use registry', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      registrySocketStub.emit('data', registryResponseBuffer)
    }, 200)

    selectPromise.then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessage)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 2)
      let socketStub = socketStubs[1]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [17001, '222.222.222.22'])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 300)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 400)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessage)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        return Promise.resolve()
      })
    }).then(done).catch(done)
  })
  it('no locator', () => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient)
    assert.throws(() => endpointManager.selectAdapterProxy(requestMessage))
  })
  it('registry error', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      registrySocketStub.emit('data', errorResponseBuffer)
    }, 200)

    selectPromise.then(({ adapterProxy }) => {
      done(new Error('?'))
    }).catch(error => {
      assert(error instanceof RpcError)
      assert(error instanceof ClientNoAdapterError)
      done()
    })
  })
  it('registry timeout', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    selectPromise.then(({ adapterProxy }) => {
      done(new Error('?'))
    }).catch(error => {
      assert(error instanceof RpcError)
      assert(error instanceof ClientNoAdapterError)
      done()
    })
  })
  it('no adapter avaliable', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      registrySocketStub.emit('data', registryEmptyResponseBuffer)
    }, 200)

    selectPromise.then(() => {
      done(new Error('meo meo meo'))
    }).catch(error => {
      assert(error instanceof RpcError)
      assert(error instanceof ClientNoAdapterError)
      done()
    })
  })
  it('merge', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    }, {
      refreshInterval: 100
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      registrySocketStub.emit('data', registryResponseBuffer)
    }, 200)

    setTimeout(() => {
      registrySocketStub.emit('data', registryResponseBuffer2)
    }, 1000)

    setTimeout(() => {
      registrySocketStub.emit('data', registryResponseBuffer3)
    }, 1500)

    selectPromise.then(({ adapterProxy }) => {
      assert.equal(adapterProxy.endpoint.protocolName, 'tcp')
      assert.equal(adapterProxy.endpoint.host, '222.222.222.22')
      assert.equal(adapterProxy.endpoint.port, 17001)
      setTimeout(() => {
        endpointManager.selectAdapterProxy(requestMessage).then(({ adapterProxy }) => {
          assert.equal(adapterProxy.endpoint.protocolName, 'tcp')
          assert.equal(adapterProxy.endpoint.host, '222.222.222.22')
          assert.equal(adapterProxy.endpoint.port, 17001)
          setTimeout(() => {
            endpointManager.selectAdapterProxy(requestMessage).then(({ adapterProxy }) => {
              assert.equal(adapterProxy.endpoint.protocolName, 'tcp')
              assert.equal(adapterProxy.endpoint.host, '222.222.222.22')
              assert.equal(adapterProxy.endpoint.port, 17002)
              done()
            }).catch(done)
          }, 200)
        }).catch(done)
      }, 200)
    }).catch(done)
  })
  it('destroy without registry', done => {
    let endpointManager = new EndpointManager(objectInfo, setInfo, TafProtocolClient)
    endpointManager.selectAdapterProxy(requestMessage).then(({ adapterProxy }) => {
      let promise = adapterProxy.doRequest(requestMessage)

      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      let socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [endpoint.port, endpoint.host])

      setTimeout(() => {
        socketStub.emit('connect')
      }, 100)

      setTimeout(() => {
        socketStub.emit('data', responseBuffer)
      }, 200)

      return promise.then(result => {
        assert.deepEqual(result.requestMessage, requestMessage)
        assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
        assert.equal(result.responseMessage.code, iRet)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        assert.equal(adapterProxy._queue.length, 0)
        assert.equal(adapterProxy._timeoutQueue.length, 0)

        endpointManager.destroy()

        assert(socketStub._destroySpy.callCount, 1)

        done()
      }).catch(done)
    })
  })
  it('destroy with registry', done => {
    let endpointManager = new EndpointManager(objectInfoNeedRegistry, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })

    let selectPromise = endpointManager.selectAdapterProxy(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let registrySocketStub = socketStubs[0]
    assert.equal(registrySocketStub._connectSpy.callCount, 1)
    let registryConnectSpyCall = registrySocketStub._connectSpy.getCall(0)
    assert.deepEqual(registryConnectSpyCall.args, [1, 'locator-host'])

    setTimeout(() => {
      registrySocketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      registrySocketStub.emit('data', registryResponseBuffer)
    }, 200)

    selectPromise.then(({ adapterProxy }) => {
      assert.equal(adapterProxy.endpoint.protocolName, 'tcp')
      assert.equal(adapterProxy.endpoint.host, '222.222.222.22')
      assert.equal(adapterProxy.endpoint.port, 17001)

      endpointManager.destroy()

      assert.equal(registrySocketStub._destroySpy.callCount, 1)

      done()
    }).catch(done)
  })
})
