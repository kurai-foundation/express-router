import { IApplicationConfig } from "../application"
import { TLogger } from "./routing/router-utils"

export default function createFullDebugConfig(debugConfig?: IApplicationConfig["debug"], logger?: TLogger) {
  if (!debugConfig || typeof debugConfig === "boolean") return {
    logger: logger,
    logs: !!debugConfig,
    middleware: !!debugConfig,
    routeExceptions: !!debugConfig,
    traces: !!debugConfig,
    json: !!debugConfig,
  }

  return {
    logger: logger,
    logs: debugConfig.logs,
    traces: debugConfig.traces ?? false,
    routeExceptions: debugConfig.routeExceptions ?? true,
    middleware: debugConfig.middleware ?? false,
    json: debugConfig.json ?? false,
  }
}