# 漏洞管理系统

基于 Umi + React + Ant Design 的漏洞管理系统，提供完整的漏洞生命周期管理和审批流程功能。

## 功能特性

### 1. 漏洞管理
- 漏洞列表展示（支持搜索、筛选、分页）
- 漏洞详情查看
- 多维度信息展示（漏洞编号、名称、来源、危害等级、发现时间、预期拦截时间、状态）
- 漏洞详情页面支持查看审批状态和跳转到审批单

### 2. 审批管理
- 审批单列表（仅显示已完成的审批单）
- 审批单详情查看
- 审批流程历史记录
- 关联漏洞信息展示
- 统计信息可视化

### 3. 系统特性
- 响应式设计，支持多种设备
- 基于约定的路由系统
- Mock 数据支持，便于开发测试
- 友好的用户界面和交互体验

## 技术栈

- **前端框架**: React 18
- **构建工具**: Umi 4
- **UI 组件库**: Ant Design 5
- **图标库**: @ant-design/icons
- **TypeScript**: 完整的类型支持

## 项目结构

```
src/
├── layouts/
│   ├── index.tsx           # 主布局组件（带侧边栏）
│   └── index.less          # 布局样式
├── pages/
│   ├── index.tsx           # 首页
│   ├── vuln/
│   │   ├── index.tsx       # 漏洞列表页
│   │   └── [id].tsx        # 漏洞详情页
│   └── approval/
│       ├── index.tsx       # 审批单列表页
│       └── [id].tsx        # 审批单详情页
├── types/
│   └── index.ts            # TypeScript 类型定义
└── global.ts               # 全局配置
mock/
├── vuln.ts                 # 漏洞相关 Mock 数据和 API
└── approval.ts             # 审批相关 Mock 数据和 API
```

## 路由配置

系统使用 Umi 的约定式路由：

- `/` - 首页
- `/vuln` - 漏洞列表
- `/vuln/:id` - 漏洞详情
- `/approval` - 审批单列表
- `/approval/:id` - 审批单详情

## 数据结构

### 漏洞 (Vulnerability)
```typescript
interface Vulnerability {
  id: string;                    // 漏洞编号
  name: string;                  // 漏洞名称
  source: string;                 // 漏洞来源 (IAST, SCA, DAST 等)
  riskLevel: string;             // 危害等级 (critical, high, medium, low)
  discoveryTime: string;         // 发现时间
  expectedBlockTime: string;     // 预期拦截时间
  status: string;                // 当前状态 (pending, approved, rejected, processing)
  description?: string;          // 漏洞描述
  severity?: string;             // 严重程度
  affectedComponent?: string;    // 影响组件
  recommendation?: string;       // 修复建议
  approvalId?: string;           // 关联的审批单ID
}
```

### 审批单 (Approval)
```typescript
interface Approval {
  id: string;                    // 审批单号
  title: string;                 // 审批标题
  status: string;                // 状态
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
  approver: string;              // 审批人
  vulnerabilities: Vulnerability[]; // 关联的漏洞列表
  comments?: string;             // 备注
  priority: string;              // 优先级 (urgent, normal, low)
  department?: string;           // 部门
}
```

## 安装和运行

### 环境要求
- Node.js >= 14
- npm >= 6

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码格式化
```bash
npm run format
```

## Mock 数据

项目包含完整的 Mock 数据和 API，支持：

- 漏洞列表和详情 API
- 审批单列表和详情 API
- 审批历史记录 API
- 搜索和筛选功能

Mock 数据位于 `mock/` 目录，可以通过修改这些文件来调整测试数据。

## 使用说明

### 漏洞管理
1. 在左侧菜单点击"漏洞管理"进入漏洞列表
2. 使用搜索框和筛选器快速定位漏洞
3. 点击漏洞编号查看详细信息
4. 在详情页面可以查看漏洞描述、修复建议和相关审批单

### 审批管理
1. 在左侧菜单点击"审批管理"进入审批单列表
2. 系统仅显示已完成的审批单
3. 点击审批单号查看详细信息
4. 审批单详情包含审批流程历史和相关漏洞信息

### 页面跳转
- 支持通过 URL 直接访问特定页面
- 漏洞详情页和审批单详情页之间可以相互跳转
- 面包屑导航帮助定位当前位置

## 扩展开发

### 添加新页面
1. 在 `src/pages/` 下创建新组件
2. 更新 `.umirc.ts` 中的路由配置
3. 在布局组件中添加对应的菜单项

### 修改 Mock 数据
1. 编辑 `mock/` 目录下的相应文件
2. 添加新的 API 端点
3. 更新数据结构（如需要）

### 样式定制
1. 修改 `src/layouts/index.less` 调整布局样式
2. 为特定页面添加独立的样式文件

## 注意事项

1. 本项目使用 Mock 数据，实际部署时需要替换为真实的 API
2. 路由参数验证和错误处理可以根据实际需求进一步完善
3. 权限控制需要在实际项目中实现
4. 数据持久化需要集成后端服务

## License

MIT