
// Set options on load
document.addEventListener("DOMContentLoaded", async () => {
  let { threshold } = await chrome.storage.local.get({ threshold: "100" });
  document.getElementById("threshold").value = threshold;
  document.getElementById("currentValue").innerText = threshold;
});

// Save options on change
document.addEventListener("input", async () => {
  let threshold = document.getElementById("threshold").value;
  document.getElementById("currentValue").innerText = threshold;
  await chrome.storage.local.set({ threshold: threshold });
});
