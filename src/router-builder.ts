import { Request, Router } from "express"
import Joi from "joi"
import { ISchema, routerUtils } from "./router-utils"
import { RouteParameters } from "express-serve-static-core"

export default class RouterBuilder {
  private readonly _router: Router

  constructor() {
    this._router = Router()
  }

  public router() {
    return this._router
  }

  public generateSchema(target: "body" | "params" | "query", content: { [key: string]: any }): ISchema {
    return {
      [target]: Joi.object(content)
    }
  }

  public post<Body = any, Route extends string = any>(
    path: Route,
    schema: ISchema,
    callback: (req: Request<RouteParameters<Route>, any, Body>) => Promise<any>
  ) {
    this._router.post(path, async (req, res) => {
      await routerUtils(res, req)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req)

          self.sendJSON(result)
        })
    })
  }

  public get<Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: (req: Request<RouteParameters<Route>>) => Promise<any>
  ) {
    this._router.get(path, async (req, res) => {
      await routerUtils(res, req)
        .schema(schema)
        .errorBoundary(async self => {
          const result = await callback(req)

          self.sendJSON(result)
        })
    })
  }
}
