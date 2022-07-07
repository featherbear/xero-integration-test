import './util'

import withXero, { XeroClient, Webhook } from 'xero-node-wrap'
import polka from 'polka'

const server = polka()
const XeroWebhook = Webhook(process.env.XERO_WEBHOOK_SECRET)
import bodyParser from 'body-parser'
import { Invoice } from 'xero-node'
import dayjs from 'dayjs'

server.post('/webhook',
    ...[
        bodyParser.raw({ type() { return true } }),
        XeroWebhook.payloadMiddlewareExpress
    ],
    (req, res) => {
        logger.info(req.body, "Received Xero Webhook")
        res.end()
    })

XeroClient.init({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    loggerFunction(msg) {
        logger.info(msg)
    }
})

server.get("/doIt", (req, res) => {

    markAsPaid("30a87092-31b5-4a2c-831e-327486533dd2").catch(e => {
        logger.error(e)
    })
    res.end("SENT")
})

const markAsPaid = (invoiceID: string) => withXero(async (xero) => {
    let account = (await __UNSAFE__getAccounts())[0]

    let invoice = await getInvoice(invoiceID)
    if (!invoice) throw new Error(`Invoice ${invoiceID} doesn't exist`)
    if (invoice.status !== Invoice.StatusEnum.AUTHORISED) throw new Error(`Invoice ${invoiceID} isn't ready to accept payments`)

    xero.accountingApi.createPayment('', {
        account,
        invoice,
        amount: invoice.amountDue,
        reference: "XeroAPI",
        details: "DEETS",
        date: dayjs().format('YYYY-MM-DD')
    })

})

const __UNSAFE__getAccounts = () => withXero(async (xero) => {
    let resp = await xero.accountingApi.getAccounts('', null, `Type=="BANK"`)
    return resp?.body?.accounts
})


const getInvoices = () => withXero(
    (xero) => xero.accountingApi.getInvoices("" /* empty tenant ID, but required from generated API */)
)

const getInvoice = (invoiceID: string) =>
    withXero(async (xero) => {
        let resp = await xero.accountingApi.getInvoice('', invoiceID)
        return resp?.body?.invoices[0]
    })


async function main() {
    server.listen(8083, '0.0.0.0', () => {
        logger.info(`Server listening`)
    })

    // mark as paid
    // 1a) Check that invoice is AUTHORISED 
    // 1b) get outstanding balance
    // 2) pay
    // const markAsPaid = (invoiceID: string) => withXero((xero) => {
    //     xero.accountingApi.createPayment('', {account: {}})
    // })





}

main()