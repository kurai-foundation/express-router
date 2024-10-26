import express, { Express } from "express"
import RouterBuilder from "./router-builder"
import { TLogger } from "./router-utils"
import {
  ICreateRouteOptions,
  ISwaggerTransformerOptions,
  TCreateRouteResponse,
  TCreateRouteSchema,
  TRegisteredBuilder
} from "../types"
import getModule from "./get-module"

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
   * If true, a root GET route will be automatically
   * added to the application, which will return Swagger UI
   *
   * If `swagger-ui-express` or `@kurai-io/express-router-swagger` are not installed,
   * then the default route with `200 OK` response will be served instead
   *
   * @default false
   */
  enableSwagger?: boolean

  /**
   * Optional swagger configuration
   */
  swagger?: Omit<ISwaggerTransformerOptions, "builders">
}

export default class Application {
  private readonly internalApp: Express

  private registeredBuilders: TRegisteredBuilder[] = []

  /**
   * Layer-2 framework based on express
   *
   * @param config application configuration
   */
  constructor(private readonly config?: IApplicationConfig) {
    const app = express()

    // Setup cors if possible
    const cors = getModule("cors")

    if (cors) app.use(cors)
    else (config?.logger?.warning || config?.logger?.error)?.("Running the application without CORS. Install the CORS package to automatically enable it")

    // Setup JSON middleware
    if (!config || config.json) {
      app.use(express.json({ limit: config?.json ? config.json.limit : "10mb" }))
    }

    if (config?.onBeforeStart) config.onBeforeStart(app)

    // Choose the default port and host
    const port = config?.port || (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined) || 3000
    const host = config?.host || process.env.APP_HOST || "127.0.0.1"

    app.listen(port, host, () => {
      if (config?.onAppStart) {
        config.onAppStart(host, port, app)
        return
      }

      if (config?.onAppStart !== null) config?.logger?.info(`Application running on host ${ host } and port ${ port }`)
    })

    // Generate swagger only after setup
    setTimeout(() => {
      if (!config?.enableSwagger) return

      const swaggerModule = getModule<{
        swaggerTransformer: (options: ISwaggerTransformerOptions) => any
      }>("@kurai-io/express-router-swagger")

      const swaggerUi = getModule("swagger-ui-express")

      if (swaggerUi && swaggerModule?.swaggerTransformer) {
        app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerModule.swaggerTransformer({
          ...this.config?.swagger ?? {},
          builders: this.registeredBuilders
        })))

        return
      }

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

    const builder = new RouterBuilder<T>({
      ...builderConfig,
      logger: this.config?.logger
    })

    if (!this.registeredBuilders.some(b => b.builder.symbol === builder.symbol)) {
      this.registeredBuilders.push({ builder, path: root })
    }

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
}
