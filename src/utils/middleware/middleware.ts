import RouterBuilder from "../routing/router-builder"
import { Request, Response } from "express"

export interface IMiddlewareOptions<T = any> {
  /**
   * Initialization method calls when RouterBuilder is constructed
   */
  onInitialize?(): RouterBuilder | void

  /**
   * Fires on every request to the RouterBuilder
   *
   * @param request express request
   * @param response express response
   */
  onRequest(request: Request, response: Response): T
}

/** Represents middleware class itself */
export type ConstructableMiddleware<T = any> = new () => Middleware<T>

export abstract class Middleware<T = any> {
  /**
   * Abstract middleware class
   *
   * @param options middleware core options
   */
  protected constructor(protected readonly options: IMiddlewareOptions<T>) {
  }

  /**
   * Initialization method calls when RouterBuilder is constructed
   */
  public onInitialize(): void | RouterBuilder {
    return this.options.onInitialize?.()
  }

  /**
   * Fires on every request to the RouterBuilder
   *
   * @param request express request
   * @param response express response
   */
  public onRequest(request: Request, response: Response): T {
    return this.options.onRequest(request, response)
  }
}
