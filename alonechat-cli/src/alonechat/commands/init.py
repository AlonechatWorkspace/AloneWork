"""
init命令 - 初始化项目配置

创建.alonechatrc配置文件，配置API密钥等
"""

import click
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.panel import Panel

from alonechat.config import ConfigManager

console = Console()


@click.command()
@click.option("--force", "-f", is_flag=True, help="强制覆盖现有配置")
@click.option("--api-key", help="API密钥")
@click.option("--model", default="deepseek", help="默认模型")
@click.pass_obj
def init_command(obj: dict, force: bool, api_key: str | None, model: str) -> None:
    """
    初始化AloneChat配置
    
    创建.alonechatrc配置文件，配置API密钥和模型设置
    """
    console.print(Panel.fit(
        "[bold cyan]AloneChat 配置初始化[/bold cyan]\n\n"
        "本工具将帮助您：\n"
        "1. 创建配置文件 (.alonechatrc)\n"
        "2. 配置API密钥（本地加密存储）\n"
        "3. 选择默认模型\n\n"
        "[dim]所有配置均存储在本地，确保隐私安全[/dim]",
        border_style="cyan"
    ))
    
    config_manager: ConfigManager = obj["config_manager"]
    config_path = config_manager.config_path
    
    if config_path.exists() and not force:
        if not Confirm.ask(f"配置文件 {config_path} 已存在，是否覆盖？"):
            console.print("[yellow]初始化已取消[/yellow]")
            return
    
    console.print("\n[bold]步骤 1/3: 配置文件位置[/bold]")
    console.print(f"配置文件将创建在: [cyan]{config_path}[/cyan]")
    
    console.print("\n[bold]步骤 2/3: API密钥配置[/bold]")
    console.print("[dim]支持以下模型提供商：[/dim]")
    console.print("  • DeepSeek (推荐，国产优秀模型)")
    console.print("  • Qwen (通义千问)")
    console.print("  • 腾讯混元")
    console.print("  • 智谱GLM")
    console.print("  • Ollama (本地模型，完全离线)")
    
    if not api_key:
        api_key = Prompt.ask(
            "\n请输入API密钥",
            password=True,
            default=""
        )
    
    console.print("\n[bold]步骤 3/3: 选择默认模型[/bold]")
    model_choices = {
        "1": "deepseek",
        "2": "qwen",
        "3": "hunyuan",
        "4": "glm",
        "5": "ollama"
    }
    
    console.print("请选择默认模型：")
    console.print("  [1] DeepSeek V3 (推荐)")
    console.print("  [2] Qwen 2.5 Max")
    console.print("  [3] 腾讯混元")
    console.print("  [4] 智谱GLM")
    console.print("  [5] Ollama (本地)")
    
    choice = Prompt.ask(
        "请选择",
        choices=list(model_choices.keys()),
        default="1"
    )
    
    selected_model = model_choices[choice]
    
    console.print("\n[bold]正在创建配置文件...[/bold]")
    
    config_data = {
        "version": "1.0",
        "model": {
            "default": selected_model,
            "providers": {
                "deepseek": {
                    "api_key": api_key if selected_model == "deepseek" else "",
                    "base_url": "https://api.deepseek.com/v1",
                    "model": "deepseek-chat"
                },
                "qwen": {
                    "api_key": api_key if selected_model == "qwen" else "",
                    "base_url": "https://dashscope.aliyuncs.com/api/v1",
                    "model": "qwen-max"
                },
                "hunyuan": {
                    "api_key": api_key if selected_model == "hunyuan" else "",
                    "base_url": "https://api.hunyuan.cloud.tencent.com/v1",
                    "model": "hunyuan-lite"
                },
                "glm": {
                    "api_key": api_key if selected_model == "glm" else "",
                    "base_url": "https://open.bigmodel.cn/api/paas/v4",
                    "model": "glm-4"
                },
                "ollama": {
                    "base_url": "http://localhost:11434",
                    "model": "deepseek-coder:6.7b"
                }
            }
        },
        "context": {
            "max_tokens": 128000,
            "compression_enabled": True
        },
        "privacy": {
            "code_local": True,
            "api_prompt_only": True,
            "log_enabled": False
        }
    }
    
    config_manager.save_config(config_data)
    
    console.print("\n[bold green]✓ 配置初始化完成！[/bold green]")
    console.print(f"\n配置文件已创建: [cyan]{config_path}[/cyan]")
    console.print(f"默认模型: [cyan]{selected_model}[/cyan]")
    
    console.print("\n[bold]下一步：[/bold]")
    console.print("  $ alonechat chat        # 启动交互式对话")
    console.print("  $ alonechat generate    # 生成代码")
    console.print("  $ alonechat --help      # 查看所有命令")
