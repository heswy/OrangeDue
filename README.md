# OrangeDue

<div align="center">
  <img src="orange.png" alt="OrangeDue Logo" width="120" height="120">
  <h3>🍊 OrangeDue - 本地个人日程管理软件</h3>
  <p>一款简洁高效的本地日程管理工具，专为个人用户设计</p>
</div>

## ✨ 功能特性

### 📋 清单管理
- **任务创建与编辑**：快速创建任务，支持标题、日期、时间、优先级、备注等详细信息
- **智能分类**：创建自定义清单，用颜色标识不同类别的任务
- **拖拽操作**：支持任务在不同清单间的拖拽移动
- **批量操作**：支持批量选择、移动、删除任务
- **优先级管理**：高、中、低三级优先级，帮助您专注重要事项

### 📅 日历视图
- **多视图模式**：月视图、周视图、日视图，灵活切换
- **直观展示**：任务在日历上的可视化展示，一目了然
- **快速编辑**：直接在日历上点击创建或编辑任务
- **时间管理**：支持设置任务的开始和结束时间

### 📊 统计分析
- **完成率统计**：实时显示任务完成情况和完成率
- **热力图展示**：直观展示每日任务活跃度
- **趋势分析**：帮助您了解工作习惯和效率变化
- **数据洞察**：基于历史数据提供个人效率分析

### ⚙️ 系统功能
- **本地存储**：所有数据存储在本地，保护隐私安全
- **数据备份**：支持数据导出和导入，防止数据丢失
- **提醒功能**：任务到期提醒，不错过重要事项
- **跨平台**：支持 Windows、macOS、Linux 多平台

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Zustand** - 轻量级状态管理
- **React Big Calendar** - 强大的日历组件
- **Recharts** - 数据可视化图表库
- **Lucide React** - 精美的图标库

### 桌面应用
- **Electron** - 跨平台桌面应用框架
- **SQLite** - 轻量级本地数据库
- **Node.js** - 后端运行时环境

### 开发工具
- **Vite** - 快速的构建工具
- **ESLint** - 代码质量检查
- **Electron Builder** - 应用打包和分发

## 📦 安装与使用

### 下载安装包

1. 访问 [Releases 页面](https://github.com/heswy/OrangeDue/releases)
2. 根据您的操作系统下载对应的安装包：
   - **Windows**: `OrangeDue Setup 1.0.0.exe`
   - **macOS**: `OrangeDue-1.0.0.dmg` (Intel) 或 `OrangeDue-1.0.0-arm64.dmg` (Apple Silicon)
   - **Linux**: `OrangeDue-1.0.0.AppImage`
3. 运行安装包并按照提示完成安装

### 从源码构建

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

# 打包应用
npm run build:all
```

## 📖 使用指南

### 快速开始

1. **创建第一个清单**
   - 点击侧边栏的「+」按钮
   - 输入清单名称，选择颜色
   - 点击保存创建清单

2. **添加任务**
   - 在清单视图中点击「+ 添加任务」
   - 填写任务详情：标题、日期、时间、优先级等
   - 保存任务

3. **管理任务**
   - 点击任务可以编辑详情
   - 拖拽任务可以移动到其他清单
   - 勾选复选框标记任务完成

4. **查看统计**
   - 切换到统计视图
   - 查看任务完成率和活跃度热力图
   - 分析个人效率趋势

### 高级功能

- **批量操作**：按住 Ctrl/Cmd 键多选任务进行批量操作
- **快捷键**：使用键盘快捷键提高操作效率
- **数据备份**：定期导出数据备份，防止数据丢失
- **自定义设置**：在设置页面调整应用偏好

## 📁 项目结构

```
OrangeDue/
├── app/
│   ├── main/           # Electron 主进程
│   │   ├── db/         # 数据库相关
│   │   ├── ipc/        # IPC 通信处理
│   │   └── index.ts    # 主进程入口
│   ├── renderer/       # 渲染进程 (React 应用)
│   │   └── src/
│   │       ├── components/  # 可复用组件
│   │       ├── pages/       # 页面组件
│   │       ├── store/       # 状态管理
│   │       └── utils/       # 工具函数
│   └── shared/         # 共享类型定义
├── build/              # 构建资源
├── dist/               # 编译输出
├── release/            # 打包输出
└── package.json        # 项目配置
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 遵循现有的代码风格
- 添加适当的注释和文档
- 确保所有测试通过
- 提交信息要清晰明确

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的支持：

- [React](https://reactjs.org/) - 用户界面库
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [React Big Calendar](https://github.com/jquense/react-big-calendar) - 日历组件
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

## 📞 联系方式

- 作者：阿橙
- 项目链接：[https://github.com/heswy/OrangeDue](https://github.com/heswy/OrangeDue)

---

<div align="center">
  <p>如果这个项目对您有帮助，请给它一个 ⭐️</p>
</div>