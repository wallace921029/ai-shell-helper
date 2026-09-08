// Supported target shells and the platform-specific instructions given to the AI model.

export const TARGETS = [
  {
    id: "powershell",
    label: "PowerShell (Windows PowerShell / pwsh)",
    instruction:
      "Output a single valid PowerShell command or one-liner, using PowerShell cmdlets and syntax " +
      "(e.g. Get-ChildItem, Remove-Item, Get-Process). Use PowerShell pipeline syntax where appropriate. " +
      "Do not use Unix/Bash-only commands unless they are also valid native PowerShell.",
  },
  {
    id: "cmd",
    label: "Command Prompt (cmd.exe)",
    instruction:
      "Output a single valid Windows Command Prompt (cmd.exe) command using batch/DOS syntax " +
      "(e.g. dir, del, copy, findstr). Do not use PowerShell or Unix syntax.",
  },
  {
    id: "bash",
    label: "Bash (Linux / macOS / WSL / Git Bash)",
    instruction:
      "Output a single valid Bash command using POSIX/GNU coreutils syntax (e.g. ls, rm, cp, grep, find). " +
      "Do not use PowerShell or Windows batch syntax.",
  },
  {
    id: "zsh",
    label: "Zsh (macOS default shell)",
    instruction:
      "Output a single valid Zsh command. Bash-compatible POSIX/GNU coreutils syntax is acceptable " +
      "(e.g. ls, rm, cp, grep, find). Do not use PowerShell or Windows batch syntax.",
  },
  {
    id: "fish",
    label: "Fish shell",
    instruction:
      "Output a single valid Fish shell command using fish syntax (e.g. `set` for variables, " +
      "`and`/`or` instead of &&/||, `string` for string operations). Do not use Bash-only syntax " +
      "such as $(...) or [[ ]] unless it is also valid in fish.",
  },
];

export function getTarget(id) {
  return TARGETS.find((t) => t.id === id);
}

export function defaultTargetId() {
  // Best-effort guess so `ash` works before the user ever runs `ash target`.
  if (process.platform === "win32") {
    return "powershell";
  }
  const shellPath = process.env.SHELL || "";
  if (shellPath.includes("zsh")) return "zsh";
  if (shellPath.includes("fish")) return "fish";
  return "bash";
}
