import request from "supertest"
import Application from "../application"
import CustomResponse from "../responses/custom-response"

describe("GET and POST requests to simple routes", () => {
  const app = new Application()
  const builder = app.createRoute({
    root: "/"
  })

  builder.schema(null).get("/", _ => {
    return new CustomResponse({
      code: 201,
      content: "OK"
    })
  })

  builder.schema(null).post("/", req => {
    return req.body
  })

  it("should return 200 and expected response on simple route", async () => {
    const response = await request(app.express).get("/")

    expect(response.status).toBe(201)
    expect(response.body.content).toEqual("OK")
    expect(response.body.error).toEqual(null)
  })

  it("should correctly process body", async () => {
    const response = await request(app.express).post("/")
      .send({ result: "OK" }).set("Content-Type", "application/json")

    expect(response.status).toBe(200)
    expect(response.body.content.result).toEqual("OK")
    expect(response.body.error).toEqual(null)
  })

  afterAll(() => app.httpServer().close())
})
