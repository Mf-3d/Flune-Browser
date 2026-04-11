import { app } from "electron";

import { parseRuntimeType, type RuntimeType } from "./runtime-types";

export interface IRuntimeContext {
  readonly runtime: RuntimeType;
  readonly isPackaged: boolean;
}

export class RuntimeContext implements IRuntimeContext {
  readonly runtime;
  readonly isPackaged;

  constructor() {
    this.runtime = this.detectRuntime();
    this.isPackaged = app.isPackaged;
  }

  private detectRuntime(): RuntimeType {
    const arg = process.argv.find((a) => a.startsWith("--runtime="));

    if (arg) return parseRuntimeType(arg);
    else {
      return app.isPackaged ? "production" : "dev";
    }
  }
}

// export function createMockRuntimeContext(
//   override?: Partial<IRuntimeContext>
// ): IRuntimeContext {
//   return {
//     runtime: "test",
//     isPackaged: false,
//     ...override
//   }
// }
