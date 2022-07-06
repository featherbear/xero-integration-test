import { XeroClient } from "xero-node";
import type { IXeroClientConfig } from "xero-node";

let client: XeroClient;
let loggerFunction: (msg, level?: number) => void

export function init({ clientId, clientSecret }: {
    clientId: IXeroClientConfig['clientId'],
    clientSecret: IXeroClientConfig['clientSecret'],
}
) {
    client = new XeroClient({
        clientId,
        clientSecret,
        grantType: 'client_credentials'
    })
}

export function setLogger(logFn: typeof loggerFunction) {
    loggerFunction = logFn
}
function log(...args: Parameters<typeof loggerFunction>) {
    loggerFunction && loggerFunction(...args)
}

/* TODO: Check if refresh in progress */

export async function withXero(fn: (client: XeroClient) => Promise<any>): ReturnType<typeof fn> {
    if (!client) throw new Error("Xero wrapper not initialised")

    let auth = client.readTokenSet()
    if (!auth || auth.expired()) {
        if (!auth) log("Requesting Xero token")
        else log("Xero token expired, refreshing")
        await client.getClientCredentialsToken()
        log("Got new token")
    }

    return fn(client)
}