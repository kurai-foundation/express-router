function classNameToReadable(name: string): string {
  const readableName = name.replace(/([A-Z])/g, " $1").trim()
  return readableName.charAt(0).toUpperCase() + readableName.slice(1).toLowerCase()
}

export default class Exception extends Error {
  public readonly code: number

  protected constructor(
    code: number,
    name?: string,
    message?: string[] | string
  ) {
    super(message ? (Array.isArray(message) ? message.join(" ") : message) : (name ? classNameToReadable(name) : "There was an unknown exception"))

    this.code = code >= 100 && code <= 599 ? code : 500

    this.name = name ?? "UnknownException"
  }

  public static fromError(error: Error) {
    const code = (error as any).code || 500

    return new Exception(code, error.name, error.message)
  }
}
