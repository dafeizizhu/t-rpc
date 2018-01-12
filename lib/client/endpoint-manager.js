const { EventEmitter } = require('events')

const AdapterProxy = require('./adapter-proxy')
const ObjectInfo = require('../util/object-info')
const EndpointInfo = require('../util/endpoint-info')
const Registry = require('./registry')
const { ClientNoAdapterError } = require('../util/rpc-error')

const REFRESH_INTERVAL = 60000
const EMPTY_REFRESH_INTERVAL = 10000

class EndpointManager extends EventEmitter {
  constructor (objectInfo, setInfo, Protocol, tConfig, options) {
    super()

    this._objectInfo = objectInfo
    this._setInfo = setInfo
    this._Protocol = Protocol
    this._adapterProxies = []
    this._hash = 0
    this._nextRefreshTime = 0
    this._tConfig = tConfig

    this._refreshInterval = options && !isNaN(options.refreshInterval) ? parseInt(options.refreshInterval, 10) : REFRESH_INTERVAL
    this._emptyRefreshInterval = options && !isNaN(options.emptyRefreshInterval) ? parseInt(options.emptyRefreshInterval, 10) : EMPTY_REFRESH_INTERVAL

    try {
      this._locator = tConfig.data.taf.application.client.locator
    } catch (error) {
      console.info('no locator')
    }

    if (this._locator) {
      this._registry = new Registry(ObjectInfo.parse(this._locator), Protocol, tConfig)
      this._registry.on('response', obj => this.emit('response', obj))
    }
  }
  _findObjects () {
    if (!this._registry) {
      throw new Error('no locator')
    } else {
      return this._registry.findObjectByIdInSameGroup(this._objectInfo.objName).then(ret => {
        let endpointInfoes = ret.response.arguments.activeEp.map(ep => new EndpointInfo({
          protocolName: ep.istcp ? 'tcp' : 'udp',
          host: ep.host,
          port: ep.port,
          timeout: ep.timeout
        }))
        return Promise.resolve({ endpointInfoes })
      })
    }
  }
  _initAdapterProxiesFromLocator () {
    return this._findObjects().then(({ endpointInfoes }) => {
      if (!this._adapterProxies || !this._adapterProxies.length) {
        if (endpointInfoes.valueOf().length) {
          this._adapterProxies = endpointInfoes.map(endpointInfo => {
            console.info(this._objectInfo.objName, 'add adapterProxy at endpoint', JSON.stringify(endpointInfo))
            return new AdapterProxy(endpointInfo, this._Protocol)
          })
        } else {
          throw new Error('no adapter avaliable')
        }
      } else {
        let diff = endpointInfoes.filter(endpointInfo => {
          for (let i = 0; i < this._adapterProxies.length; i++) {
            let adapterProxy = this._adapterProxies[i]
            if (adapterProxy.endpoint.protocolName === endpointInfo.protocolName &&
              adapterProxy.endpoint.host === endpointInfo.host &&
              adapterProxy.endpoint.port === endpointInfo.port) {
              return false
            }
          }
          return true
        })
        diff.forEach(endpointInfo => {
          console.info(this._objectInfo.objName, 'add adapterProxy at endpoint', JSON.stringify(endpointInfo))
          let adapterProxy = new AdapterProxy(endpointInfo, this._Protocol)
          this._adapterProxies.push(adapterProxy)
        })
      }
      this._nextRefreshTime = process.uptime() * 1000 + (this._adapterProxies.length ? this._refreshInterval : this._emptyRefreshInterval)
      return Promise.resolve()
    }).catch(error => {
      this._nextRefreshTime = process.uptime() * 1000 + this._emptyRefreshInterval
      throw error
    })
  }
  _initAdapterProxies () {
    if (this._objectInfo.endpoints.length) {
      this._adapterProxies = this._objectInfo.endpoints.map(endpoint => new AdapterProxy(endpoint, this._Protocol))
      return Promise.resolve()
    } else {
      return this._initAdapterProxiesFromLocator()
    }
  }
  _select (requestMessage) {
    let hashCode = parseInt(requestMessage.property.hashCode, 10)
    if (!isNaN(hashCode)) {
      return this._adapterProxies[hashCode % this._adapterProxies.length]
    } else {
      let adapterProxy = this._adapterProxies[this._hash]
      this._hash = (this._hash + 1) % this._adapterProxies.length
      return adapterProxy
    }
  }
  _needsRefresh () {
    if (this._objectInfo.endpoints.length && this._adapterProxies && this._adapterProxies.length) return false
    if (!this._adapterProxies.length) return true
    if (this._nextRefreshTime < process.uptime() * 1000) return true

    return false
  }
  selectAdapterProxy (requestMessage) {
    if (this._needsRefresh()) {
      return this._initAdapterProxies()
        .then(() => this.selectAdapterProxy(requestMessage))
        .catch(error => Promise.reject(new ClientNoAdapterError(error.message, requestMessage, null, 0, this._endpointInfo)))
    } else {
      let adapterProxy = this._select(requestMessage)
      return Promise.resolve({ adapterProxy })
    }
  }
  destroy () {
    for (let i = 0, length = this._adapterProxies.length; i < length; i++) {
      this._adapterProxies[i].destroy()
      this._adapterProxies[i] = null
    }
    this._adapterProxies = []
    if (this._registry) {
      this._registry.removeAllListeners()
      this._registry.destroy()
    }
  }
}

module.exports = EndpointManager
