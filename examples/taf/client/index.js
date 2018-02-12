const path = require('path')

const { TConfig } = require('t-util')

const TClient = require('../../../lib/client/t-client')
const { DemoFProxy } = require('../res/Demo').Demo

let tClient = new TClient(TConfig.parseFile(path.join(__dirname, '..', './Local.Nodejs.DemoServer.config.conf')))
let proxy = tClient.stringToProxy(DemoFProxy, 'Nodejs.DemoServer.DemoObj@tcp -h 127.0.0.1 -p 17001 -t 6000')

proxy.echo('foo').then(ret => {
  console.info('ret', ret)
  tClient.destroy()
}).catch(error => {
  console.error('error', error)
  tClient.destroy()
})
