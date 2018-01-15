/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')
const TModel = require('t-model')

const stubs = require('../stubs')

const TafProtocolServer = require('../../lib/protocols/taf/server')
const EndpointInfo = require('../../lib/util/endpoint-info')
const ResponseMessage = require('../../lib/util/response-message')
const { RequestPacket, ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf

const BindAdapter = proxyquire('../../lib/server/bind-adapter', {
  net: stubs.net
})

describe('BindAdapter', () => {
  let host = 'mock host'
  let port = 123
  let endpointInfo = new EndpointInfo({ protocolName: 'tcp', host, port })
  let doRequestSpy = sinon.spy()
  let servant = {
    doRequest: (...args) => {
      doRequestSpy.apply(doRequestSpy, args)
      return Promise.resolve({ responseMessage })
    }
  }
  let servantThrows = {
    doRequest: () => {
      let error = new Error('foo')
      error.requestId = requestId
      throw error
    }
  }
  let servantReject = {
    doRequest: () => {
      let error = new Error('foo')
      error.requestId = requestId
      return Promise.reject(error)
    }
  }
  let servantThrowsWithoutRequestId = {
    doRequest: () => {
      let error = new Error('foo')
      throw error
    }
  }
  let socketStub

  let iMessageType = 0
  let sBuffer = Buffer.from([1, 23, 32, 324, 2, 2342])
  let context = { foo: 'bar' }
  let responsePacket = { iMessageType, sBuffer, context }
  let requestId = 1
  let code = 123
  let message = 'message'
  let responseMessage = new ResponseMessage({ responsePacket, requestId, code, message })

  let iVersion = 2
  let cPacketType = 3
  let iRequestId = 5
  let sServantName = 'sServantName'
  let sFuncName = 'sFuncName'
  let iTimeout = 6
  let status = { see: 'sae' }
  let requestPacket = new RequestPacket({
    iVersion,
    cPacketType,
    iMessageType,
    iRequestId,
    sServantName,
    sFuncName,
    sBuffer,
    iTimeout,
    context,
    status
  })
  let os = new TModel.TOutputStream()
  requestPacket.writeTo(os, os.tBuffer)
  let requestBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  requestBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(requestBuffer, 4)

  beforeEach(() => {
    socketStub = new stubs.net.Socket()
    stubs.clear()
  })

  it('test', done => {
    let bindAdapter = new BindAdapter(endpointInfo, TafProtocolServer, servant)
    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    bindAdapter.start()
    assert.equal(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, host])

    serverStub.emit('connection', socketStub)
    assert.equal(bindAdapter._dataAdapters.length, 1)

    socketStub.emit('data', requestBuffer)
    assert.equal(doRequestSpy.callCount, 1)
    let doRequestSpyCall = doRequestSpy.getCall(0)
    let requestMessage = doRequestSpyCall.args[0]
    assert.equal(requestMessage.requestId, iRequestId)
    assert.equal(requestMessage.funcName, sFuncName)
    assert.equal(requestMessage.servantName, sServantName)
    assert.deepEqual(requestMessage.appBuffer, sBuffer)
    assert.deepEqual(requestMessage.property, { context })
    assert.equal(requestMessage.packetType, cPacketType)

    setTimeout(() => {
      assert.equal(socketStub._writeSpy.callCount, 1)
      let writeSpyCall = socketStub._writeSpy.getCall(0)
      let b = writeSpyCall.args[0]
      let length = b.readUInt32BE(0)
      let is = new TModel.TInputStream(new TModel.TBuffer(b.slice(4, length)))
      assert.equal(is.tBuffer.length, length - 4)
      let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
      assert.equal(responsePacket.iVersion, 1)
      assert.equal(responsePacket.cPacketType, 0)
      assert.equal(responsePacket.iRequestId, requestId)
      assert.equal(responsePacket.iMessageType, iMessageType)
      assert.equal(responsePacket.iRet, code)
      assert.deepEqual(responsePacket.sBuffer, sBuffer)
      assert.deepEqual(responsePacket.status, {})
      assert.equal(responsePacket.sResultDesc, message)
      assert.deepEqual(responsePacket.context, context)

      done()
    }, 100)
  })
  it('servant throws', done => {
    let bindAdapter = new BindAdapter(endpointInfo, TafProtocolServer, servantThrows)
    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    bindAdapter.start()
    assert(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, host])

    serverStub.emit('connection', socketStub)
    assert.equal(bindAdapter._dataAdapters.length, 1)

    socketStub.emit('data', requestBuffer)

    setTimeout(() => {
      assert.equal(socketStub._writeSpy.callCount, 1)
      let writeSpyCall = socketStub._writeSpy.getCall(0)
      let b = writeSpyCall.args[0]
      let length = b.readUInt32BE(0)
      let is = new TModel.TInputStream(new TModel.TBuffer(b.slice(4, length)))
      assert.equal(is.tBuffer.length, length - 4)
      let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
      assert.equal(responsePacket.iVersion, 1)
      assert.equal(responsePacket.cPacketType, 0)
      assert.equal(responsePacket.iRequestId, requestId)
      assert.equal(responsePacket.iMessageType, iMessageType)
      assert.equal(responsePacket.iRet, -999)
      assert.deepEqual(responsePacket.sBuffer, Buffer.from([]))
      assert.deepEqual(responsePacket.status, {})
      assert.equal(responsePacket.sResultDesc, 'foo')
      assert.deepEqual(responsePacket.context, {})

      done()
    }, 100)
  })
  it('servant throws without requestId', () => {
    let bindAdapter = new BindAdapter(endpointInfo, TafProtocolServer, servantThrowsWithoutRequestId)
    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    bindAdapter.start()
    assert(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, host])

    serverStub.emit('connection', socketStub)
    assert.equal(bindAdapter._dataAdapters.length, 1)

    socketStub.emit('data', requestBuffer)
    assert.equal(bindAdapter._dataAdapters.length, 0)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('servant reject', done => {
    let bindAdapter = new BindAdapter(endpointInfo, TafProtocolServer, servantReject)
    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    bindAdapter.start()
    assert(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, host])

    serverStub.emit('connection', socketStub)
    assert.equal(bindAdapter._dataAdapters.length, 1)

    socketStub.emit('data', requestBuffer)

    setTimeout(() => {
      assert.equal(socketStub._writeSpy.callCount, 1)
      let writeSpyCall = socketStub._writeSpy.getCall(0)
      let b = writeSpyCall.args[0]
      let length = b.readUInt32BE(0)
      let is = new TModel.TInputStream(new TModel.TBuffer(b.slice(4, length)))
      assert.equal(is.tBuffer.length, length - 4)
      let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
      assert.equal(responsePacket.iVersion, 1)
      assert.equal(responsePacket.cPacketType, 0)
      assert.equal(responsePacket.iRequestId, requestId)
      assert.equal(responsePacket.iMessageType, iMessageType)
      assert.equal(responsePacket.iRet, -999)
      assert.deepEqual(responsePacket.sBuffer, Buffer.from([]))
      assert.deepEqual(responsePacket.status, {})
      assert.equal(responsePacket.sResultDesc, 'foo')
      assert.deepEqual(responsePacket.context, {})

      done()
    }, 100)
  })
  it('stop', done => {
    let bindAdapter = new BindAdapter(endpointInfo, TafProtocolServer, servant)
    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    bindAdapter.start()
    assert(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, host])

    serverStub.emit('connection', socketStub)
    assert.equal(bindAdapter._dataAdapters.length, 1)

    let promise = bindAdapter.stop()
    assert.equal(bindAdapter._dataAdapters.length, 0)
    assert.equal(socketStub._destroySpy.callCount, 1)
    promise.then(() => done(), done)
    setTimeout(() => {
      serverStub._closeCb()
    }, 100)
  })
})
