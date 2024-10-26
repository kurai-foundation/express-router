interface ICustomResponseOptions {
  code?: number
  content: any
}

export default class CustomResponse {
  public readonly code: number = 200
  public readonly content: any = null

  constructor(options: ICustomResponseOptions) {
    this.code = options.code || 200
    this.code = options.content
  }
}

export function ResponseFactory(code = 200, content: any = null): new () => CustomResponse {
  return class extends CustomResponse {
    public readonly code = code
    public readonly content = content

    constructor() {
      super({ code, content })
    }
  }
}
