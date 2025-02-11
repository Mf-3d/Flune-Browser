function search() {
  const input = document.querySelector("#search-bar");
  flune.load(input.value);
  input.blur();
}

window.addEventListener("load", async () => {
  const fluneVersion = await flune.getVersion();

  console.log(fluneVersion)
  document.querySelectorAll(".flune-version").forEach((element) => {
    console.log(element)
    element.innerHTML = fluneVersion;
  });
});