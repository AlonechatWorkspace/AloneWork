
"""
MCP Marketplace database models.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class MCPServerModel(Base):
    """SQLAlchemy model for MCP servers."""
    __tablename__ = "mcp_servers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=False, default="1.0.0")
    
    # Server configuration
    command = Column(String(500), nullable=False)
    args = Column(JSON, nullable=True)
    env = Column(JSON, nullable=True)
    cwd = Column(String(500), nullable=True)
    timeout = Column(Integer, nullable=False, default=30)
    
    # Status
    status = Column(String(20), nullable=False, default="inactive")
    error_message = Column(Text, nullable=True)
    tools = Column(JSON, nullable=True)
    
    last_connected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")

    __table_args__ = (
        Index("ix_mcp_servers_user_status", "user_id", "status"),
    )

