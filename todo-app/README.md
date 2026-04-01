# Todo App — 待办事项应用

> 基于 Next.js 14 + Drizzle ORM + PostgreSQL 构建的现代全栈待办事项应用，配备暗色玻璃态 UI 设计。

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|---------|
| 框架 | Next.js (App Router) | 14.2.5 |
| 语言 | TypeScript | ^5 |
| 数据库 ORM | Drizzle ORM | ^0.31.4 |
| 数据库驱动 | postgres.js | ^3.4.4 |
| 数据库 | PostgreSQL | — |
| 样式 | Tailwind CSS + 自定义 CSS | ^3.4.1 |
| 字体 | Inter (Google Fonts) | — |

---

## 项目结构

```
todo-app/
├── src/
│   ├── app/
│   │   ├── actions.ts          # Server Actions（增删改）
│   │   ├── page.tsx            # 首页（Server Component，SSR 加载数据）
│   │   ├── layout.tsx          # 根布局（元数据、字体）
│   │   ├── globals.css         # 全局样式 + 动画 + 组件样式
│   │   ├── components/
│   │   │   └── TodoApp.tsx     # 客户端主组件（乐观更新 UI）
│   │   └── api/
│   │       └── todos/
│   │           └── route.ts    # REST API：GET /api/todos
│   └── db/
│       ├── index.ts            # 数据库连接（drizzle + postgres.js）
│       └── schema.ts           # 数据表结构定义 + 类型导出
├── drizzle.config.ts           # Drizzle Kit 配置
├── next.config.js              # Next.js 配置
├── tailwind.config.ts          # Tailwind 配置
├── tsconfig.json               # TypeScript 配置（路径别名 @/*）
├── postcss.config.js           # PostCSS 配置
├── .env                        # 环境变量（本地，不提交）
├── .env.example                # 环境变量示例
└── .gitignore
```

---

## 数据库 Schema

**表名：`todos`**

```ts
// src/db/schema.ts
export const todos = pgTable('todos', {
  id:        serial('id').primaryKey(),
  title:     text('title').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Todo    = typeof todos.$inferSelect;  // 查询返回类型
export type NewTodo = typeof todos.$inferInsert;  // 插入数据类型
```

---

## 核心功能

### 1. Server Component 首页（SSR）

`src/app/page.tsx` 在服务端直接查询数据库，按 `createdAt` 倒序加载所有 Todo，传给客户端组件。

```ts
const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
return <TodoApp initialTodos={allTodos} />;
```

### 2. Server Actions

`src/app/actions.ts` 提供三个服务端操作，每次操作后调用 `revalidatePath('/')` 使页面缓存失效：

| 函数 | 说明 |
|------|------|
| `addTodo(formData)` | 插入新 Todo，忽略空标题 |
| `toggleTodo(id, completed)` | 切换完成状态 |
| `deleteTodo(id)` | 按 ID 删除 |

### 3. 客户端组件（乐观更新）

`src/app/components/TodoApp.tsx` 使用 React 18 新特性：

- **`useOptimistic`** — 操作立即反映在 UI，无需等待服务端响应
- **`useTransition`** — 包裹异步 Server Action，保持 UI 响应性
- **`useRef`** — 提交后立即清空输入框

**筛选器（Filter）：**

| 值 | 显示 |
|----|------|
| `all` | 全部任务 |
| `active` | 未完成 |
| `done` | 已完成 |

**进度环：** 用 SVG `<circle>` + `stroke-dashoffset` 实现环形进度条，展示完成百分比。

### 4. REST API

`GET /api/todos` — 返回全部 Todo 的 JSON 数组，供外部客户端或调试使用。

---

## UI / 样式设计

- **主题**：深色背景（`#06060f`）+ 玻璃态卡片（`backdrop-filter: blur`）
- **配色**：
  - 蓝色主色调 `#0A84FF`（添加按钮、输入框 focus）
  - 绿色完成状态 `#30D158`
  - 红色删除悬停 `#FF453A`
- **动画**：`fadeIn`、`float`、`scaleIn`、`slideOut`、`shimmer`
- **交互细节**：
  - 删除按钮默认隐藏，hover 行时显示
  - 复选框选中时绿色光晕动画
  - 进度环平滑过渡（`cubic-bezier`）
  - 自定义细滚动条

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/todoapp
```

### 3. 初始化数据库

```bash
npm run db:push      # 将 Schema 推送到数据库（开发用）
npm run db:studio    # 打开 Drizzle Studio 可视化管理数据
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

### 5. 构建生产版本

```bash
npm run build
npm run start
```

---

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:password@localhost:5432/todoapp` |

---

## 可扩展方向

以下是后续升级迭代的建议方向：

### 功能增强
- [ ] **编辑 Todo** — 双击标题进入编辑模式
- [ ] **优先级 / 标签** — 为 Todo 添加优先级（高/中/低）或自定义标签
- [ ] **截止日期** — 添加 `dueDate` 字段，支持日期选择器
- [ ] **拖拽排序** — 使用 `@dnd-kit/core` 实现列表拖拽重排
- [ ] **批量操作** — 全选/全部完成/批量删除
- [ ] **搜索** — 关键字过滤 Todo 列表
- [ ] **子任务** — 支持 Todo 嵌套子项

### 用户系统
- [ ] **多用户支持** — 集成 NextAuth.js / Clerk 认证
- [ ] **用户隔离** — Schema 中添加 `userId` 外键
- [ ] **OAuth 登录** — GitHub / Google 登录

### 工程化
- [ ] **数据库迁移** — 使用 `drizzle-kit generate` + `migrate` 替代 `db:push`
- [ ] **API 完善** — 为 REST API 添加 POST / PATCH / DELETE 端点
- [ ] **错误处理** — Server Actions 添加统一错误边界（`error.tsx`）
- [ ] **加载状态** — 添加 `loading.tsx` 骨架屏
- [ ] **测试** — 添加 Vitest 单元测试 + Playwright E2E 测试
- [ ] **CI/CD** — GitHub Actions 自动化测试与部署

### 部署
- [ ] **Vercel** — 直接连接 Vercel Postgres（Neon）
- [ ] **Docker** — 编写 `docker-compose.yml` 含 PostgreSQL 服务
- [ ] **环境分层** — 区分 `.env.development` / `.env.production`

---

## 路径别名

`tsconfig.json` 中配置了 `@/*` 指向 `./src/*`，可直接使用：

```ts
import { db } from '@/db';           // → src/db/index.ts
import { todos } from '@/db/schema'; // → src/db/schema.ts
```

---

## 脚本一览

```bash
npm run dev        # 启动开发服务器（含热更新）
npm run build      # 生产构建
npm run start      # 启动生产服务器
npm run db:push    # 同步 Schema 到数据库
npm run db:studio  # 打开 Drizzle Studio
```
