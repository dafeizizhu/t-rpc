const { EventEmitter } = require('events')
const TModel = require('t-model')

const { RequestPacket, ResponsePacket } = require('./res/Packet').taf
const ResponseMessage = require('../../util/response-message')

class TafProtocolClient extends EventEmitter {
  constructor () {
    super()

    this._buffer = null
  }
  compose (requestMessage) {
    let { packetType, requestId, servantName, funcName, appBuffer, property } = requestMessage
    let requestPacket = new RequestPacket({
      iVersion: 1,
      cPacketType: packetType,
      iMessageType: 0,
      iRequestId: requestId,
      sServantName: servantName,
      sFuncName: funcName,
      sBuffer: appBuffer
    })
    // TODO dyeing
    if (property && property.dyeing && property.dyeing.dyeing) {
      throw new Error('dyeing is not implemented')
    }
    if (property && property.context) {
      requestPacket.context = Object.keys(property.context).reduce((p, c) => {
        p[c] = String(property.context[c])
        return p
      }, {})
    }
    let os = new TModel.TOutputStream()
    os.setHeaderLength(0)
    requestPacket.writeTo(os, os.tBuffer)
    os.setHeaderLength(os.tBuffer.length)

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
      let responsePacket = ResponsePacket.readFrom(is, is.tBuffer)
      let requestId = responsePacket.iRequestId
      let code = responsePacket.iRet
      let message = responsePacket.sResultDesc
      let responseMessage = new ResponseMessage({
        responsePacket,
        requestId,
        code,
        message
      })

      this.emit('message', { responseMessage })
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

module.exports = TafProtocolClient
