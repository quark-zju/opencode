import { Schema } from "effect"
import DESCRIPTION from "./shell.txt"
import { PositiveInt } from "@opencode-ai/core/schema"
import { Global } from "@opencode-ai/core/global"

export type Limits = {
  maxLines: number
  maxBytes: number
}

export function parameterSchema() {
  return Schema.Struct({
    command: Schema.String.annotate({ description: "The command to execute" }),
    timeout: Schema.optional(PositiveInt).annotate({ description: "Optional timeout in milliseconds" }),
    workdir: Schema.optional(Schema.String).annotate({
      description: "Working directory for the command. Defaults to the current directory.",
    }),
  })
}

export const Parameters = parameterSchema()
export type Parameters = Schema.Schema.Type<typeof Parameters>

function renderPrompt(template: string, values: Record<string, string>) {
  return template.replace(/\$\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]
    if (value === undefined) throw new Error(`Missing shell prompt value: ${key}`)
    return value
  })
}

function displayName(name: string) {
  if (name === "pwsh") return "PowerShell 7+"
  if (name === "powershell") return "Windows PowerShell 5.1"
  if (name === "cmd") return "cmd.exe"
  return name
}

function notes(name: string) {
  if (name === "powershell") {
    return "Windows PowerShell 5.1 does not support `&&`; use `cmd1; if ($?) { cmd2 }` for dependent commands."
  }
  return ""
}

export function render(name: string, platform: NodeJS.Platform, limits: Limits, defaultTimeoutMs: number) {
  return {
    description: renderPrompt(DESCRIPTION, {
      os: platform,
      shell: displayName(name),
      tmp: Global.Path.tmp,
      maxLines: String(limits.maxLines),
      maxBytes: String(limits.maxBytes),
      defaultTimeoutMs: String(defaultTimeoutMs),
      notes: notes(name),
    }).trim(),
    parameters: parameterSchema(),
  }
}

export * as ShellPrompt from "./prompt"
