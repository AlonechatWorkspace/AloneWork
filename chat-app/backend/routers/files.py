import os
import uuid
import mimetypes
import magic
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import FileRecord
from ..auth import get_current_user
from ..config import get_settings

router = APIRouter(prefix="/api/files", tags=["files"])

# 允许的文件扩展名白名单
ALLOWED_EXTENSIONS = {
    # 文档
    ".txt", ".md", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    # 图片
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg",
    # 音频
    ".mp3", ".wav", ".ogg", ".m4a", ".flac",
    # 视频
    ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv",
    # 代码
    ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".xml", ".yaml", ".yml",
    # 压缩包
    ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
}

# 允许的文件 MIME 类型白名单
ALLOWED_MIME_TYPES = {
    "text/plain", "text/markdown", "text/html", "text/css", "text/xml",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/svg+xml",
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac",
    "video/mp4", "video/x-msvideo", "video/quicktime", "video/x-ms-wmv", "video/x-flv", "video/x-matroska",
    "application/json", "application/xml", "application/yaml",
    "application/zip", "application/x-tar", "application/gzip", "application/x-bzip2", "application/x-7z-compressed",
    "application/x-python-code", "text/x-python",
    "application/javascript", "text/javascript", "application/typescript",
}

# 最大文件大小 (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# 上传目录
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _get_safe_filename(original_filename: str) -> str:
    """生成安全的文件名，去除路径遍历风险"""
    # 获取基本文件名（去除路径）
    basename = os.path.basename(original_filename)
    # 去除空字符和控制字符
    basename = "".join(c for c in basename if c.isprintable() and c not in "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f")
    # 如果文件名为空，使用随机 UUID
    if not basename or basename == "." or basename == "..":
        basename = str(uuid.uuid4())
    return basename


def _get_safe_path(filename: str) -> Path:
    """生成安全的文件路径，防止路径遍历"""
    safe_name = _get_safe_filename(filename)
    # 使用 UUID 作为目录名，防止文件名冲突和遍历
    file_id = str(uuid.uuid4())
    target_dir = UPLOAD_DIR / file_id[:2] / file_id[2:4]
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir / safe_name


def _validate_extension(filename: str) -> bool:
    """验证文件扩展名是否在白名单中"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def _validate_mime_type(content: bytes, declared_type: str) -> bool:
    """验证文件 MIME 类型"""
    try:
        detected = magic.from_buffer(content, mime=True)
        # 检测到的类型必须在白名单中
        if detected not in ALLOWED_MIME_TYPES:
            return False
        # 声明的类型应该在白名单中（如果提供了）
        if declared_type and declared_type not in ALLOWED_MIME_TYPES:
            return False
        return True
    except Exception:
        return False


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 读取文件内容
    content = await file.read()

    # 检查文件大小
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB."
        )

    # 验证文件扩展名
    if not _validate_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 验证 MIME 类型
    if not _validate_mime_type(content, file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match allowed types."
        )

    # 生成安全的文件路径
    file_path = _get_safe_path(file.filename)

    # 保存文件
    with open(file_path, "wb") as f:
        f.write(content)

    # 创建文件记录
    file_record = FileRecord(
        id=str(uuid.uuid4()),
        filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        uploaded_by=current_user.id,
    )
    db.add(file_record)
    await db.commit()
    await db.refresh(file_record)

    return {
        "id": file_record.id,
        "filename": file_record.filename,
        "size": file_record.file_size,
        "mime_type": file_record.mime_type,
        "uploaded_at": file_record.uploaded_at,
    }


@router.get("/")
async def list_files(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(FileRecord).where(FileRecord.uploaded_by == current_user.id)
    )
    files = result.scalars().all()
    return [
        {
            "id": f.id,
            "filename": f.filename,
            "size": f.file_size,
            "mime_type": f.mime_type,
            "uploaded_at": f.uploaded_at,
        }
        for f in files
    ]


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(FileRecord).where(
            FileRecord.id == file_id,
            FileRecord.uploaded_by == current_user.id
        )
    )
    file_record = result.scalar_one_or_none()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "id": file_record.id,
        "filename": file_record.filename,
        "size": file_record.file_size,
        "mime_type": file_record.mime_type,
        "uploaded_at": file_record.uploaded_at,
    }


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(FileRecord).where(
            FileRecord.id == file_id,
            FileRecord.uploaded_by == current_user.id
        )
    )
    file_record = result.scalar_one_or_none()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # 删除物理文件
    try:
        os.remove(file_record.file_path)
    except OSError:
        pass  # 文件可能已被删除

    await db.delete(file_record)
    await db.commit()

    return {"message": "File deleted successfully"}
