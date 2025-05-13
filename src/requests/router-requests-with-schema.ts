import { Router } from "express"
import { ICustomResponseOptions } from "../responses/custom-response"
import { IApplicationDebugConfigWithLogger } from "../utils/routing/router-builder"
import { ISchema } from "../utils/routing/router-utils"
import { ParsedQs, ReqCallback, RouterRequestsCore } from "./router-requests-core"

export class RouterContentRequestsWithSchema<Attachments extends Record<any, any> = {}> extends RouterRequestsCore<Attachments> {
  /**
   * Predefined HTTP requests with predefined by parent schema
   *
   * @internal
   *
   * @param _router express router instance
   * @param schema inherited schema
   * @param debugConfig debug logging configuration
   */
  constructor(protected readonly _router: Router, protected readonly schema: ISchema | null, debugConfig?: () => IApplicationDebugConfigWithLogger) {
    super(_router, debugConfig)
  }

  /**
   * `POST` requests handler.
   *
   * Use POST to create new resources on the server or to submit data that modifies
   * the server’s state (e.g., creating a new user, submitting a form).
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public post<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("post", path, this.schema, callback, responses)
  }

  /**
   * `PUT` requests handler.
   *
   * Use PUT to update or replace an existing resource with new data.
   * It can also be used to create a resource if it does not already exist
   * (although POST is usually preferred for creation).
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public put<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("put", path, this.schema, callback, responses)
  }

  /**
   * `PATCH` requests handler.
   *
   * Use PATCH to apply partial updates to an existing resource.
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public patch<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("patch", path, this.schema, callback, responses)
  }

  /**
   * `DELETE` requests handler.
   *
   * Use DELETE to remove a resource from the server.
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public delete<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("delete", path, this.schema, callback, responses)
  }
}

/**
 * Predefined HTTP requests (that cannot contain body) with predefined by parent schema
 *
 * @internal
 */
export class RouterRequestsWithSchema<Attachments extends Record<any, any> = {}> extends RouterContentRequestsWithSchema<Attachments> {
  /**
   * Predefined HTTP requests (that cannot contain body) with predefined by parent schema
   *
   * @param _router express router instance
   * @param schema inherited schema
   * @param debugConfig debug logging configuration
   *
   * @internal
   */
  constructor(protected readonly _router: Router, schema: ISchema | null, debugConfig?: () => IApplicationDebugConfigWithLogger) {
    super(_router, schema, debugConfig)
  }

  /**
   * `GET` requests handler.
   *
   * Use GET to retrieve data from the server without making any modifications.
   * It’s the most commonly used method for reading or querying data.
   *
   * @param path relative path
   * @param callback model
   * @param responses list of custom responses
   */
  public get<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("get", path, this.schema, callback, responses)
  }

  /**
   * `OPTIONS` requests handler.
   *
   * Use OPTIONS to check what HTTP methods are allowed or supported for a
   * particular resource or server, without actually making a data-altering request.
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public options<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("options", path, this.schema, callback, responses)
  }

  /**
   * `HEAD` requests handler.
   *
   * Use HEAD to retrieve the headers for a resource, without the response body.
   * It’s useful for checking the status or metadata of a resource without
   * downloading the entire content.
   *
   * @param path relative path
   * @param callback model
   * @param responses
   */
  public head<Body = any, Query extends ParsedQs = any, Route extends string = any, Responses extends Record<string, Omit<ICustomResponseOptions, "content">> = {}>(
    path: Route,
    callback: ReqCallback<Body, Query, Route, Attachments, Responses>,
    responses?: Responses
  ) {
    return this.request("head", path, this.schema, callback, responses)
  }
}
