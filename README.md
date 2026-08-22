This is a fork of [opencode](https://github.com/anomalyco/opencode) with fixes so I can self-host comfortably on a low-end device (Orange Pi).

## Example changes in this fork

### Performance

When running `opencode web` inside a [FUSE sandbox](https://github.com/quark-zju/leash) on the Pi:

* “Add project” path completion now feels instantaneous, down from 20+ seconds.
* Loading an uncached project now takes less than one second, down from 6+ seconds.
  * Note: configure `enabled_providers` to a small subset to fully benefit from this optimization.
* `/assets/` URLs are now served as immutable, so browsers can cache them instead of re-downloading several MBs on every page load.

### Security

* The terminal endpoint no longer accepts authentication credentials through the URL.

### Input

* CJK input methods preserve IME composition in the prompt editor, including when Chrome starts composition from an empty draft.

### Cost

* The GPT system prompt, including tool definitions, has been reduced from ~6k tokens to ~2k.

### Later fixed upstream

These fixes were present when this fork began, but upstream later implemented independent fixes for the same issues:

* Message ordering no longer depends on clock-derived ID ordering, preventing duplicate responses and ignored requests when clocks or IDs are out of order.

## Whys

### Why maintain a fork?

The opencode upstream appears to be overwhelmed by the volume of incoming PRs. I submitted polished fixes but received no response, so I decided to maintain a fork.

### Why opencode?

I use several coding agents, including kimi-code web, the Codex app, Zed, and opencode. My [Git hook](https://github.com/quark-zju/dotfiles/blob/6283025595807179fe6c0c81fc9458756f1dd3e5/.config/git-hooks/prepare-commit-msg) supports multiple tools.

* **opencode:** I like the context button tooltip showing the current cost, the ability to use different models for subagents, and the official OpenAI subscription support.
* **kimi-code web:** I like how it presents reasoning blocks: it shows only the final paragraph by default, with the full content available in a side panel.
* **Codex:** I like how it collapses intermediate details and shows only the final summary after each turn.

---

背景：我在 Orange Pi 上运行 opencode web，文件系统在 SD 卡上，并运行于 leash fuse 沙箱内，比普通机器慢许多。opencode 在打开未缓存的新项目时很慢（可能有 10 秒钟），比 kimi web（也在同一设备的沙箱内）慢很多。调查发现 opencode 在很多地方缺乏性能考虑，比如全项目或者全用户扫文件，多次跑没有太大意义的 git 命令，下载 models.dev 大 JSON 多次验证并做无用的序列化+反序列化等。

本 repo 最初修正了性能问题，使得 Pi 设备上运行相对流畅。后续包括了一些其他修改，如时差修正，输入法修正，以及提示词优化。

---

<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installation

```bash
# YOLO
curl -fsSL https://opencode.ai/install | bash

# Package managers
npm i -g opencode-ai@latest        # or bun/pnpm/yarn
scoop install opencode             # Windows
choco install opencode             # Windows
brew install anomalyco/tap/opencode # macOS and Linux (recommended, always up to date)
brew install opencode              # macOS and Linux (official brew formula, updated less)
sudo pacman -S opencode            # Arch Linux (Stable)
paru -S opencode-bin               # Arch Linux (Latest from AUR)
mise use -g opencode               # Any OS
nix run nixpkgs#opencode           # or github:anomalyco/opencode for latest dev branch
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

OpenCode is also available as a desktop application. Download directly from the [releases page](https://github.com/anomalyco/opencode/releases) or [opencode.ai/download](https://opencode.ai/download).

| Platform              | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `opencode-desktop-mac-x64.dmg`     |
| Windows               | `opencode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask opencode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/opencode-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$OPENCODE_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if it exists or can be created)
4. `$HOME/.opencode/bin` - Default fallback

```bash
# Examples
OPENCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://opencode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://opencode.ai/install | bash
```

### Agents

OpenCode includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

Learn more about [agents](https://opencode.ai/docs/agents).

### Documentation

For more info on how to configure OpenCode, [**head over to our docs**](https://opencode.ai/docs).

### Contributing

If you're interested in contributing to OpenCode, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on OpenCode

If you are working on a project that's related to OpenCode and is using "opencode" as part of its name, for example "opencode-dashboard" or "opencode-mobile", please add a note to your README to clarify that it is not built by the OpenCode team and is not affiliated with us in any way.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
