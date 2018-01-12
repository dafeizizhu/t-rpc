/* global describe, it, beforeEach */

const proxyquire = require('proxyquire')
const assert = require('assert')
const TModel = require('t-model')

const stubs = require('../stubs')

const EndpointInfo = require('../../lib/util/endpoint-info')
const TafProtocolClient = require('../../lib/protocols/taf/client')
const RequestMessage = require('../../lib/util/request-message')
const { ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf

const AdapterProxy = proxyquire('../../lib/client/adapter-proxy', {
  net: stubs.net
})

class ProtocolFeedError {
  feed (data) {
    throw new Error('foo')
  }
  on () {}
  reset () {}
  compose () {
    return Buffer.from([])
  }
}

class ProtocolComposeError {
  feed (data) {}
  on () {}
  reset () {}
  compose () {
    throw new Error('foo')
  }
}

describe('AdpaterProxy', () => {
  let endpoint = new EndpointInfo({
    protocolName: 'tcp',
    host: 'host',
    port: 1,
    timeout: 1000
  })
  let timeoutEndpoint = new EndpointInfo({
    protocolName: 'tcp',
    host: 'host',
    port: 1,
    timeout: 1
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
  let mismatchResponsePacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId: 3, iMessageType, iRet, sBuffer, status, sResultDesc, context
  })
  let errorResponsePacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId, iMessageType, iRet: -1, sBuffer, status, sResultDesc, context
  })

  let os = new TModel.TOutputStream()
  responsePacket.writeTo(os, os.tBuffer)
  let responseBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  responseBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(responseBuffer, 4)

  os = new TModel.TOutputStream()
  mismatchResponsePacket.writeTo(os, os.tBuffer)
  let mismatchResponseBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  mismatchResponseBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(mismatchResponseBuffer, 4)

  os = new TModel.TOutputStream()
  errorResponsePacket.writeTo(os, os.tBuffer)
  let errorResponseBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  errorResponseBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(errorResponseBuffer, 4)

  beforeEach(() => stubs.clear())

  it('test', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
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

    promise.then(result => {
      assert.deepEqual(result.requestMessage, requestMessage)
      assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
      assert.equal(result.responseMessage.code, iRet)
      assert.equal(result.responseMessage.message, sResultDesc)
      assert.equal(result.responseMessage.requestId, iRequestId)

      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 0)

      done()
    }).catch(done)
  })
  it('timeout', done => {
    let adapterProxy = new AdapterProxy(timeoutEndpoint, TafProtocolClient)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.catch(error => {
      assert.equal(error.message, 'timeout')
    })

    setTimeout(() => {
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 0)
      done()
    }, 1100)
  })
  it('mismatch response', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', mismatchResponseBuffer)
    }, 200)

    promise.then(() => {
      throw new Error('not here')
    }, error => {
      assert.equal(error.message, 'timeout')
    })

    setTimeout(() => {
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 1)
      done()
    }, 1500)
  })
  it('error response', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', errorResponseBuffer)
    }, 200)

    promise.then(() => {
      throw new Error('not here')
    }, error => {
      assert.equal(error.message, sResultDesc)
    })

    setTimeout(() => {
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 0)
      done()
    }, 1500)
  })
  it('destroy', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', mismatchResponseBuffer)
    }, 200)

    promise.then(() => {
      done(new Error('not here'))
    }, error => {
      assert.equal(error.message, 'timeout')
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 1)

      adapterProxy.destroy()

      assert.equal(socketStub._destroySpy.callCount, 1)
      assert.equal(adapterProxy._protocol, null)
      assert.equal(adapterProxy._transceiver, null)
      assert.equal(adapterProxy._queue, null)
      assert.equal(adapterProxy._timeoutQueue, null)

      done()
    })
  })
  it('feed error', done => {
    let adapterProxy = new AdapterProxy(timeoutEndpoint, ProtocolFeedError)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.catch(error => {
      assert.equal(error.message, 'timeout')
    })

    setTimeout(() => {
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 1)
      done()
    }, 1100)
  })
  it('compose error', done => {
    let adapterProxy = new AdapterProxy(timeoutEndpoint, ProtocolComposeError)
    let promise = adapterProxy.doRequest(requestMessage)

    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.catch(error => {
      assert.equal(error.message, 'compose error')
    })

    setTimeout(() => {
      assert.equal(adapterProxy._queue.length, 0)
      assert.equal(adapterProxy._timeoutQueue.length, 0)
      done()
    }, 1100)
  })
  it('send a one way message', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
    let promise = adapterProxy.doRequest(Object.assign({}, requestMessage, { packetType: 1 }))

    let socketStubs = stubs.net.getSocketStubs()
    assert.equal(socketStubs.length, 1)
    let socketStub = socketStubs[0]
    assert.equal(socketStub._connectSpy.callCount, 1)
    let spyCall = socketStub._connectSpy.getCall(0)
    assert.deepEqual(spyCall.args, [endpoint.port, endpoint.host])

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    promise.then(result => {
      done(new Error('?'))
    }).catch(error => {
      assert.equal(error.message, 'one way no response')
      done()
    })
  })
  it('destroy still doing request', done => {
    let adapterProxy = new AdapterProxy(endpoint, TafProtocolClient)
    adapterProxy.doRequest(requestMessage)
    let socketStubs = stubs.net.getSocketStubs()
    let socketStub = socketStubs[0]

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      adapterProxy.destroy()

      assert.equal(socketStub._destroySpy.callCount, 1)
      assert.equal(adapterProxy._protocol, null)
      assert.equal(adapterProxy._transceiver, null)
      assert.equal(adapterProxy._queue, null)
      assert.equal(adapterProxy._timeoutQueue, null)

      done()
    }, 200)
  })
})
