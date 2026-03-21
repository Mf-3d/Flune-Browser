import { protocol, net } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { type Route, Router } from "./Router";

const urlPrefix = "app\\";
const baseDir = path.resolve(__dirname, "../../out/renderer");

export class Protocol {
  private readonly router: Router;

  constructor(private readonly name: string = "app") {
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
    protocol.handle(this.name, (req) => {
      const url = new URL(req.url);
      url.hostname = urlPrefix.concat(url.hostname);
      const pathname = path.join(url.hostname, url.pathname);

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
    // match: (path) => path.startsWith("/public/"),
    match: () => true,
    handle: async (ctx) => {
      const filePath = path.join(baseDir, ctx.path).replace(urlPrefix, "");
      return net.fetch(pathToFileURL(filePath).toString());
    },
  };
}
