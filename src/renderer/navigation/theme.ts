export function applyTheme(themeUrl: string, updateSymbolColor: Function) {
  const element = document.querySelector("#theme");

  if (element) element.setAttribute("href", themeUrl);
  else {
    const themeElement = document.createElement("link");
    themeElement.rel = "stylesheet";
    themeElement.id = "theme";
    themeElement.href = themeUrl;
    
    updateSymbolColor();

    document.head.appendChild(themeElement);
  }
}