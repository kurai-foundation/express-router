import { IBodyLessSchema, ISchema } from "./utils/router-utils"
import RouterBuilder, { IRouterBuilderConfig } from "./utils/router-builder"
import { RouterContentRequestsWithSchema, RouterRequestsWithSchema } from "./requests/router-requests-with-schema"

export interface ISwaggerServer {
  /** Server url */
  url: string

  /** Server description */
  description?: string

  /** Variables */
  variables?: Record<string, any>
}

export interface ISwaggerTransformerOptions {
  /** Swagger documentation title */
  title?: string

  /** Swagger documentation description */
  description?: string

  /** Swagger documentation version */
  version?: string

  /** List of available servers */
  servers?: ISwaggerServer[]
  builders: TRegisteredBuilder[]
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

export type TRegisteredBuilder = { builder: RouterBuilder, path: string }

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
