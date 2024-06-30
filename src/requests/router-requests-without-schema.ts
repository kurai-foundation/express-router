import { Router } from "express"
import { ISchema } from "../router-utils"
import { ParsedQs, ReqCallback, RouterRequestsCore } from "./router-requests-core"

export default class RouterRequestsWithoutSchema extends RouterRequestsCore {
  constructor(protected readonly _router: Router) {
    super(_router)
  }

  public post<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("post", path, schema, callback)
  }

  public put<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("put", path, schema, callback)
  }

  public patch<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("patch", path, schema, callback)
  }

  public delete<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("delete", path, schema, callback)
  }

  public options<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("options", path, schema, callback)
  }

  public head<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("head", path, schema, callback)
  }

  public get<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("get", path, schema, callback)
  }
}
