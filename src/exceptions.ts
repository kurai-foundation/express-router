import Exception from "./utils/exception"

export { Exception }

export class BadRequest extends Exception {
  /**
   * The server could not understand the request due to malformed syntax.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 400,
      name: "BadRequest",
      message
    })
  }
}

export class Unauthorized extends Exception {
  /**
   * The request requires user authentication.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 401,
      name: "Unauthorized",
      message
    })
  }
}

export class PaymentRequired extends Exception {
  /**
   * Payment is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 402,
      name: "PaymentRequired",
      message
    })
  }
}

export class Forbidden extends Exception {
  /**
   * The server understood the request, but refuses to authorize it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 403,
      name: "Forbidden",
      message
    })
  }
}

export class NotFound extends Exception {
  /**
   * The requested resource could not be found on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 404,
      name: "NotFound",
      message
    })
  }
}

export class MethodNotAllowed extends Exception {
  /**
   * The request method is not allowed on the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 405,
      name: "MethodNotAllowed",
      message
    })
  }
}

export class NotAcceptable extends Exception {
  /**
   * The requested resource is capable of generating only content not acceptable according to the Accept headers.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 406,
      name: "NotAcceptable",
      message
    })
  }
}

export class ProxyAuthenticationRequired extends Exception {
  /**
   * Proxy authentication is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 407,
      name: "ProxyAuthenticationRequired",
      message
    })
  }
}

export class RequestTimeout extends Exception {
  /**
   * The server timed out waiting for the client request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 408,
      name: "RequestTimeout",
      message
    })
  }
}

export class Conflict extends Exception {
  /**
   * The request could not be completed due to a conflict with the current state of the resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 409,
      name: "Conflict",
      message
    })
  }
}

export class Gone extends Exception {
  /**
   * The requested resource is no longer available and has been permanently removed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 410,
      name: "Gone",
      message
    })
  }
}

export class LengthRequired extends Exception {
  /**
   * The request did not specify the length of its content, which is required by the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 411,
      name: "LengthRequired",
      message
    })
  }
}

export class PreconditionFailed extends Exception {
  /**
   * The precondition given in one or more request-header fields evaluated to false when it was tested on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 412,
      name: "PreconditionFailed",
      message
    })
  }
}

export class PayloadTooLarge extends Exception {
  /**
   * The request entity is larger than the server is willing or able to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 413,
      name: "PayloadTooLarge",
      message
    })
  }
}

export class URITooLong extends Exception {
  /**
   * The URI provided was too long for the server to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 414,
      name: "URITooLong",
      message
    })
  }
}

export class UnsupportedMediaType extends Exception {
  /**
   * The request entity has a media type that the server or resource does not support.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 415,
      name: "UnsupportedMediaType",
      message
    })
  }
}

export class RangeNotSatisfiable extends Exception {
  /**
   * The client has asked for a portion of the file, but the server cannot supply that portion.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 416,
      name: "RangeNotSatisfiable",
      message
    })
  }
}

export class ExpectationFailed extends Exception {
  /**
   * The server cannot meet the requirements of the Expect request-header field.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 417,
      name: "ExpectationFailed",
      message
    })
  }
}

export class ImATeapot extends Exception {
  /**
   * The server refuses the attempt to brew coffee with a teapot.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 418,
      name: "ImATeapot",
      message
    })
  }
}

export class MisdirectedRequest extends Exception {
  /**
   * The request was directed at a server that is not able to produce a response.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 421,
      name: "MisdirectedRequest",
      message
    })
  }
}

export class UnprocessableEntity extends Exception {
  /**
   * The request was well-formed but unable to be followed due to semantic errors.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 422,
      name: "UnprocessableEntity",
      message
    })
  }
}

export class Locked extends Exception {
  /**
   * The resource that is being accessed is locked.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 423,
      name: "Locked",
      message
    })
  }
}

export class FailedDependency extends Exception {
  /**
   * The request failed due to the failure of a previous request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 424,
      name: "FailedDependency",
      message
    })
  }
}

export class TooEarly extends Exception {
  /**
   * The server is unwilling to risk processing a request that might be replayed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 425,
      name: "TooEarly",
      message
    })
  }
}

export class UpgradeRequired extends Exception {
  /**
   * The server refuses to process the request without an upgrade to a different protocol.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 426,
      name: "UpgradeRequired",
      message
    })
  }
}

export class PreconditionRequired extends Exception {
  /**
   * The origin server requires the request to be conditional.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 428,
      name: "PreconditionRequired",
      message
    })
  }
}

export class TooManyRequests extends Exception {
  /**
   * The user has sent too many requests in a given amount of time.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 429,
      name: "TooManyRequests",
      message
    })
  }
}

export class RequestHeaderFieldsTooLarge extends Exception {
  /**
   * The server is unwilling to process the request because its header fields are too large.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 431,
      name: "RequestHeaderFieldsTooLarge",
      message
    })
  }
}

export class UnavailableForLegalReasons extends Exception {
  /**
   * The resource requested is unavailable due to legal reasons.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 451,
      name: "UnavailableForLegalReasons",
      message
    })
  }
}

export class InternalServerError extends Exception {
  /**
   * The server encountered an unexpected condition that prevented it from fulfilling the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 500,
      name: "InternalServerError",
      message
    })
  }
}

export class NotImplemented extends Exception {
  /**
   * The server does not support the functionality required to fulfill the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 501,
      name: "NotImplemented",
      message
    })
  }
}

export class BadGateway extends Exception {
  /**
   * The server, while acting as a gateway or proxy, received an invalid response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 502,
      name: "BadGateway",
      message
    })
  }
}

export class ServiceUnavailable extends Exception {
  /**
   * The server is currently unable to handle the request due to a temporary overload or maintenance.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 503,
      name: "ServiceUnavailable",
      message
    })
  }
}

export class GatewayTimeout extends Exception {
  /**
   * The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 504,
      name: "GatewayTimeout",
      message
    })
  }
}

export class HTTPVersionNotSupported extends Exception {
  /**
   * The server does not support the HTTP protocol version used in the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 505,
      name: "HTTPVersionNotSupported",
      message
    })
  }
}

export class VariantAlsoNegotiates extends Exception {
  /**
   * The server has an internal configuration error and is unable to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 506,
      name: "VariantAlsoNegotiates",
      message
    })
  }
}

export class InsufficientStorage extends Exception {
  /**
   * The server is unable to store the representation needed to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 507,
      name: "InsufficientStorage",
      message
    })
  }
}

export class LoopDetected extends Exception {
  /**
   * The server detected an infinite loop while processing the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 508,
      name: "LoopDetected",
      message
    })
  }
}

export class NotExtended extends Exception {
  /**
   * Further extensions to the request are required for the server to fulfill it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 510,
      name: "NotExtended",
      message
    })
  }
}

export class NetworkAuthenticationRequired extends Exception {
  /**
   * The client needs to authenticate to gain network access.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super({
      code: 511,
      name: "NetworkAuthenticationRequired",
      message
    })
  }
}
