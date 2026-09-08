#!/usr/bin/env node

const [, , command, ...rest] = process.argv;

async function main() {
  switch (command) {
    case undefined: {
      const { runDefault } = await import("../src/commands/run.js");
      await runDefault();
      break;
    }
    case "init": {
      const { runInit } = await import("../src/commands/init.js");
      await runInit();
      break;
    }
    case "target": {
      const { runTarget } = await import("../src/commands/target.js");
      await runTarget();
      break;
    }
    case "clipboard": {
      const { runClipboard } = await import("../src/commands/clipboard.js");
      await runClipboard(rest[0]);
      break;
    }
    case "reset": {
      const { runReset } = await import("../src/commands/reset.js");
      await runReset();
      break;
    }
    case "-c":
    case "--chat": {
      const { runChatOnce } = await import("../src/commands/chat.js");
      await runChatOnce();
      break;
    }
    case "-lc":
    case "--loop-chat": {
      const { runChatLoop } = await import("../src/commands/chat.js");
      await runChatLoop();
      break;
    }
    case "--version":
    case "-v": {
      const { readFileSync } = await import("node:fs");
      const { fileURLToPath } = await import("node:url");
      const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      console.log(pkg.version);
      break;
    }
    case "--help":
    case "-h": {
      printHelp();
      break;
    }
    default: {
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      process.exitCode = 1;
    }
  }
}

function printHelp() {
  console.log(`ash — turn a description or a command from another platform into a ready-to-run command.

Usage:
  ash                    Enter a description or command; ash prints the equivalent for your target shell.
  ash init               Configure the AI model (base URL, API key, model ID).
  ash target             Choose which shell ash should generate commands for.
  ash clipboard          Toggle auto-copying generated commands to the clipboard.
  ash reset              Clear all saved configuration (API key, model, target, clipboard setting).
  ash -c, --chat         Ask one question and get a normal conversational answer (no command generation).
  ash -lc, --loop-chat   Multi-turn chat; keeps context until you press Ctrl+C.
  ash --version          Print the installed version.
  ash --help             Show this help.`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exitCode = 1;
});
