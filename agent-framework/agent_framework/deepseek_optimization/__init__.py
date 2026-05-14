"""
DeepSeek V4 Optimization System
面向D端和B端的重量级商业化闭源系统
核心理念：All in DeepSeek V4，通过软件优化弥补硬件差距，超越Claude Mythos
"""
from .llm import DeepSeekProvider, DeepSeekConfig, DeepSeekModel
from .cache import (
    CacheEngine,
    SemanticCache,
    VectorCache,
    CacheStats,
    DeepSeekCacheManager,
)
from .context import ContextCompressor, WindowManager
from .swe import SWEEngine
from .security import (
    LicenseManager,
    AuditLogger,
    EncryptionManager,
    DataProtectionManager,
)

__version__ = "2.0.0"
__author__ = "DeepSeek Optimization Team"

__all__ = [
    # LLM
    "DeepSeekProvider",
    "DeepSeekConfig",
    "DeepSeekModel",
    # Cache
    "CacheEngine",
    "SemanticCache",
    "VectorCache",
    "CacheStats",
    "DeepSeekCacheManager",
    # Context
    "ContextCompressor",
    "WindowManager",
    # SWE
    "SWEEngine",
    # Security
    "LicenseManager",
    "AuditLogger",
    "EncryptionManager",
    "DataProtectionManager",
]
