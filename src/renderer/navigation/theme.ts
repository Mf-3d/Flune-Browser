export function applyTheme(themeUrl: string, updateSymbolColor: Function) {
  const element = document.querySelector("#theme");

  if (element) {
    element.remove();
  }

  const themeElement = createThemeElement(themeUrl);

  themeElement.addEventListener("load", () => {
    updateSymbolColor();
  });

  document.head.appendChild(themeElement);
}

function createThemeElement(themeUrl: string): HTMLLinkElement {
  const themeElement = document.createElement("link");
  themeElement.rel = "stylesheet";
  themeElement.id = "theme";
  themeElement.href = themeUrl;

  return themeElement;
}
