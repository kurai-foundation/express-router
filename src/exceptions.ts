import Exception from "./utils/exception"

export { Exception }

export class BadRequest extends Exception {
  /**
   * The server could not understand the request due to malformed syntax.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(400, "BadRequest", ...message)
  }
}

export class Unauthorized extends Exception {
  /**
   * The request requires user authentication.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(401, "Unauthorized", ...message)
  }
}

export class PaymentRequired extends Exception {
  /**
   * Payment is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(402, "PaymentRequired", ...message)
  }
}

export class Forbidden extends Exception {
  /**
   * The server understood the request, but refuses to authorize it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(403, "Forbidden", ...message)
  }
}

export class NotFound extends Exception {
  /**
   * The requested resource could not be found on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(404, "NotFound", ...message)
  }
}

export class MethodNotAllowed extends Exception {
  /**
   * The request method is not allowed on the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(405, "MethodNotAllowed", ...message)
  }
}

export class NotAcceptable extends Exception {
  /**
   * The requested resource is capable of generating only content not acceptable according to the Accept headers.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(406, "NotAcceptable", ...message)
  }
}

export class ProxyAuthenticationRequired extends Exception {
  /**
   * Proxy authentication is required to process the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(407, "ProxyAuthenticationRequired", ...message)
  }
}

export class RequestTimeout extends Exception {
  /**
   * The server timed out waiting for the client request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(408, "RequestTimeout", ...message)
  }
}

export class Conflict extends Exception {
  /**
   * The request could not be completed due to a conflict with the current state of the resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(409, "Conflict", ...message)
  }
}

export class Gone extends Exception {
  /**
   * The requested resource is no longer available and has been permanently removed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(410, "Gone", ...message)
  }
}

export class LengthRequired extends Exception {
  /**
   * The request did not specify the length of its content, which is required by the requested resource.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(411, "LengthRequired", ...message)
  }
}

export class PreconditionFailed extends Exception {
  /**
   * The precondition given in one or more request-header fields evaluated to false when it was tested on the server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(412, "PreconditionFailed", ...message)
  }
}

export class PayloadTooLarge extends Exception {
  /**
   * The request entity is larger than the server is willing or able to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(413, "PayloadTooLarge", ...message)
  }
}

export class URITooLong extends Exception {
  /**
   * The URI provided was too long for the server to process.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(414, "URITooLong", ...message)
  }
}

export class UnsupportedMediaType extends Exception {
  /**
   * The request entity has a media type that the server or resource does not support.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(415, "UnsupportedMediaType", ...message)
  }
}

export class RangeNotSatisfiable extends Exception {
  /**
   * The client has asked for a portion of the file, but the server cannot supply that portion.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(416, "RangeNotSatisfiable", ...message)
  }
}

export class ExpectationFailed extends Exception {
  /**
   * The server cannot meet the requirements of the Expect request-header field.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(417, "ExpectationFailed", ...message)
  }
}

export class ImATeapot extends Exception {
  /**
   * The server refuses the attempt to brew coffee with a teapot.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(418, "ImATeapot", ...message)
  }
}

export class MisdirectedRequest extends Exception {
  /**
   * The request was directed at a server that is not able to produce a response.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(421, "MisdirectedRequest", ...message)
  }
}

export class UnprocessableEntity extends Exception {
  /**
   * The request was well-formed but unable to be followed due to semantic errors.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(422, "UnprocessableEntity", ...message)
  }
}

export class Locked extends Exception {
  /**
   * The resource that is being accessed is locked.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(423, "Locked", ...message)
  }
}

export class FailedDependency extends Exception {
  /**
   * The request failed due to the failure of a previous request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(424, "FailedDependency", ...message)
  }
}

export class TooEarly extends Exception {
  /**
   * The server is unwilling to risk processing a request that might be replayed.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(425, "TooEarly", ...message)
  }
}

export class UpgradeRequired extends Exception {
  /**
   * The server refuses to process the request without an upgrade to a different protocol.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(426, "UpgradeRequired", ...message)
  }
}

export class PreconditionRequired extends Exception {
  /**
   * The origin server requires the request to be conditional.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(428, "PreconditionRequired", ...message)
  }
}

export class TooManyRequests extends Exception {
  /**
   * The user has sent too many requests in a given amount of time.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(429, "TooManyRequests", ...message)
  }
}

export class RequestHeaderFieldsTooLarge extends Exception {
  /**
   * The server is unwilling to process the request because its header fields are too large.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(431, "RequestHeaderFieldsTooLarge", ...message)
  }
}

export class UnavailableForLegalReasons extends Exception {
  /**
   * The resource requested is unavailable due to legal reasons.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(451, "UnavailableForLegalReasons", ...message)
  }
}

export class InternalServerError extends Exception {
  /**
   * The server encountered an unexpected condition that prevented it from fulfilling the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(500, "InternalServerError", ...message)
  }
}

export class NotImplemented extends Exception {
  /**
   * The server does not support the functionality required to fulfill the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(501, "NotImplemented", ...message)
  }
}

export class BadGateway extends Exception {
  /**
   * The server, while acting as a gateway or proxy, received an invalid response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(502, "BadGateway", ...message)
  }
}

export class ServiceUnavailable extends Exception {
  /**
   * The server is currently unable to handle the request due to a temporary overload or maintenance.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(503, "ServiceUnavailable", ...message)
  }
}

export class GatewayTimeout extends Exception {
  /**
   * The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(504, "GatewayTimeout", ...message)
  }
}

export class HTTPVersionNotSupported extends Exception {
  /**
   * The server does not support the HTTP protocol version used in the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(505, "HTTPVersionNotSupported", ...message)
  }
}

export class VariantAlsoNegotiates extends Exception {
  /**
   * The server has an internal configuration error and is unable to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(506, "VariantAlsoNegotiates", ...message)
  }
}

export class InsufficientStorage extends Exception {
  /**
   * The server is unable to store the representation needed to complete the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(507, "InsufficientStorage", ...message)
  }
}

export class LoopDetected extends Exception {
  /**
   * The server detected an infinite loop while processing the request.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(508, "LoopDetected", ...message)
  }
}

export class NotExtended extends Exception {
  /**
   * Further extensions to the request are required for the server to fulfill it.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(510, "NotExtended", ...message)
  }
}

export class NetworkAuthenticationRequired extends Exception {
  /**
   * The client needs to authenticate to gain network access.
   *
   * @param message optional error message
   */
  constructor(...message: string[]) {
    super(511, "NetworkAuthenticationRequired", ...message)
  }
}
