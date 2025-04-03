window.addEventListener("DOMContentLoaded", async () => {
  const fluneVersion = (await flune.getVersion())
  .replace("-beta.", " Beta ")
  .replace("-dev.", " Dev ");

  console.info("Flune-Browser: ", fluneVersion)
  document.querySelectorAll(".flune-version").forEach((element) => {
    element.innerHTML = fluneVersion;
  });
});