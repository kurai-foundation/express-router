import { Router, Request } from "express"
import Joi from "joi"
import { IBodyLessSchema, ISchema } from "./utils/router-utils"
import RouterRequestsWithoutSchema from "./requests/router-requests-without-schema"
import {
  RouterContentRequestsWithSchema,
  RouterRequestsWithSchema
} from "./requests/router-requests-with-schema"

export interface IRouterBuilderConfig<T> {
  middleware?: (request: Request) => T
}

export default class RouterBuilder<T extends Record<any, any> = {}> extends RouterRequestsWithoutSchema<T> {
  constructor(private config?: IRouterBuilderConfig<T>) {
    const router = Router()

    if (config?.middleware) {
      router.use((request, _, next) => {
        if (!config.middleware) return next()

        Object.assign(request, config.middleware(request))

        next()
      })
    }

    super(router)
  }

  public get router() {
    return this._router
  }

  public generateSchema(target: "body" | "params" | "query", content: { [key: string]: any }): ISchema {
    return {
      [target]: Joi.object(content)
    }
  }

  public schema(schema: IBodyLessSchema | null): RouterRequestsWithSchema<T>
  public schema(schema: ISchema | null): RouterContentRequestsWithSchema<T>

  public schema(schema: ISchema | IBodyLessSchema | null): RouterContentRequestsWithSchema<T> | RouterRequestsWithSchema<T> {
    if (schema && "body" in schema) return new RouterContentRequestsWithSchema<T>(this._router, schema)

    return new RouterRequestsWithSchema<T>(this._router, schema)
  }
}
