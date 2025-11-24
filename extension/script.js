const hidableElements = [
  "ytd-grid-video-renderer",
  "ytd-rich-item-renderer",
  "ytd-compact-video-renderer",
];

function createInterval(threshold, hidableElements) {
  function hideWatched(threshold) {
    document
      .querySelectorAll(hidableElements.join(", "))
      .forEach((node) => {
        if (
          parseInt(node.querySelector("#progress")?.style.width) >= threshold ||
          parseInt(node.querySelector(".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment")?.style.width) >= threshold
        ) {
          node.classList.add("hideVideo");
        }
      });
  }

  hideWatched(threshold);
  globalThis.HideYoutubeWatchedVideos_intervalId = setInterval(() => {
    hideWatched(threshold);
  }, 500);
}

function cancelHide() {
  clearInterval(globalThis.HideYoutubeWatchedVideos_intervalId);
  document.querySelectorAll(".hideVideo").forEach((node) => {
    node.classList.remove("hideVideo");
  });
}

async function setExtensionState() {
  let activated = await getStatus();
  await setStatus(activated);
}

async function getStatus() {
  return (await chrome.storage.local.get({ activated: true })).activated;
}

/**
 *
 * @param {boolean} status
 */
async function setStatus(status) {
  await chrome.storage.local.set({ activated: status });
  if (status) {
    chrome.action.setIcon({ path: "images/newEyeOn.png" });
  } else {
    chrome.action.setIcon({ path: "images/newEyeOff.png" });
  }
}

async function executeScript(tabId) {
  let { threshold } = await chrome.storage.local.get({ threshold: "100" });
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: createInterval,
    args: [threshold, hidableElements],
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  await setExtensionState();
});
chrome.runtime.onStartup.addListener(async () => {
  await setExtensionState();
});

chrome.webNavigation.onCompleted.addListener(
  async (details) => {
    let activated = await getStatus();
    if (activated && details.frameId === 0) {
      await executeScript(details.tabId);
    }
  },
  { url: [{ hostSuffix: "youtube.com" }] }
);

chrome.action.onClicked.addListener(async (tab) => {
  let activated = await getStatus();
  if (activated) {
    await setStatus(false);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: cancelHide,
    });
  } else {
    await setStatus(true);
    url = new URL(tab.url);
    if (url.host.endsWith("youtube.com")) {
      await executeScript(tab.id);
    }
  }
});
