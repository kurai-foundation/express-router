import { Router } from "express"
import Joi from "joi"
import { ISchema } from "./router-utils"
import RouterRequestsWithoutSchema from "./requests/router-requests-without-schema"
import RouterRequestsWithSchema from "./requests/router-requests-with-schema"

export default class RouterBuilder extends RouterRequestsWithoutSchema {
  constructor() {
    const router = Router()
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

  public schema(schema: ISchema | null) {
    return new RouterRequestsWithSchema(this._router, schema)
  }
}
