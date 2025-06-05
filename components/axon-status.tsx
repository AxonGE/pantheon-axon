import { Card, CardContent } from "@/components/ui/card"
import { Brain, Network, Database, Cpu } from "lucide-react"

interface AxonStatusProps {
  isInitialized: boolean
}

export function AxonStatus({ isInitialized }: AxonStatusProps) {
  return (
    <Card className="mb-6 bg-black border-accent/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm font-medium">Core Status</div>
              <div className="text-xs text-muted-foreground">{isInitialized ? "Operational" : "Initializing..."}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm font-medium">Nexus Connection</div>
              <div className="text-xs text-muted-foreground">Ready for input</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm font-medium">Memory Systems</div>
              <div className="text-xs text-muted-foreground">Supabase Active</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm font-medium">Reasoning Engine</div>
              <div className="text-xs text-muted-foreground">GPT-4/4o Ready</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
