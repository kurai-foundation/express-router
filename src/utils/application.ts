import express, { Express } from "express"
import RouterBuilder, { IRouterBuilderConfig } from "../router-builder"
import { IBodyLessSchema, ISchema, TLogger } from "./router-utils"
import { RouterContentRequestsWithSchema, RouterRequestsWithSchema } from "../requests/router-requests-with-schema"

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
   * If true, a root GET route will be automatically
   * added to the application, which will return 200 OK on any requests
   *
   * @default false
   */
  setDefaultRoute?: boolean

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
}

// Schema definition in configuration
export type TCreateRouteSchema = ISchema | IBodyLessSchema | undefined | null

/**
 * Route creation method options
 */
export interface ICreateRouteOptions<S extends TCreateRouteSchema, T extends Record<any, any> = {}> extends IRouterBuilderConfig<T> {
  /** The root path of the route, use "/" to use without an additional path */
  root: string

  /** Top-level route schema */
  schema?: S
}

// Create a route response based on schema
export type TCreateRouteResponse<
  S extends TCreateRouteSchema = undefined,
  T extends Record<any, any> = {}
> = S extends ISchema | IBodyLessSchema
  ? (
    S extends IBodyLessSchema
      ? RouterRequestsWithSchema<T>
      : RouterContentRequestsWithSchema<T>
    )
  : (S extends null ? RouterRequestsWithSchema<T> : RouterBuilder<T>)

export default class Application {
  private readonly internalApp: Express

  /**
   * Layer-2 framework based on express
   *
   * @param config application configuration
   */
  constructor(private readonly config?: IApplicationConfig) {
    const app = express()

    // Setup cors if possible
    try {
      const cors = require("cors")
      app.use(cors())
    } catch {
      (config?.logger?.warning || config?.logger?.error)?.("Running the application without CORS. Install the CORS package to automatically enable it")
    }

    // Setup JSON middleware
    if (!config || config.json) {
      app.use(express.json({ limit: config?.json ? config.json.limit : "10mb" }))
    }

    if (config?.onBeforeStart) config.onBeforeStart(app)

    // Choose the default port and host
    const port = config?.port || (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined) || 3000
    const host = config?.host || process.env.APP_HOST || "127.0.0.1"

    if (config?.setDefaultRoute) {
      app.get("/", (_, res) => {
        res.status(200).send("OK")
      })
    }

    app.listen(port, host, () => {
      if (config?.onAppStart) {
        config.onAppStart(host, port, app)
        return
      }

      if (config?.onAppStart !== null) config?.logger?.info(`Application running on host ${ host } and port ${ port }`)
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

    const builder = new RouterBuilder<T>(builderConfig)

    const router = schema !== undefined ? builder.schema(schema) : builder

    this.internalApp.use(options.root, builder.router)

    return router as any
  }

  /**
   * Get express application instance
   */
  public get express() {
    return this.internalApp
  }

  public getRoutes() {

  }
}
