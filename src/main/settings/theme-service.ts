import path from "node:path";

import type { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import type { Theme } from "@/shared/types/config";
import type { ApplicationService } from "@/main/application/application-service";

export class ThemeService {
  private readonly urlPrefix: string;

  constructor(
    private readonly store: SettingsStore,
    private readonly appService: ApplicationService
  ) {
    this.urlPrefix =
      !this.appService.isPackaged && process.env.ELECTRON_RENDERER_URL
        ? `${process.env.ELECTRON_RENDERER_URL}/`
        : "flune://";
  }

  getCurrentThemeId(): string {
    return this.store.get("settings").design.theme;
  }

  getThemes(): Theme[] {
    return this.store.get("themes");
  }

  getThemeById(id: string): Theme | undefined {
    const themes = this.getThemes();
    const theme = themes.find((theme) => theme.id === id);

    if (!theme) {
      console.warn(`Theme not found: ${id}, falling back to default`);
      return themes[0]; // 0番目をデフォルトに
    }

    theme.url = this.resolveThemeUrl(theme.url);

    return theme;
  }

  private resolveThemeUrl(url: string) {
    return url
      .replace(/@theme\//g, this.urlPrefix + path.join("theme", "/"))
      .replace(/\\/g, "\/");
  }
}
