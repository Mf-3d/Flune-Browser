import { protocol, net } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Router } from "./Router";

import type { Route } from "./Router";
import type { Logger } from "@/main/utils/logger";

const urlPrefix = process.platform === "win32" ? "app\\" : "app/";
const baseDir = path.resolve(__dirname, "../../out/renderer");

export class Protocol {
  private readonly router: Router;

  constructor(
    private readonly name: string = "app",
    private readonly logger: Logger
  ) {
    this.router = new Router();

    this.router.register(createStaticHandler(baseDir));

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
  }

  handle() {
    this.logger.info(`Protocol (${this.name}) handled.`);

    protocol.handle(this.name, (req) => {
      const url = new URL(req.url);
      url.hostname = path.join(urlPrefix, url.hostname);
      const pathname = path.join(url.hostname, url.pathname);

      this.logger.info(`Protocol accessed: "${pathname}"`);

      return this.router.handle({
        url,
        path: pathname,
        query: url.searchParams,
      });
    });
  }
}

function createStaticHandler(baseDir: string): Route {
  return {
    // match: (path) => path.startsWith("/app/"),
    match: () => true,
    handle: async (ctx) => {
      const filePath = path.join(baseDir, ctx.path).replace(urlPrefix, "");
      return net.fetch(pathToFileURL(filePath).toString());
    },
  };
}
