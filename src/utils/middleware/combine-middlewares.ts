// Helper type to convert a tuple of `Middleware` response types to an intersection
import { ConstructableMiddleware, Middleware } from "./middleware"
import RouterBuilder from "../routing/router-builder"
import { Request, Response } from "express"

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I : never

// Convert an array of `ConstructableMiddleware` classes to an intersection of their response types
export type CombinedMiddlewareResponseTypes<T extends ConstructableMiddleware[]> = UnionToIntersection<
  T[number] extends ConstructableMiddleware<infer R> ? R : never
>;

// Function to combine multiple Middleware classes into a new constructable class
export function combineMiddlewares<T extends ConstructableMiddleware<Record<any, any>>[]>(
  ...middlewares: T
): ConstructableMiddleware<CombinedMiddlewareResponseTypes<T>> {
  const mws = middlewares.map(mw => mw.name).join(", ")
  const CombinedMiddleware = class extends Middleware<CombinedMiddlewareResponseTypes<T>> {
    public static name = `CombinedMiddleware(${ mws })`

    constructor(parentBuilder: RouterBuilder) {
      super(
        {
          onRequest: async (request: Request, response: Response) => {
            return Object.assign(
              {},
              ...await Promise.all(
                middlewares.map(MiddlewareClass => {
                  const instance = new MiddlewareClass()
                  return instance.onRequest(request, response)
                })
              )
            ) as CombinedMiddlewareResponseTypes<T>
          },
          onInitialize: () => {
            middlewares.forEach(MiddlewareClass => {
              const instance = new MiddlewareClass()
              instance.onInitialize()
            })
            return parentBuilder
          }
        }
      )
    }
  }

  return CombinedMiddleware as ConstructableMiddleware<CombinedMiddlewareResponseTypes<T>>
}
