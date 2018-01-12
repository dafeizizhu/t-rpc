class SetInfo {
  constructor (obj) {
    this._obj = obj
  }
  get enable () {
    return false
  }
  static parse (setName) {
    return new SetInfo({ setName })
  }
}

module.exports = SetInfo
