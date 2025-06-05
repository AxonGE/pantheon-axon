export interface Directive {
  id: string
  name: string
  description: string
  priority: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  source: string
  content: string
  tags?: string[]
  timestamp: string
}

export interface SymbolicFragment {
  id: string
  key: string
  value: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Message {
  role: "user" | "axon" | "system"
  content: string
}

export interface AxonState {
  identity: string
  mission: string
  directives: Directive[]
  symbolicFragments: SymbolicFragment[]
}
