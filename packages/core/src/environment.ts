export * as Environment from "./environment"

const SENSITIVE_NAME = /key|password|secret|token|credential|auth/i

export function childProcess(input: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(input).filter(([name]) => !SENSITIVE_NAME.test(name)))
}
