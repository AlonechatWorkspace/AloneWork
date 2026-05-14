"""
DeepSeek V4 Model Configuration
DeepSeek V4专属模型配置，支持Flash和Pro型号
"""
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class DeepSeekModel(str, Enum):
    """DeepSeek V4模型枚举"""
    V4_FLASH = "deepseek-chat"  # V4 Flash - 快速响应
    V4_PRO = "deepseek-pro"   # V4 Pro - 高质量推理
    V4_REASONER = "deepseek-reasoner"  # V4 Reasoner - 推理增强


class DeepSeekConfig(BaseModel):
    """DeepSeek V4配置"""
    model: DeepSeekModel = Field(
        default=DeepSeekModel.V4_FLASH,
        description="DeepSeek V4模型型号"
    )
    api_key: Optional[str] = Field(
        default=None,
        description="DeepSeek API密钥"
    )
    api_base: str = Field(
        default="https://api.deepseek.com/v1",
        description="DeepSeek API基础URL"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="温度参数"
    )
    max_tokens: Optional[int] = Field(
        default=8192,
        ge=1,
        description="最大输出token数"
    )
    top_p: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Top-p采样"
    )
    timeout: int = Field(
        default=120,
        ge=1,
        description="请求超时时间(秒)"
    )
    max_retries: int = Field(
        default=3,
        ge=0,
        description="最大重试次数"
    )
    retry_delay: float = Field(
        default=1.0,
        ge=0.1,
        description="重试延迟(秒)"
    )
    streaming: bool = Field(
        default=True,
        description="是否启用流式输出"
    )


# DeepSeek V4模型定价
DEEPSEEK_PRICING: Dict[DeepSeekModel, Dict[str, float]] = {
    DeepSeekModel.V4_FLASH: {
        "prompt": 0.0002,      # $0.2/1M tokens
        "completion": 0.0008,  # $0.8/1M tokens
    },
    DeepSeekModel.V4_PRO: {
        "prompt": 0.001,       # $1/1M tokens
        "completion": 0.004,    # $4/1M tokens
    },
    DeepSeekModel.V4_REASONER: {
        "prompt": 0.002,       # $2/1M tokens
        "completion": 0.008,    # $8/1M tokens
    },
}


# 上下文窗口大小 - 已升级到100万
DEEPSEEK_CONTEXT_WINDOWS: Dict[DeepSeekModel, int] = {
    DeepSeekModel.V4_FLASH: 1000000,  # 100万上下文
    DeepSeekModel.V4_PRO: 1000000,    # 100万上下文
    DeepSeekModel.V4_REASONER: 1000000,  # 100万上下文
}
