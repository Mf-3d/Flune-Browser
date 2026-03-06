import { protocol, net } from "electron";
import { pathToFileURL } from "node:url";
import path from "node:path";
import Event from "@/main/lib/event";

/**
 * @deprecated
 */
export class Protocol {
  /**
   * Protocol name.
   */
  readonly name: string;

  /**
   * If you need to add a path, add it here.
   */
  private readonly pathToServe: {
    [path: string]: string
  } = {
    navigation: path.join(__dirname, "..", "renderer", "navigation.html"),
    home: path.join(__dirname, "..", "renderer", "browser", "home.html"),
    settings: path.join(__dirname, "..", "renderer", "browser", "settings.html"),
    version: path.join(__dirname, "..", "renderer", "browser", "version.html"),
    script: path.join(__dirname, "..", "renderer", "script"),
    style: path.join(__dirname, "..", "renderer", "style"),
    assets: path.join(__dirname, "..", "..", "assets"),
    error: path.join(__dirname, "..", "renderer", "browser", "error"),
    menu: path.join(__dirname, "..", "renderer", "menu"),
    // "foo.bar": path.join(__dirname, "..", "renderer", "browser", "foo", "bar"),
  };

  /**
   * **It is generated dynamically.**
   * @example 
   * ```javascript
   * "foo.bar": {
   *   pathWithProtocol: "flune://foo/bar",
   *   path: "/foo/bar",
   *   filePath: ".../foo/bar.html"
   * }
   * ```
   */
  readonly paths: {
    [key: string]: {
      /**
       * @type {string} Path with protocol.
       * @example `"flune://foo/bar"`
       */
      pathWithProtocol: string,
      /**
       * @type {string} Path.
       * @example `"/foo/bar"`
       */
      path: string,
      /**
       * @type {string} File path.
       * @example `".../foo/bar.html"`
       */
      filePath?: string
    },
  } = Object.fromEntries(Object.entries(this.pathToServe).map(([key, value]) => [
    key,
   {
      pathWithProtocol: `${this.name}://${key.replace(/\./g, "/")}`,
      path: `/${key.replace(/\./g, "/")}`,
      filePath: this.pathToServe[key]
    }
  ]));

  constructor(name: string = "flune", private readonly event: Event) {
    this.name = name;

    protocol.handle(this.name, (req) => {
      const Url: string = req.url.slice(this.name.length + 2);

      this.event.send("protocol-accessed", Url);
      switch (Url) {
        case "/ping": {
          return new Response("pong!", {
            headers: { "content-type": "text/html" }
          });
        }
        case Url.startsWith("/style") && Url: {
          return net.fetch(pathToFileURL(this.pathToServe.style + Url.slice(6)).toString(), {
            headers: { "content-type": "text/css" }
          });
        }
        case Url.startsWith("/script") && Url: {
          return net.fetch(pathToFileURL(this.pathToServe.script + Url.slice(7)).toString(), {
            headers: { "content-type": "text/javascript" }
          });
        }
        case Url.startsWith("/assets") && Url: {
          return net.fetch(pathToFileURL(this.pathToServe.assets + Url.slice(7)).toString());
        }
        case Url.startsWith("/error") && Url: {
          return net.fetch(pathToFileURL(this.pathToServe.error + Url.slice(6)).toString());
        }
        case Url.startsWith("/menu") && Url: {
          return net.fetch(pathToFileURL(this.pathToServe.menu + Url.slice(5)).toString());
        }
        default: {
          if (Object.values(this.paths).map(item => item.path)) {
            return net.fetch(
              pathToFileURL(this.getFilePathByPath(Url) ?? "")
              .toString(), {
                headers: { "content-type": "text/html" }
              });
          }

          return new Response(`not found: <pre>${Url}</pre>`, {
            status: 404,
            headers: { "content-type": "text/html" }
          });
        }
      }
    });
  }

  /**
   * @param path Path.
   * @returns File path.
   */
  getFilePathByPath(
    path: string
  ): string | undefined {
    return Object.values(this.paths)
      .find(route => route.path === path)
      ?.filePath;
  }
};


