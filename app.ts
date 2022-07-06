import bunyan from 'bunyan'

globalThis.logger = bunyan.createLogger({
    name: "Xero Test"
})

import dotenv from 'dotenv'
dotenv.config()

import { XeroClient } from 'xero-node'

const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    redirectUris: ["https://this_is_a_test/redir"],
    scopes: [
        "openid",
        "profile",
        "email",
        "accounting.transactions",
        "offline_access"
    ]
})


/*
xero.buildConsentUrl().then(url => {
    logger.info(url)
})
*/

/*
const url = "..."

xero.apiCallback(url).then(token => {
    console.log(token);
})
*/

const token = {
    id_token: '...',
    /* 30 min expiry */
    access_token: '...',
    expires_at: 1657128627,
    token_type: 'Bearer',
    /* 60 day expiry */
    refresh_token: '...',
    scope: 'openid profile email accounting.transactions offline_access',
    session_state: '...'
}
