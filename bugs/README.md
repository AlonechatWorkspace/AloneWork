# AloneChat Bug & Vulnerability Tracking System

> **项目**: AloneChat Workspace (AI Agent Framework + Chat App)
> **扫描日期**: 2026-05-14
> **Bug 编号格式**: ACW-XXXX (AloneChat Workspace)
> **扫描范围**: 82 个 Python 文件 + 30 个 TypeScript/React 文件

---

## 目录

| 文件 | 内容 |
|------|------|
| [SECURITY_VULNERABILITIES.md](SECURITY_VULNERABILITIES.md) | 安全漏洞详情（含位置、影响范围、攻击代码） |
| [FUNCTIONAL_BUGS.md](FUNCTIONAL_BUGS.md) | 功能性错误详情 |
| [SUMMARY.md](SUMMARY.md) | 汇总统计 |

## 统计概要

| 类别 | CRITICAL | HIGH | MEDIUM | LOW | 合计 |
|------|----------|------|--------|-----|------|
| **安全漏洞** | 12 | 13 | 19 | 12 | **56** |
| **功能性错误** | 3 | 6 | 12 | 8 | **29** |
| **合计** | **15** | **19** | **31** | **20** | **85** |

## 优先级修复建议

1. **P0 - 立即修复**: CRITICAL 级别安全漏洞（RCE、认证绕过、XSS）
2. **P1 - 紧急修复**: CRITICAL 级别功能 Bug（事件循环阻塞、路径遍历）
3. **P2 - 高优先级**: HIGH 级别漏洞和功能 Bug
4. **P3 - 中优先级**: MEDIUM 级别问题
5. **P4 - 低优先级**: LOW 级别问题
