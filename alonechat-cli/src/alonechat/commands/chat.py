"""
chat命令 - 启动交互式对话

提供交互式对话界面，支持：
- 自然语言交互
- 代码生成和理解
- 多轮对话
- 上下文管理
"""

import click
from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel
from rich.markdown import Markdown
from rich.live import Live

from alonechat.config import ConfigManager
from alonechat.models import ModelRouter
from alonechat.context import ContextManager

console = Console()


@click.command()
@click.option("--model", "-m", help="使用的模型")
@click.option("--context", "-c", help="上下文窗口大小", type=int, default=128000)
@click.pass_obj
def chat_command(obj: dict, model: str | None, context: int) -> None:
    """
    启动交互式对话
    
    提供自然语言交互界面，支持代码生成、理解和多轮对话
    """
    console.print(Panel.fit(
        "[bold cyan]AloneChat 交互模式[/bold cyan]\n\n"
        "输入自然语言指令，AI将帮助您：\n"
        "• 生成代码\n"
        "• 理解代码\n"
        "• 重构代码\n"
        "• 修复错误\n"
        "• 回答问题\n\n"
        "[dim]输入 'exit' 或 'quit' 退出[/dim]",
        border_style="cyan"
    ))
    
    config_manager: ConfigManager = obj["config_manager"]
    
    if not config_manager.config_path.exists():
        console.print("[red]错误: 未找到配置文件[/red]")
        console.print("请先运行: [cyan]alonechat init[/cyan]")
        return
    
    config = config_manager.load_config()
    selected_model = model or config.get("model", {}).get("default", "deepseek")
    
    console.print(f"\n使用模型: [cyan]{selected_model}[/cyan]")
    console.print(f"上下文窗口: [cyan]{context:,} tokens[/cyan]")
    console.print("\n" + "─" * 60 + "\n")
    
    model_router = ModelRouter(config)
    context_manager = ContextManager(max_tokens=context)
    
    console.print("[bold green]AloneChat 已就绪，请输入您的指令...[/bold green]\n")
    
    while True:
        try:
            user_input = Prompt.ask("[bold blue]You[/bold blue]")
            
            if user_input.lower() in ["exit", "quit", "q"]:
                console.print("\n[dim]再见！[/dim]")
                break
            
            if not user_input.strip():
                continue
            
            context_manager.add_message("user", user_input)
            
            console.print("\n[bold green]AloneChat[/bold green]")
            
            with console.status("[bold green]思考中...[/bold green]"):
                response = model_router.chat(
                    model=selected_model,
                    messages=context_manager.get_messages(),
                    stream=True
                )
            
            console.print()
            
            if isinstance(response, str):
                console.print(Markdown(response))
                context_manager.add_message("assistant", response)
            else:
                full_response = ""
                for chunk in response:
                    if chunk:
                        console.print(chunk, end="")
                        full_response += chunk
                console.print()
                context_manager.add_message("assistant", full_response)
            
            console.print("\n" + "─" * 60 + "\n")
            
        except KeyboardInterrupt:
            console.print("\n\n[dim]已中断[/dim]")
            break
        except Exception as e:
            console.print(f"\n[red]错误: {e}[/red]")
            console.print("[dim]请重试或输入 'exit' 退出[/dim]\n")
