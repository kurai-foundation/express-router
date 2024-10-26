import { Request, Response } from "express"
import Joi from "joi"
import Exception from "../../responses/exception"
import { BadRequest } from "../../exceptions"

/** Schema without body */
export interface IBodyLessSchema<T extends Joi.AnySchema = Joi.AnySchema> {
  params?: T
  query?: T
}

/** Schema with body */
export interface ISchema<T extends Joi.AnySchema = Joi.AnySchema> extends IBodyLessSchema<T> {
  body?: T
}

export type TLoggerFnType = ((message: string) => any) | ((...message: string[]) => any)

/** Required methods for basic logging */
export type TLogger<T = TLoggerFnType> = { error: T, warning?: T, info: T }

/**
 * Utility function to perform internal things
 *
 * @param res express response
 * @param req express request
 * @param logger optional logger instance
 *
 * @internal
 */
export function routerUtils<Res extends Response, Req extends Request>(res: Res, req?: Req, logger?: TLogger) {
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
    /**
     * Send unformatted JSON response
     *
     * @param content response content
     * @param status response status, default is 200
     */
    sendJSONRaw(content: unknown, status = 200) {
      if (responseSent) return

      responseSent = true
      res.status(status)
        .header("Content-Type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .send(JSON.stringify(content))
        .end()
    },

    /**
     * Send a formatted response
     *
     * @param content response content
     * @param status response status, default is 200
     */
    sendJSON(content: unknown, status = 200) {
      this.sendJSONRaw({
        error: null,
        content: content
      }, status)

      return this
    },

    /**
     * Send error as a response
     *
     * @deprecated Use `sendException` instead
     *
     * @param error error name
     * @param message optional error message
     * @param status response status, default is 400
     */
    sendJSONError(error?: string, message?: string, status = 400) {
      this.sendJSONRaw({
        error: error ?? "UnknownError",
        content: {
          message: message ?? "Unknown error occurred"
        }
      }, status)
    },

    /**
     * Send exception as a response.
     * Response code will be taken from the exception
     *
     * @param exception exception to send as a response
     */
    sendException(exception: Exception) {
      this.sendJSONRaw({
        error: exception.name,
        content: {
          message: exception.message,
          stack: exception.stack
        }
      }, exception.code)
    },

    /**
     * Validate JOI schema
     *
     * @param schema request JOI schema
     */
    schema(schema: ISchema | null) {
      if (!schema) return this

      const validationErrors = [
        validateSchema(schema, "params"),
        validateSchema(schema, "query"),
        validateSchema(schema, "body")
      ].filter(error => error !== null) as string[]

      if (!req && schema) (logger?.warning ?? logger?.error)?.("Schema has been applied but no request data provided")

      if (validationErrors.length > 0) this.sendException(new BadRequest(validationErrors .join(", ")))

      return this
    },

    /**
     * Catch any model errors and send them as a response
     *
     * @param exec model
     */
    async errorBoundary<T extends (self: typeof this) => unknown>(exec: T) {
      if (responseSent) return this
      try {
        await exec(this)
      } catch (error: any) {
        if (error?.name === "Error") logger?.error((error?.name ?? "UnknownError") + ": " + (error?.message ?? "No details"))

        this.sendException(Exception.fromError(error))
      }

      return this
    }
  }
}
