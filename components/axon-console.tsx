"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Send, RefreshCw } from "lucide-react"

interface Message {
  role: "user" | "axon" | "system"
  content: string
  timestamp: string
}

interface AxonConsoleProps {
  isInitialized: boolean
  onNewLog: () => void
}

export function AxonConsole({ isInitialized, onNewLog }: AxonConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Axon is initializing. Please wait...",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isInitialized && messages.length === 1 && messages[0].role === "system") {
      setMessages([
        {
          role: "system",
          content: "Axon initialized. Ready to receive input.",
          timestamp: new Date().toISOString(),
        },
      ])

      // Fetch identity from Axon
      fetchAxonIdentity()
    }
  }, [isInitialized])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchAxonIdentity = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch("/api/axon/identity")
      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "axon",
            content: data.message,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch Axon identity:", error)
      toast({
        title: "Connection Error",
        description: "Failed to establish connection with Axon core.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!input.trim() || !isInitialized || isProcessing) return

    const userMessage = {
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/axon/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "axon",
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ])
        onNewLog()
      } else {
        toast({
          title: "Processing Error",
          description: data.error || "Failed to process your request.",
          variant: "destructive",
        })

        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `Error: ${data.error || "Failed to process your request."}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to process message:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with Axon core.",
        variant: "destructive",
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Error: Failed to communicate with Axon core.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const resetConversation = () => {
    setMessages([
      {
        role: "system",
        content: "Conversation reset. Fetching Axon identity...",
        timestamp: new Date().toISOString(),
      },
    ])
    fetchAxonIdentity()
  }

  return (
    <Card className="flex flex-col h-full border-accent/20 bg-black">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`axon-console-message ${message.role}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">
                  {message.role === "user" ? "Dr. Gabriel Ellul" : message.role === "axon" ? "Axon" : "System"}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t border-accent/20 p-4">
        <div className="flex w-full gap-2">
          <Button variant="outline" size="icon" onClick={resetConversation} disabled={isProcessing}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a message for Axon..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={!isInitialized || isProcessing}
          />
          <Button onClick={handleSubmit} disabled={!isInitialized || !input.trim() || isProcessing}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
