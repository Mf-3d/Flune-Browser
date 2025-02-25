import path from "node:path";
import { WebContents } from "electron";

export function appendTheme(webContents: WebContents, theme: string) {
  const themeUrl = theme.replace(/@theme\//g, `flune://${path.join("style", "theme", "/")}`)
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