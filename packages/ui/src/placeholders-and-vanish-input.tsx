"use client"

import { AnimatePresence, motion } from "motion/react"
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react"
import { cn } from "./lib/utils"

interface PlaceholdersAndVanishInputProps {
  placeholders: string[]
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

interface PixelData {
  x: number
  y: number
  r: number
  color: string
}

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: PlaceholdersAndVanishInputProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [value, setValue] = useState("")
  const [animating, setAnimating] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newDataRef = useRef<PixelData[]>([])

  // ---------- Placeholder Rotation ----------
  const startAnimation = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
  }

  const stopAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      startAnimation()
    } else {
      stopAnimation()
    }
  }

  useEffect(() => {
    startAnimation()
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      stopAnimation()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [placeholders])

  // ---------- Canvas Drawing ----------
  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 800
    ctx.clearRect(0, 0, 800, 800)

    const styles = getComputedStyle(inputRef.current)
    const fontSize = parseFloat(styles.fontSize)
    ctx.font = `${fontSize * 2}px ${styles.fontFamily}`
    ctx.fillStyle = "#FFF"
    ctx.fillText(value, 16, 40)

    const imageData = ctx.getImageData(0, 0, 800, 800).data
    const newData: PixelData[] = []

    for (let y = 0; y < 800; y++) {
      for (let x = 0; x < 800; x++) {
        const i = (y * 800 + x) * 4
        if (imageData[i] || imageData[i + 1] || imageData[i + 2]) {
          newData.push({
            x,
            y,
            r: 1,
            color: `rgba(${imageData[i]}, ${imageData[i + 1]}, ${imageData[i + 2]}, ${imageData[i + 3]})`,
          })
        }
      }
    }

    newDataRef.current = newData
  }, [value])

  useEffect(() => {
    if (!animating) draw()
  }, [value, draw, animating])

  // ---------- Vanish Animation ----------
  const animate = (start: number) => {
    const step = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr: PixelData[] = []
        for (const current of newDataRef.current) {
          if (current.x < pos) {
            newArr.push(current)
          } else {
            if (current.r > 0) {
              current.x += Math.random() > 0.5 ? 1 : -1
              current.y += Math.random() > 0.5 ? 1 : -1
              current.r -= 0.05 * Math.random()
              newArr.push(current)
            }
          }
        }

        newDataRef.current = newArr
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800)
          newArr.forEach(({ x, y, r, color }) => {
            if (x > pos) {
              ctx.fillStyle = color
              ctx.fillRect(x, y, r, r)
            }
          })
        }

        if (newArr.length > 0) {
          step(pos - 8)
        } else {
          setValue("")
          setAnimating(false)
        }
      })
    }
    step(start)
  }

  const vanishAndSubmit = () => {
    if (!inputRef.current) return
    setAnimating(true)
    draw()

    if (value) {
      const maxX = Math.max(...newDataRef.current.map((p) => p.x), 0)
      animate(maxX)
    }
  }

  // ---------- Handlers ----------
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating) vanishAndSubmit()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    vanishAndSubmit()
    onSubmit?.(e)
  }

  // ---------- JSX ----------
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full relative max-w-xl mx-auto h-14 rounded-full overflow-hidden shadow transition duration-200 bg-gray-700 dark:bg-zinc-800",
        value && "bg-gray-50"
      )}
    >
      {/* Canvas Animation */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute top-[20%] left-3 sm:left-8 scale-50 origin-top-left filter invert dark:invert-0 pointer-events-none pr-20",
          animating ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Input */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value)
            onChange?.(e)
          }
        }}
        onKeyDown={handleKeyDown}
        type="text"
        className={cn(
          "w-full h-full pl-4 sm:pl-10 pr-14 text-base bg-transparent border-none focus:outline-none focus:ring-0 rounded-full z-50 text-black dark:text-white",
          animating && "text-transparent dark:text-transparent"
        )}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!value}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-black dark:bg-zinc-900 disabled:bg-gray-200 dark:disabled:bg-zinc-700 transition"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <motion.path
            d="M5 12h14"
            initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }}
            animate={{ strokeDashoffset: value ? 0 : "50%" }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
          <path d="M13 18l6 -6M13 6l6 6" />
        </motion.svg>
      </button>

      {/* Animated Placeholders */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              key={`ph-${currentPlaceholder}`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="pl-4 sm:pl-12 text-base font-normal text-neutral-500 dark:text-zinc-400 truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
