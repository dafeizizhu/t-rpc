class RpcResult {
  constructor (obj) {
    let { requestMessage, responseMessage, costTime, endpointInfo } = Object.assign({
      requestMessage: null,
      responseMessage: null,
      costTime: 0,
      endpointInfo: null
    }, obj)

    this.requestMessage = requestMessage
    this.responseMessage = responseMessage
    this.costTime = costTime
    this.endpointInfo = endpointInfo
  }
}

module.exports = RpcResult
