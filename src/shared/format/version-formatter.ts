import { parseSemVer } from "semver-parser";

export function formatVersion(version: string): string {
  const parsed = parseSemVer(version);

  if (!parsed.matches) {
    return version;
  }

  const parts: string[] = [[parsed.major, parsed.minor, parsed.patch].join(".")];

  if (parsed.pre) {
    parts.push(formatPrerelease(parsed.pre));
  }

  return parts.join(" ");
}

function formatPrerelease(pre: (string | number)[]): string {
  if (typeof pre[0] === "string") {
    const [label, ...rest] = pre;
    return `${capitalize(label)} ${rest.join(".")}`;
  }

  return pre.join(".");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
