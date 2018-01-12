/* global describe, it, beforeEach */

const sinon = require('sinon')
const assert = require('assert')
const proxyquire = require('proxyquire')
const TModel = require('t-model')

const stubs = require('../stubs')

const TafProtocolServer = require('../../lib/protocols/taf/server')
const DataAdapter = proxyquire('../../lib/server/data-adapter', {
  net: stubs.net
})
const ResponseMessage = require('../../lib/util/response-message')
const { RequestPacket, ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf

describe('DataAdatper', () => {
  beforeEach(() => {
    stubs.clear()
  })

  let iMessageType = 0
  let sBuffer = Buffer.from([1, 23, 32, 324, 2, 2342])
  let context = { foo: 'bar' }
  let responsePacket = { iMessageType, sBuffer, context }
  let requestId = 1
  let code = 999
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
  let buffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  buffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(buffer, 4)

  it('test', () => {
    let socketStub = new stubs.net.Socket()
    let dataAdapter = new DataAdapter('tcp', socketStub, TafProtocolServer)
    let onCloseSpy = sinon.spy()
    let onMessageSpy = sinon.spy()

    dataAdapter.on('close', onCloseSpy)
    dataAdapter.on('message', onMessageSpy)

    socketStub.emit('data', buffer)

    assert.equal(onMessageSpy.callCount, 1)
    let onMessageSpyCall = onMessageSpy.getCall(0)
    let { requestMessage } = onMessageSpyCall.args[0]
    assert.equal(requestMessage.requestId, iRequestId)
    assert.equal(requestMessage.funcName, sFuncName)
    assert.equal(requestMessage.servantName, sServantName)
    assert.deepEqual(requestMessage.appBuffer, sBuffer)
    assert.deepEqual(requestMessage.property, { context })
    assert.equal(requestMessage.packetType, cPacketType)

    dataAdapter.doResponse(responseMessage)

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

    let error = new Error('foo')
    error.requestId = requestId
    dataAdapter.doError(error)

    assert.equal(socketStub._writeSpy.callCount, 2)
    writeSpyCall = socketStub._writeSpy.getCall(1)
    b = writeSpyCall.args[0]
    length = b.readUInt32BE(0)
    is = new TModel.TInputStream(new TModel.TBuffer(b.slice(4, length)))
    assert.equal(is.tBuffer.length, length - 4)
    responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
    assert.equal(responsePacket.iVersion, 1)
    assert.equal(responsePacket.cPacketType, 0)
    assert.equal(responsePacket.iRequestId, requestId)
    assert.equal(responsePacket.iMessageType, iMessageType)
    assert.equal(responsePacket.iRet, -999)
    assert.deepEqual(responsePacket.sBuffer, Buffer.from([]))
    assert.deepEqual(responsePacket.status, {})
    assert.equal(responsePacket.sResultDesc, 'foo')
    assert.deepEqual(responsePacket.context, {})

    socketStub.emit('close')
    assert.equal(onCloseSpy.callCount, 1)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('doError without requestId', () => {
    let socketStub = new stubs.net.Socket()
    let onCloseSpy = sinon.spy()
    let dataAdapter = new DataAdapter('tcp', socketStub, TafProtocolServer)
    dataAdapter.on('close', onCloseSpy)

    let error = new Error('foo')
    dataAdapter.doError(error)

    assert.equal(socketStub._destroySpy.callCount, 1)
    assert.equal(onCloseSpy.callCount, 1)
  })
  it('destroy', () => {
    let socketStub = new stubs.net.Socket()
    let dataAdapter = new DataAdapter('tcp', socketStub, TafProtocolServer)
    let onCloseSpy = sinon.spy()
    dataAdapter.on('close', onCloseSpy)

    dataAdapter.destroy()
    assert.equal(socketStub._destroySpy.callCount, 1)
    assert.equal(onCloseSpy.callCount, 0)

    assert.doesNotThrow(() => dataAdapter.destroy())
  })
})
