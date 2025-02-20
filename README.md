# 腾图片前端项目 (Teng Picture Frontend)

## 项目简介

腾图片前端项目是一个基于Vue 3的现代化图片管理系统的前端部分。本项目使用最新的前端技术栈，提供流畅的用户体验和强大的图片管理功能。系统支持多空间管理、图片上传、分类管理等功能，并提供不同级别的空间服务。

## 核心功能

### 1. 用户系统

- 用户注册与登录
- 基于JWT的身份认证
- 用户角色权限管理（普通用户/管理员）

### 2. 空间管理

- 多空间创建与管理
- 空间容量监控
- 三个空间等级：
  - 普通版：基础存储空间
  - 专业版：更大存储空间，高级功能
  - 旗舰版：最大存储空间，全部功能

### 3. 图片管理

- 支持多种格式图片上传
- 图片分类与标签管理
- 图片搜索与筛选
- 支持网格视图和列表视图
- 图片详情查看与编辑

### 4. 系统功能

- 响应式布局设计
- 数据实时统计
- 空间使用量监控
- 管理员后台管理

## 技术栈

- Vue 3 - 渐进式JavaScript框架
- TypeScript - 带类型系统的JavaScript超集
- Vite - 下一代前端构建工具
- Pinia - Vue的状态管理解决方案
- Vue Router - Vue.js的官方路由管理器
- Ant Design Vue - 企业级UI组件库
- Axios - 基于Promise的HTTP客户端

## 项目结构

```
teng-picture-frontend/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源文件
│   ├── components/        # 公共组件
│   │   ├── GlobalHeader/  # 全局头部组件
│   │   └── GlobalSider/   # 全局侧边栏组件
│   ├── constants/         # 常量定义
│   │   ├── space.ts      # 空间相关常量
│   │   └── review.ts     # 审核相关常量
│   ├── layouts/          # 布局组件
│   │   ├── BasicLayout/  # 基础布局
│   │   └── UserLayout/   # 用户相关页面布局
│   ├── pages/            # 页面组件
│   │   ├── user/        # 用户相关页面
│   │   ├── space/       # 空间相关页面
│   │   ├── picture/     # 图片相关页面
│   │   └── admin/       # 管理员页面
│   ├── router/          # 路由配置
│   ├── service/         # API服务
│   ├── stores/          # Pinia状态管理
│   ├── App.vue          # 根组件
│   ├── main.ts          # 应用入口
│   └── request.ts       # 请求配置
├── public/              # 公共资源目录
├── index.html          # HTML模板
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
├── package.json        # 项目依赖配置
└── README.md           # 项目说明文档
```

## 功能流程

### 1. 用户认证流程

1. 用户注册/登录
2. 获取JWT令牌
3. 存储用户信息到Pinia
4. 路由守卫验证权限

### 2. 空间管理流程

1. 创建/选择空间
2. 查看空间详情和使用情况
3. 上传和管理图片
4. 空间容量监控

### 3. 图片管理流程

1. 图片上传（单张/批量）
2. 图片信息编辑
3. 分类和标签管理
4. 搜索和筛选

### 4. 管理员功能流程

1. 用户管理
2. 空间管理
3. 系统监控
4. 内容审核

## 开发环境设置

1. 确保已安装Node.js (推荐版本 18+)
2. 克隆项目到本地

```bash
git clone [项目地址]
```

3. 安装依赖

```bash
npm install
```

4. 启动开发服务器

```bash
npm run dev
```

## 可用的命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行代码检查并自动修复
- `npm run format` - 格式化代码
- `npm run openapi` - 生成API类型定义

## 开发规范

### 1. 代码规范

- 使用ESLint进行代码质量检查
- 使用Prettier进行代码格式化
- 使用EditorConfig确保IDE一致性
- 遵循Vue 3组合式API的最佳实践

### 2. 组件开发规范

- 组件名使用PascalCase
- Props定义使用类型声明
- 使用组合式API (setup)
- 组件文件结构遵循模板、脚本、样式顺序

### 3. 样式规范

- 使用scoped CSS
- 遵循BEM命名规范
- 使用LESS预处理器
- 响应式设计优先

### 4. Git提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 部署说明

### 构建

```bash
npm run build
```

### 部署检查清单

1. 环境变量配置
2. API地址配置
3. 静态资源路径
4. 跨域配置
5. 性能优化

## 注意事项

- 确保Node.js版本兼容性
- 定期更新依赖包
- 注意代码性能优化
- 保持良好的代码注释
- 遵循TypeScript类型定义

## 贡献指南

1. Fork本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
