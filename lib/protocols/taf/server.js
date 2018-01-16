const { EventEmitter } = require('events')
const TModel = require('t-model')

const { RequestPacket, ResponsePacket } = require('./res/Packet').taf
const RequestMessage = require('../../util/request-message')
const { hex } = require('t-util').dump

class TafProtocolServer extends EventEmitter {
  constructor () {
    super()

    this._buffer = null
  }
  compose (responseMessage) {
    let { requestId, code, message } = responseMessage
    let body = responseMessage.responsePacket

    let responsePacket = new ResponsePacket({
      iVersion: 1,
      cPacketType: 0,
      iRequestId: requestId,
      iMessageType: body.iMessageType,
      iRet: code,
      sBuffer: body.sBuffer,
      status: {},
      sResultDesc: message,
      context: body.context
    })

    let os = new TModel.TOutputStream()
    os.setHeaderLength(0)
    responsePacket.writeTo(os, os.tBuffer)
    os.setHeaderLength(os.tBuffer.length)

    if (process.env.INSPECT_BUFFER) {
      console.info('server compose responseMessage')
      console.info(hex(os.tBuffer.buffer, ','))
    }

    return os.tBuffer.buffer
  }
  composeError (error) {
    let { requestId, code, message } = error

    if (isNaN(requestId)) throw new Error('no requestId')

    code = code || -999
    message = message || 'unknow error'

    let body = error.responsePacket || {
      iMessageType: 0,
      context: {},
      sBuffer: Buffer.from([])
    }

    let responsePacket = new ResponsePacket({
      iVersion: 1,
      cPacketType: 0,
      iRequestId: requestId,
      iMessageType: body.iMessageType,
      iRet: code,
      sBuffer: body.sBuffer,
      status: {},
      sResultDesc: message,
      context: body.context
    })

    let os = new TModel.TOutputStream()
    os.setHeaderLength(0)
    responsePacket.writeTo(os, os.tBuffer)
    os.setHeaderLength(os.tBuffer.length)

    if (process.env.INSPECT_BUFFER) {
      console.info('server compose error')
      console.info(hex(os.tBuffer.buffer, ','))
    }

    return os.tBuffer.buffer
  }
  feed (buffer) {
    if (this._buffer) {
      let tmp = Buffer.allocUnsafe(this._buffer.length + buffer.length)
      this._buffer.copy(tmp, 0)
      buffer.copy(tmp, this._buffer.length)
      this._buffer = null
      buffer = tmp
    }
    let pos = 0
    while (pos < buffer.length) {
      if (buffer.length - pos < 4) break
      let length = buffer.readUInt32BE(pos)
      if (pos + length > buffer.length) break

      let is = new TModel.TInputStream(new TModel.TBuffer(buffer.slice(pos + 4, pos + length)))

      if (process.env.INSPECT_BUFFER) {
        console.info('server feed a requestMessage')
        console.info(hex(buffer.slice(pos, pos + length), ','))
      }

      let requestPacket = RequestPacket.readFrom(is, is.tBuffer)
      let requestId = requestPacket.iRequestId
      let servantName = requestPacket.sServantName
      let funcName = requestPacket.sFuncName
      let appBuffer = requestPacket.sBuffer
      let property = { context: requestPacket.context }
      let packetType = requestPacket.cPacketType
      let requestMessage = new RequestMessage({
        requestId,
        servantName,
        funcName,
        appBuffer,
        property,
        packetType
      })
      this.emit('message', { requestMessage })
      pos += length
    }
    if (pos !== buffer.length) {
      this._buffer = Buffer.allocUnsafe(buffer.length - pos)
      buffer.copy(this._buffer, 0, pos)
    }
  }
  reset () {
    this._buffer = null
  }
}

module.exports = TafProtocolServer
