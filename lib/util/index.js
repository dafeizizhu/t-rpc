const defer = () => {
  var deferred = {}
  var promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  deferred.promise = promise
  return deferred
}

class TQueue {
  constructor (keyName) {
    this._keyName = keyName
    this._keys = []
    this._values = {}
  }
  push (value) {
    let key = value[this._keyName]
    if (!key) key = new Date().valueOf()
    this._keys.push(key)
    this._values[key] = value
  }
  getByKey (key) {
    return this._values[key]
  }
  removeByKey (key) {
    let index = this._keys.indexOf(key)
    if (index >= 0) {
      this._keys.splice(index, 1)
      delete this._values[key]
    }
  }
  valueOf () {
    return this._keys.map(key => this._values[key])
  }
  get length () {
    return this._keys.length
  }
  forEach (cb) {
    this._keys.forEach(key => cb(this._values[key]))
  }
  destroy () {
    for (let i = 0, length = this._keys.length; i < length; i++) {
      let key = this._keys[i]
      if (typeof this._values[key].destroy === 'function') {
        this._values[key].destroy()
      }
      delete this._values[key]
      key = null
      this._keys[i] = null
    }
    this._keys = null
    this._values = null
  }
}

exports.defer = defer
exports.TQueue = TQueue
