"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Play, Twitter, DollarSign, Mail } from "lucide-react"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState("")
  const [email, setEmail] = useState("")
  const [favoriteMeme, setFavoriteMeme] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construct the Google Form URL with form responses
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd4L8mX-GbalKtk41_P7ZPQYXhA6fTE486NIRubitJEfmg1mA/formResponse"
    const formData = new FormData()
    
    // Map the form fields to Google Form entry IDs
    formData.append("entry.2069125003", email)              // Email field
    formData.append("entry.1006830469", twitterHandle)      // Twitter handle field
    formData.append("entry.308296035", favoriteMeme)        // Favorite memecoin field

    try {
      // Create a URL with parameters
      const urlWithParams = new URL(baseUrl)
      formData.forEach((value, key) => {
        urlWithParams.searchParams.append(key, value.toString())
      })

      // Use fetch to submit the form
      const response = await fetch(urlWithParams.toString(), {
        method: "POST",
        mode: "no-cors", // Required for Google Forms
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      console.log("Form submitted successfully")
      setIsModalOpen(false)
      
      // Optional: Clear form fields after submission
      setEmail("")
      setTwitterHandle("")
      setFavoriteMeme("")
      
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black dark relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Running Text Strip - Top */}
      <div className="absolute top-0 left-0 right-0 bg-[#1BFE8D] overflow-hidden h-8 z-20">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: [0, -1920] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...Array(20)].map((_, i) => (
            <span key={i} className={`text-lg font-bold mx-4 ${i % 2 === 0 ? 'text-black' : 'text-white'}`}>
              GAME ON MEME MONEY
            </span>
          ))}
        </motion.div>
      </div>

      {/* Running Text Strip - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1BFE8D] overflow-hidden h-8 z-20">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: [-1920, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...Array(20)].map((_, i) => (
            <span key={i} className={`text-lg font-bold mx-4 ${i % 2 === 0 ? 'text-black' : 'text-white'}`}>
              GAME ON MEME MONEY
            </span>
          ))}
        </motion.div>
      </div>

      {/* Full-screen Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1B8DFE 1px, transparent 1px),
            linear-gradient(to bottom, #1B8DFE 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.15,
        }}
      />

      {/* Adjust Glowing Orbs for mobile */}
      <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#1B8DFE] blur-3xl opacity-20" />
      <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FE1D1D] blur-3xl opacity-20" />

      <main className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-white leading-tight"
        >
          <span className="text-[#1B8DFE]">memecoin</span>{" "}
          <span>trading</span>
          <br />
          as mini games
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-[#FFFFFF]/80"
        >
          fun games to bet on internet culture
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-[#1bfe8d] hover:bg-[#1bfe8d]/80 text-black font-bold text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 rounded-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden w-full sm:w-auto"
            style={{
              boxShadow: "0 0 15px rgba(27, 254, 141, 0.5)",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, 
                  rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, 
                  rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))
                `,
                backgroundSize: "30px 30px",
              }}
              animate={{
                backgroundPosition: ["0px 0px", "30px 30px"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
            />
            <motion.span
              className="relative z-10 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PLAY NOW
              <Play className="ml-2 h-6 w-6" />
            </motion.span>
          </Button>
        </motion.div>
      </main>

      {/* Retro Scanlines Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-black border border-[#FFFFFF] text-white max-w-md w-full mx-4 sm:mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#1B8DFE] mb-2">
              Get access to the latest games on{" "}
              <span className="text-[#FFFFFF]">Solana</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-[#FFFFFF]/80">
              First Bonk game will be revealed this month
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="twitter" className="block text-sm font-medium text-[#FFFFFF]">
                Sign up X (Twitter)
              </label>
              <div className="relative">
                <Input
                  id="twitter"
                  type="text"
                  placeholder="@username"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  required
                  className="pl-10 bg-black border-[#1B8DFE] text-white"
                />
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#FFFFFF]">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-black border-[#1B8DFE] text-white"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="memecoin" className="block text-sm font-medium text-[#FFFFFF]">
                What&apos;s your favorite memecoin?
              </label>
              <div className="relative">
                <Input
                  id="memecoin"
                  type="text"
                  placeholder="bonk wif wen"
                  value={favoriteMeme}
                  onChange={(e) => setFavoriteMeme(e.target.value)}
                  required
                  className="pl-10 bg-black border-[#1B8DFE] text-white"
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1bfe8d] hover:bg-[#1bfe8d]/80 text-black font-bold py-2 px-4 rounded"
            >
              Get back on Nov 30th
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hilight Red: FE1D1D, Action green: 1BFE8D, Primary blue: 1B8DFE, Main white: FFFFFF, Background black: 000000