# 物品管理系统

## 项目概述

物品管理系统是一个全栈应用程序，用于帮助用户管理个人或家庭物品。系统提供了物品的分类管理、库存跟踪、位置记录、提醒设置等功能，同时支持多用户和家庭共享功能。

## 系统架构

项目采用前后端分离的架构设计：

- **前端**：移动端应用（stuff 文件夹）
- **后端**：Java Spring Boot 应用（bakend 文件夹）
- **管理端**：Vue.js 管理界面（admin 文件夹）
- **数据库**：MySQL 数据库（stuff(2).sql）

## 功能特点

### 用户功能

- **用户注册与登录**：支持用户账号创建和身份验证
- **个人中心**：用户信息管理和设置

### 物品管理

- **物品添加与编辑**：记录物品的名称、数量、位置、描述等信息
- **物品分类**：自定义物品分类，便于管理和查找
- **物品搜索**：支持按名称、分类等条件搜索物品
- **图片上传**：支持为物品添加图片，使用 canvas 转 base64 存储
- **位置记录**：可记录物品的存放位置，支持地图选择

### 提醒功能

- **库存提醒**：当物品数量低于设定阈值时发出提醒
- **使用提醒**：根据设定的使用间隔提醒用户使用物品

### 家庭共享

- **家庭创建**：创建家庭组，邀请成员加入
- **权限管理**：不同角色（管理员、成员、访客）拥有不同权限
- **物品共享**：家庭成员间共享物品信息

### 收藏功能

- **物品收藏**：用户可收藏常用物品，便于快速访问

## 技术栈

### 前端（移动端）

- **框架**：Vue.js + uni-app（跨平台移动应用开发框架）
- **UI 组件**：uni-ui 组件库
- **状态管理**：Vue 的响应式数据管理
- **地图功能**：集成地图 API 用于位置选择
- **图片处理**：使用 canvas 进行图片处理和转换

### 后端

- **框架**：Spring Boot 2.6.x
- **ORM**：Spring Data JPA
- **安全**：自定义权限注解（@RequireRole）
- **API**：RESTful API 设计
- **跨域**：支持 CORS 跨域请求

### 管理端

- **框架**：Vue 3.x
- **构建工具**：Vite
- **UI 库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router

### 数据库

- **类型**：MySQL 8.0
- **主要表结构**：
  - users：用户信息
  - items：物品信息
  - categories：分类信息
  - families：家庭组信息
  - family_members：家庭成员关系
  - favorites：收藏记录
  - reminders：提醒设置

## 安装与使用

### 数据库配置

1. 创建 MySQL 数据库：

   ```sql
   CREATE DATABASE stuff;
   ```

2. 导入数据库结构：
   ```bash
   mysql -u username -p stuff < stuff(2).sql
   ```

### 后端部署

1. 进入后端目录：

   ```bash
   cd bakend
   ```

2. 使用 Maven 构建项目：

   ```bash
   mvn clean package
   ```

3. 运行 Spring Boot 应用：
   ```bash
   java -jar target/stuff-0.0.1-SNAPSHOT.jar
   ```

### 前端部署（移动端）

1. 进入前端目录：

   ```bash
   cd stuff
   ```

2. 使用 HBuilderX 打开项目，或通过 uni-app CLI 运行：
   ```bash
   # 如果使用CLI
   npm install -g @vue/cli
   npm install
   npm run dev:h5  # 运行H5版本
   # 或使用HBuilderX导入项目并运行
   ```

### 管理端部署

1. 进入管理端目录：

   ```bash
   cd admin
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 开发模式运行：

   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

## 访问应用

- 后端 API：http://localhost:8080/api
- 前端移动应用：根据 uni-app 运行环境（如 H5 模式为 http://localhost:8080）
- 管理端：http://localhost:5173

## 注意事项

- 确保 MySQL 服务已启动并配置正确
- 后端默认运行在 8080 端口，请确保端口未被占用
- 图片上传功能需要确保 uploads 目录有写入权限
- 跨域配置已在后端设置，支持本地开发环境
  > > > > > > > master
