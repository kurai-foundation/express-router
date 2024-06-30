import { Router } from "express"
import { ISchema } from "../router-utils"
import { ParsedQs, ReqCallback, RouterRequestsCore } from "./router-requests-core"

export default class RouterRequestsWithSchema extends RouterRequestsCore {
  constructor(protected readonly _router: Router, private readonly schema: ISchema | null) {
    super(_router)
  }

  public post<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("post", path, this.schema, callback)
  }

  public put<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("put", path, this.schema, callback)
  }

  public patch<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("patch", path, this.schema, callback)
  }

  public delete<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("delete", path, this.schema, callback)
  }

  public options<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("options", path, this.schema, callback)
  }

  public head<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("head", path, this.schema, callback)
  }

  public get<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    callback: ReqCallback<Body, Query, Route>
  ) {
    this.request("get", path, this.schema, callback)
  }
}
