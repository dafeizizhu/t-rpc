const assert = require('assert')
const { EventEmitter } = require('events')

const ObjectInfo = require('../util/object-info')
const SetInfo = require('../util/set-info')
const ObjectProxy = require('./object-proxy')

class TClient extends EventEmitter {
  constructor (tConfig) {
    super()

    this._tConfig = null
    this._inited = false
    this._objectProxyMap = {}
    this._locator = ''

    try {
      this._tConfig = tConfig
      this._locator = tConfig.data.taf.application.client.locator
    } catch (error) {
      console.info('no locator')
    }
  }
  get tConfig () {
    return this._tConfig
  }
  stringToProxy (ProxyHandler, objName, setName) {
    assert(objName, 'objName is required')
    assert(objName.indexOf('@') !== -1 || this._locator, 'objName without endpoint needs a locator')

    let proxy = new ProxyHandler()
    proxy._name = objName
    proxy._objectProxy = this._getObjectProxy(objName, setName, ProxyHandler.Protocol)

    return proxy
  }
  _getObjectProxy (objName, setName, Protocol) {
    let key = `${objName}:${setName || ''}`
    if (this._objectProxyMap.hasOwnProperty(key)) {
      return this._objectProxyMap[key]
    }
    let objectProxy = new ObjectProxy(ObjectInfo.parse(objName), SetInfo.parse(setName), Protocol, this._tConfig)
    objectProxy.on('response', obj => this.emit('response', obj))
    this._objectProxyMap[key] = objectProxy
    return objectProxy
  }
  destroy () {
    Object.keys(this._objectProxyMap).forEach(key => {
      this._objectProxyMap[key].removeAllListeners()
      this._objectProxyMap[key].destroy()
      this._objectProxyMap[key] = null
    })
    this._objectProxyMap = {}
  }
}

module.exports = TClient
