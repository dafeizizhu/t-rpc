const TModel = require('t-model')
const md5 = require('md5')

class EndpointF extends TModel.TStruct {
  static parse (value) {
    return Object.assign({}, {
      host: '',
      port: 0,
      timeout: 0,
      istcp: 0,
      grid: 0,
      groupworkid: 0,
      grouprealid: 0,
      setId: '',
      qos: 0
    }, value)
  }
  static readFrom (is, tBuffer) {
    let host = (TModel.TString).read(is, 0, true)
    let port = (TModel.TInt32).read(is, 1, true)
    let timeout = (TModel.TInt32).read(is, 2, true)
    let istcp = (TModel.TInt32).read(is, 3, true)
    let grid = (TModel.TInt32).read(is, 4, true)
    let groupworkid = (TModel.TInt32).read(is, 5, false)
    let grouprealid = (TModel.TInt32).read(is, 6, false)
    let setId = (TModel.TString).read(is, 7, false)
    let qos = (TModel.TInt32).read(is, 8, false)
    return new EndpointF({
      host, port, timeout, istcp, grid, groupworkid, grouprealid, setId, qos
    }).valueOf()
  }
  constructor (value) {
    super(value)

    this._t_host = new (TModel.TString)(this._value.host)
    this._t_port = new (TModel.TInt32)(this._value.port)
    this._t_timeout = new (TModel.TInt32)(this._value.timeout)
    this._t_istcp = new (TModel.TInt32)(this._value.istcp)
    this._t_grid = new (TModel.TInt32)(this._value.grid)
    this._t_groupworkid = new (TModel.TInt32)(this._value.groupworkid)
    this._t_grouprealid = new (TModel.TInt32)(this._value.grouprealid)
    this._t_setId = new (TModel.TString)(this._value.setId)
    this._t_qos = new (TModel.TInt32)(this._value.qos)
  }

  get host () {
    return this._t_host.valueOf()
  }
  get port () {
    return this._t_port.valueOf()
  }
  get timeout () {
    return this._t_timeout.valueOf()
  }
  get istcp () {
    return this._t_istcp.valueOf()
  }
  get grid () {
    return this._t_grid.valueOf()
  }
  get groupworkid () {
    return this._t_groupworkid.valueOf()
  }
  get grouprealid () {
    return this._t_grouprealid.valueOf()
  }
  get setId () {
    return this._t_setId.valueOf()
  }
  get qos () {
    return this._t_qos.valueOf()
  }

  set host (value) {
    this._t_host = new (TModel.TString)(value)
  }
  set port (value) {
    this._t_port = new (TModel.TInt32)(value)
  }
  set timeout (value) {
    this._t_timeout = new (TModel.TInt32)(value)
  }
  set istcp (value) {
    this._t_istcp = new (TModel.TInt32)(value)
  }
  set grid (value) {
    this._t_grid = new (TModel.TInt32)(value)
  }
  set groupworkid (value) {
    this._t_groupworkid = new (TModel.TInt32)(value)
  }
  set grouprealid (value) {
    this._t_grouprealid = new (TModel.TInt32)(value)
  }
  set setId (value) {
    this._t_setId = new (TModel.TString)(value)
  }
  set qos (value) {
    this._t_qos = new (TModel.TInt32)(value)
  }

  writeTo (os, tBuffer) {
    this._t_host.write(os, 0)
    this._t_port.write(os, 1)
    this._t_timeout.write(os, 2)
    this._t_istcp.write(os, 3)
    this._t_grid.write(os, 4)
    this._t_groupworkid.write(os, 5)
    this._t_grouprealid.write(os, 6)
    this._t_setId.write(os, 7)
    this._t_qos.write(os, 8)
  }

  valueOf () {
    return {
      host: this._t_host.valueOf(),
      port: this._t_port.valueOf(),
      timeout: this._t_timeout.valueOf(),
      istcp: this._t_istcp.valueOf(),
      grid: this._t_grid.valueOf(),
      groupworkid: this._t_groupworkid.valueOf(),
      grouprealid: this._t_grouprealid.valueOf(),
      setId: this._t_setId.valueOf(),
      qos: this._t_qos.valueOf()
    }
  }

  keyOf () {
    return md5([
      this._t_host.keyOf(),
      this._t_port.keyOf(),
      this._t_timeout.keyOf(),
      this._t_istcp.keyOf(),
      this._t_grid.keyOf(),
      this._t_qos.keyOf()
    ].join('__key__'))
  }
}

exports.taf = exports.taf || {}
exports.taf.EndpointF = EndpointF
