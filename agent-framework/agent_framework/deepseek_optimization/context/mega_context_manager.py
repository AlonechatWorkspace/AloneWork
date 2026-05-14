"""
Mega Context Manager
100万上下文智能管理器 - 协调活跃窗口与本地存储
"""
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from .message_ranker import (
    MessageRanker, MessageImportance, ImportanceCategory
)
from .storage_engine import StructuredStorageEngine, StoredMessage


@dataclass
class ContextDecision:
    """上下文处理决策"""
    keep_in_context: bool
    reason: str
    suggested_action: str  # "keep", "compress", "archive"


@dataclass
class ManagedMessage:
    """受管理的消息"""
    message: Dict[str, Any]
    importance: MessageImportance
    decision: ContextDecision
    stored: Optional[StoredMessage] = None


@dataclass
class ContextStats:
    """上下文统计"""
    total_messages: int = 0
    in_context_count: int = 0
    archived_count: int = 0
    estimated_tokens_used: int = 0
    estimated_tokens_saved: int = 0
    last_updated: datetime = field(default_factory=datetime.now)


class MegaContextManager:
    """
    100万上下文管理器
    智能协调活跃上下文窗口与本地存储
    """
    
    def __init__(
        self,
        storage_root: Optional[Path] = None,
        max_context_tokens: int = 1000000,
        target_active_tokens: int = 800000
    ):
        if storage_root is None:
            storage_root = Path("./data/context_archive")
        
        self.max_context_tokens = max_context_tokens
        self.target_active_tokens = target_active_tokens
        
        # 组件初始化
        self.ranker = MessageRanker()
        self.storage = StructuredStorageEngine(storage_root)
        
        # 状态管理
        self._all_messages: List[ManagedMessage] = []
        self._stats = ContextStats()
    
    def add_message(
        self,
        message: Dict[str, Any]
    ) -> ManagedMessage:
        """
        添加并处理新消息
        
        Args:
            message: 原始消息
            
        Returns:
            ManagedMessage: 处理结果
        """
        # 评估重要性
        message_index = len(self._all_messages)
        importance = self.ranker.rank_message(
            message,
            message_index,
            max(len(self._all_messages), 1)
        )
        
        # 做出决策
        decision = self._make_decision(importance, message)
        
        # 创建管理对象
        managed = ManagedMessage(
            message=message,
            importance=importance,
            decision=decision
        )
        
        # 执行决策
        self._execute_decision(managed)
        
        # 添加到列表
        self._all_messages.append(managed)
        
        # 更新统计
        self._update_stats()
        
        return managed
    
    def _make_decision(
        self,
        importance: MessageImportance,
        message: Dict[str, Any]
    ) -> ContextDecision:
        """
        决定消息的处理方式
        """
        if importance.category in [
            ImportanceCategory.CRITICAL,
            ImportanceCategory.IMPORTANT
        ]:
            return ContextDecision(
                keep_in_context=True,
                reason=f"重要性高 ({importance.score:.2f}): {importance.reasoning}",
                suggested_action="keep"
            )
        elif importance.category == ImportanceCategory.NORMAL:
            return ContextDecision(
                keep_in_context=True,
                reason=f"普通重要性 ({importance.score:.2f})",
                suggested_action="compress"
            )
        else:
            return ContextDecision(
                keep_in_context=False,
                reason=f"重要性较低 ({importance.score:.2f})，建议归档保存",
                suggested_action="archive"
            )
    
    def _execute_decision(self, managed: ManagedMessage):
        """执行决策"""
        if managed.decision.suggested_action == "archive":
            # 归档到本地存储
            stored = self.storage.archive_message(
                managed.message,
                managed.importance
            )
            managed.stored = stored
            managed.keep_in_context = False
        else:
            managed.keep_in_context = True
    
    def get_active_context(
        self,
        current_usage_tokens: int = 0
    ) -> Tuple[List[Dict[str, Any]], List[ManagedMessage]]:
        """
        获取当前活跃上下文
        
        Args:
            current_usage_tokens: 当前已使用的token数
            
        Returns:
            (消息列表, 管理信息列表)
        """
        # 检查是否需要调整
        available = self.max_context_tokens - current_usage_tokens
        
        active_messages = []
        active_managed = []
        used_tokens = 0
        
        # 按重要性排序并选择
        sorted_messages = sorted(
            self._all_messages,
            key=lambda m: m.importance.score,
            reverse=True
        )
        
        for managed in sorted_messages:
            # 估算token（简化）
            content_len = len(managed.message.get("content", ""))
            estimated_tokens = max(10, content_len // 4)
            
            if used_tokens + estimated_tokens <= available:
                active_messages.append(managed.message)
                active_managed.append(managed)
                used_tokens += estimated_tokens
            else:
                # 如果空间不够，检查是否归档了
                if not managed.stored and not managed.keep_in_context:
                    stored = self.storage.archive_message(
                        managed.message,
                        managed.importance
                    )
                    managed.stored = stored
        
        return active_messages, active_managed
    
    def optimize_context(self) -> Dict[str, Any]:
        """优化上下文分布"""
        optimization_result = {
            "before": {
                "total": len(self._all_messages),
                "active": sum(1 for m in self._all_messages if getattr(m, "keep_in_context", True)),
                "archived": sum(1 for m in self._all_messages if m.stored)
            },
            "after": {}
        }
        
        # 检查并归档低重要性消息
        for managed in self._all_messages:
            if managed.importance.category in [
                ImportanceCategory.LOW,
                ImportanceCategory.TRIVIAL
            ] and not managed.stored:
                stored = self.storage.archive_message(
                    managed.message,
                    managed.importance
                )
                managed.stored = stored
                managed.keep_in_context = False
        
        optimization_result["after"] = {
            "total": len(self._all_messages),
            "active": sum(1 for m in self._all_messages if getattr(m, "keep_in_context", True)),
            "archived": sum(1 for m in self._all_messages if m.stored)
        }
        
        return optimization_result
    
    def _update_stats(self):
        """更新统计信息"""
        self._stats.total_messages = len(self._all_messages)
        self._stats.in_context_count = sum(
            1 for m in self._all_messages
            if getattr(m, "keep_in_context", True)
        )
        self._stats.archived_count = sum(
            1 for m in self._all_messages if m.stored
        )
        self._stats.last_updated = datetime.now()
        
        # 估算token（简化）
        total_content = sum(
            len(m.message.get("content", ""))
            for m in self._all_messages
        )
        self._stats.estimated_tokens_used = total_content // 4
        
        archived_content = sum(
            len(m.message.get("content", ""))
            for m in self._all_messages if m.stored
        )
        self._stats.estimated_tokens_saved = archived_content // 4
    
    def get_stats(self) -> ContextStats:
        """获取统计"""
        return self._stats
    
    def get_storage_stats(self):
        """获取存储统计"""
        return self.storage.get_stats()
    
    def get_archived_files(self):
        """获取归档文件列表"""
        return self.storage.get_file_list()
    
    def search_archive(self, keyword: str, limit: int = 50) -> List[StoredMessage]:
        """搜索归档内容"""
        return self.storage.search_messages(keyword, limit)
