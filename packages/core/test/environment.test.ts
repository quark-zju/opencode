import { describe, expect, test } from "bun:test"
import { Environment } from "@opencode-ai/core/environment"

describe("Environment.childProcess", () => {
  test("removes credential-like variables", () => {
    expect(
      Environment.childProcess({
        PATH: "/usr/bin",
        OPENCODE_SERVER_PASSWORD: "password",
        ANTHROPIC_API_KEY: "key",
        GITHUB_TOKEN: "token",
        TERM: "xterm-256color",
      }),
    ).toEqual({ PATH: "/usr/bin", TERM: "xterm-256color" })
  })
})
