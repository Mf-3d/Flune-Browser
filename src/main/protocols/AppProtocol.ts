import { protocol, net, app } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Router } from "./Router";

import type { Route } from "./Router";
import type { Logger } from "@/main/utils/logger";
import type { IRuntimeContext } from "../application/runtime-context";

const urlPrefix = process.platform === "win32" ? "-\\" : "-/";

export class Protocol {
  private readonly router: Router;

  constructor(
    private readonly name: string = "app",
    private readonly runtime: IRuntimeContext,
    private readonly logger: Logger
  ) {
    this.router = new Router();

    this.router.register(createStaticHandler(this.runtime));

    try {
      if (app.isReady()) {
        throw new Error("Ready event has already been fired.");
      }

      protocol.registerSchemesAsPrivileged([
        {
          scheme: this.name,
          privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
          },
        },
      ]);
    } catch (err) {
      this.logger.error(
        new Error(`Failed to register protocol: ${err}`, {
          cause: err,
        })
      );
    }
  }

  handle() {
    try {
      if (protocol.isProtocolHandled(this.name)) return;

      protocol.handle(this.name, async (req) => {
        const url = new URL(req.url);
        url.hostname = path.join(urlPrefix, url.hostname);
        const pathname = path.join(url.hostname, url.pathname);

        this.logger.info(`Protocol accessed: "${pathname}"`);

        return await this.router.handle({
          url,
          path: pathname,
          query: url.searchParams,
          logger: this.logger,
        });
      });

      this.logger.info(`Protocol ("${this.name}") handled.`);
    } catch (err) {
      this.logger.error(
        new Error(`Failed to handle Protocol ("${this.name}"): ${err}`, { cause: err })
      );
    }
  }
}

function createStaticHandler(runtime: IRuntimeContext): Route {
  const baseDir =
    runtime.isPackaged && process.platform === "darwin"
      ? path.join(process.resourcesPath, "app.asar", "out", "renderer")
      : path.join(__dirname, "..", "..", "out", "renderer");

  return {
    match: (path) => path.startsWith(urlPrefix),
    handle: async (ctx) => {
      const filePath = path.join(baseDir, ctx.path.replace(urlPrefix, ""));
      ctx.logger.debug(pathToFileURL(filePath).toString());
      return net.fetch(pathToFileURL(filePath).toString());
    },
  };
}
