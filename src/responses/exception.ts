function classNameToReadable(name: string): string {
  const readableName = name.replace(/([A-Z])/g, " $1").trim()
  return readableName.charAt(0).toUpperCase() + readableName.slice(1).toLowerCase()
}

interface IExceptionOptions {
  code: number
  name?: string
  message?: string[] | string
}

export default class Exception extends Error {
  public readonly code: number

  protected constructor(options: IExceptionOptions) {
    super(
      options.message
        ? (Array.isArray(options.message) ? options.message.join(" ") : options.message)
        : (options.name ? classNameToReadable(options.name) : "There was an unknown exception")
    )

    this.code = options.code >= 100 && options.code <= 599 ? options.code : 500

    this.name = options.name ?? "UnknownException"
  }

  public static fromError(error: Error) {
    return new Exception({
      name: error.name,
      code: (error as any).code || 500,
      message: error.message
    })
  }
}
