import { Brain } from "lucide-react"

interface AxonHeaderProps {
  isInitialized: boolean
}

export function AxonHeader({ isInitialized }: AxonHeaderProps) {
  return (
    <header className="border-b border-accent/20 bg-black">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Axon</h1>
            <p className="text-sm text-muted-foreground">Pantheon Ecosystem Orchestrator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isInitialized ? "bg-green-500" : "bg-amber-500"}`}></div>
          <span className="text-sm text-muted-foreground">{isInitialized ? "Online" : "Initializing..."}</span>
        </div>
      </div>
    </header>
  )
}
