"""
License Manager
许可证管理 - 企业级授权控制
"""
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import hashlib


@dataclass
class LicenseInfo:
    """许可证信息"""
    license_key: str
    customer_id: str
    plan_name: str
    max_concurrent_requests: int
    max_tokens_per_month: int
    expires_at: datetime
    features: list
    created_at: datetime


class LicenseManager:
    """
    许可证管理器
    用于控制API访问权限和配额
    """

    def __init__(self, license_key: Optional[str] = None):
        self.license_key = license_key
        self._licenses: Dict[str, LicenseInfo] = {}
        self._usage: Dict[str, Dict[str, Any]] = {}

    def add_license(self, license_info: LicenseInfo):
        """添加许可证"""
        self._licenses[license_info.license_key] = license_info

    def validate_license(self, license_key: str) -> tuple[bool, Optional[str]]:
        """验证许可证有效性"""
        if license_key not in self._licenses:
            return False, "Invalid license key"

        info = self._licenses[license_key]
        if datetime.now() > info.expires_at:
            return False, "License expired"

        return True, None

    def check_quota(self, license_key: str, tokens_used: int) -> tuple[bool, Optional[str]]:
        """检查配额是否超出"""
        valid, msg = self.validate_license(license_key)
        if not valid:
            return False, msg

        if license_key not in self._usage:
            self._usage[license_key] = {
                "tokens_used": 0,
                "concurrent_requests": 0,
                "reset_date": datetime.now() + timedelta(days=30),
            }

        usage = self._usage[license_key]
        info = self._licenses[license_key]

        if usage["tokens_used"] + tokens_used > info.max_tokens_per_month:
            return False, "Token quota exceeded"

        return True, None

    def record_usage(self, license_key: str, tokens_used: int):
        """记录使用情况"""
        if license_key in self._usage:
            self._usage[license_key]["tokens_used"] += tokens_used

    def get_license_info(self, license_key: str) -> Optional[LicenseInfo]:
        """获取许可证信息"""
        return self._licenses.get(license_key)

    def get_usage_info(self, license_key: str) -> Optional[Dict[str, Any]]:
        """获取使用信息"""
        return self._usage.get(license_key)
