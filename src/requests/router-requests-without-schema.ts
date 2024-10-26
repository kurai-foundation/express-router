import { Router } from "express"
import { ISchema } from "../utils/router-utils"
import { ParsedQs, ReqCallback, RouterRequestsCore } from "./router-requests-core"

export default class RouterRequestsWithoutSchema<Attachments extends Record<any, any> = {}> extends RouterRequestsCore<Attachments> {
  /**
   * Predefined HTTP requests
   *
   * @internal
   */
  constructor(protected readonly _router: Router) {
    super(_router)
  }

  /**
   * `POST` requests handler.
   *
   * Use POST to create new resources on the server or to submit data that modifies
   * the server’s state (e.g., creating a new user, submitting a form).
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public post<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("post", path, schema, callback)
  }

  /**
   * `PUT` requests handler.
   *
   * Use PUT to update or replace an existing resource with new data.
   * It can also be used to create a resource if it does not already exist
   * (although POST is usually preferred for creation).
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public put<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("put", path, schema, callback)
  }

  /**
   * `PATCH` requests handler.
   *
   * Use PATCH to apply partial updates to an existing resource.
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public patch<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("patch", path, schema, callback)
  }

  /**
   * `DELETE` requests handler.
   *
   * Use DELETE to remove a resource from the server.
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public delete<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: ISchema | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("delete", path, schema, callback)
  }

  /**
   * `OPTIONS` requests handler.
   *
   * Use OPTIONS to check what HTTP methods are allowed or supported for a
   * particular resource or server, without actually making a data-altering request.
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public options<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: Omit<ISchema, "body"> | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("options", path, schema, callback)
  }

  /**
   * `HEAD` requests handler.
   *
   * Use HEAD to retrieve the headers for a resource, without the response body.
   * It’s useful for checking the status or metadata of a resource without
   * downloading the entire content.
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public head<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: Omit<ISchema, "body"> | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("head", path, schema, callback)
  }

  /**
   * `GET` requests handler.
   *
   * Use GET to retrieve data from the server without making any modifications.
   * It’s the most commonly used method for reading or querying data.
   *
   * @param path relative path
   * @param schema requestJOI schema
   * @param callback model
   */
  public get<Body = any, Query extends ParsedQs = any, Route extends string = any>(
    path: Route,
    schema: Omit<ISchema, "body"> | null,
    callback: ReqCallback<Body, Query, Route, Attachments>
  ) {
    this.request("get", path, schema, callback)
  }
}
