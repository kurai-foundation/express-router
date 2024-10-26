export default function getModule<T = any>(module: string) {
  try {
    return require(module) as T
  } catch {
    return null
  }
}
