import { XeroClient } from "xero-node";
import type { IXeroClientConfig } from "xero-node";

type LoggerFunctionType = (msg, level?: number) => void
class XeroWrapper {
    #client: XeroClient;
    #loggerFunction: LoggerFunctionType

    constructor({ clientId, clientSecret, loggerFunction }: {
        clientId: IXeroClientConfig['clientId'],
        clientSecret: IXeroClientConfig['clientSecret'],
        loggerFunction?: LoggerFunctionType
    }
    ) {
        this.#client = new XeroClient({
            clientId,
            clientSecret,
            grantType: 'client_credentials'
        })

        if (loggerFunction) this.#loggerFunction = loggerFunction


    }

    setLogger(loggerFunction: LoggerFunctionType) {
        this.#loggerFunction = loggerFunction
    }

    #log(...args: Parameters<LoggerFunctionType>) {
        this.#loggerFunction && this.#loggerFunction(...args)
    }


    async withXero(fn: (client: XeroClient) => Promise<any>): ReturnType<typeof fn> {

        let auth = this.#client.readTokenSet()
        if (!auth || auth.expired()) {
            if (!auth) this.#log("Requesting Xero token")
            else this.#log("Xero token expired, refreshing")
            
            /* TODO: Check if refresh in progress */
            await this.#client.getClientCredentialsToken()
            this.#log("Got new token")
        }

        return fn(this.#client)
    }
}