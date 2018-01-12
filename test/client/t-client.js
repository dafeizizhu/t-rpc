/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')
const path = require('path')
const TModel = require('t-model')
const { TConfig } = require('t-util')

const stubs = require('../stubs')

const { ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf
const TClient = proxyquire('../../lib/client/t-client', {
  net: stubs.net
})

const { DemoFProxy } = require('./res/Demo').Demo

describe('TClient', () => {
  let str = 'foo'
  let returnString = 'bar'

  let os = new TModel.TOutputStream()
  ;(new TModel.TString(returnString)).write(os, 0)

  let iVersion = 1
  let cPacketType = 1
  let iRequestId = 1
  let iMessageType = 3
  let iRet = 0
  let sBuffer = os.tBuffer.buffer
  let status = { foo: 'bar', bar: 'foo' }
  let sResultDesc = 'sResultDesc'
  let context = { foo: 'foo', bar: 'bar' }
  let responsePacket = new ResponsePacket({
    iVersion, cPacketType, iRequestId, iMessageType, iRet, sBuffer, status, sResultDesc, context
  })
  os = new TModel.TOutputStream()
  responsePacket.writeTo(os, os.tBuffer)
  let responseBuffer = Buffer.allocUnsafe(os.tBuffer.length + 4)
  responseBuffer.writeInt32BE(os.tBuffer.length + 4, 0)
  os.tBuffer.buffer.copy(responseBuffer, 4)

  beforeEach(() => stubs.clear())

  it('test', done => {
    let responseSpy = sinon.spy()
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, 'Prod.Video.UploadStatusServer.config.conf')))
    tClient.on('response', responseSpy)
    let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 222.222.222.222 -t 60000 -p 17001', '')
    let socketStub
    let property = { foo: 'bar' }
    let promise = proxy.echo(str, property)

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [17001, '222.222.222.222'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.then(result => {
      assert.deepEqual(result.request.requestId, iRequestId)
      assert.deepEqual(result.request.servantName, 'Nodejs.DemoServer.DemoObj')
      assert.deepEqual(result.request.funcName, 'echo')
      assert.deepEqual(result.request.packetType, property.packetType || 0)
      assert.deepEqual(result.response.arguments, {})
      assert.deepEqual(result.response.return, returnString)

      assert.deepEqual(responseSpy.callCount, 1)
      let spyCall = responseSpy.getCall(0)
      assert.deepEqual(spyCall.args[0].rpcResult.requestMessage, {
        requestId: iRequestId,
        servantName: 'Nodejs.DemoServer.DemoObj',
        funcName: 'echo',
        appBuffer: Buffer.from([22, 3, 102, 111, 111]),
        property: {},
        packetType: 0
      })
      assert.deepEqual(spyCall.args[0].rpcResult.responseMessage, {
        responsePacket: {
          iVersion: 1,
          cPacketType: 1,
          iRequestId: 1,
          iMessageType: 3,
          iRet: 0,
          sBuffer: Buffer.from([6, 3, 98, 97, 114]),
          status: { foo: 'bar', bar: 'foo' },
          sResultDesc: 'sResultDesc',
          context: { foo: 'foo', bar: 'bar' }
        },
        requestId: 1,
        code: 0,
        message: 'sResultDesc'
      })
      done()
    }).catch(done)
  })
  it('no locator', () => {
    let tClient = new TClient()
    assert.throws(() => tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj'))
  })
  it('get tConfig', () => {
    let tClient = new TClient('mock config')
    assert.equal(tClient.tConfig, 'mock config')
  })
  it('object proxy cached', () => {
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, 'Prod.Video.UploadStatusServer.config.conf')))
    let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 222.222.222.222 -t 60000 -p 17001', '')
    let proxy2 = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 222.222.222.222 -t 60000 -p 17001', '')
    assert.equal(proxy._objectProxy, proxy2._objectProxy)
  })
  it('destroy', done => {
    let responseSpy = sinon.spy()
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, 'Prod.Video.UploadStatusServer.config.conf')))
    tClient.on('response', responseSpy)
    let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 222.222.222.222 -t 60000 -p 17001', '')
    let socketStub
    let property = { foo: 'bar' }
    let promise = proxy.echo(str, property)

    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert.equal(socketStubs.length, 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._connectSpy.callCount, 1)
      let spyCall = socketStub._connectSpy.getCall(0)
      assert.deepEqual(spyCall.args, [17001, '222.222.222.222'])
    }, 50)

    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    setTimeout(() => {
      socketStub.emit('data', responseBuffer)
    }, 200)

    promise.then(result => {
      tClient.destroy()

      assert.deepEqual(tClient._objectProxyMap, {})
      assert.equal(socketStub._destroySpy.callCount, 1)

      done()
    }).catch(done)
  })
})
