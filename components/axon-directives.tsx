"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Save, Trash } from "lucide-react"
import type { Directive } from "@/types/axon-types"

interface AxonDirectivesProps {
  directives: Directive[]
  onDirectiveUpdate: () => void
}

export function AxonDirectives({ directives, onDirectiveUpdate }: AxonDirectivesProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newDirective, setNewDirective] = useState<Partial<Directive>>({
    name: "",
    description: "",
    priority: 1,
    tags: [],
  })
  const [editDirective, setEditDirective] = useState<Partial<Directive>>({})
  const [tagInput, setTagInput] = useState("")
  const [editTagInput, setEditTagInput] = useState("")
  const { toast } = useToast()

  const handleAddDirective = async () => {
    if (!newDirective.name || !newDirective.description) {
      toast({
        title: "Validation Error",
        description: "Name and description are required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/axon/directives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDirective),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Directive Added",
          description: "New directive has been successfully added.",
        })
        setIsAdding(false)
        setNewDirective({
          name: "",
          description: "",
          priority: 1,
          tags: [],
        })
        onDirectiveUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add directive.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add directive:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateDirective = async (id: string) => {
    try {
      const response = await fetch(`/api/axon/directives/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editDirective),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Directive Updated",
          description: "Directive has been successfully updated.",
        })
        setIsEditing(null)
        setEditDirective({})
        onDirectiveUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update directive.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update directive:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDirective = async (id: string) => {
    if (!confirm("Are you sure you want to delete this directive?")) return

    try {
      const response = await fetch(`/api/axon/directives/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Directive Deleted",
          description: "Directive has been successfully deleted.",
        })
        onDirectiveUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete directive.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete directive:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    setNewDirective((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }))
    setTagInput("")
  }

  const handleRemoveTag = (index: number) => {
    setNewDirective((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }))
  }

  const handleAddEditTag = () => {
    if (!editTagInput.trim()) return
    setEditDirective((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), editTagInput.trim()],
    }))
    setEditTagInput("")
  }

  const handleRemoveEditTag = (index: number) => {
    setEditDirective((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }))
  }

  const startEditing = (directive: Directive) => {
    setIsEditing(directive.id)
    setEditDirective({ ...directive })
  }

  return (
    <Card className="h-full border-accent/20 bg-black overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mission Directives</CardTitle>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Directive
        </Button>
      </CardHeader>

      <CardContent>
        {isAdding && (
          <div className="axon-directive bg-secondary/30">
            <h3 className="text-lg font-semibold mb-2">New Directive</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={newDirective.name}
                  onChange={(e) => setNewDirective((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Directive name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newDirective.description}
                  onChange={(e) => setNewDirective((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Directive description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={newDirective.priority}
                  onChange={(e) =>
                    setNewDirective((prev) => ({
                      ...prev,
                      priority: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {newDirective.tags?.map((tag, index) => (
                    <div key={index} className="axon-tag flex items-center">
                      {tag}
                      <button onClick={() => handleRemoveTag(index)} className="ml-2 text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDirective}>
                <Save className="h-4 w-4 mr-2" />
                Save Directive
              </Button>
            </div>
          </div>
        )}

        {directives.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            No directives found. Add your first directive to guide Axon.
          </div>
        ) : (
          <div className="space-y-4">
            {directives.map((directive) => (
              <div key={directive.id} className="axon-directive">
                {isEditing === directive.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input
                        value={editDirective.name}
                        onChange={(e) => setEditDirective((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={editDirective.description}
                        onChange={(e) => setEditDirective((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={editDirective.priority}
                        onChange={(e) =>
                          setEditDirective((prev) => ({
                            ...prev,
                            priority: Number.parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={editTagInput}
                          onChange={(e) => setEditTagInput(e.target.value)}
                          placeholder="Add tag"
                          onKeyDown={(e) => e.key === "Enter" && handleAddEditTag()}
                        />
                        <Button onClick={handleAddEditTag}>Add</Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {editDirective.tags?.map((tag, index) => (
                          <div key={index} className="axon-tag flex items-center">
                            {tag}
                            <button onClick={() => handleRemoveEditTag(index)} className="ml-2 text-xs">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleUpdateDirective(directive.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{directive.name}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEditing(directive)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDirective(directive.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">Priority: {directive.priority}</div>

                    <p className="mb-3">{directive.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {directive.tags?.map((tag, index) => (
                        <div key={index} className="axon-tag">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
