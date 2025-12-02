#!/bin/bash

echo "🚀 启动漏洞管理系统..."
echo "📱 系统将自动在浏览器中打开"
echo "🌐 本地地址: http://localhost:8001"
echo "🔗 网络地址: http://192.168.3.100:8001"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
  echo "❌ 错误: 未找到 node_modules 目录"
  echo "💡 请先运行 'npm install' 安装依赖"
  exit 1
fi

# 启动开发服务器
npm run dev