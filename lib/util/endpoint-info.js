const assert = require('assert')

class EndpointInfo {
  constructor (obj) {
    let { protocolName, host, port, timeout, setId } = Object.assign({
      protocolName: '',
      host: '',
      port: 0,
      setId: '',
      timeout: 10000
    }, obj)

    this._protocolName = protocolName
    this._host = host
    this._port = port
    this._timeout = timeout
    this._setId = setId
  }
  get protocolName () {
    return this._protocolName
  }
  get host () {
    return this._host
  }
  get port () {
    return this._port
  }
  get timeout () {
    return this._timeout
  }
  get setId () {
    return this._setId
  }
  toString () {
    return `${this._protocolName} -h ${this._host} -p ${this._port} -t ${this._timeout}`
  }
  static parse (endpointName) {
    try {
      let items = endpointName.split(' ')
      let protocolName = items[0].toLowerCase()
      // TODO only implement tcp
      assert(protocolName === 'tcp', `protocol ${protocolName} not implement`)
      let host, port
      let timeout = 10000
      for (let i = 1; i < items.length; i++) {
        let item = items[i]
        switch (item) {
          case '-h':
            host = items[++i]
            break
          case '-p':
            port = parseInt(items[++i], 10)
            break
          case '-t':
            timeout = parseInt(items[++i], 10)
            break
        }
      }
      return new EndpointInfo({ protocolName, host, port, timeout })
    } catch (err) {
      throw new Error(`invalid endpoint name ${endpointName}, reason ${err.message}`)
    }
  }
}

module.exports = EndpointInfo
