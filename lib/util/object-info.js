const EndpointInfo = require('./endpoint-info')

class ObjectInfo {
  constructor (obj) {
    let { objName, endpoints } = Object.assign({
      objName: '',
      endpoints: []
    }, obj)
    this._objName = objName
    this._endpoints = endpoints
  }
  get objName () {
    return this._objName
  }
  get endpoints () {
    return this._endpoints
  }
  toString () {
    return `${this._objName}@${this._endpoints.map(endpoint => endpoint.toString()).join(':')}`
  }
  static parse (objectInfoName) {
    try {
      let items = objectInfoName.split('@')
      let objName = items[0].replace(/^[\s\t ]+|[\s\t ]+$/g, '').replace(/\s{2,}/g, ' ')
      let endpoints = !items[1] ? [] : items[1].split(':').map(i => EndpointInfo.parse(i))
      return new ObjectInfo({ objName, endpoints })
    } catch (err) {
      throw new Error(`invalid objectInfoName ${objectInfoName}, reason ${err.message}`)
    }
  }
}

module.exports = ObjectInfo
