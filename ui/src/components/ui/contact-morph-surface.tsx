"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type SpringConfig = {
  type: "spring"
  stiffness: number
  damping: number
  mass?: number
  delay?: number
}

const SPEED = 1
const CONTACT_WIDTH = 380
const CONTACT_HEIGHT = 340

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactMorphSurfaceProps {
  // Dimensions
  collapsedWidth?: number | "auto"
  collapsedHeight?: number
  expandedWidth?: number
  expandedHeight?: number

  // Animation
  animationSpeed?: number
  springConfig?: SpringConfig

  // Content
  triggerLabel?: string
  triggerIcon?: React.ReactNode

  // Callbacks
  onSubmit?: (data: ContactFormData) => void | Promise<void>
  onOpen?: () => void
  onClose?: () => void
  onSuccess?: () => void

  // Styles
  className?: string
  triggerClassName?: string
}

interface ContactContextValue {
  showForm: boolean
  success: boolean
  openForm: () => void
  closeForm: () => void
  triggerLabel: string
  triggerIcon?: React.ReactNode
  triggerClassName?: string
  onSubmit?: (data: ContactFormData) => void | Promise<void>
  animationSpeed: number
  springConfig?: SpringConfig
  expandedWidth: number
  expandedHeight: number
}

const ContactContext = createContext<ContactContextValue>(
  {} as ContactContextValue
)

const useContactSurface = () => useContext(ContactContext)

function useContactLogic({
  expandedWidth = CONTACT_WIDTH,
  expandedHeight = CONTACT_HEIGHT,
  collapsedHeight = 44,
  animationSpeed = SPEED,
}: {
  expandedWidth?: number
  expandedHeight?: number
  collapsedHeight?: number
  animationSpeed?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  function closeForm() {
    setIsOpen(false)
  }

  function openForm() {
    setIsOpen((prev) => !prev)
  }

  function setSuccessState(value: boolean) {
    setSuccess(value)
  }

  useClickOutside(containerRef, closeForm)

  return {
    containerRef,
    showForm: isOpen,
    success,
    openForm,
    closeForm,
    setSuccess: setSuccessState,
    expandedWidth,
    expandedHeight,
    collapsedHeight,
    animationSpeed,
  }
}

export function ContactMorphSurface({
  collapsedWidth = CONTACT_WIDTH,
  collapsedHeight = 44,
  expandedWidth = CONTACT_WIDTH,
  expandedHeight = CONTACT_HEIGHT,
  animationSpeed = SPEED,
  springConfig,
  triggerLabel = "Contact us",
  triggerIcon,
  onSubmit,
  onOpen,
  onClose,
  onSuccess,
  className,
  triggerClassName,
}: ContactMorphSurfaceProps = {}) {
  const hookLogic = useContactLogic({
    expandedWidth,
    expandedHeight,
    collapsedHeight,
    animationSpeed,
  })

  const {
    containerRef,
    showForm,
    success,
    openForm,
    closeForm,
    setSuccess,
    expandedWidth: hookExpandedWidth,
    expandedHeight: hookExpandedHeight,
    collapsedHeight: hookCollapsedHeight,
  } = hookLogic

  function onFormSuccess() {
    closeForm()
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 2000)
    onSuccess?.()
  }

  const context = useMemo(
    () => ({
      showForm,
      success,
      openForm: () => {
        openForm()
        onOpen?.()
      },
      closeForm: () => {
        closeForm()
        onClose?.()
      },
      triggerLabel,
      triggerIcon,
      triggerClassName,
      onSubmit,
      animationSpeed,
      springConfig,
      expandedWidth: hookExpandedWidth,
      expandedHeight: hookExpandedHeight,
    }),
    [
      showForm,
      success,
      openForm,
      closeForm,
      triggerLabel,
      triggerIcon,
      triggerClassName,
      onSubmit,
      animationSpeed,
      springConfig,
      hookExpandedWidth,
      hookExpandedHeight,
    ]
  )

  return (
    <motion.div
      className={cn("flex justify-center items-start", className)}
      style={{
        width: hookExpandedWidth,
      }}
      initial={false}
      animate={{
        height: showForm ? hookExpandedHeight : hookCollapsedHeight + 16,
      }}
      transition={{
        type: "spring",
        stiffness: 550 / animationSpeed,
        damping: 45,
        mass: 0.7,
      }}
    >
      <motion.div
        ref={containerRef}
        onClick={() => {
          if (!showForm) {
            openForm()
            onOpen?.()
          }
        }}
        className={cn(
          "relative flex flex-col items-center z-10 overflow-hidden",
          "bg-card dark:bg-muted",
          "shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]",
          "dark:shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)]",
          !showForm &&
            "cursor-pointer hover:brightness-105 transition-[filter] duration-200"
        )}
        initial={false}
        animate={{
          width: showForm ? hookExpandedWidth : collapsedWidth,
          height: showForm ? hookExpandedHeight : hookCollapsedHeight,
          borderRadius: showForm ? 14 : 20,
        }}
        transition={
          springConfig || {
            type: "spring",
            stiffness: 550 / animationSpeed,
            damping: 45,
            mass: 0.7,
            delay: showForm ? 0 : 0.08,
          }
        }
      >
        <ContactContext.Provider value={context}>
          <ContactDock />
          <ContactForm onSuccess={onFormSuccess} />
        </ContactContext.Provider>
      </motion.div>
    </motion.div>
  )
}

// Dock (collapsed trigger bar)
function ContactDock() {
  const {
    success,
    showForm,
    openForm,
    triggerLabel,
    triggerIcon,
    triggerClassName,
    animationSpeed,
    springConfig,
  } = useContactSurface()

  const logoSpring = springConfig || {
    type: "spring" as const,
    stiffness: 350 / animationSpeed,
    damping: 35,
  }

  const checkSpring = {
    type: "spring" as const,
    stiffness: 500 / animationSpeed,
    damping: 22,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openForm()
  }

  return (
    <footer className="flex items-center justify-center select-none whitespace-nowrap mt-auto h-[44px] w-full">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          {showForm ? (
            <div className="w-5 h-5" style={{ opacity: 0 }} />
          ) : (
            <motion.div
              className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
              layoutId="contact-morph-dot"
              transition={logoSpring}
            >
              <AnimatePresence>
                {success && (
                  <motion.div
                    key="check"
                    exit={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      ...checkSpring,
                      delay: success ? 0.3 : 0,
                    }}
                    className="m-[2px]"
                  >
                    <IconCheck />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          <span className="text-sm font-medium text-foreground">
            {success ? "Sent!" : "Still have questions?"}
          </span>
        </div>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5",
            "text-sm font-semibold",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "cursor-pointer",
            triggerClassName
          )}
          onClick={handleClick}
        >
          {triggerLabel}
        </button>
      </div>
    </footer>
  )
}

// Expanded contact form
function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    closeForm,
    showForm,
    onSubmit,
    expandedWidth,
    expandedHeight,
    animationSpeed,
  } = useContactSurface()

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showForm) {
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [showForm])

  const contentSpring = {
    type: "spring" as const,
    stiffness: 550 / animationSpeed,
    damping: 45,
    mass: 0.7,
  }

  const logoSpring = {
    type: "spring" as const,
    stiffness: 350 / animationSpeed,
    damping: 35,
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data: ContactFormData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    if (onSubmit) {
      try {
        await onSubmit(data)
        onSuccess()
      } catch (error) {
        console.error("Contact form submission error:", error)
      }
    } else {
      onSuccess()
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      closeForm()
    }
  }

  const inputClasses = cn(
    "w-full text-sm outline-none px-4 py-2.5 rounded-xl",
    "bg-muted/50 dark:bg-background/50 border border-border/50",
    "caret-primary",
    "placeholder:text-muted-foreground/50",
    "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
    "focus:border-primary/40",
    "transition-colors"
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0"
      style={{
        width: expandedWidth,
        height: expandedHeight,
        pointerEvents: showForm ? "all" : "none",
      }}
      onKeyDown={onKeyDown}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentSpring}
            className="p-3 flex flex-col h-full gap-2"
          >
            {/* Header */}
            <div className="flex justify-between items-center py-1 px-1">
              <p className="flex gap-[6px] text-sm items-center text-muted-foreground select-none z-[2] ml-[22px] font-medium">
                Contact Us
              </p>
              <button
                type="button"
                onClick={closeForm}
                className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                Esc
              </button>
            </div>

            {/* Name + Email row */}
            <div className="flex gap-2">
              <input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="Name"
                required
                className={inputClasses}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className={inputClasses}
              />
            </div>

            {/* Subject */}
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              required
              className={inputClasses}
            />

            {/* Message */}
            <textarea
              name="message"
              placeholder="Your message..."
              required
              spellCheck={false}
              className={cn(
                inputClasses,
                "resize-none flex-1 py-3 rounded-2xl"
              )}
            />

            {/* Submit */}
            <button
              type="submit"
              className={cn(
                "w-full py-2.5 rounded-full text-sm font-semibold",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "cursor-pointer"
              )}
            >
              Send Message
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {showForm && (
        <motion.div
          layoutId="contact-morph-dot"
          className="w-2 h-2 bg-primary rounded-full absolute top-[18.5px] left-4"
          transition={logoSpring}
        />
      )}
    </form>
  )
}

// Utility components
function IconCheck() {
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="white"
    >
      <title>Icon Check</title>
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        strokeWidth="2px"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current
      if (!el || el.contains((event?.target as Node) || null)) {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}
