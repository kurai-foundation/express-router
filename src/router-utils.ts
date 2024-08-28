import { Request, Response } from "express"
import Joi from "joi"

export interface ISchema<T extends Joi.AnySchema = Joi.AnySchema> {
  params?: T
  query?: T
  body?: T
}

export function routerUtils<Res extends Response, Req extends Request>(res: Res, req?: Req, Logger?: any) {
  let responseSent = false

  const validateSchema = (schema: ISchema, type: keyof ISchema) => {
    if (req?.[type] && schema[type]) {
      const result = schema[type]?.validate(req[type])
      if (!result) return null

      if (result.error) return result.error.details[0].message
    }

    return null
  }

  return {
    sendJSONRaw(data: unknown, status = 200) {
      if (responseSent) return

      responseSent = true
      res.status(status)
        .header("Content-Type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .send(JSON.stringify(data, null, 4))
        .end()
    },

    sendJSON(data: unknown, status = 200) {
      this.sendJSONRaw({
        error: null,
        content: data
      }, status)

      return this
    },

    sendJSONError(error?: string, message?: string, status = 400) {
      this.sendJSONRaw({
        error: error ?? "UnknownError",
        content: {
          message: message ?? "Unknown error occurred"
        }
      }, status)
    },

    schema(schema: ISchema | null) {
      if (!schema) return this

      const validationErrors = [
        validateSchema(schema, "params"),
        validateSchema(schema, "query"),
        validateSchema(schema, "body")
      ].filter(error => error !== null) as string[]

      if (!req && schema) Logger?.warning("Schema has been applied but no request data provided")

      if (validationErrors.length > 0) this.sendJSONError("ValidationError", validationErrors[0])

      return this
    },

    async errorBoundary<T extends (self: typeof this) => unknown>(exec: T) {
      if (responseSent) return this
      try {
        await exec(this)
      } catch (error: any) {
        if (error?.name === "Error") Logger?.error((error?.name ?? "UnknownError") + ": " + (error?.message ?? "No details"))
        this.sendJSONRaw({
          error: error?.name ?? "UnknownError",
          content: error?.message ?? null
        }, error.code || 500)
      }

      return this
    }
  }
}
