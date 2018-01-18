const path = require('path')

const { TConfig } = require('t-util')
const TServer = require('../../../lib/server/t-server')

const { DemoFServant } = require('../res/Demo').Demo

class DemoFServantImp extends DemoFServant {
  echo (str) {
    let ret = {}
    ret.return = 'echo at @taf2/rpc: ' + str
    return Promise.resolve(ret)
  }
}

let tServer = new TServer(TConfig.parseFile(path.join(__dirname, '..', './Local.Nodejs.DemoServer.config.conf')))
tServer.addServant(new DemoFServantImp(), 'Nodejs.DemoServer.DemoObj')
tServer.start()
