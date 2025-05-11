import { SendFileOptions } from "express-serve-static-core"

export default class FileResponse {
  public readonly code: number = 200

  constructor(public readonly path: string, public readonly options?: SendFileOptions) {}
}