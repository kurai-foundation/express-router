import { Request, Router } from "express"
import { ISchema, routerUtils } from "../router-utils"
import { RouteParameters } from "express-serve-static-core"

export type RequestMethods = "get" | "post" | "put" | "delete" | "options" | "patch" | "head"
export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export type ReqCallback<ReqBody = any, Query extends ParsedQs = any, Route extends string = any> = (
  req: Request<RouteParameters<Route>, any, ReqBody, Query>
) => Promise<any>

export class RouterRequestsCore {
  constructor(protected readonly _router: Router) {
  }

  public request<ReqBody = any, Query extends ParsedQs = any, Route extends string = any>(
    method: RequestMethods,
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<ReqBody, Query, Route>
  ) {
    this._router[method](path, async (req, res) => {
      await routerUtils(res, req)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req as any)

          self.sendJSON(result)
        })
    })
  }
}
