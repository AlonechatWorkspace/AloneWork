"""
Audit Logger
审计日志 - 合规性记录
"""
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass
from pathlib import Path


@dataclass
class AuditLogEntry:
    """审计日志条目"""
    timestamp: datetime
    event_type: str
    user_id: Optional[str]
    action: str
    resource: str
    success: bool
    metadata: Dict[str, Any]
    duration_ms: Optional[float] = None


class AuditLogger:
    """
    审计日志记录器
    用于记录系统操作，满足合规性要求
    """

    def __init__(self, log_dir: Optional[str] = None):
        self.log_dir = Path(log_dir) if log_dir else Path("./logs/audit")
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self._logs: List[AuditLogEntry] = []

    def log_access(
        self,
        user_id: Optional[str],
        action: str,
        resource: str,
        success: bool,
        metadata: Optional[Dict[str, Any]] = None,
        duration_ms: Optional[float] = None,
    ):
        """记录访问事件"""
        entry = AuditLogEntry(
            timestamp=datetime.now(),
            event_type="ACCESS",
            user_id=user_id,
            action=action,
            resource=resource,
            success=success,
            metadata=metadata or {},
            duration_ms=duration_ms,
        )
        self._logs.append(entry)
        self._write_log(entry)

    def log_modification(
        self,
        user_id: Optional[str],
        action: str,
        resource: str,
        success: bool,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """记录修改事件"""
        entry = AuditLogEntry(
            timestamp=datetime.now(),
            event_type="MODIFICATION",
            user_id=user_id,
            action=action,
            resource=resource,
            success=success,
            metadata=metadata or {},
        )
        self._logs.append(entry)
        self._write_log(entry)

    def log_error(
        self,
        user_id: Optional[str],
        error_type: str,
        error_message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """记录错误事件"""
        entry = AuditLogEntry(
            timestamp=datetime.now(),
            event_type="ERROR",
            user_id=user_id,
            action=error_type,
            resource="SYSTEM",
            success=False,
            metadata={
                "error_message": error_message,
                **(metadata or {}),
            },
        )
        self._logs.append(entry)
        self._write_log(entry)

    def _write_log(self, entry: AuditLogEntry):
        """写入日志文件"""
        log_file = self.log_dir / f"audit_{entry.timestamp.strftime('%Y%m%d')}.jsonl"
        
        log_data = {
            "timestamp": entry.timestamp.isoformat(),
            "event_type": entry.event_type,
            "user_id": entry.user_id,
            "action": entry.action,
            "resource": entry.resource,
            "success": entry.success,
            "duration_ms": entry.duration_ms,
            "metadata": entry.metadata,
        }
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_data, ensure_ascii=False) + "\n")

    def get_logs(
        self,
        event_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[AuditLogEntry]:
        """获取审计日志"""
        filtered = self._logs
        
        if event_type:
            filtered = [e for e in filtered if e.event_type == event_type]
        if start_date:
            filtered = [e for e in filtered if e.timestamp >= start_date]
        if end_date:
            filtered = [e for e in filtered if e.timestamp <= end_date]
            
        return filtered[-limit:]
