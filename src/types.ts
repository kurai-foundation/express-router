import CustomResponse from "./responses/custom-response"
import { IBodyLessSchema, ISchema } from "./utils/routing/router-utils"
import RouterBuilder, { IRouterBuilderConfig } from "./utils/routing/router-builder"
import { RouterContentRequestsWithSchema, RouterRequestsWithSchema } from "./requests/router-requests-with-schema"
import { Request } from "express"

export interface ISwaggerServer {
  /** Server url */
  url: string

  /** Server description */
  description?: string

  /** Variables */
  variables?: Record<string, any>
}

export type ResponsesList<T extends string> = Record<T, new (content: any) => CustomResponse>

export type AnyRequest = Request<any, any, any, any, any>

export type RequestWithBody<T extends Record<string, any>> = Request<any, any, T>

export type RequestWithQuery<T extends Record<string, string>> = Request<any, any, any, T>

export interface ISwaggerTransformerOptions {
  /** Swagger documentation title */
  title?: string

  /** Swagger documentation description */
  description?: string

  /** Swagger documentation version */
  version?: string

  /** List of available servers */
  servers?: ISwaggerServer[]

  builders: RouterBuilder[]

  /** List of security schemas */
  securitySchemas?: Record<string, SwaggerSecuritySchemes.SecurityScheme>
}

// Schema definition in configuration
export type TCreateRouteSchema = ISchema | IBodyLessSchema | undefined | null

/**
 * Route creation method options
 */
export interface ICreateRouteOptions<S extends TCreateRouteSchema, T extends Record<any, any> = {}> extends Omit<IRouterBuilderConfig<T>, "logger"> {
  /** The root path of the route, use "/" to use without an additional path */
  root: string

  /** Top-level route schema */
  schema?: S
}

// Create a route response based on schema
export type TCreateRouteResponse<
  S extends TCreateRouteSchema = undefined,
  T extends Record<any, any> = {}
> = S extends ISchema | IBodyLessSchema
  ? (
    S extends IBodyLessSchema
      ? RouterRequestsWithSchema<T>
      : RouterContentRequestsWithSchema<T>
    )
  : (S extends null ? RouterRequestsWithSchema<T> : RouterBuilder<T>)

export type SwaggerThemes = "classic"
  | "dark-monokai"
  | "dark"
  | "dracula"
  | "feeling-blue"
  | "flattop"
  | "gruvbox"
  | "material"
  | "monokai"
  | "muted"
  | "newspaper"
  | "nord-dark"
  | "one-dark"
  | "outline"

export namespace SwaggerSecuritySchemes {
  interface BaseSecurityScheme {
    description?: string
  }

  export interface HttpSecurityScheme extends BaseSecurityScheme {
    type: "http"
    scheme: string
    bearerFormat?: string
  }

  export interface ApiKeySecurityScheme extends BaseSecurityScheme {
    type: "apiKey"
    in: "query" | "header" | "cookie"
    name: string;
  }

  export interface OAuth2SecurityScheme extends BaseSecurityScheme {
    type: "oauth2"
    flows: {
      implicit?: OAuth2Flow
      password?: OAuth2Flow
      clientCredentials?: OAuth2Flow
      authorizationCode?: OAuth2Flow
    }
  }

  export interface OAuth2Flow {
    authorizationUrl?: string
    tokenUrl?: string
    refreshUrl?: string
    scopes: Record<string, string>
  }

  export interface OpenIdSecurityScheme extends BaseSecurityScheme {
    type: "openIdConnect";
    openIdConnectUrl: string;
  }

  export type SecurityScheme =
    | HttpSecurityScheme
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdSecurityScheme
}

export namespace Cors {
  /**
   * A static CORS origin definition. Can be:
   * - `boolean` — `true` to allow any origin, `false` to allow none
   * - `string` — a single allowed origin
   * - `RegExp` — a regular expression to match allowed origins
   * - `Array<boolean | string | RegExp>` — a list of any combination of the above
   */
  export type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>

  /**
   * A custom function to dynamically determine the CORS origin
   *
   * @param requestOrigin `origin` header value from the incoming request
   * @param callback a function to call with the result:
   */
  export type CustomOrigin = (
    requestOrigin: string | undefined,
    callback: (err: Error | null, origin?: StaticOrigin) => void
  ) => void
}