export {}

console.log("VerbaLingo: Background Service Loaded")

// ============================================
// OFFSCREEN DOCUMENT MANAGEMENT
// ============================================

let offscreenCreating: Promise<void> | null = null
let offscreenReady = false

async function hasOffscreenDocument(): Promise<boolean> {
  try {
    // @ts-ignore - getContexts types may not be up to date
    if (chrome.runtime.getContexts) {
      // @ts-ignore
      const contexts = await (chrome.runtime.getContexts as any)({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL('assets/offscreen.html')]
      })
      return Boolean(contexts && contexts.length > 0)
    }
  } catch (e) {
    console.log("VerbaLingo: getContexts not available", e)
  }
  return false
}

async function setupOffscreenDocument(): Promise<boolean> {
  const hasDoc = await hasOffscreenDocument()
  
  if (hasDoc) {
    console.log("VerbaLingo: Offscreen document already exists")
    return true
  }

  if (offscreenCreating) {
    await offscreenCreating
    return offscreenReady
  }

  console.log("VerbaLingo: Creating offscreen document...")
  
  offscreenCreating = chrome.offscreen.createDocument({
    url: 'assets/offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Playing YouTube clips for language learning'
  })

  try {
    await offscreenCreating
    console.log("VerbaLingo: Offscreen document created successfully")
    offscreenReady = true
    return true
  } catch (error) {
    console.error("VerbaLingo: Failed to create offscreen document:", error)
    offscreenReady = false
    return false
  } finally {
    offscreenCreating = null
  }
}

// ============================================
// SIDE PANEL SETUP
// ============================================

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// ============================================
// MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const msgType = message.type || message.action
  console.log("VerbaLingo Background received:", msgType)

  // Messages from offscreen document
  if (message.type === "OFFSCREEN_READY") {
    console.log("VerbaLingo: Offscreen document is ready")
    offscreenReady = true
    return
  }

  if (message.type === "PLAYER_READY") {
    console.log("VerbaLingo: YouTube player is ready")
    return
  }

  if (message.type === "PLAYER_STATE") {
    console.log("VerbaLingo: Player state:", message.state)
    return
  }

  if (message.type === "PLAYER_ERROR") {
    console.error("VerbaLingo: Player error:", message.error)
    return
  }

  if (message.type === "CLIP_ENDED") {
    console.log("VerbaLingo: Clip ended")
    return
  }

  // Commands from side panel
  if (message.action === "OPEN_PANEL") {
    if (sender.tab?.windowId) {
      chrome.sidePanel
        .open({ windowId: sender.tab.windowId })
        .catch(console.error)
    }
    sendResponse({ success: true })
    return true
  }

  if (message.action === "PLAY_CLIP") {
    (async () => {
      try {
        const ready = await setupOffscreenDocument()
        if (!ready) {
          sendResponse({ success: false, error: "Failed to setup offscreen document" })
          return
        }
        
        // Send to offscreen document
        chrome.runtime.sendMessage({
          type: "LOAD_VIDEO",
          videoId: message.clip.video_id,
          start: message.clip.start,
          end: message.clip.end
        }, (response) => {
          console.log("VerbaLingo: LOAD_VIDEO response:", response)
        })
        
        sendResponse({ success: true })
      } catch (error) {
        console.error("VerbaLingo: PLAY_CLIP error:", error)
        sendResponse({ success: false, error: String(error) })
      }
    })()
    return true
  }

  if (message.action === "REPLAY") {
    chrome.runtime.sendMessage({ type: "REPLAY" })
    sendResponse({ success: true })
    return true
  }

  if (message.action === "SET_LOOP") {
    chrome.runtime.sendMessage({ type: "SET_LOOP", loop: message.loop })
    sendResponse({ success: true })
    return true
  }

  if (message.action === "PAUSE") {
    chrome.runtime.sendMessage({ type: "PAUSE" })
    sendResponse({ success: true })
    return true
  }

  if (message.action === "PLAY") {
    chrome.runtime.sendMessage({ type: "PLAY" })
    sendResponse({ success: true })
    return true
  }
})

// Initialize offscreen document on startup
setupOffscreenDocument()

console.log("VerbaLingo: Background script initialized")
