export {}

console.log("VerbaLingo: Background Service Loaded")

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_PANEL") {
    console.log("VerbaLingo: Received OPEN_PANEL command", message)
    if (sender.tab?.windowId) {
      chrome.sidePanel
        .open({ windowId: sender.tab.windowId })
        .catch(console.error)
    }
    return true
  }
})
