const TCPListener = require('./tcp-listener')

exports.factory = {
  create: endpointInfo => {
    if (endpointInfo.protocolName !== 'tcp') throw new Error('not implemented')
    return new TCPListener(endpointInfo.host, endpointInfo.port)
  }
}

exports.TCPListener = TCPListener
