class RequestMessage {
  constructor (obj) {
    let { requestId, funcName, appBuffer, property, packetType, servantName } = Object.assign({}, {
      requestId: 0,
      funcName: '',
      appBuffer: null,
      property: null,
      packetType: 0,
      servantName: ''
    }, obj)
    this.requestId = requestId
    this.servantName = servantName
    this.funcName = funcName
    this.appBuffer = appBuffer
    this.property = property
    this.packetType = packetType
  }
}

module.exports = RequestMessage
