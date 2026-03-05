export function applyTheme(themeUrl: string, updateSymbolColor: Function) {
  const element = document.querySelector("#theme");

  if (element) element.setAttribute("href", themeUrl);
  else document.head.innerHTML += `<link rel="stylesheet" id="theme" href="${themeUrl}" />`;

  updateSymbolColor();
}