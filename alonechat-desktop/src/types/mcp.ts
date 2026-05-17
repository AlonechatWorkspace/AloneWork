export interface MCPServer {
  id: string
  name: string
  command: string
  args: string[]
  env?: Record<string, string>
  transport_type: 'stdio' | 'sse'
  url?: string
  status: 'stopped' | 'running' | 'error'
  tools: MCPTool[]
  resources: MCPResource[]
  created_at: string
  updated_at: string
}

export interface MCPTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
  server_id: string
  server_name: string
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mime_type?: string
  server_id: string
}

export interface CallToolRequest {
  server_id?: string
  tool_name: string
  arguments: Record<string, unknown>
}

export interface CallToolResponse {
  success: boolean
  result?: unknown
  error?: string
  duration_ms?: number
}

export interface CreateServerRequest {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  transport_type?: 'stdio' | 'sse'
  url?: string
}
