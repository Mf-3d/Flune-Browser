window.addEventListener("DOMContentLoaded", async () => {
  const fluneVersion = await flune.getVersion();

  console.info("Flune-Browser: ", fluneVersion)
  document.querySelectorAll(".flune-version").forEach((element) => {
    element.innerHTML = fluneVersion;
  });
});