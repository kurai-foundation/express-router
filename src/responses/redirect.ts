export default class Redirect {
  public readonly code: number = 302
  public readonly to: string

  constructor(to: string, code?: number) {
    this.to = to

    if (code) {
      if (code > 399 || code < 300) throw new Error("Invalid redirect code")
      this.code = code
    }
  }
}
