"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Play, Twitter, DollarSign, Mail, Laptop, Candy, Share2 } from "lucide-react"
import Head from "next/head"
import Script from "next/script"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/toaster"

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
    formData.append("entry.2069125003", email)
    formData.append("entry.1006830469", twitterHandle)
    formData.append("entry.308296035", favoriteMeme)

    try {
      const urlWithParams = new URL(baseUrl)
      formData.forEach((value, key) => {
        urlWithParams.searchParams.append(key, value.toString())
      })

      const response = await fetch(urlWithParams.toString(), {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      console.log("Form submitted successfully")
      setIsModalOpen(false)
      
      // Show success toast
      toast(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-black">You&apos;re on the waitlist 🎉</p>
          <p className="text-gray-600 text-sm">You will be notified on game reveal</p>
        </div>,
        {
          position: "top-center",
          duration: 5000,
          className: "bg-white text-black",
          style: {
            backgroundColor: "white",
            color: "black",
            border: "1px solid #e2e8f0",
          }
        }
      )
      
      // Clear form fields
      setEmail("")
      setTwitterHandle("")
      setFavoriteMeme("")
      
    } catch (error) {
      console.error("Error submitting form:", error)
      // Optionally show error toast
      toast.error("Something went wrong. Please try again.")
    }
  }

  const handleShare = async () => {
    const shareUrl = "https://playbonk.fun"
    const shareText = "Play exciting meme coin trading games on Solana 🎮"

    if (navigator.share && window.innerWidth <= 768) {
      // Mobile native share
      try {
        await navigator.share({
          title: "Game On Meme Money",
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Desktop clipboard copy
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast("Link copied to clipboard!")
      } catch (err) {
        console.log("Error copying to clipboard:", err)
      }
    }
  }

  return (
    <>
      <Head>
        <title>meme coin trading as mini games | game on meme money</title>
        <meta name="description" content="Play exciting meme coin trading games on Solana. Turn internet culture into profit with our gamified memecoin trading platform. Join the future of meme coins and gaming." />
        <meta name="keywords" content="solana, memecoins, meme coins, solana meme coins, solana meme, solana game, solana games, meme games, crypto games, play to earn" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://playbonk.fun/" />
        <meta property="og:title" content="meme coin trading as mini games | game on meme money" />
        <meta property="og:description" content="Play exciting meme coin trading games on Solana. Turn internet culture into profit with our gamified memecoin trading platform." />
        <meta property="og:image" content="https://playbonk.fun/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://playbonk.fun/" />
        <meta property="twitter:title" content="meme coin trading as mini games | game on meme money" />
        <meta property="twitter:description" content="Play exciting meme coin trading games on Solana. Turn internet culture into profit with our gamified memecoin trading platform." />
        <meta property="twitter:image" content="https://playbonk.fun/twitter-image.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://playbonk.fun/" />

        {/* Add this after getting your verification code from Google Search Console */}
        <meta name="google-site-verification" content="your-google-verification-code" />
      </Head>

      {/* Add Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5MGHYY191M"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-5MGHYY191M');
        `}
      </Script>

      <Script
        id="schema-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Game On Meme Money",
            "description": "Play exciting meme coin trading games on Solana blockchain platform",
            "url": "https://playbonk.fun",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "category": "Gaming Platform",
            },
            "keywords": "solana, memecoins, meme coins, solana meme coins, solana game, meme games",
          })
        }}
      />

      <div className="min-h-screen bg-black dark relative overflow-hidden flex flex-col px-4 sm:px-6 lg:px-8">
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
              linear-gradient(to right, #1B8DFE 2px, transparent 2px),
              linear-gradient(to bottom, #1B8DFE 2px, transparent 2px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.15,
          }}
        />

        {/* Glowing Orbs */}
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#1B8DFE] blur-3xl opacity-20" />
        <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FE1D1D] blur-3xl opacity-20" />

        {/* Navbar - with proper spacing from top strip */}
        <nav className="relative z-30 pt-12 pb-4 w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <a
              href="https://github.com/UjjwalGupta49/play-bonk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-xs sm:text-base"
            >
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Contribute</span>
            </a>

            <a
              href="https://x.com/ujjwalgupta49"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-xs sm:text-base"
            >
              <Candy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Feature Request</span>
            </a>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-xs sm:text-base"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Share</span>
            </button>
          </div>
        </nav>

        {/* Main Content - Adjusted position upward */}
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 text-center -mt-20 sm:-mt-16">
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

          {/* Play Now Button */}
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
          <DialogContent className="bg-black border border-[#FFFFFF] text-white max-w-md w-[95%] sm:w-full mx-auto p-4 sm:p-6 rounded-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-lg sm:text-xl font-bold text-[#1B8DFE] mb-2 leading-tight">
                <span className="block sm:inline">Get access to the latest</span>{" "}
                <span className="block sm:inline">
                  games on{" "}
                  <span className="text-[#FFFFFF]">Solana</span>
                </span>
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-[#FFFFFF]/80">
                First Bonk game will be revealed this month
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-3">
                <label htmlFor="twitter" className="block text-sm font-medium text-[#FFFFFF]">
                  Sign up X (Twitter)
                </label>
                <div className="relative">
                  <Input
                    id="twitter"
                    type="text"
                    placeholder="@solana"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    required
                    className="pl-10 bg-black border-[#1B8DFE] text-white h-11 w-full rounded-md"
                  />
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-medium text-[#FFFFFF]">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="solana@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-black border-[#1B8DFE] text-white h-11 w-full rounded-md"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
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
                    className="pl-10 bg-black border-[#1B8DFE] text-white h-11 w-full rounded-md"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFFFFF] w-4 h-4" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1bfe8d] hover:bg-[#1bfe8d]/80 text-black font-bold py-3 rounded-md mt-6 text-sm sm:text-base"
              >
                Get back on Nov 30th
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Sonner for toast notifications */}
      <Toaster />
    </>
  )
}

// Hilight Red: FE1D1D, Action green: 1BFE8D, Primary blue: 1B8DFE, Main white: FFFFFF, Background black: 000000