/* global describe, it, beforeEach */

const proxyquire = require('proxyquire')
const assert = require('assert')
const TModel = require('t-model')

const stubs = require('../stubs')

const ObjectInfo = require('../../lib/util/object-info')
const SetInfo = require('../../lib/util/set-info')
const TafProtocolClient = require('../../lib/protocols/taf/client')
const { ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf

const ObjectProxy = proxyquire('../../lib/client/object-proxy', {
  net: stubs.net
})

describe('ObjectProxy', () => {
  let objectInfo = ObjectInfo.parse('objName@tcp -h host1 -p 1 -t 1000:tcp -h host2 -p 2 -t 2000')
  let objectInfoWithoutEndpoint = ObjectInfo.parse('objName')
  let setInfo = SetInfo.parse('foo')

  let funcName = 'funcName'
  let appBuffer = Buffer.from([1, 43, 44535, 345, 3])
  let packetType = 0
  let dyeing = 'dyeing'
  let hashCode = 'hashCode'

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

  let responseErrorPacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId, iMessageType, iRet: -1, sBuffer, status, sResultDesc, context
  })

  os = new TModel.TOutputStream()
  responseErrorPacket.writeTo(os, os.tBuffer)
  let responseErrorBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  responseErrorBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(responseErrorBuffer, 4)

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

  beforeEach(() => stubs.clear())

  it('test', done => {
    let objectProxy = new ObjectProxy(objectInfo, setInfo, TafProtocolClient, null)
    let promise = objectProxy.invoke(funcName, appBuffer, { packetType, dyeing, context, hashCode })

    let socketStub

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [1, 'host1'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.then(result => {
      assert.deepEqual(result.requestMessage.requestId, 1)
      assert.deepEqual(result.requestMessage.servantName, 'objName')
      assert.deepEqual(result.requestMessage.funcName, funcName)
      assert.deepEqual(result.requestMessage.appBuffer, appBuffer)
      assert.deepEqual(result.requestMessage.property, { packetType, dyeing, context, hashCode })
      assert.deepEqual(result.requestMessage.packetType, packetType)

      assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
      assert.equal(result.responseMessage.code, iRet)
      assert.equal(result.responseMessage.message, sResultDesc)
      assert.equal(result.responseMessage.requestId, iRequestId)

      done()
    }, done)
  })
  it('with registry', done => {
    let objectProxy = new ObjectProxy(objectInfoWithoutEndpoint, setInfo, TafProtocolClient, {
      data: { taf: { application: { client: { locator: 'locator@tcp -h locator-host -p 1 -t 1000' } } } }
    })
    let promise = objectProxy.invoke(funcName, appBuffer, { packetType, dyeing, context, hashCode })

    let socketStub
    let socketStub2

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [1, 'locator-host'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', registryResponseBuffer)
    }, 200)

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 2)
      socketStub2 = socketStubs[1]
      assert.equal(socketStub2._connectSpy.callCount, 1)
      let spyCall = socketStub2._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [17001, '222.222.222.22'])
    }, 250)

    setTimeout(() => {
      socketStub2.emit('connect')
    }, 300)

    setTimeout(() => {
      socketStub2.emit('data', responseBuffer)
    }, 400)

    promise.then(result => {
      assert.deepEqual(result.requestMessage.requestId, 1)
      assert.deepEqual(result.requestMessage.servantName, 'objName')
      assert.deepEqual(result.requestMessage.funcName, funcName)
      assert.deepEqual(result.requestMessage.appBuffer, appBuffer)
      assert.deepEqual(result.requestMessage.property, { packetType, dyeing, context, hashCode })
      assert.deepEqual(result.requestMessage.packetType, packetType)

      assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
      assert.equal(result.responseMessage.code, iRet)
      assert.equal(result.responseMessage.message, sResultDesc)
      assert.equal(result.responseMessage.requestId, iRequestId)

      done()
    }, done)
  })
  it('invoke without property', done => {
    let objectProxy = new ObjectProxy(objectInfo, setInfo, TafProtocolClient, null)
    let promise = objectProxy.invoke(funcName, appBuffer)

    let socketStub

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [1, 'host1'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.then(result => {
      assert.deepEqual(result.requestMessage.requestId, 1)
      assert.deepEqual(result.requestMessage.servantName, 'objName')
      assert.deepEqual(result.requestMessage.funcName, funcName)
      assert.deepEqual(result.requestMessage.appBuffer, appBuffer)
      assert.deepEqual(result.requestMessage.property, {})
      assert.deepEqual(result.requestMessage.packetType, packetType)

      assert.deepEqual(result.responseMessage.responsePacket, responsePacket.valueOf())
      assert.equal(result.responseMessage.code, iRet)
      assert.equal(result.responseMessage.message, sResultDesc)
      assert.equal(result.responseMessage.requestId, iRequestId)

      done()
    }, done)
  })
  it('invoke error', done => {
    let objectProxy = new ObjectProxy(objectInfo, setInfo, TafProtocolClient, null)
    let promise = objectProxy.invoke(funcName, appBuffer)

    let socketStub

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [1, 'host1'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseErrorBuffer)
    }, 200)

    promise.then(result => {
      done(new Error('not here'))
    }, result => {
      try {
        assert.deepEqual(result.requestMessage.requestId, 1)
        assert.deepEqual(result.requestMessage.servantName, 'objName')
        assert.deepEqual(result.requestMessage.funcName, funcName)
        assert.deepEqual(result.requestMessage.appBuffer, appBuffer)
        assert.deepEqual(result.requestMessage.property, {})
        assert.deepEqual(result.requestMessage.packetType, packetType)

        assert.deepEqual(result.responseMessage.responsePacket, responseErrorPacket.valueOf())
        assert.equal(result.responseMessage.code, -1)
        assert.equal(result.responseMessage.message, sResultDesc)
        assert.equal(result.responseMessage.requestId, iRequestId)

        done()
      } catch (error) {
        done(error)
      }
    })
  })
  it('destroy', done => {
    let objectProxy = new ObjectProxy(objectInfo, setInfo, TafProtocolClient, null)
    let promise = objectProxy.invoke(funcName, appBuffer)

    let socketStub

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [1, 'host1'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.then(() => {
      objectProxy.destroy()
      assert.equal(socketStub._destroySpy.callCount, 1)
      done()
    }, done)
  })
})
