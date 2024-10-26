import { Router, Request } from "express"
import Joi from "joi"
import { IBodyLessSchema, ISchema, TLogger } from "./router-utils"
import RouterRequestsWithoutSchema from "../requests/router-requests-without-schema"
import {
  RouterContentRequestsWithSchema,
  RouterRequestsWithSchema
} from "../requests/router-requests-with-schema"
import { RequestMethods, RouteMetadata } from "../requests/router-requests-core"
import { TCreateRouteSchema } from "../types"
import { InternalServerError } from "../exceptions"

export interface IRouterBuilderConfig<T> {
  middleware?: (request: Request, builder: RouterBuilder) => T
  logger?: TLogger
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

  constructor(private readonly config?: IRouterBuilderConfig<T>) {
    const router = Router()

    if (config?.middleware) {
      router.use((request, _, next) => {
        if (!config.middleware) return next()

        Object.assign(request, config.middleware(request, this))

        next()
      })
    }

    super(router, config?.logger)

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
    const routeRegistered = this.registeredRoutes
      .findIndex(route => route.path.toLowerCase() === path.toLowerCase() && route.method === method)

    if (routeRegistered !== -1) {
      this.registeredRoutes[routeRegistered] = { path, method, metadata, schema }
    } else {
      this.registeredRoutes.push({ path, method, metadata, schema })
    }
  }

  /**
   * Express router
   */
  public get router() {
    return this._router
  }

  /**
   * @deprecated
   *
   * Generate schema from source
   *
   * @param target target validation unit
   * @param content schema
   */
  public generateSchema(target: "body" | "params" | "query", content: { [key: string]: any }): ISchema {
    return {
      [target]: Joi.object(content)
    }
  }

  /**
   * Predefine a schema for the following handlers
   *
   * @param schema JOI schema
   */
  public schema<S extends TCreateRouteSchema>(schema: S): S extends IBodyLessSchema ? RouterRequestsWithSchema<T> : RouterContentRequestsWithSchema<T> {
    let router: RouterContentRequestsWithSchema<T> | RouterRequestsWithSchema<T>

    if (schema && "body" in schema) router = new RouterContentRequestsWithSchema<T>(this._router, schema, this.config?.logger)
    else router = new RouterRequestsWithSchema<T>(this._router, schema as any, this.config?.logger)

    router.setupRouteRegisterCallback(this.registerRouteImpl)
    return router as any
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
}
