import { protocol, net } from "electron";
import { pathToFileURL } from "node:url";
import path from "node:path";

export class Protocol {
  name: string;
  pathToServe: {
    [path: string]: string
  } = {
    home: path.join(__dirname, "..", "renderer", "browser", "home.html"),
    setting: path.join(__dirname, "..", "renderer", "browser", "setting.html"),
    script: path.join(__dirname, "..", "renderer", "script"),
    style: path.join(__dirname, "..", "renderer", "style"),
    assets: path.join(__dirname, "..", "assets"),
  };

  constructor(name: string = "flune") {
    this.name = name;

    protocol.handle(this.name, (req) => {
      const Url: string = req.url.slice(this.name.length + 2);
    
      switch (Url) {
        case "/ping": {
          return new Response("pong!", {
            headers: { "content-type": "text/html" }
          });
        }
        case "/home": {
          return net.fetch(pathToFileURL(this.pathToServe.home).toString(), {
            headers: { "content-type": "text/html" }
          });
        }
        case "/setting": {
          return net.fetch(pathToFileURL(this.pathToServe.setting).toString(), {
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
        default: {
          return new Response(`not found: <pre>${Url}</pre>`, {
            status: 404,
            headers: { "content-type": "text/html" }
          });
        }
      }
    });
  }
};


