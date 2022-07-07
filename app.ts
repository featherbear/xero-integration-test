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

    markAsPaid("f020625c-d46c-462d-b047-16f82d8df540").catch(e => {
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
        amount: 1 || invoice.amountDue,
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
    async (xero) => {
        let resp = await xero.accountingApi.getInvoices("" /* empty tenant ID, but required from generated API */)
        return resp?.body?.invoices
    }

    //https://authorize.xero.com/custom?consentId=ec8c1b4a-8692-43ad-96a3-18c38ee87e83
)

const getInvoice = (invoiceID: string, getURL: boolean = false) =>
    withXero(async (xero) => {
        let resp = await xero.accountingApi.getInvoice('', invoiceID)
        let invoice = resp?.body?.invoices?.[0]

        if (invoice && getURL) {
            let resp2 = await xero.accountingApi.getOnlineInvoice('', invoice.invoiceID)
            invoice.url = resp2?.body?.onlineInvoices?.[0]?.onlineInvoiceUrl
        }

        return invoice
    })

const __TEST__createInvoice = () => withXero(async (xero) => {
    xero.accountingApi.createInvoices('', {
        invoices: [{
            type: Invoice.TypeEnum.ACCRECCREDIT,
            contact: {
                // ...
            },
            lineItems: [
                {
                    // ...
                    description: "...",
                    // discountAmount
                    // discountRate

                }
            ],

            ...{
                /* Optional stuff */
                // invoiceNumber
                // reference
                // sentToContact

            }
        }]
    })
})



async function main() {
    server.listen(8083, '0.0.0.0', () => {
        logger.info(`Server listening`)
    })


    let invoices = await getInvoices()
    logger.info(invoices[0])
    console.log(invoices[0].url);

}

main()