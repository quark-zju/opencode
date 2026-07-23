import { describe, expect, test } from "bun:test"
import { terminalWebSocketURL } from "./terminal-websocket-url"

describe("terminalWebSocketURL", () => {
  test("uses the PTY connect ticket", () => {
    const url = terminalWebSocketURL({
      url: "http://127.0.0.1:49365",
      id: "pty_test",
      directory: "/tmp/project",
      cursor: 0,
      ticket: "ticket",
    })

    expect(url.protocol).toBe("ws:")
    expect(url.searchParams.has("auth_token")).toBe(false)
    expect(url.searchParams.get("ticket")).toBe("ticket")
  })
})
