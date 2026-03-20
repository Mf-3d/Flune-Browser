export function applyTheme(themeUrl: string) {
  const element = document.querySelector("#theme");

  if (element) element.setAttribute("href", themeUrl);
  else {
    const themeElement = document.createElement("link");
    themeElement.rel = "stylesheet";
    themeElement.id = "theme";
    themeElement.href = themeUrl;

    document.head.appendChild(themeElement);
  }
}
