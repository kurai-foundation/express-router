import { Request, Router } from "express"
import FileResponse from "../responses/file-response"
import Redirect from "../responses/redirect"
import { IRegisteredRoute } from "../utils"
import getModule from "../utils/get-module"
import { IApplicationDebugConfigWithLogger } from "../utils/routing/router-builder"
import { ISchema, routerUtils } from "../utils/routing/router-utils"
import { RouteParameters } from "express-serve-static-core"
import Exception from "../responses/exception"
import CustomResponse, { ICustomResponseOptions, ResponseFactory } from "../responses/custom-response"
import sendLog from "../utils/send-log"

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
  auth?: string[] | Record<string, string[]>
  deprecated?: boolean
}

export type TRegisterRouteCallback = (path: string, method: RequestMethods, metadata: RouteMetadata | null, schema?: ISchema | null) => IRegisteredRoute

const colorsModule = getModule("colors")

/**
 * @internal
 */
export class RouterRequestsCore<Attachments extends Record<any, any> = {}> {
  protected registerRoute: TRegisterRouteCallback | null = null

  constructor(protected readonly _router: Router, private readonly base: string, private readonly debugConfig?: () => IApplicationDebugConfigWithLogger) {}

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

    let executeOnLog: Function | null = null

    this._router[method](path, async (req, res) => {
      const debug = this.debugConfig?.()
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
      let resultCode = 200
      await routerUtils(res, req, debug)
        .schema(schema, code => resultCode = code)
        .errorBoundary(async self => {
          const result = await callback(req as any, c as any)
          resultCode = typeof result?.code === "number" ? result.code : 200

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

          if (result instanceof Redirect) self.redirect(result.to, result.code)

          if (result instanceof FileResponse) self.sendFile(result.path, result.options)

          self.sendJSON(result)
        }, (name, message, code) => {
          if (debug?.routeExceptions && code >= 500) executeOnLog = () => {
            colorsModule.enable()
            const messageText = colorsModule && !debug.json ? colorsModule.dim(`${ name }: ${ message }`) : `${ name }: ${ message }`

            sendLog(debug, {
              message: colorsModule ? ` ${ colorsModule.dim("->") } ${ messageText }` : messageText,
              json: { name, message },
              levels: ["error"],
              module: "router"
            })

            colorsModule.disable()
          }

          resultCode = code
        })

      const execTime = Math.round((performance.now() - startTime) * 1000) / 1000
      sendLog(debug, {
        levels: [resultCode >= 500 ? "error" : "info"],
        message: `${ method.toUpperCase() } ${ this.base + path } - ${ resultCode } - ${ execTime }ms`,
        json: { method: method.toUpperCase(), path: this.base + path, code: resultCode, time: execTime },
        module: "requests"
      })

      executeOnLog?.()
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
