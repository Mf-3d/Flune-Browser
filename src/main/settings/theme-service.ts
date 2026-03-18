import { app } from "electron";
import path from "node:path";
import { SettingsStore } from "./settings-store";
import { Theme } from "@/shared/types/config";

const URL_PREFIX = (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) ? `${process.env.ELECTRON_RENDERER_URL}/` : "flune://";

export class ThemeService {
  constructor(private store: SettingsStore) { }

  getCurrentThemeId(): string {
    return this.store.get("settings").design.theme;
  }

  getThemes(): Theme[] {
    return this.store.get("themes");
  }
  
  getThemeById(id: string): Theme | undefined {
    const themes = this.getThemes();
    const theme = themes.find(theme => theme.id === id);
  
    if (!theme) {
      console.warn(`Theme not found: ${id}, falling back to default`);
      return themes[0]; // 0番目をデフォルトに
    }

    theme.url = this.resolveThemeUrl(theme.url);
  
    return theme;
  }

  private resolveThemeUrl(url: string) {
    return url.replace(/@theme\//g, URL_PREFIX + path.join("style", "theme", "/")).replace(/\\/g, "\/");
  }
}