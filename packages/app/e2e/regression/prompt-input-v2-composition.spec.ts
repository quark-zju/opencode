import { expect, test } from "@playwright/test"
import { base64Encode } from "@opencode-ai/core/util/encode"
import { mockOpenCodeServer } from "../utils/mock-server"
import { expectAppVisible } from "../utils/waits"

const directory = "C:/OpenCode/PromptInputV2Composition"
const projectID = "proj_prompt_input_v2_composition"
const sessionID = "ses_prompt_input_v2_composition"

test("does not persist IME pre-edit text before composition ends", async ({ page }) => {
  await mockOpenCodeServer(page, {
    directory,
    project: {
      id: projectID,
      worktree: directory,
      vcs: "git",
      name: "prompt-input-v2-composition",
      time: { created: 1700000000000, updated: 1700000000000 },
      sandboxes: [],
    },
    provider: { all: [], connected: [], default: {} },
    sessions: [
      {
        id: sessionID,
        slug: "prompt-input-v2-composition",
        projectID,
        directory,
        title: "Prompt input V2 composition",
        version: "dev",
        time: { created: 1700000000000, updated: 1700000000000 },
      },
    ],
    pageMessages: () => ({ items: [] }),
  })
  await page.addInitScript(() => {
    localStorage.setItem("settings.v3", JSON.stringify({ general: { newLayoutDesigns: true } }))
  })

  await page.goto(`/${base64Encode(directory)}/session/${sessionID}`)
  const composer = page.locator('[data-component="prompt-input-v2"]')
  const input = composer.locator('[data-component="prompt-input"]')
  const placeholder = composer.locator('[data-slot="prompt-input-placeholder"]')
  const send = composer.getByRole("button", { name: "Send" })
  await expectAppVisible(composer)

  await input.fill("seed")
  await input.press("ControlOrMeta+A")
  await input.press("Backspace")
  await expect(input).toBeEmpty()
  await expect(placeholder).toBeVisible()
  await expect(send).toBeDisabled()
  const emptyContent = await input.evaluate((element) => getComputedStyle(element, "::before").content)
  expect(emptyContent).not.toContain("\u200B")

  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    element.textContent = "sh"
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "sh",
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    )
  })

  await expect(input).toHaveText("sh")
  await expect(placeholder).toBeHidden()
  await expect(send).toBeDisabled()

  await input.evaluate((element) => {
    element.textContent = "时"
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "时" }))
  })

  await expect(send).toBeEnabled()
  await expect(input).toHaveText("时")
})
