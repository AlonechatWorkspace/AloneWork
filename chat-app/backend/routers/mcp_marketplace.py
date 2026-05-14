
"""
MCP Marketplace API routes.
"""

import sys
from pathlib import Path

# Add agent-framework to Python path
agent_framework_path = Path(__file__).parent.parent.parent / "agent-framework"
sys.path.insert(0, str(agent_framework_path))

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from datetime import datetime

from database import get_db
from auth import get_current_user
from models import User
from models.mcp_marketplace import MCPServerModel
from schemas.mcp_marketplace import (
    MCPServerCreate,
    MCPServerUpdate,
    MCPServerResponse,
    MCPServerListResponse,
    MCPServerActionRequest,
    MCPToolCallRequest,
    MCPToolCallResponse,
    MCPTool,
)

# Import from agent-framework
from agent_framework.deepseek_optimization.mcp_marketplace import (
    MCPServerConfig,
    MCPServerRegistry,
    MCPServerLoader,
    ServerStatus,
)

router = APIRouter(prefix="/api/v1/mcp-marketplace", tags=["mcp-marketplace"])

# Global registry and loader (in production, this should be properly initialized)
registry = MCPServerRegistry()
loader = MCPServerLoader(registry)


def model_to_response(model: MCPServerModel) -&gt; MCPServerResponse:
    """Convert database model to response schema."""
    tools_data = model.tools or []
    tools = [MCPTool(**t) for t in tools_data] if tools_data else None

    return MCPServerResponse(
        id=model.id,
        user_id=model.user_id,
        name=model.name,
        description=model.description,
        version=model.version,
        status=model.status,
        error_message=model.error_message,
        tools=tools,
        last_connected_at=model.last_connected_at,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


@router.post("/servers", response_model=MCPServerResponse, status_code=status.HTTP_201_CREATED)
async def create_mcp_server(
    data: MCPServerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new MCP server configuration."""
    server = MCPServerModel(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        version=data.version,
        command=data.command,
        args=data.args,
        env=data.env,
        cwd=data.cwd,
        timeout=data.timeout,
        status="inactive",
    )
    db.add(server)
    await db.commit()
    await db.refresh(server)

    # Also register in memory registry
    config = MCPServerConfig(
        command=data.command,
        args=data.args or [],
        env=data.env or {},
        cwd=data.cwd,
        timeout=data.timeout or 30,
    )
    registry.register_server(
        server_id=server.id,
        name=data.name,
        config=config,
        description=data.description,
        version=data.version,
    )

    return model_to_response(server)


@router.get("/servers", response_model=MCPServerListResponse)
async def list_mcp_servers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all MCP servers for the current user."""
    # Count total
    count_query = select(func.count(MCPServerModel.id)).where(
        MCPServerModel.user_id == current_user.id
    )
    if status:
        count_query = count_query.where(MCPServerModel.status == status)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Query paginated
    query = select(MCPServerModel).where(
        MCPServerModel.user_id == current_user.id
    )
    if status:
        query = query.where(MCPServerModel.status == status)
    query = query.order_by(desc(MCPServerModel.updated_at))
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    servers = result.scalars().all()
    
    items = [model_to_response(s) for s in servers]
    pages = (total + page_size - 1) // page_size if total &gt; 0 else 0
    
    return MCPServerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/servers/{server_id}", response_model=MCPServerResponse)
async def get_mcp_server(
    server_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific MCP server."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    return model_to_response(server)


@router.patch("/servers/{server_id}", response_model=MCPServerResponse)
async def update_mcp_server(
    server_id: str,
    data: MCPServerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an MCP server configuration."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(server, field, value)
    
    await db.commit()
    await db.refresh(server)
    
    # Also update in memory registry
    if registry.get_server(server_id):
        config_kwargs = {}
        if "command" in update_data:
            config_kwargs["command"] = update_data["command"]
        if "args" in update_data:
            config_kwargs["args"] = update_data["args"]
        if "env" in update_data:
            config_kwargs["env"] = update_data["env"]
        if "cwd" in update_data:
            config_kwargs["cwd"] = update_data["cwd"]
        if "timeout" in update_data:
            config_kwargs["timeout"] = update_data["timeout"]
        
        if config_kwargs:
            reg_server = registry.get_server(server_id)
            config = MCPServerConfig(
                command=config_kwargs.get("command", reg_server.config.command),
                args=config_kwargs.get("args", reg_server.config.args),
                env=config_kwargs.get("env", reg_server.config.env),
                cwd=config_kwargs.get("cwd", reg_server.config.cwd),
                timeout=config_kwargs.get("timeout", reg_server.config.timeout),
            )
            registry.update_server(
                server_id,
                name=update_data.get("name"),
                description=update_data.get("description"),
                version=update_data.get("version"),
                config=config,
            )
        else:
            registry.update_server(
                server_id,
                name=update_data.get("name"),
                description=update_data.get("description"),
                version=update_data.get("version"),
            )
    
    return model_to_response(server)


@router.delete("/servers/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mcp_server(
    server_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an MCP server configuration."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Stop server if running
    await loader.stop_server(server_id)
    
    # Delete from database
    await db.delete(server)
    await db.commit()
    
    # Remove from registry
    registry.unregister_server(server_id)
    
    return None


@router.post("/servers/{server_id}/action", response_model=MCPServerResponse)
async def server_action(
    server_id: str,
    data: MCPServerActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Perform an action on an MCP server (start, stop, restart)."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Ensure server is in registry
    if not registry.get_server(server_id):
        config = MCPServerConfig(
            command=server.command,
            args=server.args or [],
            env=server.env or {},
            cwd=server.cwd,
            timeout=server.timeout or 30,
        )
        registry.register_server(
            server_id=server.id,
            name=server.name,
            config=config,
            description=server.description,
            version=server.version,
        )
    
    # Perform action
    if data.action == "start":
        success = await loader.start_server(server_id)
    elif data.action == "stop":
        success = await loader.stop_server(server_id)
    elif data.action == "restart":
        success = await loader.restart_server(server_id)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'start', 'stop', or 'restart'"
        )
    
    # Update database with current state
    reg_server = registry.get_server(server_id)
    if reg_server:
        server.status = reg_server.status.value
        server.error_message = reg_server.error_message
        if reg_server.tools:
            server.tools = [t.model_dump() for t in reg_server.tools]
        if reg_server.status == ServerStatus.ACTIVE:
            server.last_connected_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(server)
    
    return model_to_response(server)


@router.get("/servers/{server_id}/tools", response_model=List[MCPTool])
async def list_server_tools(
    server_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tools available from an MCP server."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    if server.status != "active":
        raise HTTPException(status_code=400, detail="Server is not active")
    
    # Get from registry if available, otherwise from database
    reg_server = registry.get_server(server_id)
    if reg_server and reg_server.tools:
        return reg_server.tools
    
    # Fallback to database
    tools_data = server.tools or []
    return [MCPTool(**t) for t in tools_data]


@router.post("/servers/{server_id}/tools/call", response_model=MCPToolCallResponse)
async def call_tool(
    server_id: str,
    data: MCPToolCallRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Call a tool on an active MCP server."""
    result = await db.execute(
        select(MCPServerModel).where(
            MCPServerModel.id == server_id,
            MCPServerModel.user_id == current_user.id,
        )
    )
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    if server.status != "active":
        raise HTTPException(status_code=400, detail="Server is not active")
    
    try:
        result = await loader.call_tool(
            server_id,
            data.tool_name,
            data.arguments,
        )
        return MCPToolCallResponse(success=True, result=result)
    except Exception as e:
        return MCPToolCallResponse(success=False, error=str(e))

