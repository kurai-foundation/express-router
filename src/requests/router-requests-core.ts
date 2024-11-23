import { Request, Router } from "express"
import { IRegisteredRoute } from "../utils/routing/router-builder"
import { ISchema, routerUtils, TLogger } from "../utils/routing/router-utils"
import { RouteParameters } from "express-serve-static-core"
import Exception from "../responses/exception"
import CustomResponse, { ICustomResponseOptions, ResponseFactory } from "../responses/custom-response"

export type RequestMethods = "get" | "post" | "put" | "delete" | "options" | "patch" | "head"

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]
}

export type ReqCallback<ReqBody = any, Query extends ParsedQs = any, Route extends string = any, Attachments extends Record<any, any> = {}, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}> = (
  req: Request<RouteParameters<Route>, any, ReqBody, Query> & Attachments,
  responses: Record<keyof Responses, new (content: any) => CustomResponse>
) => Promise<any> | any

export interface RouteMetadata {
  responses?: ((new () => Exception) | (new () => CustomResponse))[]
  description?: string
  example?: any
}

export type TRegisterRouteCallback = (path: string, method: RequestMethods, metadata: RouteMetadata | null, schema?: ISchema | null) => IRegisteredRoute

/**
 * @internal
 */
export class RouterRequestsCore<Attachments extends Record<any, any> = {}> {
  protected registerRoute: TRegisterRouteCallback | null = null

  constructor(protected readonly _router: Router, private readonly logger?: TLogger, private readonly debug = false) {
  }

  public setupRouteRegisterCallback(registerRoute: TRegisterRouteCallback) {
    this.registerRoute = registerRoute
  }

  /**
   * Register request in express router
   *
   * @internal
   * @param method request method
   * @param path request relative path
   * @param schema request schema
   * @param callback model
   * @param responses list of custom responses
   */
  public request<ReqBody = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    method: RequestMethods,
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<ReqBody, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    const metadata: RouteMetadata | null = responses ? {
      responses: Object.values(responses).map(options => ResponseFactory({
        ...options,
        content: "Response content"
      }))
    } : null

    const routeLink = this.registerRoute?.(path, method, metadata, schema)

    if (!routeLink) throw new Error("No route registration implementation found")

    this._router[method](path, async (req, res) => {
      const startTime = performance.now()
      const c = Object.fromEntries(
        Object.entries(responses ?? {}).map(([key, value]) => [
          key,
          ResponseFactory({
            ...value,
            content: null
          })
        ])
      )
      await routerUtils(res, req, this.logger, this.debug)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req as any, c as any)

          if (result instanceof CustomResponse) {
            const isRaw = result.raw || (result.headers && result.headers.get("content-type") !== "application/json")

            if (isRaw) {
              const send = result.headers.get("content-type") === "application/json"
                ? self.sendJSONRaw
                : self.sendRaw

              send(result.content, result.code, result.headers)
            }

            self.sendJSON(result.content, result.code)
          }

          if (result instanceof Error) self.sendException(Exception.fromError(result))

          self.sendJSON(result)
        })

      const execTime = Math.round((performance.now() - startTime) * 1000) / 1000
      if (this.debug && this.logger) {
        (this.logger.debug || this.logger.info)?.(`${ method.toUpperCase() } ${ path } - ${ execTime }ms`)
      }
    })

    return {
      metadata: (metadata: RouteMetadata) => {
        if (!routeLink) return

        routeLink.metadata = {
          ...routeLink?.metadata ?? {},
          ...metadata
        }
      }
    }
  }
}
