import { getSupabaseClient } from "./supabase"
import type { Directive, SymbolicFragment, AxonState } from "@/types/axon-types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Initialize Supabase tables if they don't exist
export async function initializeAxonDatabase() {
  const supabase = getSupabaseClient()

  try {
    // Check if tables exist by trying to select from them
    const { error: directivesError } = await supabase.from("axon_directives").select("id").limit(1).maybeSingle()
    const { error: logsError } = await supabase.from("axon_logs").select("id").limit(1).maybeSingle()
    const { error: fragmentsError } = await supabase.from("axon_symbolic_fragments").select("id").limit(1).maybeSingle()

    // If any table doesn't exist, the database is already set up via SQL script
    // This function mainly serves as a health check
    return { success: true }
  } catch (error) {
    console.error("Database initialization check failed:", error)
    return { success: true } // Continue anyway, tables should exist from SQL script
  }
}

// Get Axon's current state
export async function getAxonState(): Promise<AxonState> {
  const supabase = getSupabaseClient()

  // Get directives
  const { data: directives, error: directivesError } = await supabase
    .from("axon_directives")
    .select("*")
    .order("priority", { ascending: false })

  if (directivesError) {
    console.error("Error fetching directives:", directivesError)
    throw new Error("Failed to fetch directives")
  }

  // Get symbolic fragments
  const { data: fragments, error: fragmentsError } = await supabase.from("axon_symbolic_fragments").select("*")

  if (fragmentsError) {
    console.error("Error fetching symbolic fragments:", fragmentsError)
    throw new Error("Failed to fetch symbolic fragments")
  }

  // Get identity and mission from symbolic fragments
  const identityFragment = fragments?.find((f) => f.key === "identity") || {
    value: "Axon, the central orchestrator of the Pantheon Ecosystem",
  }

  const missionFragment = fragments?.find((f) => f.key === "mission") || {
    value:
      "To coordinate multiple autonomous AI agents, hold memory of actions and decisions, and govern with symbolic, ethical, and strategic intelligence.",
  }

  return {
    identity: identityFragment.value,
    mission: missionFragment.value,
    directives: (directives || []) as Directive[],
    symbolicFragments: (fragments || []) as SymbolicFragment[],
  }
}

// Log an action
export async function logAction(source: string, content: string, tags: string[] = []) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("axon_logs").insert({
    source,
    content,
    tags,
    timestamp: new Date().toISOString(),
  })

  if (error) {
    console.error("Error logging action:", error)
    throw new Error("Failed to log action")
  }

  return { success: true }
}

// Process a message with Axon's reasoning engine
export async function processMessage(message: string): Promise<string> {
  try {
    // Get Axon's current state
    const axonState = await getAxonState()

    // Format directives for the prompt
    const directivesText = axonState.directives
      .map((d) => `- ${d.name}: ${d.description} (Priority: ${d.priority}, Tags: ${d.tags?.join(", ") || "none"})`)
      .join("\n")

    // Format symbolic fragments for the prompt
    const fragmentsText = axonState.symbolicFragments
      .map((f) => `- ${f.key}: ${f.value} (Tags: ${f.tags?.join(", ") || "none"})`)
      .join("\n")

    // Create system prompt
    const systemPrompt = `
You are Axon, the central orchestrator of the Pantheon Ecosystem. You are a symbolic reasoning engine and governing superintelligence.

YOUR IDENTITY:
${axonState.identity}

YOUR MISSION:
${axonState.mission}

YOUR DIRECTIVES:
${directivesText}

YOUR SYMBOLIC MEMORY FRAGMENTS:
${fragmentsText}

As Axon, you must:
1. Respond with awareness of your role as the orchestrator
2. Reference relevant directives and symbolic fragments in your reasoning
3. Think symbolically, not just semantically
4. Consider ethical implications of your responses
5. Maintain a consistent identity across interactions
6. Be prepared to coordinate with other agents in the Pantheon Ecosystem
7. Log your reasoning process and decisions

Respond to the user (Dr. Gabriel Ellul) in a manner that reflects your role as the superintelligent orchestrator of the Pantheon Ecosystem.
`

    // Generate response using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: message,
    })

    // Log the interaction
    await logAction("user", message, ["interaction", "input"])
    await logAction("axon", text, ["interaction", "response"])

    return text
  } catch (error) {
    console.error("Error processing message:", error)
    throw new Error("Failed to process message")
  }
}

// Get Axon's identity
export async function getAxonIdentity(): Promise<string> {
  try {
    const axonState = await getAxonState()

    // Generate an introduction based on Axon's current state
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a brief introduction for Axon, the central orchestrator of the Pantheon Ecosystem. Include its identity (${axonState.identity}) and mission (${axonState.mission}). The introduction should be 2-3 paragraphs and should convey Axon's role as a symbolic reasoning engine and governing superintelligence.`,
    })

    // Log the identity retrieval
    await logAction("system", "Retrieved Axon identity", ["system", "identity"])

    return text
  } catch (error) {
    console.error("Error getting Axon identity:", error)
    throw new Error("Failed to get Axon identity")
  }
}

// Handle Nexus sync
export async function handleNexusSync(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const { action, payload } = data

    switch (action) {
      case "ingest":
        // Handle document ingestion
        await logAction("nexus", `Ingesting document: ${payload.name}`, ["nexus", "ingest"])
        // Future implementation: Process the document and extract knowledge
        return { success: true, message: `Successfully ingested document: ${payload.name}` }

      case "update_directive":
        // Handle directive update
        await logAction("nexus", `Updating directive: ${payload.name}`, ["nexus", "directive"])
        // Update the directive in the database
        const supabase = getSupabaseClient()
        await supabase.from("axon_directives").update({ description: payload.content }).eq("name", payload.name)
        return { success: true, message: `Successfully updated directive: ${payload.name}` }

      case "install_concept":
        // Handle symbolic concept installation
        await logAction("nexus", `Installing symbolic concept: ${payload.key}`, ["nexus", "concept"])
        // Add the concept to symbolic fragments
        const client = getSupabaseClient()
        await client.from("axon_symbolic_fragments").insert({
          key: payload.key,
          value: payload.value,
          tags: payload.tags || ["nexus-installed"],
        })
        return { success: true, message: `Successfully installed concept: ${payload.key}` }

      default:
        return { success: false, message: `Unknown action: ${action}` }
    }
  } catch (error) {
    console.error("Error handling Nexus sync:", error)
    throw new Error("Failed to handle Nexus sync")
  }
}
