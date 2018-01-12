const { EventEmitter } = require('events')

const AdapterProxy = require('../adapter-proxy')
const RequestMessage = require('../../util/request-message')
const { QueryFProxy } = require('./res/QueryF').taf

class Proxy extends EventEmitter {
  constructor (objectInfo, Protocol) {
    super()

    this._objectInfo = objectInfo
    this._adapterProxy = new AdapterProxy(objectInfo.endpoints[0], Protocol)
    this._requestId = 0
  }
  _genRequestId () {
    return ++this._requestId
  }
  invoke (funcName, appBuffer, property) {
    // TODO ignore property, or static property?
    let requestMessage = new RequestMessage({
      requestId: this._genRequestId(),
      servantName: this._objectInfo.objName,
      funcName,
      appBuffer,
      property: {},
      packetType: 0
    })

    return this._adapterProxy.doRequest(requestMessage)
      .then(rpcResult => {
        this.emit('response', { rpcResult })
        return Promise.resolve(rpcResult)
      })
      .catch(error => {
        this.emit('response', { rpcError: error })
        return Promise.reject(error)
      })
  }
  destroy () {
    this._adapterProxy.destroy()
  }
}

class Registry extends EventEmitter {
  constructor (objectInfo, Protocol) {
    super()

    this._proxy = new QueryFProxy()
    this._proxy._name = objectInfo.objName
    this._proxy._objectProxy = new Proxy(objectInfo, Protocol)
    this._proxy._objectProxy.on('response', obj => this.emit('response', obj))
  }
  findObjectByIdInSameGroup (id) {
    return this._proxy.findObjectByIdInSameGroup(id)
  }
  destroy () {
    this._proxy._objectProxy.removeAllListeners()
    this._proxy._objectProxy.destroy()
  }
}

module.exports = Registry
