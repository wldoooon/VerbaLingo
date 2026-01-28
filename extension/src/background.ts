export {}

console.log("VerbaLingo: Background Service Loaded")

// Register declarativeNetRequest rules to inject Referer header for YouTube embeds
// This fixes Error 153 "Video player configuration error" in extension side panels
async function registerYouTubeRefererRules() {
  try {
    // Remove any existing dynamic rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const existingRuleIds = existingRules.map(rule => rule.id)
    
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      })
    }

    // Add rules to inject Referer header for YouTube embed requests
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
              {
                header: "Referer",
                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                value: "https://www.youtube.com/"
              }
            ]
          },
          condition: {
            urlFilter: "*://www.youtube.com/embed/*",
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME]
          }
        },
        {
          id: 2,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
              {
                header: "Referer",
                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                value: "https://www.youtube-nocookie.com/"
              }
            ]
          },
          condition: {
            urlFilter: "*://www.youtube-nocookie.com/embed/*",
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME]
          }
        }
      ]
    })

    console.log("VerbaLingo: YouTube Referer rules registered successfully")
  } catch (error) {
    console.error("VerbaLingo: Failed to register YouTube Referer rules:", error)
  }
}

// Register rules on extension load
registerYouTubeRefererRules()

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
