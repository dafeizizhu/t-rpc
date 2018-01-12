/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')
const path = require('path')
const TModel = require('t-model')
const { TConfig } = require('t-util')

const stubs = require('../stubs')

const TServer = proxyquire('../../lib/server/t-server', {
  net: stubs.net
})

const { DemoFServant } = require('./res/Demo').Demo

describe('TServer', () => {
  beforeEach(() => stubs.clear())

  it('test', () => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, 'Prod.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServant(), 'Nodejs.DemoServer.DemoObj')

    console.info(tServer)
  })
})
