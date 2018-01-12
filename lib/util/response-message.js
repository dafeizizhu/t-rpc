class ResponseMessage {
  constructor (obj) {
    let { responsePacket, requestId, code, message } = Object.assign({}, {
      requestMessage: null,
      code: -1,
      message: ''
    }, obj)
    this.responsePacket = responsePacket
    this.requestId = requestId
    this.code = code
    this.message = message
  }
}

module.exports = ResponseMessage
