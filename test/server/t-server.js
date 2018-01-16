/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')
const path = require('path')
const TModel = require('t-model')
const { TConfig } = require('t-util')

const { RequestPacket, ResponsePacket } = require('../../lib/protocols/taf/res/Packet').taf

const stubs = require('../stubs')

const TServer = proxyquire('../../lib/server/t-server', {
  net: stubs.net
})

const { DemoFServant } = require('./res/Demo').Demo

class DemoFServantImp extends DemoFServant {
  echo (str) {
    let ret = {}
    ret.return = 'echo at @taf2/rpc: ' + str
    return Promise.resolve(ret)
  }
}

describe('TServer', () => {
  beforeEach(() => stubs.clear())

  let normalRequestBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x3e, 0x10, 0x01, 0x2c, 0x3c,
    0x40, 0x01, 0x56, 0x17, 0x44, 0x65, 0x6d, 0x6f,
    0x2e, 0x44, 0x65, 0x6d, 0x6f, 0x53, 0x65, 0x72,
    0x76, 0x65, 0x72, 0x2e, 0x44, 0x65, 0x6d, 0x6f,
    0x4f, 0x62, 0x6a, 0x66, 0x04, 0x65, 0x63, 0x68,
    0x6f, 0x7d, 0x00, 0x00, 0x0a, 0x16, 0x08, 0x73,
    0x55, 0x73, 0x72, 0x4e, 0x61, 0x6d, 0x65, 0x81,
    0x13, 0x88, 0x98, 0x0c, 0xa8, 0x0c
  ])
  let normalResponseBuffer = Buffer.from([
    0x00, 0x00, 0x00, 0x39, 0x10, 0x01, 0x2c, 0x30,
    0x01, 0x4c, 0x5c, 0x6d, 0x00, 0x00, 0x1d, 0x06,
    0x1b, 0x65, 0x63, 0x68, 0x6f, 0x20, 0x61, 0x74,
    0x20, 0x40, 0x74, 0x61, 0x66, 0x32, 0x2f, 0x72,
    0x70, 0x63, 0x3a, 0x20, 0x73, 0x55, 0x73, 0x72,
    0x4e, 0x61, 0x6d, 0x65, 0x78, 0x0c, 0x86, 0x07,
    0x73, 0x75, 0x63, 0x63, 0x65, 0x73, 0x73, 0x98,
    0x0c
  ])

  it('test', done => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServantImp(), 'Nodejs.DemoServer.DemoObj')
    tServer.start()

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]
    assert.equal(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [17001, '222.222.222.222'])

    let socketStub = new stubs.net.Socket()
    serverStub.emit('connection', socketStub)
    socketStub.emit('data', normalRequestBuffer)

    setTimeout(() => {
      assert.equal(socketStub._writeSpy.callCount, 1)
      let writeSpyCall = socketStub._writeSpy.getCall(0)
      assert.deepEqual(writeSpyCall.args, [normalResponseBuffer])
      done()
    }, 100)
  })
  it('stop', done => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServantImp(), 'Nodejs.DemoServer.DemoObj')
    tServer.start()

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    tServer.stop().then(() => done(), done)
    setTimeout(() => serverStub._closeCb(), 100)
  })
  it('add a servant no exist in tConfig', () => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServantImp(), 'foo')

    assert.equal(tServer._bindAdapters.length, 0)
  })
  it('no tConfig', () => {
    assert.throws(() => new TServer())
  })
  it('start error', () => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServantImp(), 'Nodejs.DemoServer.DemoObj')

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]
    serverStub._listenCb = () => {
      throw new Error('foo')
    }
    assert.doesNotThrow(() => tServer.start())
  })
})
