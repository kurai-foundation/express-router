import express, { Express } from "express"
import * as http from "node:http"
import * as https from "node:https"
import RouterBuilder from "./utils/routing/router-builder"
import { TLogger } from "./utils/routing/router-utils"
import {
  ICreateRouteOptions,
  ISwaggerTransformerOptions,
  TCreateRouteResponse,
  TCreateRouteSchema
} from "./types"
import getModule from "./utils/get-module"

export interface IApplicationConfig {
  /**
   * Configuring JSON middleware for applications.
   * If you want to completely disable the JSON middleware, pass false
   *
   * @default { limit: "10mb" }
   */
  json?: false | { limit: string }

  /**
   * Set the logger for the application. If it is not installed, you will
   * not receive logs when errors and warnings occur.
   *
   * The logger must contain at least `error` and `info` methods
   */
  logger?: TLogger

  /**
   * The application host, if it is not set, the application
   * will try to get the APP_HOST environment variable,
   * if it is not set either, 127.0.0.1 will be used
   *
   * @default APP_HOST, 127.0.0.1
   * */
  host?: string

  /**
   * The application port, if it is not set, the application
   * will try to get the APP_PORT environment variable,
   * if it is not set either, 3000 will be used
   *
   * @default APP_PORT, 3000
   */
  port?: number

  /**
   * A callback that will be called just before the application
   * is launched for additional configuration
   *
   * @param app express application itself
   */
  onBeforeStart?: (app: Express) => void

  /**
   * A callback that will be called immediately after
   * the application is launched
   *
   * @param host application host
   * @param port application port
   * @param app express application itself
   */
  onAppStart?: (host: string, port: number, app: Express) => void | null

  /**
   * Enable debug logs. Works only if logger is specified
   *
   * @default false
   */
  debug?: boolean

  /**
   * If true, a root GET route will be automatically
   * added to the application, which will return Swagger UI
   *
   * If `swagger-ui-express` or `@kurai-io/express-router-swagger` are not installed,
   * then the default route with `200 OK` response will be served instead
   *
   * Object configuration will be counted as true (swagger enabled)
   */
  swagger?: (Omit<ISwaggerTransformerOptions, "builders"> & {
    /**
     * Swagger UI serve path
     *
     * @default root
     * */
    path?: string
  }) | true

  /**
   * HTTPS configuration
   */
  https?: https.ServerOptions

  /**
   * If true, http/s server will not be automatically created and started
   */
  serverless?: boolean
}

export default class Application<T extends IApplicationConfig = IApplicationConfig> {
  private readonly internalApp: Express
  private readonly internalServer?: http.Server | https.Server

  private registeredBuilders: RouterBuilder[] = []

  /**
   * Layer-2 framework based on express
   *
   * @param config application configuration
   */
  constructor(private readonly config?: T) {
    const app = express()

    // Setup cors if possible
    const cors = getModule("cors")

    if (cors) {
      this.debugLog("Setting up global CORS middleware")
      app.use(cors())
    }
    else (config?.logger?.warning || config?.logger?.error)?.("Running the application without CORS. Install the CORS package to automatically enable it")

    // Setup JSON middleware
    if (!config || config.json !== false) {
      app.use(express.json({ limit: config?.json ? config.json.limit : "10mb" }))
    }

    if (config?.onBeforeStart) config.onBeforeStart(app)

    // Choose the default port and host
    const port = config?.port || (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined) || 3000
    const host = config?.host || process.env.APP_HOST || "127.0.0.1"

    if (!config?.serverless) {
      if (config?.https) this.internalServer = https.createServer(config.https, app)
      else this.internalServer = http.createServer(app)

      this.internalServer.listen(port, host, () => {
        if (config?.onAppStart) {
          config.onAppStart(host, port, app)
          return
        }

        if (config?.onAppStart !== null) config?.logger?.info(`Application running on host ${ host } and port ${ port }`)
      })
    }

    // Generate swagger only after setup
    setTimeout(() => {
      if (!config?.swagger) return

      const swaggerModule = getModule<{
        swaggerTransformer: (options: ISwaggerTransformerOptions) => any
      }>("@kurai-io/express-router-swagger")

      const swaggerUi = getModule("swagger-ui-express")

      if (swaggerUi && swaggerModule?.swaggerTransformer) {
        const swaggerConfig = {
          path: "/",
          ...(typeof this.config?.swagger === "object" ? this.config.swagger : {})
        }

        this.debugLog("Registering swagger at path GET", swaggerConfig.path || "/")

        app.use(swaggerConfig.path || "/", swaggerUi.serve, swaggerUi.setup(swaggerModule.swaggerTransformer({
          ...swaggerConfig,
          builders: this.registeredBuilders
        })))

        return
      }

      this.debugLog("Registering default 200 OK response on path GET /");
      (config?.logger?.warning || config?.logger?.error)?.("Swagger module or swagger-ui-express not installed, setting up default GET path instead")
      app.get("/", (_, res) => {
        res.status(200).send("OK")
      })
    })

    this.internalApp = app
  }

  /**
   * Create a new route
   *
   * @param options route options
   */
  public createRoute<S extends TCreateRouteSchema = undefined, T extends Record<any, any> = {}>(
    options: ICreateRouteOptions<S, T>
  ): TCreateRouteResponse<S, T> {
    const { root, schema, ...builderConfig } = options

    const builder = new RouterBuilder<T>(root, {
      ...builderConfig,
      logger: this.config?.logger,
      debug: this.config?.debug
    }, this)

    this.injectBuilder(builder)

    const router = schema !== undefined ? builder.schema(schema) : builder

    this.debugLog("Route created:", options.root)

    return router as any
  }

  /**
   * Inject existing route builder into application
   *
   * @param builder route builder instance
   */
  public injectBuilder(builder: RouterBuilder) {
    if (!this.registeredBuilders.some(b => b.symbol === builder.symbol)) {
      this.registeredBuilders.push(builder)
    }

    if (this.config?.logger) builder.attachLogger(this.config?.logger)

    this.internalApp.use(builder.root, builder.router)
  }

  /**
   * Get express application instance
   */
  public get express() {
    return this.internalApp
  }

  public httpServer<K = T["serverless"], C = T["https"]>(): K extends true ? undefined : (C extends https.ServerOptions ? https.Server : http.Server) {
    return this.internalServer as any
  }

  private debugLog(...message: string[]) {
    if (!this.config?.debug) return

    (this.config?.logger?.debug || this.config.logger?.info)?.(message.join(" "))
  }
}
