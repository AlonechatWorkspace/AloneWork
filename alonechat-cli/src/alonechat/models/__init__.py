"""
模型路由模块

负责：
- 多模型支持
- API调用
- 本地模型支持
- 流式输出
"""

import httpx
from typing import Any, Generator
from abc import ABC, abstractmethod

from alonechat.config import ConfigManager


class BaseModelProvider(ABC):
    """模型提供商基类"""
    
    @abstractmethod
    def chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> str | Generator[str, None, None]:
        """聊天接口"""
        pass


class DeepSeekProvider(BaseModelProvider):
    """DeepSeek提供商"""
    
    def __init__(self, config: dict[str, Any]):
        self.api_key = config.get("api_key", "")
        self.base_url = config.get("base_url", "https://api.deepseek.com/v1")
        self.model = config.get("model", "deepseek-chat")
    
    def chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> str | Generator[str, None, None]:
        """DeepSeek聊天接口"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            **kwargs
        }
        
        with httpx.Client(base_url=self.base_url, headers=headers) as client:
            if stream:
                return self._stream_chat(client, data)
            else:
                response = client.post("/chat/completions", json=data)
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
    
    def _stream_chat(
        self,
        client: httpx.Client,
        data: dict[str, Any]
    ) -> Generator[str, None, None]:
        """流式聊天"""
        with client.stream("POST", "/chat/completions", json=data) as response:
            for line in response.iter_lines():
                if line.startswith("data: "):
                    if line == "data: [DONE]":
                        break
                    import json
                    chunk = json.loads(line[6:])
                    if content := chunk["choices"][0]["delta"].get("content"):
                        yield content


class OllamaProvider(BaseModelProvider):
    """Ollama本地模型提供商"""
    
    def __init__(self, config: dict[str, Any]):
        self.base_url = config.get("base_url", "http://localhost:11434")
        self.model = config.get("model", "deepseek-coder:6.7b")
    
    def chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> str | Generator[str, None, None]:
        """Ollama聊天接口"""
        data = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
        }
        
        with httpx.Client(base_url=self.base_url) as client:
            if stream:
                return self._stream_chat(client, data)
            else:
                response = client.post("/api/chat", json=data)
                response.raise_for_status()
                return response.json()["message"]["content"]
    
    def _stream_chat(
        self,
        client: httpx.Client,
        data: dict[str, Any]
    ) -> Generator[str, None, None]:
        """流式聊天"""
        with client.stream("POST", "/api/chat", json=data) as response:
            for line in response.iter_lines():
                import json
                chunk = json.loads(line)
                if content := chunk.get("message", {}).get("content"):
                    yield content


class ModelRouter:
    """模型路由器"""
    
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.providers = self._init_providers()
    
    def _init_providers(self) -> dict[str, BaseModelProvider]:
        """初始化提供商"""
        providers = {}
        provider_configs = self.config.get("model", {}).get("providers", {})
        
        for name, provider_config in provider_configs.items():
            if name == "deepseek":
                providers[name] = DeepSeekProvider(provider_config)
            elif name == "ollama":
                providers[name] = OllamaProvider(provider_config)
        
        return providers
    
    def chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> str | Generator[str, None, None]:
        """
        聊天接口
        
        Args:
            model: 模型名称
            messages: 消息列表
            stream: 是否流式输出
            
        Returns:
            响应内容
        """
        if model not in self.providers:
            raise ValueError(f"不支持的模型: {model}")
        
        return self.providers[model].chat(messages, stream, **kwargs)
