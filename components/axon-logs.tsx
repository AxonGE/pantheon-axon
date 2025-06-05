"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Filter } from "lucide-react"
import type { Log } from "@/types/axon-types"

interface AxonLogsProps {
  logs: Log[]
  onRefresh: () => void
}

export function AxonLogs({ logs, onRefresh }: AxonLogsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [filterSource, setFilterSource] = useState("")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag =
      filterTag === "" || (log.tags && log.tags.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase())))

    const matchesSource = filterSource === "" || log.source.toLowerCase() === filterSource.toLowerCase()

    return matchesSearch && matchesTag && matchesSource
  })

  const uniqueSources = [...new Set(logs.map((log) => log.source))]
  const uniqueTags = [...new Set(logs.flatMap((log) => log.tags || []))]

  return (
    <Card className="h-full border-accent/20 bg-black overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Action Logs</CardTitle>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="relative w-48">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full h-10 pl-8 pr-4 rounded-md border border-input bg-background text-sm"
              >
                <option value="">All Sources</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-48">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full h-10 pl-8 pr-4 rounded-md border border-input bg-background text-sm"
              >
                <option value="">All Tags</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No logs found matching your criteria.</div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="axon-log">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{log.source}</div>
                  <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                </div>

                <p className="text-sm mb-2">{log.content}</p>

                <div className="flex flex-wrap gap-1">
                  {log.tags?.map((tag, index) => (
                    <div key={index} className="axon-tag text-xs">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
