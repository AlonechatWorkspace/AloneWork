"""
Encryption Manager
加密管理 - 数据保护
"""
import hashlib
from typing import Optional
from dataclasses import dataclass
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os


@dataclass
class EncryptionConfig:
    """加密配置"""
    key: bytes
    algorithm: str = "AES-256-GCM"


class EncryptionManager:
    """
    加密管理器
    负责敏感数据的加密和解密
    """

    def __init__(self, secret_key: Optional[bytes] = None):
        self._fernet: Optional[Fernet] = None
        
        if secret_key:
            self._initialize_with_key(secret_key)

    def _initialize_with_key(self, secret_key: bytes):
        """用密钥初始化"""
        if len(secret_key) != 32:
            # 如果不是32字节，用哈希处理
            digest = hashlib.sha256(secret_key).digest()
        else:
            digest = secret_key
        
        # Fernet需要base64编码的密钥
        key = base64.urlsafe_b64encode(digest)
        self._fernet = Fernet(key)

    def generate_key(self) -> bytes:
        """生成新的密钥"""
        return Fernet.generate_key()

    def encrypt(self, data: str) -> str:
        """加密数据"""
        if not self._fernet:
            raise ValueError("Encryption manager not initialized with a key")
        return self._fernet.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """解密数据"""
        if not self._fernet:
            raise ValueError("Encryption manager not initialized with a key")
        return self._fernet.decrypt(encrypted_data.encode()).decode()

    def hash_data(self, data: str) -> str:
        """计算数据的哈希值（用于完整性校验）"""
        return hashlib.sha256(data.encode()).hexdigest()

    def secure_random(self, length: int = 32) -> bytes:
        """生成安全的随机字节"""
        return os.urandom(length)
