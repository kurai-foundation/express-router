import express, { Express } from "express"
import * as http from "node:http"
import * as https from "node:https"
import { Cors, ICreateRouteOptions, ISwaggerTransformerOptions, SwaggerThemes, TCreateRouteResponse, TCreateRouteSchema } from "./types"
import { TLogger } from "./utils"
import createFullDebugConfig from "./utils/create-full-debug-config"
import getModule from "./utils/get-module"
import RouterBuilder from "./utils/routing/router-builder"
import sendLog from "./utils/send-log"

export interface IApplicationDebugConfig {
  /** Set true to enable request and internal operations logging */
  logs: boolean

  /**
   * Set true to attach exception stack traces to the responses
   *
   * @default false
   */
  traces?: boolean

  /**
   * Set true to enable middleware call traces
   *
   * @default false
   */
  middleware?: boolean

  /**
   * Set false to disable logging of route exception
   *
   * @default true
   */
  routeExceptions?: boolean

  /**
   * Switch logs into json mode
   *
   * @default false
   */
  json?: boolean
}

/**
 * Interface for configuring an application. Defines properties and options
 * to control various aspects of an application's setup, logging, hosting,
 * middleware configuration, debugging, Swagger integration, and more.
 */
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
   * Cross-Origin Resource Sharing configuration
   *
   * The `cors` module must be installed, otherwise the option has no effect whatsoever
   */
  cors?: {
    /**
     * Configures the Access-Control-Allow-Origin CORS header.
     * Can be a string (e.g. "https://example.com"), an array of origins,
     * a RegExp to match origins, or a custom function `(req, callback) => void`
     * for dynamic origin resolution.
     */
    origin?: Cors.StaticOrigin | Cors.CustomOrigin;

    /**
     * Configures the Access-Control-Allow-Methods CORS header,
     * listing the HTTP methods allowed for CORS requests.
     * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
     */
    methods?: string | string[];

    /**
     * Configures the Access-Control-Allow-Headers CORS header,
     * specifying which headers can be used during the actual request.
     */
    allowedHeaders?: string | string[];

    /**
     * Configures the Access-Control-Expose-Headers CORS header,
     * indicating which headers browsers are allowed to access
     * on the response.
     */
    exposedHeaders?: string | string[];

    /**
     * Configures the Access-Control-Allow-Credentials CORS header.
     * Set to true to allow cookies and other credentials in CORS requests.
     */
    credentials?: boolean;

    /**
     * Configures the Access-Control-Max-Age CORS header.
     * Defines how long (in seconds) the results of a preflight request
     * can be cached by the client.
     */
    maxAge?: number;

    /**
     * Pass the CORS preflight response to the next handler instead of ending the request.
     * @default false
     */
    preflightContinue?: boolean;

    /**
     * Provides the status code to use for successful OPTIONS (preflight) requests.
     * Some legacy browsers (e.g. IE11) choke on 204.
     * @default 204
     */
    optionsSuccessStatus?: number;
  }

  /**
   * When set as boolean:
   * - Enable or disable debug logs and exception stack traces in the responses.
   * Logging works only when `logger` specified
   *
   * When set as an object:
   * - `.logs` - enable or disable debug logs. Logging works only when `logger` specified
   * - `.traces` - enable or disable exception stack traces in the responses
   *
   * @default false
   */
  debug?: boolean | IApplicationDebugConfig

  /**
   * If true, a root GET route will be automatically
   * added to the application, which will return Swagger UI
   *
   * Requires both `swagger-ui-express` and `@kurai-io/express-router-swagger` to serve UI
   * or just `@kurai-io/express-router-swagger` to serve only JSON specification
   *
   * Object configuration will be counted as true (swagger enabled)
   */
  swagger?: (Omit<ISwaggerTransformerOptions, "builders"> & {
    /**
     * Path where Swagger UI will be served
     *
     * @default /docs
     */
    path?: string

    /**
     * Path where the swagger.json file will be served
     *
     * When specified, creates an endpoint that serves the OpenAPI/Swagger specification
     * in JSON format
     *
     * Requires `@kurai-io/express-router-swagger` transformer module
     */
    jsonFilePath?: string

    /**
     * Custom title displayed in Swagger UI
     */
    title?: string

    /**
     * Custom title for the Swagger UI page. This will be displayed
     * in the browser's title bar and as the main heading of the UI
     *
     * @default Swagger's default title
     */
    siteTitle?: string

    /**
     * URL to a custom favicon for the Swagger UI page.
     * Must be a valid URL pointing to an image file
     *
     * @default Swagger's default favicon
     */
    icon?: string

    /**
     * Swagger UI theme
     *
     * Requires `swagger-themes` module
     */
    theme?: SwaggerThemes
  }) | true

  /**
   * Secure server configuration
   *
   * When set, the internal server will automatically switch into https mode
   */
  https?: https.ServerOptions

  /**
   * Completely disable the internal server
   *
   * _Use this only if you later attach the application to a custom http server_
   */
  serverless?: boolean
}

export default class Application<T extends IApplicationConfig> {
  private readonly internalApp: Express
  private readonly internalServer?: http.Server | https.Server

  private swaggerContent?: any
  private readonly swaggerModule: {
    swaggerTransformer: (options: ISwaggerTransformerOptions) => any
  } | null = null

  private registeredBuilders: RouterBuilder[] = []

  /**
   * Layer-2 framework based on express
   *
   * @param config application configuration
   */
  constructor(private readonly config?: T) {
    const app = express()

    const fullDebugConfig = createFullDebugConfig(config?.debug, config?.logger)

    // Set up cors if possible
    const cors = getModule("cors")

    if (cors) {
      sendLog(fullDebugConfig, {
        levels: ["info"],
        message: "Setting up global CORS middleware",
        json: { milestone: "module", ok: true, modules: ["cors"] },
        module: "application",
      })

      app.use(cors(config?.cors))
    }

    sendLog(fullDebugConfig, {
      levels: ["warning"],
      message: "Running the application without CORS. Install the CORS package to automatically enable it",
      json: { milestone: "module", ok: false, modules: ["cors"] },
      condition: !cors,
      module: "application"
    })

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

        sendLog(fullDebugConfig, {
          message: `Application running on host ${ host } and port ${ port }`,
          json: { milestone: "server", ok: true, serverless: false, host, port },
          levels: ["info"],
          module: "application"
        })
      })
    }
    else {
      sendLog(fullDebugConfig, {
        levels: ["warning"],
        message: "Running application in serverless mode, you should configure http server yourself",
        json: { milestone: "server", ok: true, serverless: true },
        module: "application"
      })
    }

    this.internalApp = app

    // Swagger setup

    if (!config?.swagger) return

    this.swaggerModule = getModule<{
      swaggerTransformer: (options: ISwaggerTransformerOptions) => any
    }>("@kurai-io/express-router-swagger")

    const swaggerUi = getModule("swagger-ui-express")

    const swaggerConfig = { path: "/docs", ...(typeof this.config?.swagger === "object" ? this.config.swagger : {}) }

    if (swaggerConfig.jsonFilePath) {
      if (!this.swaggerModule?.swaggerTransformer) {
        sendLog(fullDebugConfig, {
          levels: ["warning", "error"],
          message: "Failed to serve swagger JSON file: transformer module @kurai-io/express-router-swagger not found",
          json: { milestone: "module", ok: false, modules: ["@kurai-io/express-router-swagger"] },
          module: "application"
        })

        return
      }

      sendLog(fullDebugConfig, {
        levels: ["info"],
        message: "Serving swagger JSON file at " + swaggerConfig.jsonFilePath,
        json: { milestone: "swagger", type: "json", ok: true, path: swaggerConfig.jsonFilePath },
        module: "application",
      })

      app.use(swaggerConfig.jsonFilePath, (_, res) => {
        res.setHeader("Content-Type", "application/json").status(200).send(JSON.stringify(this.swaggerContent, null, 2)).end()
      })
    }

    if (!swaggerUi || !this.swaggerModule?.swaggerTransformer) {
      const missingModules: string[] = []
      if (!swaggerUi) missingModules.push("swagger-ui-express")
      if (!this.swaggerModule?.swaggerTransformer) {
        missingModules.push("@kurai-io/express-router-swagger")
      }

      sendLog(fullDebugConfig, {
        levels: ["warning", "error"],
        message: "Swagger UI not available due to one or both required modules not found: " + missingModules.join(", "),
        json: { milestone: "module", ok: false, modules: missingModules },
        module: "application",
      })

      return
    }

    const swaggerUISetupOptions: Record<string, any> = { swaggerOptions: {} }

    if (swaggerConfig.icon) swaggerUISetupOptions.customfavIcon = swaggerConfig.icon
    if (swaggerConfig.siteTitle) swaggerUISetupOptions.customSiteTitle = swaggerConfig.siteTitle
    if (swaggerConfig.theme) {
      const themeModule = getModule<{ SwaggerTheme: new () => any }>("swagger-themes")

      if (themeModule) {
        const theme = new themeModule.SwaggerTheme()
        swaggerUISetupOptions.customCss = theme.getBuffer(swaggerConfig.theme)
      }

      sendLog(fullDebugConfig, {
        levels: ["warning", "error"],
        message: "Unable to set up swagger UI theme due to missing swagger-themes module",
        json: { milestone: "module", ok: false, modules: ["swagger-themes"] },
        module: "application",
        condition: !themeModule
      })
    }

    if (swaggerConfig.jsonFilePath) swaggerUISetupOptions.swaggerOptions.urls = [
      { url: swaggerConfig.jsonFilePath, name: "Swagger JSON file" }
    ]

    sendLog(fullDebugConfig, {
      levels: ["info"],
      message: "Serving swagger at " + swaggerConfig.path,
      json: { milestone: "swagger", type: "ui", ok: true, path: swaggerConfig.path },
      module: "application",
    })

    app.use(swaggerConfig.path, swaggerUi.serve, (...args) => {
      swaggerUi.setup(this.swaggerContent, swaggerUISetupOptions)(...args)
    })

    this.updateSwaggerDefinition()
  }

  private updateSwaggerDefinition() {
    if (!this.swaggerModule) return
    const swaggerConfig = { path: "/docs", ...(typeof this.config?.swagger === "object" ? this.config.swagger : {}) }

    setTimeout(() => {
      this.swaggerContent = this.swaggerModule?.swaggerTransformer({
        ...swaggerConfig,
        builders: this.registeredBuilders
      })
    })
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

    sendLog(createFullDebugConfig(this.config?.debug, this.config?.logger), {
      levels: ["info"],
      message: "Router builder created for route " + builder.root,
      json: { milestone: "builder", root: builder.root },
      module: "application"
    })

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

    if (this.config?.logger) builder.attachLogger(this.config?.logger, this.config.debug)

    this.internalApp.use(builder.root, builder.router)

    this.updateSwaggerDefinition()
  }

  /**
   * Get express application instance
   */
  public get express() {
    return this.internalApp
  }

  public httpServer(): T extends undefined ? http.Server : T["serverless"] extends true ? undefined : (T["https"] extends https.ServerOptions ? https.Server : http.Server) {
    return this.internalServer as any
  }
}
