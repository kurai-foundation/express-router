import { IApplicationDebugConfigWithLogger } from "./routing/router-builder"

export interface ILogOptions {
  levels: string[] | string
  message: string[] | string
  json?: any
  module: string
  condition?: any
}

export default function sendLog(debug: IApplicationDebugConfigWithLogger | undefined, {
  message,
  levels,
  condition,
  ...rest
}: ILogOptions) {
  const _levels = Array.isArray(levels) ? levels : [levels]
  const _msg = Array.isArray(message) ? message.join(" ") : message

  const _res_msg = debug?.json ? JSON.stringify({
    module: rest.module,
    level: levels[0],
    timestamp: Date.now(),
    data: rest.json ?? { message: _msg }
  }) : _msg

  let fn: ((message: string) => void) | undefined
  _levels.forEach(level => {
    const lvl: ((message: string) => void) | undefined = (debug?.logger as any)?.[level]
    const alt: typeof lvl = level === "warning" ? (debug?.logger as any)?.["warn"]
      : (level === "info" ? (debug?.logger as any)?.["debug"] : undefined)

    if (lvl) fn = lvl ?? alt
  })

  const debug_fn = (debug?.logger?.info || (debug?.logger as any)?.log)
  if (typeof condition !== "undefined") {
    if (condition) !debug?.json ? fn?.(_res_msg) : debug_fn?.(_res_msg)
  }

  else !debug?.json ? fn?.(_res_msg) : debug_fn?.(_res_msg)
}