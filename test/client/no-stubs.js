/* global describe, it */

const path = require('path')
const assert = require('assert')
const { TConfig } = require('t-util')

const TClient = require('../../lib/client/t-client')
const { DemoFProxy } = require('./res/Demo').Demo

describe('TClient', () => {
  it('test', done => {
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, './Prod.Video.UploadStatusServer.config.conf')))
    let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 222.222.222.222 -t 60000 -p 17001', '')
    proxy.echo('foo').then(ret => {
      assert.equal(ret.response.return, 'echo: foo')
      tClient.destroy()
      done()
    }).catch(error => {
      tClient.destroy()
      done(error)
    })
  })
  it('use registry', done => {
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, './Prod.Video.UploadStatusServer.config.conf')))
    let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj', '')
    proxy.echo('foo').then(ret => {
      assert.equal(ret.response.return, 'echo: foo')
      return Promise.resolve()
    }).catch(error => {
      return Promise.reject(error)
    }).then(() => {
      let proxy2 = tClient.stringToProxy(DemoFProxy, 'taf.tafstat.StatObj', '')
      return proxy2.echo('foo')
    }).then(() => {
      tClient.destroy()
      done(new Error('?'))
    }).catch(error => {
      tClient.destroy()
      done(!error)
    })
  })
  it('no adapter', done => {
    let tClient = new TClient(TConfig.parseFile(path.join(__dirname, './Prod.Video.UploadStatusServer.config.conf')))
    let proxy = tClient.stringToProxy(DemoFProxy, 'foo', '')
    proxy.echo('foo').then(ret => {
      tClient.destroy()
      done(new Error('meo meo meo?'))
    }).catch(error => {
      tClient.destroy()
      done(!error)
    })
  })
})
