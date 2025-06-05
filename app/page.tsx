"use client"

import { useState, useEffect } from "react"
import { AxonHeader } from "@/components/axon-header"
import { AxonConsole } from "@/components/axon-console"
import { AxonStatus } from "@/components/axon-status"
import { AxonDirectives } from "@/components/axon-directives"
import { AxonLogs } from "@/components/axon-logs"
import { AxonSymbolicMemory } from "@/components/axon-symbolic-memory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Directive, Log, SymbolicFragment } from "@/types/axon-types"

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [directives, setDirectives] = useState<Directive[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [symbolicFragments, setSymbolicFragments] = useState<SymbolicFragment[]>([])
  const [activeTab, setActiveTab] = useState("console")
  const { toast } = useToast()

  useEffect(() => {
    const initializeAxon = async () => {
      try {
        const response = await fetch("/api/axon/initialize")
        const data = await response.json()

        if (data.success) {
          setIsInitialized(true)
          toast({
            title: "Axon Initialized",
            description: "The Pantheon orchestrator is online and operational.",
          })

          // Fetch initial data
          fetchDirectives()
          fetchLogs()
          fetchSymbolicFragments()
        } else {
          toast({
            title: "Initialization Failed",
            description: data.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to initialize Axon:", error)
        toast({
          title: "Connection Error",
          description: "Failed to establish connection with Axon core.",
          variant: "destructive",
        })
      }
    }

    initializeAxon()
  }, [toast])

  const fetchDirectives = async () => {
    try {
      const response = await fetch("/api/axon/directives")
      const data = await response.json()
      setDirectives(data.directives)
    } catch (error) {
      console.error("Failed to fetch directives:", error)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/axon/logs")
      const data = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
  }

  const fetchSymbolicFragments = async () => {
    try {
      const response = await fetch("/api/axon/symbolic-fragments")
      const data = await response.json()
      setSymbolicFragments(data.fragments)
    } catch (error) {
      console.error("Failed to fetch symbolic fragments:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AxonHeader isInitialized={isInitialized} />

      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <AxonStatus isInitialized={isInitialized} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="console">Console</TabsTrigger>
            <TabsTrigger value="directives">Directives</TabsTrigger>
            <TabsTrigger value="logs">Action Logs</TabsTrigger>
            <TabsTrigger value="symbolic">Symbolic Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="console" className="flex-1">
            <AxonConsole isInitialized={isInitialized} onNewLog={() => fetchLogs()} />
          </TabsContent>

          <TabsContent value="directives" className="flex-1">
            <AxonDirectives directives={directives} onDirectiveUpdate={() => fetchDirectives()} />
          </TabsContent>

          <TabsContent value="logs" className="flex-1">
            <AxonLogs logs={logs} onRefresh={() => fetchLogs()} />
          </TabsContent>

          <TabsContent value="symbolic" className="flex-1">
            <AxonSymbolicMemory fragments={symbolicFragments} onFragmentUpdate={() => fetchSymbolicFragments()} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
