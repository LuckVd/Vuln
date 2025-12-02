# 漏洞管理系统部署指南

## 🚀 部署方式

### 1. 开发环境启动
```bash
# 启动开发服务器
npm run dev

# 或使用快速启动脚本
./start.sh
```

### 2. 生产环境构建
```bash
# 构建生产版本
npm run build

# 构建结果检查
ls -la dist/
```

### 3. 静态资源部署

#### 直接部署
将 `dist` 目录下的所有文件部署到 Web 服务器

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project;
    index index.html;

    location / {
        try_files $uri $uri$args;
        expires 7d;
    }

    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Docker 部署
```dockerfile
# 构建镜像
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY .umirc.ts ./
COPY dist/ ./dist/

EXPOSE 8001

CMD ["npm", "start"]

# 构建和运行
RUN npm install
RUN npm run build

# 启动应用
CMD ["npm", "start"]
```

#### PM2 部署
```bash
# 全局安装
npm install -g pm2

# 启动应用
pm2 start "npm run start"
```

### 4. 环境配置

#### 开发环境 (.env.development)
```bash
# API 基础URL
VITE_API_BASE_URL=http://localhost:8001
VITE_API_MOCK_ENABLED=true

# 构建配置
npm run build
```

#### 生产环境 (.env.production)
```bash
# API 基础URL
VITE_API_BASE_URL=https://api.your-domain.com
VITE_API_MOCK_ENABLED=false

# 构建配置
npm run build
```

### 5. 环境变量说明

| 变量 | 开发环境 | 生产环境 | 说明 |
|--------|------------|------------|------|
| `VITE_API_BASE_URL` | `http://localhost:8001` | `https://api.your-domain.com` | API 服务地址 |
| `VITE_API_MOCK_ENABLED` | `true` | `false` | 是否使用 Mock 数据 |
| `VITE_PUBLIC_PATH` | `/` | `/static` | 静态资源路径 |

### 6. CI/CD 部署

#### GitHub Actions 示例
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: dist/
          target: /path/to/deploy
          strip_components: true
```

#### Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

## 🎯 部署后访问

部署成功后，用户可以通过以下地址访问：

- **开发环境**: http://localhost:8001
- **生产环境**: https://your-domain.com
- **Vercel 部署**: https://your-project.vercel.app

## 📊 监控和维护

### 日志监控
```bash
# PM2 进程管理
pm2 monit

# 查看日志
pm2 logs vuln-management-system

# 重启应用
pm2 restart vuln-management-system
```

### 性能优化建议

1. **代码分割**: 使用动态导入减少初始包大小
2. **资源优化**: 启用 Gzip 压缩
3. **缓存策略**: 配置合适的浏览器缓存头
4. **CDN 加速**: 使用内容分发网络加速资源加载

### 安全配置

1. **HTTPS**: 生产环境强制使用 HTTPS
2. **CORS**: 配置跨域资源共享策略
3. **环境变量**: 敏感信息使用环境变量，不硬编码
4. **依赖安全**: 定期更新依赖包，修复安全漏洞

## 🚨 故障排除

### 常见问题

#### 1. 端口占用
```bash
# 查看端口占用
lsof -i :8001

# 杀死进程
kill -9 $(lsof -ti:8001)

# 更改端口
# 修改 .umirc.ts 中的 port 配置
```

#### 2. 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 重新安装
npm install
```

#### 3. 构建错误
```bash
# 检查 TypeScript 配置
npx tsc --noEmit

# 修复类型错误
# 更新依赖版本
```

## 📞 技术支持

### 官方文档
- **UmiJS**: https://umijs.org/docs
- **Ant Design**: https://ant.design/components/overview/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **React**: https://react.dev/

### 社区支持
- **GitHub**: https://github.com/umijs/umi
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/umijs

### 开发工具推荐
- **IDE**: VS Code + 相关插件
- **浏览器**: Chrome DevTools
- **API 测试**: Postman + Thunder Client

---

**🎉 恭喜！项目已完成开发，可以投入使用！**