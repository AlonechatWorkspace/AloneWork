export type AgentMode = 'MTC' | 'CODE'

export type InteractionMode = 'plan' | 'agent' | 'yolo'

export interface SessionMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    tool_name?: string
    tool_args?: Record<string, unknown>
    tool_result?: unknown
    duration_ms?: number
    step?: number
    thinking_steps?: string[]
  }
}

export interface Session {
  id: string
  display_name?: string
  title?: string
  mode: AgentMode
  interaction_mode: InteractionMode
  status: 'idle' | 'thinking' | 'acting' | 'completed' | 'error'
  messages: SessionMessage[]
  message_count: number
  last_message?: string
  created_at: string
  updated_at: string
  summary?: string
  parent_id?: string
  branch_point?: number
  metadata?: Record<string, unknown>
  agent_config?: Record<string, unknown>
}

export interface SessionStats {
  total_sessions: number
  total_messages: number
  archived: number
  db_path?: string
}

export interface SessionSearchResult {
  sessions: Session[]
  total: number
  query: string
}
