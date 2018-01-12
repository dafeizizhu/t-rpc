const TCPTransceiver = require('./tcp-transceiver')

exports.factory = {
  create: endpoint => {
    if (endpoint.protocolName !== 'tcp') throw new Error('not implemented')
    return new TCPTransceiver(endpoint.host, endpoint.port)
  }
}

exports.TCPTransceiver = TCPTransceiver
