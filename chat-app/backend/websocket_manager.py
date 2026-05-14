import json
import asyncio
from typing import Dict, List, Optional
from fastapi import WebSocket
import aioredis

from .agent_service import AgentService
from .multi_agent_service import run_multi_agent_team


class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_groups: Dict[str, List[str]] = {}
        self.redis: Optional[aioredis.Redis] = None
        self.agent_service = AgentService()

    async def connect_redis(self):
        try:
            self.redis = await aioredis.from_url("redis://localhost:6379/0")
        except Exception:
            self.redis = None

    async def disconnect_redis(self):
        if self.redis:
            await self.redis.close()

    async def connect(self, websocket: WebSocket, user_id: str):
        """连接 WebSocket - 需要已经通过 JWT 验证的 user_id"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        if user_id not in self.user_groups:
            self.user_groups[user_id] = []

        # 广播用户上线状态
        await self.broadcast_user_status(user_id, True)

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_groups:
            del self.user_groups[user_id]

        # 广播用户离线状态
        await self.broadcast_user_status(user_id, False)

    async def send_message(self, message: dict, recipient_id: str):
        if recipient_id in self.active_connections:
            await self.active_connections[recipient_id].send_json(message)

    async def broadcast_to_group(self, message: dict, group_id: str):
        for user_id, groups in self.user_groups.items():
            if group_id in groups and user_id in self.active_connections:
                await self.active_connections[user_id].send_json(message)

    async def broadcast_user_status(self, user_id: str, is_online: bool):
        status_message = {
            "type": "user_status",
            "payload": {
                "user_id": user_id,
                "is_online": is_online
            }
        }
        for uid, connection in self.active_connections.items():
            if uid != user_id:
                await connection.send_json(status_message)

    def join_group(self, user_id: str, group_id: str):
        if user_id in self.user_groups:
            if group_id not in self.user_groups[user_id]:
                self.user_groups[user_id].append(group_id)

    def leave_group(self, user_id: str, group_id: str):
        if user_id in self.user_groups:
            if group_id in self.user_groups[user_id]:
                self.user_groups[user_id].remove(group_id)

    async def handle_agent_message(self, user_id: str, content: str, session_id: str):
        try:
            response = await self.agent_service.process_message(content, session_id)
            await self.send_message({
                "type": "agent_response",
                "payload": {
                    "session_id": session_id,
                    "content": response
                }
            }, user_id)
        except Exception as e:
            await self.send_message({
                "type": "agent_error",
                "payload": {
                    "session_id": session_id,
                    "error": str(e)
                }
            }, user_id)

    async def handle_agent_stream(self, user_id: str, content: str, session_id: str):
        try:
            async for chunk in self.agent_service.process_message_stream(content, session_id):
                await self.send_message({
                    "type": "agent_stream",
                    "payload": {
                        "session_id": session_id,
                        "chunk": chunk
                    }
                }, user_id)
        except Exception as e:
            await self.send_message({
                "type": "agent_error",
                "payload": {
                    "session_id": session_id,
                    "error": str(e)
                }
            }, user_id)

    async def handle_multi_agent(self, user_id: str, content: str, session_id: str):
        try:
            await run_multi_agent_team(user_id, session_id, content, self)
        except Exception as e:
            await self.send_message({
                "type": "agent_error",
                "payload": {
                    "session_id": session_id,
                    "error": str(e)
                }
            }, user_id)


manager = WebSocketManager()
