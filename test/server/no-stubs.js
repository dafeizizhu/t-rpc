/* global describe, it */

const { TConfig } = require('t-util')
const path = require('path')
const cp = require('child_process')

const TServer = require('../../lib/server/t-server')

const { DemoFServant } = require('./res/Demo').Demo

class DemoFServantImp extends DemoFServant {
  echo (str) {
    let ret = {}
    ret.return = 'echo at @taf2/rpc: ' + str
    return Promise.resolve(ret)
  }
}

describe('TServer', () => {
  it('test', done => {
    let tServer = new TServer(TConfig.parseFile(path.join(__dirname, './Local.Nodejs.DemoServer.config.conf')))
    tServer.addServant(new DemoFServantImp(), 'Nodejs.DemoServer.DemoObj')
    tServer.start()

    Promise.all([
      new Promise((resolve, reject) => {
        tServer.on('response', obj => {
          console.info('response', obj)
          tServer.stop().then(resolve).catch(reject)
        })
      }),
      new Promise((resolve, reject) => {
        cp.exec('/home/dafeizizhu/test/taf/TafCall "Demo.DemoServer.DemoObj@tcp -h 127.0.0.1 -p 17001 -t 60000" "echo" "\'sUsrName\'"', (error, stdout, stderr) => {
          if (error) {
            console.error('exec error', error)
            reject(error)
          } else {
            console.info('stdout', stdout)
            console.error('stderr', stderr)
            resolve()
          }
        })
      })
    ]).then(results => {
      if (results.filter(r => !!r).length) done(new Error('foo!'))
      else done()
    }).catch(done)
  })
})
