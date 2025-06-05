"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Save, Trash, Search } from "lucide-react"
import type { SymbolicFragment } from "@/types/axon-types"

interface AxonSymbolicMemoryProps {
  fragments: SymbolicFragment[]
  onFragmentUpdate: () => void
}

export function AxonSymbolicMemory({ fragments, onFragmentUpdate }: AxonSymbolicMemoryProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newFragment, setNewFragment] = useState<Partial<SymbolicFragment>>({
    key: "",
    value: "",
    tags: [],
  })
  const [editFragment, setEditFragment] = useState<Partial<SymbolicFragment>>({})
  const [tagInput, setTagInput] = useState("")
  const [editTagInput, setEditTagInput] = useState("")
  const { toast } = useToast()

  const filteredFragments = fragments.filter((fragment) => {
    return (
      searchTerm === "" ||
      fragment.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fragment.tags && fragment.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
  })

  const handleAddFragment = async () => {
    if (!newFragment.key || !newFragment.value) {
      toast({
        title: "Validation Error",
        description: "Key and value are required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/axon/symbolic-fragments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFragment),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Fragment Added",
          description: "New symbolic fragment has been successfully added.",
        })
        setIsAdding(false)
        setNewFragment({
          key: "",
          value: "",
          tags: [],
        })
        onFragmentUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add fragment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add fragment:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateFragment = async (id: string) => {
    try {
      const response = await fetch(`/api/axon/symbolic-fragments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFragment),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Fragment Updated",
          description: "Symbolic fragment has been successfully updated.",
        })
        setIsEditing(null)
        setEditFragment({})
        onFragmentUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update fragment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update fragment:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFragment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this symbolic fragment?")) return

    try {
      const response = await fetch(`/api/axon/symbolic-fragments/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Fragment Deleted",
          description: "Symbolic fragment has been successfully deleted.",
        })
        onFragmentUpdate()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete fragment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete fragment:", error)
      toast({
        title: "Connection Error",
        description: "Failed to communicate with the server.",
        variant: "destructive",
      })
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    setNewFragment((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }))
    setTagInput("")
  }

  const handleRemoveTag = (index: number) => {
    setNewFragment((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }))
  }

  const handleAddEditTag = () => {
    if (!editTagInput.trim()) return
    setEditFragment((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), editTagInput.trim()],
    }))
    setEditTagInput("")
  }

  const handleRemoveEditTag = (index: number) => {
    setEditFragment((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }))
  }

  const startEditing = (fragment: SymbolicFragment) => {
    setIsEditing(fragment.id)
    setEditFragment({ ...fragment })
  }

  return (
    <Card className="h-full border-accent/20 bg-black overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Symbolic Memory</CardTitle>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fragment
        </Button>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symbolic fragments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isAdding && (
          <div className="axon-symbolic-fragment bg-secondary/30 mb-4">
            <h3 className="text-lg font-semibold mb-2">New Symbolic Fragment</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key</label>
                <Input
                  value={newFragment.key}
                  onChange={(e) => setNewFragment((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="Symbolic key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <Textarea
                  value={newFragment.value}
                  onChange={(e) => setNewFragment((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="Symbolic value"
                  rows={3}
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
                  {newFragment.tags?.map((tag, index) => (
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
              <Button onClick={handleAddFragment}>
                <Save className="h-4 w-4 mr-2" />
                Save Fragment
              </Button>
            </div>
          </div>
        )}

        {filteredFragments.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            No symbolic fragments found. Add your first fragment to enhance Axon's memory.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFragments.map((fragment) => (
              <div key={fragment.id} className="axon-symbolic-fragment">
                {isEditing === fragment.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Key</label>
                      <Input
                        value={editFragment.key}
                        onChange={(e) => setEditFragment((prev) => ({ ...prev, key: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <Textarea
                        value={editFragment.value}
                        onChange={(e) => setEditFragment((prev) => ({ ...prev, value: e.target.value }))}
                        rows={3}
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
                        {editFragment.tags?.map((tag, index) => (
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
                      <Button onClick={() => handleUpdateFragment(fragment.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{fragment.key}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEditing(fragment)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFragment(fragment.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="mb-3">{fragment.value}</p>

                    <div className="flex flex-wrap gap-2">
                      {fragment.tags?.map((tag, index) => (
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
