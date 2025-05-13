import { IApplicationConfig } from "../application"
import { IApplicationDebugConfigWithLogger } from "./routing/router-builder"
import { TLogger } from "./routing/router-utils"

export default function createFullDebugConfig(debugConfig?: IApplicationConfig["debug"], logger?: TLogger): IApplicationDebugConfigWithLogger {
  if (!debugConfig || typeof debugConfig === "boolean") return {
    logger: logger,
    logs: true,
    middleware: false,
    routeExceptions: true,
    traces: false,
    json: false,
    registration: true
  }

  return {
    logger: logger,
    logs: debugConfig.logs,
    traces: debugConfig.traces ?? false,
    routeExceptions: debugConfig.routeExceptions ?? true,
    middleware: debugConfig.middleware ?? false,
    json: debugConfig.json ?? false,
    registration: debugConfig.registration ?? true
  }
}