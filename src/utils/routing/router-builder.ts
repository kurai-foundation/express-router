import { Router } from "express"
import createFullDebugConfig from "../create-full-debug-config"
import sendLog, { ILogOptions } from "../send-log"
import { IBodyLessSchema, ISchema, routerUtils, TLogger } from "./router-utils"
import RouterRequestsWithoutSchema from "../../requests/router-requests-without-schema"
import {
  RouterContentRequestsWithSchema,
  RouterRequestsWithSchema
} from "../../requests/router-requests-with-schema"
import { RequestMethods, RouteMetadata } from "../../requests/router-requests-core"
import { TCreateRouteSchema } from "../../types"
import { InternalServerError } from "../../exceptions"
import Application, { IApplicationConfig, IApplicationDebugConfig } from "../../application"
import { ConstructableMiddleware } from "../middleware/middleware"

export interface IApplicationDebugConfigWithLogger extends IApplicationDebugConfig {
  logger?: TLogger
}

export interface IRouterBuilderConfig<T extends Record<any, any>> {
  middleware?: ConstructableMiddleware<T>
  logger?: TLogger
  debug?: IApplicationConfig["debug"]
  tags?: string[]
}

export interface IRegisteredRoute {
  path: string
  method: RequestMethods
  metadata: RouteMetadata | null
  schema?: ISchema | null
}

export default class RouterBuilder<T extends Record<any, any> = {}> extends RouterRequestsWithoutSchema<T> {
  protected registeredRoutes: IRegisteredRoute[] = []
  public readonly symbol = Symbol()
  public readonly tags?: string[]
  private debugLogTail: ILogOptions[] = []

  constructor(public readonly root: string, private config?: IRouterBuilderConfig<T>, app?: Application<IApplicationConfig>) {
    const router = Router()

    super(router, root, () => this.fullDebugConfig)

    this.tags = config?.tags

    if (config?.middleware) {
      sendLog(this.fullDebugConfig, {
        levels: ["info"],
        message: ["Setting up middleware: ", config.middleware.name],
        json: { milestone: "middleware", ok: true, name: config.middleware.name },
        module: "builder"
      })

      const middleware = new config.middleware()

      const customBuilder = middleware.onInitialize()
      if (customBuilder && app) app.injectBuilder(customBuilder)

      router.use(async (request, response, next) => {
        if (!config.middleware) return next()

        sendLog(this.fullDebugConfig, {
          levels: ["info"],
          message: ["Middleware call:", config.middleware.name, request.method.toUpperCase(), this.root + request.path],
          json: { name: config.middleware.name, method: request.method.toUpperCase(), path: this.root + request.path },
          module: "middleware",
          condition: this.fullDebugConfig.middleware
        })

        let result: any

        await routerUtils(response, request, this.fullDebugConfig).errorBoundary(async () => {
          const _result = middleware.onRequest(request, response)

          if (_result instanceof Promise) result = await _result
          else result = _result
        })

        if (!result) return

        Object.assign(request, result)

        next()
      })
    }

    this.registerRouteImpl = this.registerRouteImpl.bind(this)
    super.setupRouteRegisterCallback(this.registerRouteImpl)
  }

  /**
   * Implementation of a route registration method
   * @param path route path
   * @param method request method
   * @param metadata
   * @param schema validation schema
   *
   * @protected
   * @internal
   */
  protected registerRouteImpl(path: string, method: RequestMethods, metadata: RouteMetadata | null, schema?: ISchema | null) {
    sendLog(this.fullDebugConfig, {
      levels: ["info"],
      message: ["Route registered", method.toUpperCase(), this.root + path],
      json: { milestone: "route", method: method.toUpperCase(), path: this.root + path },
      module: "builder"
    })

    const routeRegistered = this.registeredRoutes
      .findIndex(route => route.path.toLowerCase() === path.toLowerCase() && route.method === method)

    const routeLink = routeRegistered !== -1 ? this.registeredRoutes[routeRegistered] : { path, method, metadata, schema }

    if (routeRegistered !== -1) {
      routeLink.path = path
      routeLink.metadata = metadata
      routeLink.method = method
      routeLink.schema = schema
    }
    else {
      this.registeredRoutes.push(routeLink)
    }

    return routeLink
  }

  /**
   * Express router
   */
  public get router() {
    return this._router
  }

  /**
   * Predefine a schema for the following handlers
   *
   * @param schema JOI schema
   */
  public schema<S extends TCreateRouteSchema>(schema: S): S extends null ? RouterRequestsWithSchema<T> : (S extends IBodyLessSchema ? RouterRequestsWithSchema<T> : RouterContentRequestsWithSchema<T>) {
    let router: RouterContentRequestsWithSchema<T> | RouterRequestsWithSchema<T>

    if (schema && "body" in schema) router = new RouterContentRequestsWithSchema<T>(this._router, this.root, schema, () => this.fullDebugConfig)
    else router = new RouterRequestsWithSchema<T>(this._router, this.root, schema as any, () => this.fullDebugConfig)

    router.setupRouteRegisterCallback(this.registerRouteImpl)
    return router as any
  }

  /**
   * Attach logger to the existing router builder instance
   *
   * @param logger compatible logger
   * @param debug enable debug
   */
  public attachLogger(logger?: TLogger, debug?: IApplicationConfig["debug"]) {
    this.config = {
      debug,
      ...this.config,
      logger
    }

    if (this.fullDebugConfig.logs && this.config.logger && this.debugLogTail.length > 0) {
      this.debugLogTail.forEach(message => sendLog(this.fullDebugConfig, message))
      this.debugLogTail = []
    }
  }

  /**
   * List registered routes for swagger transformer
   *
   * @internal
   */
  public getRegisteredRoutes() {
    return this.registeredRoutes.map(route => {
      return {
        ...route,
        metadata: {
          ...route.metadata,
          responses: route.metadata?.responses?.some(e => new e().code === 500)
            ? route.metadata?.responses
            : [...route.metadata?.responses ?? [], InternalServerError]
        }
      }
    })
  }

  private get fullDebugConfig(): IApplicationDebugConfigWithLogger {
    return createFullDebugConfig(this.config?.debug, this.config?.logger)
  }
}
