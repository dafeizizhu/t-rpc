class RpcError extends Error {
  constructor (code, message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(message)

    this.code = code
    this.requestMessage = requestMessage
    this.responseMessage = responseMessage
    this.costTime = costTime
    this.endpointInfo = endpointInfo
  }
}

class ServerDecodeError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-1, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ServerEncodeError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-2, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ServerFuncNotFoundError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-3, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ServerServantNotFoundError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-4, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ServerOverloadError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-9, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ServerNoAdapterError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-10, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ClientNoAdapterError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-10000, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ClientDecodeError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-11000, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

class ClientTimeoutError extends RpcError {
  constructor (message, requestMessage, responseMessage, costTime, endpointInfo) {
    super(-13001, message, requestMessage, responseMessage, costTime, endpointInfo)
  }
}

module.exports = {
  RpcError,
  ServerDecodeError,
  ServerEncodeError,
  ServerFuncNotFoundError,
  ServerServantNotFoundError,
  ServerOverloadError,
  ServerNoAdapterError,
  ClientNoAdapterError,
  ClientDecodeError,
  ClientTimeoutError
}
