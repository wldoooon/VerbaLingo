import type { PlasmoCSConfig, PlasmoRender } from "plasmo"
import React, { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// Types
interface Position {
  top: number
  left: number
}

const GLASS_BG = "rgba(28, 28, 30, 0.5)" // semi-transparent dark, decent for both themes
const BORDER = "rgba(255, 255, 255, 0.18)"

const SelectionPopover: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<Position>({ top: -9999, left: -9999 })
  const [selectedText, setSelectedText] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Compute popover position near current selection
  const updatePositionFromSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setVisible(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (!rect || (rect.top === 0 && rect.left === 0 && rect.width === 0 && rect.height === 0)) {
      setVisible(false)
      return
    }

    const popoverMargin = 8 // px gap from selection
    const top = rect.top + window.scrollY - 40 - popoverMargin
    const left = rect.left + window.scrollX + rect.width / 2

    setPosition({ top: Math.max(8, top), left: Math.max(8, left) })
    setVisible(true)
  }

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const rawText = selection?.toString() || ""
    const text = rawText.replace(/\s+/g, " ").trim()

    if (text && text.length >= 1) {
      setSelectedText(text)
      updatePositionFromSelection()
    } else {
      setVisible(false)
    }
  }

  const handleScrollOrResize = () => {
    if (!visible) return
    updatePositionFromSelection()
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (!containerRef.current) return
    if (!containerRef.current.contains(e.target as Node)) {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setVisible(false)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible])

  if (!visible) return null

  // Compute transform to center horizontally above selection
  const style: React.CSSProperties = {
    position: "absolute",
    top: position.top,
    left: position.left,
    transform: "translate(-50%, -100%)",
    zIndex: 2147483646, // on top
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
    background: GLASS_BG,
    border: `1px solid ${BORDER}`,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
    borderRadius: 9999,
    padding: 6,
    display: "flex",
    gap: 8,
    alignItems: "center",
    color: "#fff",
    userSelect: "none"
  }

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    fontSize: 12,
    lineHeight: 1,
    borderRadius: 9999,
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${BORDER}`,
    color: "#fff",
    cursor: "pointer",
    transition: "background 120ms ease, transform 120ms ease",
  }

  const chipHoverStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.14)",
  }

  const onMeaning = () => {
    console.log("[VerbalIngo] Meaning clicked for:", selectedText)
    // TODO: send a message to background to fetch meaning
    setVisible(false)
  }

  const onSearch = () => {
    console.log("[VerbalIngo] Search clicked for:", selectedText)
    // TODO: open a search UI or message background
    setVisible(false)
  }

  return (
    <div ref={containerRef} style={style}>
      <PopoverButton label="Meaning" onClick={onMeaning} chipStyle={chipStyle} chipHoverStyle={chipHoverStyle} />
      <PopoverButton label="Search" onClick={onSearch} chipStyle={chipStyle} chipHoverStyle={chipHoverStyle} />
    </div>
  )
}

const PopoverButton: React.FC<{
  label: string
  onClick: () => void
  chipStyle: React.CSSProperties
  chipHoverStyle: React.CSSProperties
}> = ({ label, onClick, chipStyle, chipHoverStyle }) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...chipStyle,
        ...(hover ? chipHoverStyle : {}),
      }}
    >
      {label}
    </button>
  )
}

export const render: PlasmoRender = async ({ createRootContainer }) => {
  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<SelectionPopover />)
}
