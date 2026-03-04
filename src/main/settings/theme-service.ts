import { SettingsStore } from "./settings-store";
import { Theme } from "./types";

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
  
    return theme;
  }
}