import request from "supertest"
import Application from "../application"
import { Middleware } from "../utils/middleware/middleware"
import { combineMiddlewares } from "../utils/middleware/combine-middlewares"
import { BadRequest, Unauthorized } from "../exceptions"

describe("Middleware data processing", () => {
  const app = new Application()

  class CustomMiddleware1 extends Middleware<{ attachment1: "OK" }> {
    constructor() {
      super({
        onRequest() {
          return { attachment1: "OK" }
        }
      })
    }
  }

  class CustomMiddleware2 extends Middleware<{ attachment2: "OK" }> {
    constructor() {
      super({
        onRequest() {
          return { attachment2: "OK" }
        }
      })
    }
  }

  class CustomMiddlewareError1 extends Middleware {
    constructor() {
      super({
        onRequest() {
          if (1 === 1) throw new BadRequest()

          return { attachment2: "OK" }
        }
      })
    }
  }

  class CustomMiddlewareError2 extends Middleware {
    constructor() {
      super({
        onRequest() {
          if (1 === 1) throw new Unauthorized()
          return { attachment2: "OK" }
        }
      })
    }
  }

  const singleMwBuilder = app.createRoute({
    root: "/single",
    middleware: CustomMiddleware1
  })

  const singleMwErrorBuilder = app.createRoute({
    root: "/e/single",
    middleware: CustomMiddlewareError1
  })

  const combinedMwBuilder = app.createRoute({
    root: "/combined",
    middleware: combineMiddlewares(CustomMiddleware1, CustomMiddleware2)
  })

  const combinedMwErrorBuilder = app.createRoute({
    root: "/e/combined",
    middleware: combineMiddlewares(CustomMiddlewareError2, CustomMiddlewareError1)
  })

  singleMwBuilder.schema(null).get("/", req => {
    return req.attachment1
  })

  combinedMwBuilder.schema(null).get("/", req => {
    return req.attachment1 + "-" + req.attachment2
  })

  singleMwErrorBuilder.schema(null).get("/", req => {
    return req.attachment1
  })

  combinedMwErrorBuilder.schema(null).get("/", req => {
    return req.attachment1 + "-" + req.attachment2
  })


  it("should correctly pass attachments with single middleware", async () => {
    const response = await request(app.express).get("/single")

    expect(response.status).toBe(200)
    expect(response.body.content).toEqual("OK")
    expect(response.body.error).toEqual(null)
  })

  it("should correctly pass attachments with combined middlewares", async () => {
    const response = await request(app.express).get("/combined")

    expect(response.status).toBe(200)
    expect(response.body.content).toEqual("OK-OK")
    expect(response.body.error).toEqual(null)
  })

  it("should return correct data when processing exceptions with single middleware", async () => {
    const response = await request(app.express).get("/e/single")

    expect(response.status).toBe(400)
    // expect(response.body.content).toEqual("OK-OK")
    expect(response.body.error).not.toEqual(null)
  })

  it("should return correct data when processing exceptions with combined middlewares", async () => {
    const response = await request(app.express).get("/e/combined")

    expect(response.status).toBe(401)
    // expect(response.body.content).toEqual("OK-OK")
    expect(response.body.error).not.toEqual(null)
  })

  afterAll(() => app.httpServer.close())
})
