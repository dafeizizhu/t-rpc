/* global describe, it, beforeEach */

const assert = require('assert')
const TModel = require('t-model')

const TafProtocolClient = require('../../../lib/protocols/taf/client')
const RequestMessage = require('../../../lib/util/request-message')
const { RequestPacket, ResponsePacket } = require('../../../lib/protocols/taf/res/Packet').taf

describe('TafProtocolClient', () => {
  let tafProtocolClient
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
  let iRequestId = 2
  let iMessageType = 3
  let iRet = 0
  let sBuffer = Buffer.from([32, 234234, 42342, 32, 32421, 3242])
  let status = { foo: 'bar', bar: 'foo' }
  let sResultDesc = 'sResultDesc'
  let context = { foo: 'foo', bar: 'bar' }
  let responsePacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId, iMessageType, iRet, sBuffer, status, sResultDesc, context
  })
  beforeEach(() => {
    tafProtocolClient = new TafProtocolClient()
  })
  it('compose', () => {
    let buffer = tafProtocolClient.compose(requestMessage)
    let length = buffer.readUInt32BE(0)
    let is = new TModel.TInputStream(new TModel.TBuffer(buffer.slice(4, length)))
    assert.equal(is.tBuffer.length, length - 4)
    let requestPacket = RequestPacket.readFrom(is, is.tBuffer)
    assert.equal(requestPacket.iVersion, 1)
    assert.equal(requestPacket.cPacketType, packetType)
    assert.equal(requestPacket.iMessageType, 0)
    assert.equal(requestPacket.iRequestId, requestId)
    assert.equal(requestPacket.sServantName, servantName)
    assert.equal(requestPacket.sFuncName, funcName)
    assert.deepEqual(requestPacket.sBuffer, appBuffer)
    assert.deepEqual(requestPacket.context, property.context)
    assert.equal(is.tBuffer.position, is.tBuffer.length)
  })
  it('feed', done => {
    let os = new TModel.TOutputStream()
    let totalBuffer
    for (let i = 0; i < 10; i++) {
      responsePacket.writeTo(os, os.tBuffer)
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
        tafProtocolClient.on('message', ({ responseMessage }) => {
          assert.deepEqual(responseMessage.responsePacket, responsePacket.valueOf())
          assert.equal(responseMessage.requestId, iRequestId)
          assert.equal(responseMessage.code, iRet)
          assert.equal(responseMessage.message, sResultDesc)
          resolve()
        })
      }))
    }
    Promise.all(promises).then(() => done())
    buffers.forEach(buffer => tafProtocolClient.feed(buffer))
  })
})
