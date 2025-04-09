"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const colorOptions = ["red", "green", "blue", "yellow"]

// Map each color to its Tailwind CSS class
const colorClasses: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
}

export default function SimonGame() {
  const [gameSequence, setGameSequence] = useState<string[]>([])
  const [playerSequence, setPlayerSequence] = useState<string[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [flashedColor, setFlashedColor] = useState<string | null>(null)
  const [message, setMessage] = useState("Press Start to Begin!")

  // Add a random color to the game sequence
  const addRandomColor = () => {
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)]
    setGameSequence(prev => [...prev, randomColor])
  }

  // Play the sequence for the player
  const playSequence = async () => {
    setIsAnimating(true)
    setMessage("Watch the sequence!")
    for (const color of gameSequence) {
      await flashColorButton(color)
    }
    setIsAnimating(false)
    setIsPlayerTurn(true)
    setMessage("Your turn!")
    setPlayerSequence([])
  }

  // Flash a color button by updating state and waiting for a brief interval
  const flashColorButton = (color: string) => {
    return new Promise<void>(resolve => {
      setFlashedColor(color)
      setTimeout(() => {
        setFlashedColor(null)
        // Brief pause before the next flash
        setTimeout(resolve, 250)
      }, 600)
    })
  }

  // Handle player clicking a color button
  const handlePlayerClick = (color: string) => {
    if (!isPlayerTurn || isAnimating) return

    const newPlayerSequence = [...playerSequence, color]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1
    // If the player presses the wrong color, the game is over
    if (newPlayerSequence[currentIndex] !== gameSequence[currentIndex]) {
      toast.error("Incorrect sequence! Game over.")
      setMessage("Game Over! Restarting...")
      setIsPlayerTurn(false)
      setTimeout(resetGame, 1500)
      return
    }

    // If the player completes the sequence correctly, proceed to next round
    if (newPlayerSequence.length === gameSequence.length) {
      toast("Correct! Next round.")
      setIsPlayerTurn(false)
      setTimeout(() => {
        addRandomColor()
      }, 1000)
    }
  }

  // Start a new game
  const startGame = () => {
    setGameSequence([])
    setPlayerSequence([])
    setIsPlayerTurn(false)
    addRandomColor()
  }

  // Reset game by starting fresh
  const resetGame = () => {
    startGame()
  }

  // Whenever the game sequence is updated, play it for the user
  useEffect(() => {
    if (gameSequence.length > 0) {
      setTimeout(() => {
        playSequence()
      }, 500)
    }
  }, [gameSequence])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 drop-shadow-lg">Simon Says</h1>
        <p className="text-lg text-blue-800 drop-shadow">{message}</p>
        <p className="text-sm text-blue-700 drop-shadow">Round: {gameSequence.length}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {colorOptions.map((color) => (
          <motion.div
            key={color}
            whileTap={{ scale: 0.9, opacity: 0.7 }}
            className={`w-32 h-32 cursor-pointer flex items-center justify-center rounded-lg ${
              colorClasses[color]
            } ${flashedColor === color ? "brightness-150" : "brightness-100"} transition-all duration-300`}
            onClick={() => handlePlayerClick(color)}
          >
            <span className="text-xl font-bold uppercase text-white drop-shadow">{color}</span>
          </motion.div>
        ))}
      </div>
      <Button
        onClick={startGame}
        variant="default"
        size="lg"
        className="bg-blue-900 text-white border-blue-900 hover:bg-white hover:text-blue-900"
      >
        Start Game
      </Button>
    </div>
  )
}