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

describe.skip('TServer', () => {
  beforeEach(() => stubs.clear())

  let requestBuffer = Buffer.from([])
  let responeBuffer = Buffer.from([])

  it('test', done => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServant(), 'Nodejs.DemoServer.DemoObj')
    tServer.start()

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]
    assert.equal(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [17001, '222.222.222.222'])

    let socketStub = new stubs.net.Socket()
    serverStub.emit('connection', socketStub)
    socketStub.emit('data', requestBuffer)

    setTimeout(() => {
      assert.equal(socketStub._writeSpy.callCount, 1)

      done()
    })
  })
})
