import { Request, Router } from "express"
import { ISchema, routerUtils } from "../utils/router-utils"
import { RouteParameters } from "express-serve-static-core"
import Exception from "../utils/exception"

export type RequestMethods = "get" | "post" | "put" | "delete" | "options" | "patch" | "head"
export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[]
}

export type ReqCallback<ReqBody = any, Query extends ParsedQs = any, Route extends string = any, Attachments extends Record<any, any> = {}> = (
  req: Request<RouteParameters<Route>, any, ReqBody, Query> & Attachments
) => Promise<any>

/**
 * @internal
 */
export class RouterRequestsCore<Attachments extends Record<any, any> = {}> {
  constructor(protected readonly _router: Router) {
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
      await routerUtils(res, req)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req as any)

          if (result instanceof Error) {
            self.sendException(Exception.fromError(result))
          }

          self.sendJSON(result)
        })
    })
  }
}
