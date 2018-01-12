const TafProtocolServer = require('../protocols/taf/server')
const BindAdapter = require('./bind-adapter')
const EndpointInfo = require('../util/endpoint-info')

class TServer {
  constructor (tConfig) {
    this._tConfig = tConfig
    this._adapterInfoes = []
    this._bindAdapters = []

    try {
      let serverInfo = tConfig.data.taf.application.server
      let adapterInfoes = Object.keys(serverInfo).reduce((p, c) => {
        if (typeof serverInfo[c] === 'object') {
          return p.concat(serverInfo[c])
        } else {
          return p
        }
      }, [])

      this._adapterInfoes = adapterInfoes
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  start () {
    this._bindAdapters.forEach(({ adapterInfo, bindAdapter }) => {
      try {
        bindAdapter.start()
      } catch (error) {
        console.error(`bindAdapter at ${adapterInfo.endpoint} start error ${error.message}`)
      }
      console.info(`bindAdapter at ${adapterInfo.endpoint} started`)
    })
  }
  stop () {
    return Promise.all(this._bindAdpaters.map(({ bindAdapter }) => bindAdapter.stop()))
  }
  addServant (servant, servantName, Protocol) {
    let adapterInfo = this._adapterInfoes.filter(info => info.servant === servantName)[0]
    if (adapterInfo) {
      Protocol = adapterInfo.protocol === 'taf' ? TafProtocolServer : Protocol
      let bindAdapter = new BindAdapter(EndpointInfo.parse(adapterInfo.endpoint, Protocol, servant))
      this._bindAdapters.push({
        adapterInfo,
        bindAdapter
      })
    } else {
      console.warn(`no adapter info for servant ${servantName}`)
    }
  }
}

module.exports = TServer
