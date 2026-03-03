import path from "node:path";
import { app, WebContents } from "electron";

const URL_PREFIX = (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) ? `${process.env.ELECTRON_RENDERER_URL}` : "flune://";

export function appendTheme(webContents: WebContents, theme: string) {
  const themeUrl = theme.replace(/@theme\//g, URL_PREFIX + path.join("style", "theme", "/"))
                        .replace(/\\/g, "\/");

  if (URL.canParse(themeUrl)) {
    
    webContents.executeJavaScript(`
      (() => {
        const element = document.getElementById("theme");

        if (element) {
          element.setAttribute("href", "${themeUrl}");
        } else {
          document.head.innerHTML += '<link rel="stylesheet" id="theme" href="${themeUrl}" onload="updateSymbolColor()">';
        }

        if (typeof updateSymbolColor === "function") updateSymbolColor();
      })();
    `);
  } else console.error("Could not append the theme: Theme URL is incorrect.");
}

export function dependTheme(webContents: WebContents) {
  webContents.executeJavaScript(`
    document.getElementById("theme").remove(); 
  `);
}

export default {
  appendTheme,
  dependTheme
}