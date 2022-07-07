import bunyan from 'bunyan'

declare global {
    var logger: bunyan
}
globalThis.logger = bunyan.createLogger({
    name: "Xero Test"
})

import dotenv from 'dotenv'
dotenv.config()

import withXero, { XeroClient } from 'xero-node-wrap'

XeroClient.init({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    loggerFunction(msg) {
        logger.info(msg)
    }
})

async function main() {
    let invoices = withXero(
        (xero) =>
            xero.accountingApi.getInvoices("" /* empty tenant ID, but required from generated API */)
    )

    logger.info(await invoices)
}
main()