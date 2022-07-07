
import dotenv from 'dotenv'
dotenv.config()

import bunyan from 'bunyan'

declare global {
    var logger: bunyan
}
globalThis.logger = bunyan.createLogger({
    name: "Xero Test"
})
