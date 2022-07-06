import { XeroClient } from "xero-node";
import type { IXeroClientConfig } from "xero-node";

type LoggerFunctionType = (msg, level?: number) => void
type InitParamsType = {
    clientId: IXeroClientConfig['clientId'],
    clientSecret: IXeroClientConfig['clientSecret'],
    loggerFunction?: LoggerFunctionType
}

export default class XeroWrapper {
    #client: XeroClient;
    #loggerFunction: LoggerFunctionType
    #refreshPromise: Promise<void>

    constructor(params?: InitParamsType, acknowledgeNullParams = false) {
        if (!params) {
            if (!acknowledgeNullParams) throw new Error("XeroWrapper missing parameters without acknowledgement")
        } else {
            this.init(params)
        }
    }

    init({ clientId, clientSecret, loggerFunction }: InitParamsType
    ) {
        if (this.#client) throw new Error("XeroWrapper already initialised")
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
            if (!this.#refreshPromise) {
                if (!auth) this.#log("Requesting Xero token")
                else this.#log("Xero token expired, refreshing")

                this.#refreshPromise = this.#client.getClientCredentialsToken()
                    .then(() => {
                        this.#log("Got new token")
                    })
                    .catch(() => {
                        this.#log("Failed to get new token")
                    }).finally(() => {
                        this.#refreshPromise = null
                    })
            } else {
                this.#log("Waiting for existing token request")
            }

            await this.#refreshPromise
        }

        return fn(this.#client)
    }
}