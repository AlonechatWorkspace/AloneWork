
"""
MCP Marketplace Pydantic schemas.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class MCPServerConfigBase(BaseModel):
    command: str = Field(..., description="Command to start the server")
    args: Optional[List[str]] = Field(default_factory=list, description="Command arguments")
    env: Optional[Dict[str, str]] = Field(default_factory=dict, description="Environment variables")
    cwd: Optional[str] = Field(None, description="Working directory")
    timeout: Optional[int] = Field(30, description="Request timeout in seconds")


class MCPServerBase(BaseModel):
    name: str = Field(..., description="Server name")
    description: Optional[str] = Field(None, description="Server description")
    version: Optional[str] = Field("1.0.0", description="Server version")


class MCPServerCreate(MCPServerBase, MCPServerConfigBase):
    pass


class MCPServerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    command: Optional[str] = None
    args: Optional[List[str]] = None
    env: Optional[Dict[str, str]] = None
    cwd: Optional[str] = None
    timeout: Optional[int] = None


class MCPToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[Any]] = None


class MCPTool(BaseModel):
    name: str
    description: str
    parameters: Dict[str, MCPToolParameter] = Field(default_factory=dict)


class MCPServerResponse(MCPServerBase):
    id: str
    user_id: str
    status: str
    error_message: Optional[str] = None
    tools: Optional[List[MCPTool]] = None
    last_connected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MCPServerListResponse(BaseModel):
    items: List[MCPServerResponse]
    total: int
    page: int
    page_size: int
    pages: int


class MCPServerActionRequest(BaseModel):
    action: str = Field(..., description="Action to perform: start, stop, restart")


class MCPToolCallRequest(BaseModel):
    tool_name: str = Field(..., description="Name of the tool to call")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Tool arguments")


class MCPToolCallResponse(BaseModel):
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None

