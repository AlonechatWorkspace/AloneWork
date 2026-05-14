"""
Context Compressor
智能上下文压缩
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import re


@dataclass
class CompressionResult:
    """压缩结果"""
    original_messages: List[Dict]
    compressed_messages: List[Dict]
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    kept_ratio: float
    summary: str = ""


class ContextCompressor:
    """
    上下文压缩器
    保持关键信息，压缩上下文大小
    """

    def __init__(
        self,
        min_compression_ratio: float = 0.5,
        preserve_last_n: int = 5,
    ):
        self.min_compression_ratio = min_compression_ratio
        self.preserve_last_n = preserve_last_n

    def compress(
        self,
        messages: List[Dict],
        target_tokens: int,
        current_tokens: int
    ) -> CompressionResult:
        """压缩上下文"""
        if current_tokens <= target_tokens:
            return CompressionResult(
                original_messages=messages,
                compressed_messages=list(messages),
                original_tokens=current_tokens,
                compressed_tokens=current_tokens,
                compression_ratio=1.0,
                kept_ratio=1.0,
            )

        # 保留最后N条消息
        preserved = messages[-self.preserve_last_n:] if messages else []

        # 压缩早期的消息
        early_messages = messages[:-self.preserve_last_n] if len(messages) > self.preserve_last_n else []
        compressed_early = self._summarize_messages(early_messages)

        final_messages = compressed_early + preserved

        # 估算压缩后的token数（简化估算）
        compressed_tokens = int(current_tokens * 0.5)

        return CompressionResult(
            original_messages=messages,
            compressed_messages=final_messages,
            original_tokens=current_tokens,
            compressed_tokens=compressed_tokens,
            compression_ratio=compressed_tokens / current_tokens,
            kept_ratio=len(final_messages) / max(len(messages), 1),
            summary=f"Compressed {len(early_messages)} early messages",
        )

    def _summarize_messages(self, messages: List[Dict]) -> List[Dict]:
        """消息摘要"""
        if not messages:
            return []

        # 简单摘要：合并为一个摘要消息
        content = "[Previous conversation summarized]"
        return [
            {
                "role": "system",
                "content": content
            }
        ]
