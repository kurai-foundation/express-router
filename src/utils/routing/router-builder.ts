import { Router } from "express"
import { IBodyLessSchema, ISchema, routerUtils, TLogger } from "./router-utils"
import RouterRequestsWithoutSchema from "../../requests/router-requests-without-schema"
import {
  RouterContentRequestsWithSchema,
  RouterRequestsWithSchema
} from "../../requests/router-requests-with-schema"
import { RequestMethods, RouteMetadata } from "../../requests/router-requests-core"
import { TCreateRouteSchema } from "../../types"
import { InternalServerError } from "../../exceptions"
import Application, { IApplicationConfig } from "../../application"
import { ConstructableMiddleware } from "../middleware/middleware"

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
  private debugLogTail: string[] = []

  constructor(public readonly root: string, private config?: IRouterBuilderConfig<T>, app?: Application<IApplicationConfig>) {
    const router = Router()

    super(router, () => this.buildDebugConfig())

    this.buildDebugConfig = this.buildDebugConfig.bind(this)

    this.tags = config?.tags

    if (config?.middleware) {
      this.debugLog("Setting up middleware:", config.middleware.name)

      const middleware = new config.middleware()

      const customBuilder = middleware.onInitialize()
      if (customBuilder && app) app.injectBuilder(customBuilder)

      router.use(async (request, response, next) => {
        if (!config.middleware) return next()

        this.debugLog("Middleware call:", config.middleware.name, request.method.toUpperCase(), request.path)
        let result: any

        const traces = this.config?.debug === true || (typeof config.debug === "object" && config.debug.traces)
        await routerUtils(response, request, config.logger, traces).errorBoundary(async () => {
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
    this.debugLog("Route registered", method.toUpperCase(), this.root + path)

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

    if (schema && "body" in schema) router = new RouterContentRequestsWithSchema<T>(this._router, schema, this.buildDebugConfig)
    else router = new RouterRequestsWithSchema<T>(this._router, schema as any, this.buildDebugConfig)

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

    if (this.buildDebugConfig()?.[1] && this.config.logger && this.debugLogTail.length > 0) {
      this.debugLogTail.forEach(message => this.debugLog(message))
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

  private debugLog(...message: string[]) {
    if (!this.buildDebugConfig()?.[1] || !this.config?.logger) {
      if (this.debugLogTail.length >= 10) this.debugLogTail.slice(1)
      this.debugLogTail.push(message.join(" "))
      return
    }

    (this.config?.logger?.debug || this.config.logger?.info)?.(message.join(" "))
  }

  private buildDebugConfig() {
    const logging = typeof this.config?.debug === "object" ? this.config.debug.logs : this.config?.debug

    return this.config?.logger && logging ? [
      this.config?.logger,
      logging,
      this.config.debug === true || (typeof this.config.debug === "object" && this.config.debug.traces)
    ] as [TLogger, boolean, boolean] : undefined

  }
}
