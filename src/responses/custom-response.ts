export interface ICustomResponseOptions {
  code?: number
  raw?: boolean
  headers?: Record<string, string>
  content: any
  example?: any
}

export default class CustomResponse {
  public readonly code: number = 200
  public readonly content: any = null
  public readonly raw: boolean = false
  public readonly headers: Headers

  constructor(options: ICustomResponseOptions) {
    this.code = options.code || 200
    this.content = options.content

    if (options.raw) this.raw = options.raw
    this.headers = new Headers({
      "Content-Type": "application/json",
      ...options.headers
    })
  }
}

export function ResponseFactory(options: ICustomResponseOptions): new (content?: any) => CustomResponse {
  return class extends CustomResponse {
    public readonly code = options.code ?? 200
    public readonly content = options.content
    public readonly raw = options.raw ?? false
    public readonly headers: Headers
    public readonly example: any = options.example

    constructor(content?: any) {
      super(options)

      if (content) this.content = content

      this.headers = new Headers({
        "Content-Type": "application/json",
        ...options.headers
      })
    }
  }
}
