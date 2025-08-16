# OrangeDue - 个人日程管理软件

<div align="center">
  <img src="orange.png" alt="OrangeDue Logo" width="128" height="128">
  <h3>🍊 简洁高效的本地日程管理工具</h3>
  <p>基于 Electron + React + TypeScript 构建的跨平台桌面应用</p>
</div>

## ✨ 特性

### 📋 任务管理
- **智能清单**：支持自定义清单分类，颜色标识
- **优先级管理**：高、中、低三级优先级，直观显示
- **状态跟踪**：待办、已完成状态切换
- **详细信息**：支持任务备注、时间设置
- **快速操作**：一键完成、编辑、删除

### 📅 日历视图
- **多视图模式**：月视图、周视图、日视图自由切换
- **拖拽操作**：拖拽任务调整时间和日期
- **时间管理**：精确到分钟的时间安排
- **视觉化展示**：任务以事件形式在日历中显示
- **快速创建**：点击日历空白处快速创建任务

### 🔔 智能提醒
- **灵活提醒**：支持自定义提醒时间
- **系统通知**：集成系统通知，不错过重要任务
- **提醒管理**：可查看、测试和管理即将到来的提醒

### 📊 数据统计
- **完成率统计**：直观显示任务完成情况
- **热力图**：年度任务活跃度可视化
- **趋势分析**：了解个人效率变化趋势

### 💾 数据管理
- **本地存储**：数据完全存储在本地，保护隐私
- **备份恢复**：支持数据导出和导入
- **自动保存**：实时保存，无需手动操作

## 🚀 快速开始

### 安装

#### 方式一：下载预编译版本
1. 前往 [Releases](https://github.com/heswy/OrangeDue/releases) 页面
2. 下载适合您操作系统的安装包：
   - **Windows**: `OrangeDue Setup 1.0.0.exe`
   - **macOS**: `OrangeDue-1.0.0.dmg` (Intel) 或 `OrangeDue-1.0.0-arm64.dmg` (Apple Silicon)
   - **Linux**: `OrangeDue-1.0.0.AppImage`
3. 运行安装包完成安装

#### 方式二：从源码构建

**环境要求**
- Node.js 18+
- npm 或 yarn

**安装步骤**
```bash
# 克隆仓库
git clone https://github.com/heswy/OrangeDue.git
cd OrangeDue

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建应用
npm run build

# 打包发布版本
npm run build:all
```

## 📖 使用指南

### 基础操作

#### 创建任务
1. 点击右上角的 "+ 新建任务" 按钮
2. 填写任务标题、选择日期和时间
3. 设置优先级和所属清单
4. 添加备注和提醒时间（可选）
5. 点击保存

#### 管理清单
1. 在左侧边栏点击 "+ 新建" 创建清单
2. 设置清单名称和颜色
3. 鼠标悬停在清单上可进行编辑或删除操作

### 高级功能

#### 日历操作
- **拖拽移动**：在日历中拖拽任务可调整日期和时间
- **创建任务**：在日历空白处点击可快速创建任务
- **视图切换**：支持月、周、日三种视图模式
- **颜色模式**：可按优先级或清单颜色显示任务

### 数据管理

- **自动保存**：所有操作自动保存到本地数据库
- **数据位置**：数据存储在用户目录的应用专用文件夹
- **备份恢复**：通过设置页面可导出/导入数据备份

## 🏗️ 项目结构

```
project-root/
├── app/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts          # 应用启动入口
│   │   ├── preload.ts        # 预加载脚本
│   │   ├── ipc/              # IPC 通信处理
│   │   ├── db/               # 数据库访问层
│   │   └── services/         # 通知等服务
│   ├── renderer/             # 前端界面
│   │   └── src/
│   │       ├── pages/        # 页面组件
│   │       ├── components/   # 通用组件
│   │       ├── store/        # 状态管理
│   │       └── hooks/        # 自定义 Hooks
│   └── shared/               # 共享类型定义
├── build/                    # 构建资源
├── dist/                     # 编译输出
├── release/                  # 打包输出
└── package.json
```

## 🛠️ 技术栈

- **框架**: [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- **前端**: [React 18](https://reactjs.org/) + [TypeScript](https://typescriptlang.org/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **UI 框架**: [Tailwind CSS](https://tailwindcss.com/)
- **日历组件**: [React Big Calendar](https://github.com/jquense/react-big-calendar)
- **图表**: [Recharts](https://recharts.org/)
- **构建工具**: [Vite](https://vitejs.dev/) + [Electron Builder](https://electron.build/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置的代码规范
- 提交前请运行 `npm run lint` 检查代码

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目：

- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [React Big Calendar](https://github.com/jquense/react-big-calendar) - 日历组件
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Recharts](https://recharts.org/) - 图表库

## 📞 联系方式

- 作者：阿橙
- 邮箱：heswyc@gmail.com
- 项目主页：[GitHub](https://github.com/heswy/OrangeDue)

---

<div align="center">
  <p>如果这个项目对您有帮助，请给个 ⭐️ 支持一下！</p>
</div>