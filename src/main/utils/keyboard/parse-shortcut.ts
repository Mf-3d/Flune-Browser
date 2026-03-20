function parseShortcut(accelerators: string): string[] {
  const keys = accelerators.split("\+").map((acc) => {
    switch (acc) {
      case "Command":
      case "Cmd":
        return process.platform === "darwin" ? "Meta" : "";

      case "Control":
      case "Ctrl":
        return "Control";

      case "CommandOrControl":
      case "CmdOrCtrl":
        return process.platform === "darwin" ? "Meta" : "Control";

      case "Alt":
      case "Option":
        return "Alt";

      case "Shift":
        return "Shift";

      case "Shift":
        return "Shift";

      case "Up":
        return "ArrowUp";

      case "Down":
        return "ArrowDown";

      case "Left":
        return "ArrowLeft";

      case "Right":
        return "ArrowRight";

      case "Escape":
      case "Esc":
        return "Escape";

      case "Delete":
        return process.platform === "darwin" ? "Backspace" : "Delete";

      default:
        if (acc.match(/^[a-zA-Z]$/)) return `Key${acc.toUpperCase()}`;
        else if (acc.match(/^[0-9]$/)) return `Digit${acc}`;
        else if (acc.match(/^num[0-9]$/)) return `Numpad${acc.slice(3)}`;
        else return acc;
    }
  });

  return keys;
}

function normalizeAccelerator(parsed: string[]) {
  return {
    ctrl: parsed.includes("Control"),
    meta: parsed.includes("Meta"),
    shift: parsed.includes("Shift"),
    alt: parsed.includes("Alt"),
    code: parsed.find(
      (k) => k.startsWith("Key") || k.startsWith("Digit") || k.startsWith("Numpad")
    ),
  };
}
