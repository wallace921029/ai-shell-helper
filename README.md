# ai-shell-helper

A tiny CLI that turns a plain-language description — or a command written for
some other platform — into a ready-to-run command for **your** shell, using
any OpenAI Chat-Completions-compatible model (OpenAI, DeepSeek, etc).

Installs as the `ash` command.

## Requirements

Node.js >= 18 (uses the built-in `fetch`).

## Install

```
npm install -g ai-shell-helper
```

## Setup

Configure your model once:

```
ash init
```

You'll be asked for:

- **Base URL** (OpenAI Chat Completions format, e.g. `https://api.deepseek.com`
  or `https://api.openai.com/v1`)
- **API Key**
- **Model ID** (e.g. `deepseek-chat`, `gpt-4o-mini`)

Pick which shell ash should generate commands for:

```
ash target
```

Supports PowerShell, cmd.exe, Bash, Zsh, and Fish. If you skip this, ash
guesses a sensible default from your OS.

By default, every generated command is also copied to your clipboard. Toggle
that with:

```
ash clipboard        # interactive on/off prompt
ash clipboard on     # or set it directly
ash clipboard off
```

## Use

```
ash
>>> list all files, including hidden ones
Get-ChildItem -Force
```

Type a description of what you want to do, or paste a command from another
platform (e.g. a Bash command while targeting PowerShell) — ash returns a
single, directly runnable command for your configured target shell.

**ash never runs anything for you.** It only prints the command (and copies
it to your clipboard by default) so you can read it before pasting and
running it yourself.

### Chat mode

Sometimes you don't want a command, you want an answer. Use `-c`/`--chat` for
a single question-and-answer exchange:

```
ash -c
>>> nginx 怎么安装
...normal conversational answer, not a command...
```

Or `-lc`/`--loop-chat` for a multi-turn conversation that keeps context
between turns. Press Ctrl+C to exit:

```
ash -lc
>>> ...
>>> ...
```

Long-running conversations are automatically compacted: once the accumulated
history gets large, ash summarizes everything except the most recent few
turns into a single summary message (via an extra AI call), the same idea as
Claude Code's `/compact`. You'll see a "Context compacted" note when it
happens.

## Commands

| Command                     | Description                                              |
| ---------------------------- | --------------------------------------------------------- |
| `ash`                        | Turn a description/command into one for your target shell |
| `ash init`                   | Configure base URL, API key, and model ID                 |
| `ash target`                 | Choose the target shell                                   |
| `ash clipboard [on\|off]`    | Toggle/set auto-copy to clipboard                          |
| `ash -c`, `--chat`           | One-shot conversational Q&A (no command generation)        |
| `ash -lc`, `--loop-chat`     | Multi-turn chat with context; exit with Ctrl+C             |
| `ash --version`, `-v`        | Print the installed version                                |
| `ash --help`, `-h`           | Show usage                                                 |

## Config & security

Config (including your API key) is stored in plaintext at
`~/.ash/config.json`. Keep this file private — don't commit it or share it,
and be extra careful on shared machines.

## License

MIT © Youzhi Wang — see [LICENSE](./LICENSE).
