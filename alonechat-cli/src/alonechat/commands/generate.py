"""
generate命令 - 代码生成

支持：
- 函数生成
- 类生成
- 模块生成
- 项目脚手架
"""

import click
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel
from rich.syntax import Syntax

from alonechat.config import ConfigManager
from alonechat.models import ModelRouter

console = Console()


@click.command()
@click.option("--type", "-t", "gen_type", help="生成类型", 
              type=click.Choice(["function", "class", "module", "project"]))
@click.option("--name", "-n", help="名称")
@click.option("--output", "-o", help="输出路径", type=click.Path())
@click.option("--model", "-m", help="使用的模型")
@click.pass_obj
def generate_command(obj: dict, gen_type: str | None, name: str | None, 
                     output: str | None, model: str | None) -> None:
    """
    生成代码
    
    支持生成函数、类、模块和项目脚手架
    """
    console.print(Panel.fit(
        "[bold cyan]代码生成[/bold cyan]\n\n"
        "支持生成：\n"
        "• 函数 (function)\n"
        "• 类 (class)\n"
        "• 模块 (module)\n"
        "• 项目 (project)",
        border_style="cyan"
    ))
    
    config_manager: ConfigManager = obj["config_manager"]
    
    if not config_manager.config_path.exists():
        console.print("[red]错误: 未找到配置文件[/red]")
        console.print("请先运行: [cyan]alonechat init[/cyan]")
        return
    
    config = config_manager.load_config()
    selected_model = model or config.get("model", {}).get("default", "deepseek")
    
    if not gen_type:
        console.print("\n请选择生成类型：")
        console.print("  [1] 函数 (function)")
        console.print("  [2] 类 (class)")
        console.print("  [3] 模块 (module)")
        console.print("  [4] 项目 (project)")
        
        choice = Prompt.ask("请选择", choices=["1", "2", "3", "4"], default="1")
        gen_type = ["function", "class", "module", "project"][int(choice) - 1]
    
    if not name:
        name = Prompt.ask(f"请输入{gen_type}名称")
    
    description = Prompt.ask(f"请描述{gen_type}的功能")
    
    console.print(f"\n[bold]正在生成{gen_type}...[/bold]")
    
    model_router = ModelRouter(config)
    
    prompt = f"""
请生成一个{gen_type}，名称为 {name}。

功能描述：{description}

要求：
1. 代码清晰、可读性强
2. 包含必要的注释
3. 遵循最佳实践
4. 包含类型注解（如果适用）
5. 包含错误处理

请直接输出代码，不要包含markdown代码块标记。
"""
    
    with console.status("[bold green]生成中...[/bold green]"):
        response = model_router.chat(
            model=selected_model,
            messages=[{"role": "user", "content": prompt}],
            stream=False
        )
    
    console.print("\n[bold green]生成的代码：[/bold green]\n")
    
    if output:
        output_path = Path(output)
        output_path.write_text(response, encoding="utf-8")
        console.print(f"[green]✓ 代码已保存到: {output_path}[/green]")
    else:
        syntax = Syntax(response, "python", theme="monokai", line_numbers=True)
        console.print(syntax)
        
        if click.confirm("\n是否保存到文件？"):
            filename = Prompt.ask("文件名", default=f"{name}.py")
            Path(filename).write_text(response, encoding="utf-8")
            console.print(f"[green]✓ 已保存到: {filename}[/green]")
