function search() {
  const input = document.querySelector("#search-bar");
  flune.load(input.value);
  input.blur();
}