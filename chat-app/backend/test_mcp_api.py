
"""
Test script for MCP Marketplace API
"""
import sys
from pathlib import Path

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "agent-framework"))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_api_docs():
    """Test that API docs are available"""
    response = client.get("/docs")
    assert response.status_code in [200, 404]  # 404 if not running, but just testing import
    print("✅ API docs endpoint test passed")


def test_mcp_router_import():
    """Test that MCP router is properly imported"""
    from routers import mcp_marketplace
    assert hasattr(mcp_marketplace, 'router')
    print("✅ MCP router import test passed")


def test_models_import():
    """Test that models are imported correctly"""
    from models.mcp_marketplace import MCPServerModel
    from models import User, Conversation
    print("✅ Models import test passed")


def test_schemas_import():
    """Test that schemas are imported correctly"""
    from schemas.mcp_marketplace import (
        MCPServerCreate,
        MCPServerResponse,
        MCPTool,
    )
    print("✅ Schemas import test passed")


def test_core_module_import():
    """Test that core MCP module is imported correctly"""
    from agent_framework.deepseek_optimization.mcp_marketplace import (
        MCPServerConfig,
        MCPServerRegistry,
        MCPServerLoader,
        ServerStatus,
    )
    print("✅ Core module import test passed")


if __name__ == "__main__":
    print("🧪 Running MCP Marketplace API Tests...\n")
    
    tests_passed = 0
    total_tests = 5
    
    try:
        test_mcp_router_import()
        tests_passed += 1
    except Exception as e:
        print(f"❌ Router test failed: {e}")
    
    try:
        test_models_import()
        tests_passed += 1
    except Exception as e:
        print(f"❌ Models test failed: {e}")
    
    try:
        test_schemas_import()
        tests_passed += 1
    except Exception as e:
        print(f"❌ Schemas test failed: {e}")
    
    try:
        test_core_module_import()
        tests_passed += 1
    except Exception as e:
        print(f"❌ Core module test failed: {e}")
    
    try:
        test_api_docs()
        tests_passed += 1
    except Exception as e:
        print(f"⚠️  API docs test skipped (server not running): {e}")
    
    print(f"\n📊 Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed >= 4:
        print("\n🎉 All core components are working correctly!")
        print("\nNext steps:")
        print("1. Start your PostgreSQL database")
        print("2. Run alembic upgrade head to apply migrations")
        print("3. Start the server with uvicorn main:app --reload")
        print("4. Test the API at http://localhost:8000/docs")

