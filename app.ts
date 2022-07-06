import bunyan from 'bunyan'

globalThis.logger = bunyan.createLogger({
    name: "Xero Test"
})

