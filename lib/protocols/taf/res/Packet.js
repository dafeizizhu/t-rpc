const TModel = require('t-model')

class RequestPacket extends TModel.TStruct {
  static parse (value) {
    return Object.assign({}, {
      iVersion: 0,
      cPacketType: 0,
      iMessageType: 0,
      iRequestId: 0,
      sServantName: '',
      sFuncName: '',
      sBuffer: null,
      iTimeout: 0,
      context: null,
      status: null
    }, value)
  }
  static readFrom (is, tBuffer) {
    let iVersion = (TModel.TInt16).read(is, 1, true)
    let cPacketType = (TModel.TInt8).read(is, 2, true)
    let iMessageType = (TModel.TInt32).read(is, 3, true)
    let iRequestId = (TModel.TInt32).read(is, 4, true)
    let sServantName = (TModel.TString).read(is, 5, true)
    let sFuncName = (TModel.TString).read(is, 6, true)
    let sBuffer = (TModel.TBytes).read(is, 7, true)
    let iTimeout = (TModel.TInt32).read(is, 8, true)
    let context = (TModel.TMap(TModel.TString, TModel.TString)).read(is, 9, true)
    let status = (TModel.TMap(TModel.TString, TModel.TString)).read(is, 10, true)
    return new RequestPacket({
      iVersion, cPacketType, iMessageType, iRequestId, sServantName, sFuncName, sBuffer, iTimeout, context, status
    }).valueOf()
  }
  constructor (value) {
    super(value)

    this._t_iVersion = new (TModel.TInt16)(this._value.iVersion)
    this._t_cPacketType = new (TModel.TInt8)(this._value.cPacketType)
    this._t_iMessageType = new (TModel.TInt32)(this._value.iMessageType)
    this._t_iRequestId = new (TModel.TInt32)(this._value.iRequestId)
    this._t_sServantName = new (TModel.TString)(this._value.sServantName)
    this._t_sFuncName = new (TModel.TString)(this._value.sFuncName)
    this._t_sBuffer = new (TModel.TBytes)(this._value.sBuffer)
    this._t_iTimeout = new (TModel.TInt32)(this._value.iTimeout)
    this._t_context = new (TModel.TMap(TModel.TString, TModel.TString))(this._value.context)
    this._t_status = new (TModel.TMap(TModel.TString, TModel.TString))(this._value.status)
  }

  get iVersion () {
    return this._t_iVersion.valueOf()
  }
  get cPacketType () {
    return this._t_cPacketType.valueOf()
  }
  get iMessageType () {
    return this._t_iMessageType.valueOf()
  }
  get iRequestId () {
    return this._t_iRequestId.valueOf()
  }
  get sServantName () {
    return this._t_sServantName.valueOf()
  }
  get sFuncName () {
    return this._t_sFuncName.valueOf()
  }
  get sBuffer () {
    return this._t_sBuffer.valueOf()
  }
  get iTimeout () {
    return this._t_iTimeout.valueOf()
  }
  get context () {
    return this._t_context.valueOf()
  }
  get status () {
    return this._t_status.valueOf()
  }

  set iVersion (value) {
    this._t_iVersion = new (TModel.TInt16)(value)
  }
  set cPacketType (value) {
    this._t_cPacketType = new (TModel.TInt8)(value)
  }
  set iMessageType (value) {
    this._t_iMessageType = new (TModel.TInt32)(value)
  }
  set iRequestId (value) {
    this._t_iRequestId = new (TModel.TInt32)(value)
  }
  set sServantName (value) {
    this._t_sServantName = new (TModel.TString)(value)
  }
  set sFuncName (value) {
    this._t_sFuncName = new (TModel.TString)(value)
  }
  set sBuffer (value) {
    this._t_sBuffer = new (TModel.TBytes)(value)
  }
  set iTimeout (value) {
    this._t_iTimeout = new (TModel.TInt32)(value)
  }
  set context (value) {
    this._t_context = new (TModel.TMap(TModel.TString, TModel.TString))(value)
  }
  set status (value) {
    this._t_status = new (TModel.TMap(TModel.TString, TModel.TString))(value)
  }

  writeTo (os, tBuffer) {
    this._t_iVersion.write(os, 1)
    this._t_cPacketType.write(os, 2)
    this._t_iMessageType.write(os, 3)
    this._t_iRequestId.write(os, 4)
    this._t_sServantName.write(os, 5)
    this._t_sFuncName.write(os, 6)
    this._t_sBuffer.write(os, 7)
    this._t_iTimeout.write(os, 8)
    this._t_context.write(os, 9)
    this._t_status.write(os, 10)
  }

  valueOf () {
    return {
      iVersion: this._t_iVersion.valueOf(),
      cPacketType: this._t_cPacketType.valueOf(),
      iMessageType: this._t_iMessageType.valueOf(),
      iRequestId: this._t_iRequestId.valueOf(),
      sServantName: this._t_sServantName.valueOf(),
      sFuncName: this._t_sFuncName.valueOf(),
      sBuffer: this._t_sBuffer.valueOf(),
      iTimeout: this._t_iTimeout.valueOf(),
      context: this._t_context.valueOf(),
      status: this._t_status.valueOf()
    }
  }
}
class ResponsePacket extends TModel.TStruct {
  static parse (value) {
    return Object.assign({}, {
      iVersion: 0,
      cPacketType: 0,
      iRequestId: 0,
      iMessageType: 0,
      iRet: 0,
      sBuffer: null,
      status: null,
      sResultDesc: '',
      context: null
    }, value)
  }
  static readFrom (is, tBuffer) {
    let iVersion = (TModel.TInt16).read(is, 1, true)
    let cPacketType = (TModel.TInt8).read(is, 2, true)
    let iRequestId = (TModel.TInt32).read(is, 3, true)
    let iMessageType = (TModel.TInt32).read(is, 4, true)
    let iRet = (TModel.TInt32).read(is, 5, true)
    let sBuffer = (TModel.TBytes).read(is, 6, true)
    let status = (TModel.TMap(TModel.TString, TModel.TString)).read(is, 7, true)
    let sResultDesc = (TModel.TString).read(is, 8, false)
    let context = (TModel.TMap(TModel.TString, TModel.TString)).read(is, 9, false)
    return new ResponsePacket({
      iVersion, cPacketType, iRequestId, iMessageType, iRet, sBuffer, status, sResultDesc, context
    }).valueOf()
  }
  constructor (value) {
    super(value)

    this._t_iVersion = new (TModel.TInt16)(this._value.iVersion)
    this._t_cPacketType = new (TModel.TInt8)(this._value.cPacketType)
    this._t_iRequestId = new (TModel.TInt32)(this._value.iRequestId)
    this._t_iMessageType = new (TModel.TInt32)(this._value.iMessageType)
    this._t_iRet = new (TModel.TInt32)(this._value.iRet)
    this._t_sBuffer = new (TModel.TBytes)(this._value.sBuffer)
    this._t_status = new (TModel.TMap(TModel.TString, TModel.TString))(this._value.status)
    this._t_sResultDesc = new (TModel.TString)(this._value.sResultDesc)
    this._t_context = new (TModel.TMap(TModel.TString, TModel.TString))(this._value.context)
  }

  get iVersion () {
    return this._t_iVersion.valueOf()
  }
  get cPacketType () {
    return this._t_cPacketType.valueOf()
  }
  get iRequestId () {
    return this._t_iRequestId.valueOf()
  }
  get iMessageType () {
    return this._t_iMessageType.valueOf()
  }
  get iRet () {
    return this._t_iRet.valueOf()
  }
  get sBuffer () {
    return this._t_sBuffer.valueOf()
  }
  get status () {
    return this._t_status.valueOf()
  }
  get sResultDesc () {
    return this._t_sResultDesc.valueOf()
  }
  get context () {
    return this._t_context.valueOf()
  }

  set iVersion (value) {
    this._t_iVersion = new (TModel.TInt16)(value)
  }
  set cPacketType (value) {
    this._t_cPacketType = new (TModel.TInt8)(value)
  }
  set iRequestId (value) {
    this._t_iRequestId = new (TModel.TInt32)(value)
  }
  set iMessageType (value) {
    this._t_iMessageType = new (TModel.TInt32)(value)
  }
  set iRet (value) {
    this._t_iRet = new (TModel.TInt32)(value)
  }
  set sBuffer (value) {
    this._t_sBuffer = new (TModel.TBytes)(value)
  }
  set status (value) {
    this._t_status = new (TModel.TMap(TModel.TString, TModel.TString))(value)
  }
  set sResultDesc (value) {
    this._t_sResultDesc = new (TModel.TString)(value)
  }
  set context (value) {
    this._t_context = new (TModel.TMap(TModel.TString, TModel.TString))(value)
  }

  writeTo (os, tBuffer) {
    this._t_iVersion.write(os, 1)
    this._t_cPacketType.write(os, 2)
    this._t_iRequestId.write(os, 3)
    this._t_iMessageType.write(os, 4)
    this._t_iRet.write(os, 5)
    this._t_sBuffer.write(os, 6)
    this._t_status.write(os, 7)
    this._t_sResultDesc.write(os, 8)
    this._t_context.write(os, 9)
  }

  valueOf () {
    return {
      iVersion: this._t_iVersion.valueOf(),
      cPacketType: this._t_cPacketType.valueOf(),
      iRequestId: this._t_iRequestId.valueOf(),
      iMessageType: this._t_iMessageType.valueOf(),
      iRet: this._t_iRet.valueOf(),
      sBuffer: this._t_sBuffer.valueOf(),
      status: this._t_status.valueOf(),
      sResultDesc: this._t_sResultDesc.valueOf(),
      context: this._t_context.valueOf()
    }
  }
}

exports.taf = exports.taf || {}
exports.taf.RequestPacket = RequestPacket
exports.taf.ResponsePacket = ResponsePacket
