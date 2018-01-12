const TModel = require('t-model')
const TafProtocolClient = require('../../../protocols/taf/client')
const { RpcError, ClientDecodeError, ServerFuncNotFoundError } = require('../../../util/rpc-error')

let { EndpointF } = require('./EndpointF.js').taf

class QueryFProxy {
  static get Protocol () {
    return TafProtocolClient
  }
  constructor () {
    this._name = undefined
    this._objectProxy = undefined
  }
  setTimeout (value) {
    this._objectProxy.timeout = value
  }
  getTimeout () {
    return this._objectProxy.timeout
  }
  findObjectById (id, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TList(EndpointF).read(is, 0, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectById', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
  findObjectById4Any (id, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TInt32.read(is, 0, true)
        response.arguments.activeEp = TModel.TList(EndpointF).read(is, 2, true)
        response.arguments.inactiveEp = TModel.TList(EndpointF).read(is, 3, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectById4Any', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
  findObjectById4All (id, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TInt32.read(is, 0, true)
        response.arguments.activeEp = TModel.TList(EndpointF).read(is, 2, true)
        response.arguments.inactiveEp = TModel.TList(EndpointF).read(is, 3, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectById4All', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
  findObjectByIdInSameGroup (id, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TInt32.read(is, 0, true)
        response.arguments.activeEp = TModel.TList(EndpointF).read(is, 2, true)
        response.arguments.inactiveEp = TModel.TList(EndpointF).read(is, 3, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectByIdInSameGroup', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
  findObjectByIdInSameStation (id, sStation, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      new (TModel.TString)(sStation).write(os, 2)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TInt32.read(is, 0, true)
        response.arguments.activeEp = TModel.TList(EndpointF).read(is, 3, true)
        response.arguments.inactiveEp = TModel.TList(EndpointF).read(is, 4, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectByIdInSameStation', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
  findObjectByIdInSameSet (id, setId, ...args) {
    let _encode = () => {
      let os = new TModel.TOutputStream()
      new (TModel.TString)(id).write(os, 1)
      new (TModel.TString)(setId).write(os, 2)
      return os.tBuffer.buffer
    }
    let _decode = rpcResult => {
      try {
        let response = { arguments: {} }
        let is = new TModel.TInputStream(new TModel.TBuffer(rpcResult.responseMessage.responsePacket.sBuffer))
        response.costtime = rpcResult.costTime
        response.return = TModel.TInt32.read(is, 0, true)
        response.arguments.activeEp = TModel.TList(EndpointF).read(is, 3, true)
        response.arguments.inactiveEp = TModel.TList(EndpointF).read(is, 4, true)
        return { request: rpcResult.requestMessage, response }
      } catch (error) {
        throw new ClientDecodeError(error.message, rpcResult.requestMessage, rpcResult.responseMessage, rpcResult.costTime, rpcResult.endpointInfo)
      }
    }
    let _error = rpcError => {
      let code = rpcError.responseMessage ? rpcError.responseMessage.code : -999
      let message = rpcError.responseMessage ? rpcError.responseMessage.message : rpcError.message
      throw new RpcError(code, message, rpcError.requestMessage, rpcError.responseMessage, rpcError.costTime, rpcError.endpointInfo)
    }
    return this._objectProxy.invoke('findObjectByIdInSameSet', _encode(), args.length > 0 ? args[0] : undefined).then(_decode, _error)
  }
}

class QueryFServant {
  doRequest (requestMessage) {
    let { requestId, funcName, appBuffer } = requestMessage
    let is = new TModel.TInputStream(new TModel.TBuffer(appBuffer))
    let os = new TModel.TOutputStream()
    switch (funcName) {
      case 'findObjectById': {
        let id = TModel.TString.read(is, 1, true)
        return this.findObjectById(id).then(ret => {
          new (TModel.TList(EndpointF))(ret.return).write(os, 0)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      case 'findObjectById4Any': {
        let id = TModel.TString.read(is, 1, true)
        return this.findObjectById4Any(id).then(ret => {
          new (TModel.TInt32)(ret.return).write(os, 0)
          new (TModel.TList(EndpointF))(ret.activeEp).write(os, 2)
          new (TModel.TList(EndpointF))(ret.inactiveEp).write(os, 3)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      case 'findObjectById4All': {
        let id = TModel.TString.read(is, 1, true)
        return this.findObjectById4All(id).then(ret => {
          new (TModel.TInt32)(ret.return).write(os, 0)
          new (TModel.TList(EndpointF))(ret.activeEp).write(os, 2)
          new (TModel.TList(EndpointF))(ret.inactiveEp).write(os, 3)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      case 'findObjectByIdInSameGroup': {
        let id = TModel.TString.read(is, 1, true)
        return this.findObjectByIdInSameGroup(id).then(ret => {
          new (TModel.TInt32)(ret.return).write(os, 0)
          new (TModel.TList(EndpointF))(ret.activeEp).write(os, 2)
          new (TModel.TList(EndpointF))(ret.inactiveEp).write(os, 3)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      case 'findObjectByIdInSameStation': {
        let id = TModel.TString.read(is, 1, true)
        let sStation = TModel.TString.read(is, 2, true)
        return this.findObjectByIdInSameStation(id, sStation).then(ret => {
          new (TModel.TInt32)(ret.return).write(os, 0)
          new (TModel.TList(EndpointF))(ret.activeEp).write(os, 3)
          new (TModel.TList(EndpointF))(ret.inactiveEp).write(os, 4)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      case 'findObjectByIdInSameSet': {
        let id = TModel.TString.read(is, 1, true)
        let setId = TModel.TString.read(is, 2, true)
        return this.findObjectByIdInSameSet(id, setId).then(ret => {
          new (TModel.TInt32)(ret.return).write(os, 0)
          new (TModel.TList(EndpointF))(ret.activeEp).write(os, 3)
          new (TModel.TList(EndpointF))(ret.inactiveEp).write(os, 4)
          let responseMessage = {
            requestId,
            code: 0,
            message: 'success',
            responsePacket: {
              sBuffer: os.tBuffer.buffer
            }
          }
          return Promise.resolve({ responseMessage })
        }).catch(error => {
          let code = error.code ? error.code : -999
          let message = error.message || 'unknown error'
          let rpcError = new RpcError(code, message, requestMessage, null, 0, null)
          return Promise.reject(rpcError)
        })
      }
      default:
        return Promise.reject(new ServerFuncNotFoundError(funcName + ' not found', requestMessage, null, 0, null))
    }
  }
  findObjectById (id) {
    let ret = {}
    ret.return = null
    return Promise.resolve(ret)
  }
  findObjectById4Any (id) {
    let ret = {}
    ret.return = 0
    ret.activeEp = null
    ret.inactiveEp = null
    return Promise.resolve(ret)
  }
  findObjectById4All (id) {
    let ret = {}
    ret.return = 0
    ret.activeEp = null
    ret.inactiveEp = null
    return Promise.resolve(ret)
  }
  findObjectByIdInSameGroup (id) {
    let ret = {}
    ret.return = 0
    ret.activeEp = null
    ret.inactiveEp = null
    return Promise.resolve(ret)
  }
  findObjectByIdInSameStation (id, sStation) {
    let ret = {}
    ret.return = 0
    ret.activeEp = null
    ret.inactiveEp = null
    return Promise.resolve(ret)
  }
  findObjectByIdInSameSet (id, setId) {
    let ret = {}
    ret.return = 0
    ret.activeEp = null
    ret.inactiveEp = null
    return Promise.resolve(ret)
  }
}

exports.taf = exports.taf || {}
exports.taf.EndpointF = EndpointF
exports.taf = exports.taf || {}
exports.taf.QueryFProxy = QueryFProxy
exports.taf.QueryFServant = QueryFServant
