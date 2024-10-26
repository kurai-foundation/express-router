import { Request, Router } from "express"
import { ISchema, routerUtils, TLogger } from "../utils/routing/router-utils"
import { RouteParameters } from "express-serve-static-core"
import Exception from "../responses/exception"
import CustomResponse from "../responses/custom-response"

export type RequestMethods = "get" | "post" | "put" | "delete" | "options" | "patch" | "head"

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]
}

export type ReqCallback<ReqBody = any, Query extends ParsedQs = any, Route extends string = any, Attachments extends Record<any, any> = {}> = (
  req: Request<RouteParameters<Route>, any, ReqBody, Query> & Attachments
) => Promise<any> | any

export interface RouteMetadata {
  responses?: ((new () => Exception) | (new () => CustomResponse))[]
  description?: string
}

export type TRegisterRouteCallback = (path: string, method: RequestMethods, metadata: RouteMetadata | null, schema?: ISchema | null) => any

/**
 * @internal
 */
export class RouterRequestsCore<Attachments extends Record<any, any> = {}> {
  protected registerRoute: TRegisterRouteCallback | null = null

  constructor(protected readonly _router: Router, private readonly logger?: TLogger) {
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
   */
  public request<ReqBody = any, Query extends ParsedQs = any, Route extends string = any>(
    method: RequestMethods,
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<ReqBody, Query, Route, Attachments>
  ) {
    this._router[method](path, async (req, res) => {
      await routerUtils(res, req, this.logger)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req as any)

          if (result instanceof CustomResponse) {
            self.sendJSON(result.content, result.code)
          }

          if (result instanceof Error) self.sendException(Exception.fromError(result))

          self.sendJSON(result)
        })
    })

    this.registerRoute?.(path, method, null, schema)

    return {
      metadata: (metadata: RouteMetadata) => {
        this.registerRoute?.(path, method, metadata, schema)
      }
    }
  }
}
