const { EventEmitter } = require('events')

const EndpointManager = require('./endpoint-manager')
const RequestMessage = require('../util/request-message')

class ObjectProxy extends EventEmitter {
  constructor (objectInfo, setInfo, Protocol, tConfig) {
    super()

    this._objectInfo = objectInfo
    this._setInfo = setInfo
    this._endpointManager = new EndpointManager(this._objectInfo, this._setInfo, Protocol, tConfig)
    this._endpointManager.on('response', obj => this.emit('response', obj))
    this._requestId = 0
  }
  _genRequestId () {
    return ++this._requestId
  }
  invoke (funcName, appBuffer, property) {
    let extProperty = {}
    property = property || {}
    if (property.hasOwnProperty('dyeing')) extProperty.dyeing = property.dyeing
    if (property.hasOwnProperty('context')) extProperty.context = property.context
    if (property.hasOwnProperty('packetType')) extProperty.packetType = property.packetType
    if (property.hasOwnProperty('hashCode')) extProperty.hashCode = property.hashCode

    let requestMessage = new RequestMessage({
      requestId: this._genRequestId(),
      servantName: this._objectInfo.objName,
      funcName,
      appBuffer,
      property: extProperty,
      packetType: property.packetType || 0
    })

    return this._endpointManager.selectAdapterProxy(requestMessage)
      .then(({ adapterProxy }) => adapterProxy.doRequest(requestMessage))
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
    this._endpointManager.removeAllListeners()
    this._endpointManager.destroy()
  }
}

module.exports = ObjectProxy
