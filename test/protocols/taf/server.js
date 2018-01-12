/* global describe, it, beforeEach */

const assert = require('assert')
const TModel = require('t-model')

const TafProtocolServer = require('../../../lib/protocols/taf/server')
const ResponseMessage = require('../../../lib/util/response-message')
const { RequestPacket, ResponsePacket } = require('../../../lib/protocols/taf/res/Packet').taf

describe('TafProtocolServer', () => {
  let tafProtocolServer

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

  beforeEach(() => {
    tafProtocolServer = new TafProtocolServer()
  })

  it('compose', () => {
    let buffer = tafProtocolServer.compose(responseMessage)
    let length = buffer.readUInt32BE(0)
    let is = new TModel.TInputStream(new TModel.TBuffer(buffer.slice(4, length)))
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
  })
  it('composeError', () => {
    let code = -123
    let message = 'foo'
    let error = new Error(message)
    error.code = code
    error.requestId = requestId

    let buffer = tafProtocolServer.composeError(error)
    let length = buffer.readUInt32BE(0)
    let is = new TModel.TInputStream(new TModel.TBuffer(buffer.slice(4, length)))
    assert.equal(is.tBuffer.length, length - 4)
    let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
    assert.equal(responsePacket.iVersion, 1)
    assert.equal(responsePacket.cPacketType, 0)
    assert.equal(responsePacket.iRequestId, requestId)
    assert.equal(responsePacket.iMessageType, iMessageType)
    assert.equal(responsePacket.iRet, code)
    assert.deepEqual(responsePacket.sBuffer, Buffer.from([]))
    assert.deepEqual(responsePacket.status, {})
    assert.equal(responsePacket.sResultDesc, message)
    assert.deepEqual(responsePacket.context, {})
  })
  it('composeError without code and message', () => {
    let error = new Error('')
    error.requestId = requestId

    let buffer = tafProtocolServer.composeError(error)
    let length = buffer.readUInt32BE(0)
    let is = new TModel.TInputStream(new TModel.TBuffer(buffer.slice(4, length)))
    assert.equal(is.tBuffer.length, length - 4)
    let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
    assert.equal(responsePacket.iVersion, 1)
    assert.equal(responsePacket.cPacketType, 0)
    assert.equal(responsePacket.iRequestId, requestId)
    assert.equal(responsePacket.iMessageType, iMessageType)
    assert.equal(responsePacket.iRet, -999)
    assert.deepEqual(responsePacket.sBuffer, Buffer.from([]))
    assert.deepEqual(responsePacket.status, {})
    assert.equal(responsePacket.sResultDesc, 'unknow error')
    assert.deepEqual(responsePacket.context, {})
  })
  it('composeError without requestId', () => {
    let error = new Error('foo')
    assert.throws(() => tafProtocolServer.composeError(error))
  })
  it('feed', done => {
    let os = new TModel.TOutputStream()
    let totalBuffer
    for (let i = 0; i < 10; i++) {
      requestPacket.writeTo(os, os.tBuffer)
      let buffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
      buffer.writeInt32BE(os.tBuffer.length + 4, 0)
      os.tBuffer.buffer.copy(buffer, 4)

      if (!totalBuffer) {
        totalBuffer = buffer
      } else {
        let tmp = Buffer.allocUnsafe(totalBuffer.length + buffer.length)
        totalBuffer.copy(tmp, 0)
        buffer.copy(tmp, totalBuffer.length)
        totalBuffer = tmp
      }
    }

    let buffers = []
    let pos = 0
    while (pos < totalBuffer.length) {
      let length = Math.min(totalBuffer.length - pos, 50)
      let buffer = Buffer.allocUnsafe(length)
      totalBuffer.copy(buffer, 0, pos, pos + length)
      pos += length
      buffers.push(buffer)
    }
    let promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(new Promise((resolve, reject) => {
        tafProtocolServer.on('message', ({ requestMessage }) => {
          assert.equal(requestMessage.requestId, iRequestId)
          assert.equal(requestMessage.funcName, sFuncName)
          assert.equal(requestMessage.servantName, sServantName)
          assert.deepEqual(requestMessage.appBuffer, sBuffer)
          assert.deepEqual(requestMessage.property, { context })
          assert.equal(requestMessage.packetType, cPacketType)
          resolve()
        })
      }))
    }
    Promise.all(promises).then(() => done()).catch(done)
    buffers.forEach(buffer => tafProtocolServer.feed(buffer))
  })
})
