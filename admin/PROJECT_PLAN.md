# Personal Brand CMS — 完整项目方案

> **项目名称：** Bol G — Personal Brand CMS
> **文档版本：** v1.0
> **目标：** 将现有 Next.js 前台 + 后台管理系统的本地存储方案升级为完整的、可上线、可长期维护的 Web 应用。

---

# 1. 项目功能清单

## 1.1 用户与权限系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 用户注册/登录 | 身份认证入口 | 管理员首次登录 | 是 | 中 | users, roles 表 |
| 2 | JWT 认证（Access + Refresh Token） | 无状态认证 | 所有受保护接口 | 是 | 中 | — |
| 3 | 角色管理（RBAC） | 分配权限组 | 未来多人协作 | 是 | 中 | roles, permissions, role_permissions 表 |
| 4 | 权限管理 | 细粒度控制 | 不同角色操作不同模块 | 是 | 中 | — |
| 5 | 密码修改 | 安全管理 | 管理员定期改密码 | 是 | 低 | — |
| 6 | 密码重置（邮件） | 找回密码 | 忘记密码时 | 否 | 高 | 邮件服务 |
| 7 | 多因素认证（2FA） | 安全加固 | 防止盗号 | 否 | 高 | TOTP 库 |
| 8 | Session 管理 | 查看/踢出在线设备 | 安全审计 | 否 | 中 | — |
| 9 | OAuth 第三方登录 | 简化登录 | Google/GitHub 登录 | 否 | 高 | OAuth 配置 |

## 1.2 内容管理系统（核心）

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 作品 CRUD | 管理所有作品 | 创建/编辑/删除作品 | 是 | 中 | works, work_translations 表 |
| 2 | 文章/博客 CRUD | 管理文章内容 | 写技术博客、生活记录 | 是 | 中 | posts, post_translations 表 |
| 3 | 分类 CRUD | 内容分类 | 编程/动画/书法等分类 | 是 | 低 | categories, category_translations 表 |
| 4 | 标签 CRUD | 多维标记 | 跨分类标记作品/文章 | 是 | 低 | tags, tag_translations 表 |
| 5 | 时间线 CRUD | 管理里程碑 | 展示职业发展轨迹 | 是 | 低 | timeline_milestones, timeline_translations 表 |
| 6 | 关于页编辑 | 管理个人简介 | 更新个人介绍、价值观、技术栈 | 是 | 低 | about_sections, about_translations 表 |
| 7 | 首页配置 | 管理 Hero 区域 | 更新标语、CTA、统计数据 | 是 | 低 | site_settings（JSON） |
| 8 | 导航配置 | 管理导航链接 | 增删改排序导航 | 是 | 低 | site_settings（JSON） |
| 9 | 页脚配置 | 管理页脚信息 | 社交链接、联系方式 | 是 | 低 | site_settings（JSON） |
| 10 | 专辑/合集功能 | 将多个作品组合 | 同系列作品归组展示 | 否 | 中 | collections 表 |
| 11 | 友情链接 | 管理外部链接 | 展示合作伙伴 | 否 | 低 | links 表 |
| 12 | 公告/横幅 | 站点公告 | 重要通知、维护信息 | 否 | 低 | announcements 表 |
| 13 | 自定义页面 | 创建自定义页面 | 简历页、作品集页 | 否 | 高 | pages 表 |

## 1.3 草稿与发布系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 草稿/发布状态切换 | 内容生命周期管理 | 编辑完后发布 | 是 | 低 | status 字段 |
| 2 | 定时发布 | 预设发布时间 | 计划内容发布 | 否 | 中 | published_at 字段 + 定时任务 |
| 3 | 草稿预览 | 发布前预览 | 检查效果再发布 | 是 | 中 | 预览接口 |
| 4 | 批量发布/撤回 | 批量操作 | 一次性处理多条内容 | 否 | 低 | — |
| 5 | 回收站 | 软删除恢复 | 误删后恢复 | 否 | 低 | deleted_at 字段 |

## 1.4 版本历史与回滚

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 内容版本记录 | 每次保存产生新版本 | 追踪修改历史 | 否 | 中 | content_revisions 表 |
| 2 | 版本对比（Diff） | 查看两个版本差异 | 确认修改内容 | 否 | 高 | Diff 算法 |
| 3 | 版本回滚 | 恢复到历史版本 | 误改后恢复 | 否 | 中 | — |
| 4 | 自动保存 | 定时保存草稿 | 防止丢失编辑内容 | 否 | 中 | 前端定时器 + API |

## 1.5 多语言系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 内容双语存储（EN/ZH） | 每个内容支持两种语言 | 所有内容模块 | 是 | 中 | _translations 表 |
| 2 | 后台界面中英切换 | 管理后台自身语言 | 管理员选择界面语言 | 是 | 低 | i18n 系统 |
| 3 | 前台语言切换 | 前台展示语言 | 访客选择阅读语言 | 是 | 中 | 前台语言检测 |
| 4 | 内容语言标记 | 标记哪些语言版本完成 | 确保翻译完整性 | 否 | 低 | — |
| 5 | 翻译工作流 | 待翻译列表 | 批量翻译补充 | 否 | 中 | — |
| 6 | RTL 支持 | 阿拉伯语等语言 | 未来扩展 | 否 | 低 | CSS 方向处理 |

## 1.6 媒体资源管理

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 图片上传与存储 | 上传并存储图片 | 作品封面、文章配图 | 是 | 中 | media_assets 表 + 存储服务 |
| 2 | 图片裁剪/压缩 | 优化图片 | 上传时自动生成缩略图 | 是 | 中 | 图片处理库 |
| 3 | 媒体库浏览 | 查看所有上传文件 | 选择已上传的图片 | 否 | 低 | — |
| 4 | 文件夹/相册分类 | 组织媒体文件 | 按项目/类型归类 | 否 | 低 | — |
| 5 | 视频上传/外链 | 支持视频内容 | 展示视频作品 | 否 | 高 | 视频处理/CDN |
| 6 | CDN 集成 | 加速媒体访问 | 提升加载速度 | 否 | 高 | CDN 服务 |
| 7 | 图片批量上传 | 一次传多张 | 大量素材上传 | 否 | 中 | 并发上传 |
| 8 | 未使用媒体清理 | 释放存储空间 | 定期清理无用文件 | 否 | 低 | 引用检测 |

## 1.7 SEO 管理

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | Meta 标签管理 | 管理 title/description | 每个页面 SEO | 是 | 低 | seo 字段 |
| 2 | Open Graph 管理 | 社交分享预览 | 微信/Twitter 分享 | 否 | 低 | OG 字段 |
| 3 | Sitemap 生成 | 搜索引擎索引 | Google/Baidu 收录 | 否 | 低 | 自动生成脚本 |
| 4 | robots.txt 管理 | 搜索引擎爬虫控制 | 控制收录范围 | 否 | 低 | 配置文件 |
| 5 | 结构化数据（JSON-LD） | 搜索结果富媒体展示 | Google 富片段 | 否 | 中 | Schema.org |
| 6 | Canonical URL | 防重复内容 | 避免 SEO 降权 | 否 | 低 | — |
| 7 | SEO 评分建议 | 内容优化建议 | 写作时提示 SEO 问题 | 否 | 中 | 分析逻辑 |

## 1.8 搜索系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 全文搜索 | 搜索作品/文章 | 访客搜索内容 | 否 | 中 | 全文索引 |
| 2 | 后台搜索 | 管理端内容检索 | 管理员快速找内容 | 是 | 低 | LIKE 查询 |
| 3 | 标签/分类筛选 | 按维度浏览 | 访客按类别浏览 | 是 | 低 | 筛选接口 |
| 4 | 搜索建议/自动补全 | 搜索体验优化 | 输入时提示 | 否 | 中 | 前端防抖 + 后端建议接口 |

## 1.9 统计分析

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 后台仪表盘统计 | 内容概览 | 管理员查看数据 | 是 | 低 | 内容统计查询 |
| 2 | 页面访问统计 | 了解流量 | 哪些作品受欢迎 | 否 | 中 | page_views 表 |
| 3 | 内容分布图 | 可视化内容构成 | 分析内容策略 | 是 | 低 | Recharts |
| 4 | 最近活动流 | 操作动态 | 查看最近修改 | 是 | 低 | activity_logs 表 |
| 5 | 趋势分析 | 长期数据趋势 | 决策支持 | 否 | 中 | 聚合查询 |

## 1.10 审计日志

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 操作日志记录 | 记录所有写操作 | 追踪谁改了什么 | 是 | 中 | activity_logs 表 |
| 2 | 登录日志 | 记录登录事件 | 安全审计 | 是 | 低 | — |
| 3 | 日志查询/筛选 | 查看历史操作 | 排查问题 | 否 | 低 | 日志接口 |
| 4 | 日志导出 | 导出审计记录 | 合规/备份 | 否 | 低 | — |

## 1.11 备份与恢复

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 内容导出 JSON | 导出所有内容 | 备份/迁移 | 是 | 低 | 导出接口 |
| 2 | 内容导入 JSON | 从备份恢复 | 灾难恢复 | 是 | 低 | 导入接口 |
| 3 | 数据库自动备份 | 定时备份 | 防止数据丢失 | 否 | 中 | 定时任务 + 存储 |
| 4 | 增量备份 | 减少备份体积 | 大量数据时 | 否 | 高 | — |

## 1.12 前台展示系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 首页展示 | 首次访问印象 | Hero + 精选作品 | 是 | 中 | — |
| 2 | 作品列表/详情 | 浏览作品 | 访客查看作品 | 是 | 中 | — |
| 3 | 文章列表/详情 | 阅读文章 | 访客阅读博客 | 是 | 中 | — |
| 4 | 分类/标签页面 | 内容聚合浏览 | 按类型浏览 | 是 | 中 | — |
| 5 | 时间线展示 | 职业发展 | 了解个人经历 | 是 | 低 | — |
| 6 | 关于页面 | 个人介绍 | 了解博主 | 是 | 低 | — |
| 7 | 404 页面 | 错误处理 | URL 不存在时 | 否 | 低 | — |
| 8 | RSS 订阅 | 内容订阅 | 读者订阅更新 | 否 | 低 | RSS 生成 |
| 9 | 深色/浅色主题 | 视觉偏好 | 访客切换主题 | 否 | 低 | CSS 变量 |
| 10 | 响应式设计 | 移动端适配 | 手机/平板访问 | 是 | 中 | Tailwind 响应式 |
| 11 | 内容分享按钮 | 社交分享 | 分享到社交平台 | 否 | 低 | OG 配置 |

## 1.13 后台管理系统

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | 仪表盘 | 数据概览 | 登录后首页 | 是 | 低 | — |
| 2 | 内容管理路由 | 各模块管理页面 | 日常管理 | 是 | 中 | — |
| 3 | 数据表格 | 列表展示 | 浏览/筛选/排序 | 是 | 中 | TanStack Table |
| 4 | 表单系统 | 内容编辑 | 创建/编辑内容 | 是 | 中 | React Hook Form |
| 5 | 批量操作 | 批量管理 | 批量删除/发布 | 否 | 低 | — |
| 6 | 键盘快捷键 | 操作效率 | 快速操作 | 否 | 低 | 快捷键监听 |

## 1.14 运维与部署

| # | 功能点 | 作用 | 使用场景 | MVP | 复杂度 | 依赖 |
|---|--------|------|----------|-----|--------|------|
| 1 | Docker 容器化 | 环境一致性 | 开发/生产一致 | 否 | 中 | Dockerfile |
| 2 | CI/CD 流水线 | 自动部署 | 代码提交自动部署 | 否 | 中 | GitHub Actions |
| 3 | 环境变量管理 | 配置分离 | 不同环境配置 | 是 | 低 | .env |
| 4 | 健康检查接口 | 服务监控 | 运维监控 | 否 | 低 | /health 端点 |
| 5 | 日志系统 | 结构化日志 | 排查问题 | 否 | 中 | 日志库 |
| 6 | 错误监控 | 前后端错误追踪 | 发现线上问题 | 否 | 中 | Sentry 集成 |
| 7 | 性能监控 | 性能分析 | 优化依据 | 否 | 中 | APM 工具 |

---

# 2. 开发优先级

## P0 — 必须先做的核心功能（Sprint 1-4）

**目标：** 搭建完整的基础架构，实现从本地存储到服务端存储的迁移，核心 CRUD 能跑通。

| 顺序 | 功能 | 说明 |
|------|------|------|
| 1 | Go 后端项目初始化 | 目录结构、配置管理、数据库连接、中间件框架 |
| 2 | MySQL 数据库建表 | 所有核心表的 DDL，迁移脚本 |
| 3 | 用户认证（JWT） | 登录/注册、Access Token + Refresh Token |
| 4 | 角色与权限（RBAC） | 管理员角色 + 基础权限 |
| 5 | 作品 CRUD API | 完整的增删改查 + 双语 |
| 6 | 分类 CRUD API | 分类管理 + 双语 |
| 7 | 标签 CRUD API | 标签管理 + 双语 |
| 8 | 时间线 CRUD API | 里程碑管理 + 双语 |
| 9 | 关于页 API | 个人简介管理 |
| 10 | 站点设置 API | Hero/导航/页脚配置 |
| 11 | 媒体上传 API | 图片上传 + 存储 |
| 12 | 草稿/发布状态 | status 字段 + 过滤逻辑 |
| 13 | 后台前端改造 | 将 Zustand localStorage 切换为 API 调用 |
| 14 | 前台前端改造 | 从 localStorage 读取改为 API 读取 |
| 15 | 审计日志基础版 | 记录写操作 |

**为什么要先做这些：**
- 没有认证系统，一切都无法保护
- 没有数据库，内容无法持久化
- 核心 CRUD 是整个 CMS 的骨架
- 后台和前台改造是让现有代码真正跑起来的关键

**可以先做简版的部分：**
- 权限先做"管理员/访客"两个角色，后续扩展
- 媒体上传先支持本地存储，后续迁移到 OSS
- 审计日志先记录关键操作，后续增加详情

## P1 — 重要功能（Sprint 5-8）

**目标：** 完善内容管理能力，提升管理效率。

| 顺序 | 功能 | 说明 |
|------|------|------|
| 1 | 文章/博客系统 | posts 表 + 完整 CRUD |
| 2 | 内容版本历史 | content_revisions 表 + 查看历史 |
| 3 | 草稿预览 | 带 token 的预览链接 |
| 4 | 后台搜索增强 | 跨模块搜索 |
| 5 | 前台多语言切换 | 语言检测 + 手动切换 |
| 6 | SEO 基础字段 | Meta 标签管理 |
| 7 | 内容导出/导入 | JSON 备份恢复 |
| 8 | 仪表盘完善 | 统计图表、活动流 |
| 9 | 前台页面完善 | 分类/标签筛选页、文章页 |

**为什么放在这个阶段：**
- 文章系统是个人品牌站的核心内容形式之一
- 版本历史是"可以长期维护"的基本保障
- 搜索和筛选让内容管理更高效
- SEO 基础是上线的前提条件

## P2 — 增强体验功能（Sprint 9-12）

| 顺序 | 功能 | 说明 |
|------|------|------|
| 1 | 图片裁剪/压缩 | 上传时自动处理 |
| 2 | 媒体库管理 | 浏览、搜索已上传文件 |
| 3 | 定时发布 | 预设发布时间 |
| 4 | 批量操作 | 批量删除/发布/分类 |
| 5 | 前台搜索 | 全文搜索 |
| 6 | 版本对比/回滚 | Diff + 恢复 |
| 7 | Open Graph 管理 | 社交分享优化 |
| 8 | Sitemap 生成 | 搜索引擎收录 |
| 9 | 登录日志 | 安全审计 |
| 10 | 密码重置邮件 | 安全功能 |
| 11 | 日志查询/筛选 | 审计功能 |
| 12 | 前台 RSS 订阅 | 内容订阅 |

## P3 — 长期扩展功能（Sprint 13+）

| 顺序 | 功能 | 说明 |
|------|------|------|
| 1 | 专辑/合集 | 作品组合展示 |
| 2 | 视频上传/外链 | 多媒体支持 |
| 3 | CDN 集成 | 性能优化 |
| 4 | 自动保存 | 编辑防丢失 |
| 5 | 键盘快捷键 | 操作效率 |
| 6 | 2FA 安全 | 高级安全 |
| 7 | OAuth 第三方登录 | 便捷登录 |
| 8 | 结构化数据 | SEO 增强 |
| 9 | 错误监控（Sentry） | 线上问题追踪 |
| 10 | CI/CD + Docker | 自动化部署 |
| 11 | 自定义页面 | 灵活内容 |
| 12 | 翻译工作流 | 多人翻译 |

---

# 3. 数据库表设计

## 3.1 设计原则

1. **双语支持：** 所有需要展示的内容通过 `_translations` 表实现多语言，`lang` 字段区分 `en`/`zh`
2. **草稿/发布：** 核心内容表使用 `status` 字段（`draft`/`published`/`archived`）+ `published_at` 时间戳
3. **软删除：** 所有内容表使用 `deleted_at` 实现软删除
4. **版本追踪：** 核心内容表有 `content_revisions` 表记录每次变更
5. **JSON 字段：** 站点设置、SEO 配置等结构灵活的数据使用 JSON 字段
6. **排序：** 所有列表展示的内容使用 `sort_order` 字段
7. **审计：** `activity_logs` 记录所有写操作

## 3.2 表清单（按依赖顺序）

```
users → roles → permissions → role_permissions
categories → category_translations
tags → tag_translations
works → work_translations → work_tags
posts → post_translations → post_tags
timeline_milestones → timeline_translations
about_sections → about_translations
site_settings (standalone, JSON)
media_assets (standalone)
content_revisions (polymorphic)
activity_logs (polymorphic)
```

## 3.3 各表详细设计

### 表 1：roles

**用途：** 角色定义，用于 RBAC 权限控制。

```sql
CREATE TABLE roles (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,        -- admin, editor, viewer
    display_name    VARCHAR(100) NOT NULL,              -- 管理员 / 编辑 / 访客
    description     VARCHAR(255) DEFAULT NULL,
    is_system       TINYINT(1) NOT NULL DEFAULT 0,      -- 系统内置角色不可删除
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT UNSIGNED | 主键，自增 |
| name | VARCHAR(50) | 角色标识名，唯一 |
| display_name | VARCHAR(100) | 显示名称 |
| description | VARCHAR(255) | 角色描述 |
| is_system | TINYINT(1) | 是否系统角色 |

- **外键：** 无
- **软删除：** 不支持（系统角色，用 `is_system` 保护）
- **预置数据：** `admin`(管理员), `editor`(编辑), `viewer`(只读)

---

### 表 2：permissions

**用途：** 权限定义，细粒度控制每个资源的操作。

```sql
CREATE TABLE permissions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,       -- works.read, works.write, works.delete
    module          VARCHAR(50) NOT NULL,               -- works, posts, categories, media, settings
    action          VARCHAR(50) NOT NULL,               -- read, write, delete, publish, manage
    description     VARCHAR(255) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_permissions_name (name),
    INDEX idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| name | VARCHAR(100) | 权限标识，格式：`模块.操作` |
| module | VARCHAR(50) | 所属模块 |
| action | VARCHAR(50) | 操作类型 |

- **预置数据：** 每个模块 5 条：`read`, `write`, `delete`, `publish`, `manage`

---

### 表 3：role_permissions

**用途：** 角色-权限关联表，多对多关系。

```sql
CREATE TABLE role_permissions (
    role_id         BIGINT UNSIGNED NOT NULL,
    permission_id   BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- **外键：** role_id → roles(id)，permission_id → permissions(id)
- **索引：** 复合主键已覆盖

---

### 表 4：users

**用途：** 系统用户。

```sql
CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) DEFAULT NULL,
    avatar_url      VARCHAR(500) DEFAULT NULL,
    role_id         BIGINT UNSIGNED NOT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at   TIMESTAMP NULL DEFAULT NULL,
    last_login_ip   VARCHAR(45) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_users_username (username),
    UNIQUE INDEX idx_users_email (email),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_deleted_at (deleted_at),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

| 字段 | 类型 | 说明 |
|------|------|------|
| username | VARCHAR(50) | 登录用户名 |
| email | VARCHAR(255) | 邮箱 |
| password_hash | VARCHAR(255) | bcrypt 哈希 |
| role_id | BIGINT UNSIGNED | 关联角色 |
| is_active | TINYINT(1) | 是否启用 |
| last_login_at | TIMESTAMP | 最后登录时间 |
| last_login_ip | VARCHAR(45) | 最后登录 IP |

- **外键：** role_id → roles(id)
- **软删除：** 支持（deleted_at）

---

### 表 5：categories

**用途：** 内容分类，如编程开发、动画制作、书法等。

```sql
CREATE TABLE categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL UNIQUE,       -- URL 标识: coding, animation, calligraphy
    icon_name       VARCHAR(50) DEFAULT NULL,           -- Lucide 图标名
    color           VARCHAR(20) DEFAULT NULL,           -- 渐变色或纯色值
    parent_id       BIGINT UNSIGNED DEFAULT NULL,       -- 支持多级分类
    sort_order      INT NOT NULL DEFAULT 0,
    status          ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_status (status),
    INDEX idx_categories_sort_order (sort_order),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- **外键：** parent_id → categories(id)（自引用，支持树形分类）
- **软删除：** 支持
- **JSON 字段：** 无（color 使用 VARCHAR，结构固定）

---

### 表 6：category_translations

**用途：** 分类的多语言翻译。

```sql
CREATE TABLE category_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    name            VARCHAR(100) NOT NULL,              -- 显示名称
    description     TEXT DEFAULT NULL,                  -- 分类描述

    PRIMARY KEY (id),
    UNIQUE INDEX idx_cat_trans (category_id, lang),
    CONSTRAINT fk_cat_trans_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 7：tags

**用途：** 标签定义，跨内容类型使用。

```sql
CREATE TABLE tags (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 8：tag_translations

**用途：** 标签的多语言翻译。

```sql
CREATE TABLE tag_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag_id          BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    name            VARCHAR(100) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_tag_trans (tag_id, lang),
    CONSTRAINT fk_tag_trans_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 9：works

**用途：** 作品管理，核心内容表。

```sql
CREATE TABLE works (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    category_id     BIGINT UNSIGNED DEFAULT NULL,
    cover_image_url VARCHAR(500) DEFAULT NULL,
    gradient        VARCHAR(255) DEFAULT NULL,           -- 渐变色
    date            DATE NOT NULL,
    featured        TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,
    status          ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMP NULL DEFAULT NULL,

    -- SEO 字段（结构简单，直接放主表）
    seo_title       VARCHAR(200) DEFAULT NULL,
    seo_description VARCHAR(500) DEFAULT NULL,
    seo_keywords    VARCHAR(255) DEFAULT NULL,

    created_by      BIGINT UNSIGNED DEFAULT NULL,
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_works_slug (slug),
    INDEX idx_works_category_id (category_id),
    INDEX idx_works_status (status),
    INDEX idx_works_featured (featured),
    INDEX idx_works_date (date),
    INDEX idx_works_sort_order (sort_order),
    INDEX idx_works_published_at (published_at),
    INDEX idx_works_deleted_at (deleted_at),
    CONSTRAINT fk_works_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_works_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_works_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明：**
- `gradient` — VARCHAR 存储渐变值，不是 JSON（结构固定：`linear-gradient(...)` 字符串）
- `seo_*` — 三个 VARCHAR 字段而非 JSON，因为 SEO 字段结构固定，SQL 查询更方便
- `created_by` / `updated_by` — 追踪创建者和最后修改者
- **外键：** category_id → categories(id)，created_by/updated_by → users(id)
- **软删除：** 支持

---

### 表 10：work_translations

**用途：** 作品的多语言内容。

```sql
CREATE TABLE work_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    work_id         BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    title           VARCHAR(200) NOT NULL,
    excerpt         TEXT DEFAULT NULL,
    content         LONGTEXT DEFAULT NULL,               -- 详细内容（Markdown/HTML）

    PRIMARY KEY (id),
    UNIQUE INDEX idx_work_trans (work_id, lang),
    FULLTEXT INDEX ft_work_trans_title_excerpt (title, excerpt),
    CONSTRAINT fk_work_trans_work FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- **content 使用 LONGTEXT：** 支持长文章/详细描述
- **FULLTEXT 索引：** 支持标题和摘要的全文搜索（MySQL 5.7+ InnoDB）

---

### 表 11：work_tags

**用途：** 作品-标签关联表。

```sql
CREATE TABLE work_tags (
    work_id         BIGINT UNSIGNED NOT NULL,
    tag_id          BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (work_id, tag_id),
    INDEX idx_work_tags_tag_id (tag_id),
    CONSTRAINT fk_work_tags_work FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
    CONSTRAINT fk_work_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 12：posts

**用途：** 文章/博客系统。

```sql
CREATE TABLE posts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    category_id     BIGINT UNSIGNED DEFAULT NULL,
    cover_image_url VARCHAR(500) DEFAULT NULL,
    reading_time    INT DEFAULT NULL,                    -- 预估阅读时长（分钟）
    featured        TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,
    status          ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMP NULL DEFAULT NULL,

    seo_title       VARCHAR(200) DEFAULT NULL,
    seo_description VARCHAR(500) DEFAULT NULL,
    seo_keywords    VARCHAR(255) DEFAULT NULL,

    created_by      BIGINT UNSIGNED DEFAULT NULL,
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_posts_slug (slug),
    INDEX idx_posts_category_id (category_id),
    INDEX idx_posts_status (status),
    INDEX idx_posts_published_at (published_at),
    INDEX idx_posts_featured (featured),
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- 结构与 `works` 表基本一致，增加 `reading_time` 字段

---

### 表 13：post_translations

**用途：** 文章的多语言内容。

```sql
CREATE TABLE post_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    title           VARCHAR(200) NOT NULL,
    excerpt         TEXT DEFAULT NULL,
    content         LONGTEXT DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_post_trans (post_id, lang),
    FULLTEXT INDEX ft_post_trans_title_excerpt (title, excerpt),
    CONSTRAINT fk_post_trans_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 14：post_tags

**用途：** 文章-标签关联表。

```sql
CREATE TABLE post_tags (
    post_id         BIGINT UNSIGNED NOT NULL,
    tag_id          BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (post_id, tag_id),
    INDEX idx_post_tags_tag_id (tag_id),
    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 15：timeline_milestones

**用途：** 时间线里程碑。

```sql
CREATE TABLE timeline_milestones (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date            DATE NOT NULL,
    icon_name       VARCHAR(50) DEFAULT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    status          ENUM('draft', 'published') NOT NULL DEFAULT 'published',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),
    INDEX idx_timeline_date (date),
    INDEX idx_timeline_sort_order (sort_order),
    INDEX idx_timeline_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 16：timeline_translations

**用途：** 时间线里程碑的多语言内容。

```sql
CREATE TABLE timeline_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    milestone_id    BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_timeline_trans (milestone_id, lang),
    CONSTRAINT fk_timeline_trans_milestone FOREIGN KEY (milestone_id) REFERENCES timeline_milestones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 17：about_sections

**用途：** 关于页的各个区块（简介、价值观、名言、技术栈）。

**为什么用 sections 而不是一张大表：**
关于页包含多个独立区块（bio 段落、values 列表、quote、tech_stack 列表），每个区块结构不同。使用 sections 表可以：
- 灵活增删区块
- 每个区块独立排序
- 未来可扩展自定义区块

```sql
CREATE TABLE about_sections (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_key     VARCHAR(50) NOT NULL UNIQUE,        -- bio, values, quote, tech_stack
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_about_sections_key (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 18：about_translations

**用途：** 关于页区块的多语言内容。

```sql
CREATE TABLE about_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id      BIGINT UNSIGNED NOT NULL,
    lang            ENUM('en', 'zh') NOT NULL,
    title           VARCHAR(200) DEFAULT NULL,           -- 区块标题
    content         JSON NOT NULL,                       -- 区块内容，JSON 结构因 section_key 不同而异

    PRIMARY KEY (id),
    UNIQUE INDEX idx_about_trans (section_id, lang),
    CONSTRAINT fk_about_trans_section FOREIGN KEY (section_id) REFERENCES about_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**为什么 `content` 使用 JSON 字段：**
不同 section 的内容结构差异很大：
- `bio` → `["段落1", "段落2", "段落3"]`（字符串数组）
- `values` → `[{"title": "...", "description": "...", "iconName": "Shield"}, ...]`（对象数组）
- `quote` → `{"text": "...", "author": "..."}`（单个对象）
- `tech_stack` → `["React", "Go", "MySQL"]`（字符串数组）

用 JSON 字段可以灵活支持不同结构，而不需要为每个 section 类型建子表。

---

### 表 19：site_settings

**用途：** 站点全局配置，每个配置项一行。

```sql
CREATE TABLE site_settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,       -- hero, navigation, footer, seo, general
    setting_value   JSON NOT NULL,                       -- 配置值，JSON 结构因 key 不同而异
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX idx_settings_key (setting_key),
    CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**为什么 `setting_value` 使用 JSON 字段：**
站点配置的结构多样且经常变化：
- `hero` → `{ "brandText": {...}, "headingText": {...}, "primaryCTA": {...}, "stats": [...] }`
- `navigation` → `{ "links": [{ "label": {...}, "href": "...", "order": 1 }, ...] }`
- `footer` → `{ "brandDescription": {...}, "socialLinks": [...], "contactInfo": {...} }`
- `seo` → `{ "siteTitle": {...}, "siteDescription": {...}, "ogImage": "..." }`
- `general` → `{ "language": "zh", "colorScheme": "dark", "maintenance": false }`

每个 key 的 JSON 结构不同，且可能随需求变化。用 JSON 字段比建多个表更灵活。

**预置数据：**
```sql
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero', '{"brandText": {"en": "Bol G", "zh": "Bol G"}, ...}'),
('navigation', '{"links": [...]}'),
('footer', '{"brandDescription": {...}, ...}'),
('seo', '{"siteTitle": {...}, "siteDescription": {...}}'),
('general', '{"language": "zh", "colorScheme": "dark"}');
```

---

### 表 20：media_assets

**用途：** 媒体资源管理。

```sql
CREATE TABLE media_assets (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename        VARCHAR(255) NOT NULL,               -- 存储文件名（UUID + 扩展名）
    original_name   VARCHAR(255) NOT NULL,               -- 原始文件名
    mime_type       VARCHAR(100) NOT NULL,               -- image/jpeg, image/png, video/mp4
    file_size       BIGINT UNSIGNED NOT NULL,            -- 文件大小（字节）
    width           INT UNSIGNED DEFAULT NULL,           -- 图片宽度
    height          INT UNSIGNED DEFAULT NULL,           -- 图片高度
    url             VARCHAR(500) NOT NULL,               -- 访问 URL
    thumbnail_url   VARCHAR(500) DEFAULT NULL,           -- 缩略图 URL
    alt_text        VARCHAR(255) DEFAULT NULL,           -- alt 文本（SEO）
    folder          VARCHAR(100) DEFAULT NULL,           -- 虚拟文件夹: works, posts, avatars
    uploaded_by     BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_media_mime_type (mime_type),
    INDEX idx_media_folder (folder),
    INDEX idx_media_uploaded_by (uploaded_by),
    INDEX idx_media_created_at (created_at),
    CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 表 21：content_revisions

**用途：** 内容版本历史，通用多态表。

```sql
CREATE TABLE content_revisions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,               -- work, post, about_section
    entity_id       BIGINT UNSIGNED NOT NULL,           -- 对应表的 ID
    revision_number INT NOT NULL,                       -- 版本号，从 1 开始递增
    snapshot        JSON NOT NULL,                      -- 该版本的完整内容快照
    change_summary  VARCHAR(255) DEFAULT NULL,          -- 修改说明（可选）
    created_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_revisions_entity (entity_type, entity_id),
    INDEX idx_revisions_entity_version (entity_type, entity_id, revision_number DESC),
    INDEX idx_revisions_created_by (created_by),
    CONSTRAINT fk_revisions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**为什么 `snapshot` 使用 JSON 字段：**
版本快照需要存储不同内容类型的完整数据。使用 JSON 可以：
- 避免为每种内容类型建单独的版本表
- 存储完整的关联数据（如 work + work_translations + work_tags 的组合快照）
- 简化回滚逻辑（从 JSON 快照还原）

---

### 表 22：activity_logs

**用途：** 审计日志，记录所有操作。

```sql
CREATE TABLE activity_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED DEFAULT NULL,
    action          VARCHAR(50) NOT NULL,               -- create, update, delete, publish, unpublish, login, logout
    entity_type     VARCHAR(50) DEFAULT NULL,           -- work, post, category, tag, user, setting
    entity_id       BIGINT UNSIGNED DEFAULT NULL,
    entity_name     VARCHAR(200) DEFAULT NULL,          -- 实体名称/标题（冗余，方便查询）
    description     VARCHAR(500) DEFAULT NULL,          -- 操作描述（可读）
    old_value       JSON DEFAULT NULL,                  -- 修改前的值
    new_value       JSON DEFAULT NULL,                  -- 修改后的值
    ip_address      VARCHAR(45) DEFAULT NULL,
    user_agent      VARCHAR(500) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_logs_user_id (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_created_at (created_at),
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**为什么 `old_value`/`new_value` 使用 JSON 字段：**
- 存储变更前后的完整数据快照
- 不同实体的数据结构不同，JSON 通用
- 方便后续做 Diff 展示

---

## 3.4 表关系总览

```
roles ──1:N──> users
permissions <──M:N──> roles (via role_permissions)
users ──1:N──> works (created_by, updated_by)
users ──1:N──> posts (created_by, updated_by)
users ──1:N──> media_assets (uploaded_by)
users ──1:N──> content_revisions (created_by)
users ──1:N──> activity_logs (user_id)
users ──1:N──> site_settings (updated_by)

categories ──1:N──> works
categories ──1:N──> posts
categories <──M:N──> tags (via work_tags)
tags <──M:N──> works (via work_tags)
tags <──M:N──> posts (via post_tags)

works ──1:N──> work_translations
posts ──1:N──> post_translations
categories ──1:N──> category_translations
tags ──1:N──> tag_translations
timeline_milestones ──1:N──> timeline_translations
about_sections ──1:N──> about_translations

works ──1:N──> content_revisions (entity_type='work')
posts ──1:N──> content_revisions (entity_type='post')
about_sections ──1:N──> content_revisions (entity_type='about_section')

site_settings (standalone)
media_assets (standalone)
```

---

# 4. 后端 API 设计

## 4.1 通用规范

### 4.1.1 基础路径

```
/api/v1/...
```

### 4.1.2 通用响应格式

```json
{
  "code": 0,                    // 0=成功，非0=错误码
  "message": "success",         // 可读消息
  "data": { ... },              // 响应数据（列表时为 items + meta）
  "trace_id": "abc123"          // 请求追踪 ID（调试用）
}
```

### 4.1.3 分页规范

**请求：**
```
GET /api/v1/works?page=1&per_page=20&sort=date&order=desc
```

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "meta": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 156,
      "total_pages": 8
    }
  }
}
```

### 4.1.4 筛选/排序规范

```
GET /api/v1/works
  ?status=published          // 筛选状态
  &category_id=3             // 筛选分类
  &featured=true             // 筛选精选
  &lang=zh                   // 返回语言
  &q=关键词                   // 搜索关键词
  &sort=date                 // 排序字段
  &order=desc                // 排序方向: asc/desc
  &page=1
  &per_page=20
```

### 4.1.5 统一错误码

```go
// 错误码体系
const (
    // 通用成功
    ErrCodeOK = 0

    // 认证相关 10xx
    ErrCodeUnauthorized     = 1001  // 未登录
    ErrCodeTokenExpired     = 1002  // Token 过期
    ErrCodeTokenInvalid     = 1003  // Token 无效
    ErrCodeForbidden        = 1004  // 无权限
    ErrCodeLoginFailed      = 1005  // 登录失败（用户名或密码错误）
    ErrCodeAccountDisabled  = 1006  // 账号已禁用

    // 请求相关 20xx
    ErrCodeBadRequest       = 2001  // 请求参数错误
    ErrCodeValidation       = 2002  // 数据校验失败（details 包含字段错误）
    ErrCodeNotFound         = 2003  // 资源不存在
    ErrCodeConflict         = 2004  // 冲突（如 slug 重复）
    ErrCodeMethodNotAllowed = 2005  // 方法不允许

    // 业务相关 30xx
    ErrCodeSlugExists       = 3001  // Slug 已存在
    ErrCodeDraftOnly        = 3002  // 仅草稿状态可编辑
    ErrCodeAlreadyPublished = 3003  // 已发布，操作无效
    ErrCodeRevertFailed     = 3004  // 版本回滚失败

    // 服务器相关 50xx
    ErrCodeInternal         = 5001  // 服务器内部错误
    ErrCodeDBError          = 5002  // 数据库错误
    ErrCodeFileUploadFailed = 5003  // 文件上传失败
)
```

**错误响应示例：**
```json
{
  "code": 2002,
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": ["Title is required"],
      "email": ["Invalid email format"]
    }
  },
  "trace_id": "req_abc123"
}
```

### 4.1.6 多语言参数

- `?lang=zh` — 返回指定语言的内容（翻译表 JOIN）
- 无 `lang` 参数时返回全部语言版本
- POST/PUT 请求的 body 中使用嵌套对象：
```json
{
  "title": { "en": "Hello", "zh": "你好" },
  "excerpt": { "en": "Short desc", "zh": "简短描述" }
}
```

### 4.1.7 草稿/发布状态

- `?status=draft` — 仅返回草稿
- `?status=published` — 仅返回已发布
- `?status=all` — 返回全部（仅管理员）
- 无参数时：前台返回已发布，后台返回全部

---

## 4.2 Auth 模块

### POST /api/v1/auth/login — 登录

**请求：**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**返回：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "dGhpcyBpcyBh...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "display_name": "管理员",
      "role": {
        "id": 1,
        "name": "admin",
        "permissions": ["works.read", "works.write", "works.delete", "posts.read", "posts.write", ...]
      }
    }
  }
}
```

**权限：** 无需认证

**Token 机制：**
- `access_token` — 有效期 1 小时，用于 API 鉴权
- `refresh_token` — 有效期 7 天，存在 HttpOnly Cookie 或 localStorage
- 两者都是 JWT，refresh_token 存储在数据库中以支持吊销

### POST /api/v1/auth/refresh — 刷新 Token

**请求：**
```json
{
  "refresh_token": "dGhpcyBpcyBh..."
}
```

**返回：** 同登录

**权限：** 需要有效的 refresh_token

### POST /api/v1/auth/logout — 登出

**请求：** 无 body

**返回：**
```json
{ "code": 0, "message": "success", "data": null }
```

**权限：** 需要认证。服务端吊销 refresh_token。

### GET /api/v1/auth/me — 获取当前用户

**返回：** 当前用户信息 + 角色 + 权限

**权限：** 需要认证

---

## 4.3 Users 模块

### GET /api/v1/users — 用户列表

- **权限：** `users.manage`
- **分页：** 支持
- **筛选：** `?role_id=1&is_active=true&q=search`

### POST /api/v1/users — 创建用户

- **权限：** `users.manage`
- **请求：** `{ username, email, password, display_name, role_id }`

### GET /api/v1/users/:id — 用户详情

- **权限：** `users.manage` 或当前用户本人

### PUT /api/v1/users/:id — 更新用户

- **权限：** `users.manage` 或当前用户本人

### DELETE /api/v1/users/:id — 删除用户（软删除）

- **权限：** `users.manage`

### PUT /api/v1/users/:id/password — 修改密码

- **权限：** 当前用户本人
- **请求：** `{ old_password, new_password }`

---

## 4.4 Roles & Permissions 模块

### GET /api/v1/roles — 角色列表

- **权限：** `users.manage`
- **返回：** 角色列表，每个角色包含权限 ID 列表

### GET /api/v1/roles/:id — 角色详情

- **权限：** `users.manage`
- **返回：** 角色信息 + 完整权限列表

### PUT /api/v1/roles/:id — 更新角色权限

- **权限：** `users.manage`
- **请求：** `{ display_name, description, permission_ids: [1, 2, 3] }`

### GET /api/v1/permissions — 权限列表

- **权限：** `users.manage`
- **返回：** 按模块分组的权限列表

---

## 4.5 Categories 模块

### GET /api/v1/categories — 分类列表

- **权限：** 无需认证（前台公开）
- **参数：** `?status=active&lang=zh`
- **分页：** 不分页（分类数量少）
- **返回：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "slug": "coding",
      "icon_name": "Code2",
      "color": "linear-gradient(135deg, #667eea, #764ba2)",
      "parent_id": null,
      "sort_order": 1,
      "status": "active",
      "translations": {
        "en": { "name": "Coding", "description": "Software development" },
        "zh": { "name": "编程开发", "description": "软件开发" }
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-06-01T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/categories — 创建分类

- **权限：** `categories.write`
- **请求：**
```json
{
  "slug": "coding",
  "icon_name": "Code2",
  "color": "linear-gradient(135deg, #667eea, #764ba2)",
  "parent_id": null,
  "sort_order": 1,
  "translations": {
    "en": { "name": "Coding", "description": "Software development" },
    "zh": { "name": "编程开发", "description": "软件开发" }
  }
}
```

### GET /api/v1/categories/:id — 分类详情

- **权限：** 无需认证（前台公开）

### PUT /api/v1/categories/:id — 更新分类

- **权限：** `categories.write`

### DELETE /api/v1/categories/:id — 删除分类（软删除）

- **权限：** `categories.delete`
- **检查：** 是否有关联的 works/posts，可选择级联更新或阻止删除

---

## 4.6 Tags 模块

### GET /api/v1/tags — 标签列表

- **权限：** 无需认证（前台公开）
- **参数：** `?lang=zh&q=关键词`

### POST /api/v1/tags — 创建标签

- **权限：** `tags.write`
- **请求：**
```json
{
  "slug": "react",
  "translations": {
    "en": { "name": "React" },
    "zh": { "name": "React" }
  }
}
```

### GET /api/v1/tags/:id — 标签详情

### PUT /api/v1/tags/:id — 更新标签

### DELETE /api/v1/tags/:id — 删除标签（软删除）

- **权限：** `tags.delete`

---

## 4.7 Works 模块

### GET /api/v1/works — 作品列表

- **权限：** 无需认证（前台返回 published），需认证（后台返回全部）
- **筛选：** `?status=published&category_id=1&featured=true&tag_id=3&lang=zh&q=关键词`
- **排序：** `?sort=date&order=desc`，`?sort=sort_order`，`?sort=created_at`
- **分页：** 支持
- **返回：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "slug": "my-project",
        "category": { "id": 1, "slug": "coding", "name": "编程开发" },
        "cover_image_url": "/uploads/works/cover.jpg",
        "gradient": "linear-gradient(135deg, #667eea, #764ba2)",
        "date": "2025-06-01",
        "featured": true,
        "sort_order": 1,
        "status": "published",
        "published_at": "2025-06-01T10:00:00Z",
        "tags": [{ "id": 1, "slug": "react", "name": "React" }],
        "translations": {
          "en": { "title": "My Project", "excerpt": "A cool project" },
          "zh": { "title": "我的项目", "excerpt": "一个很酷的项目" }
        },
        "seo": {
          "title": "My Project - Bol G",
          "description": "...",
          "keywords": "react,project"
        },
        "created_at": "2025-05-01T00:00:00Z",
        "updated_at": "2025-06-01T00:00:00Z"
      }
    ],
    "meta": { "current_page": 1, "per_page": 20, "total_items": 156, "total_pages": 8 }
  }
}
```

### POST /api/v1/works — 创建作品

- **权限：** `works.write`
- **请求：**
```json
{
  "slug": "my-project",
  "category_id": 1,
  "cover_image_url": "/uploads/works/cover.jpg",
  "gradient": "linear-gradient(135deg, #667eea, #764ba2)",
  "date": "2025-06-01",
  "featured": true,
  "sort_order": 1,
  "status": "draft",
  "tag_ids": [1, 3],
  "translations": {
    "en": { "title": "My Project", "excerpt": "A cool project", "content": "..." },
    "zh": { "title": "我的项目", "excerpt": "一个很酷的项目", "content": "..." }
  },
  "seo": {
    "title": "My Project - Bol G",
    "description": "...",
    "keywords": "react,project"
  }
}
```

### GET /api/v1/works/:id — 作品详情

- **权限：** 无需认证（published），需认证（draft 仅作者/管理员）
- **返回：** 完整作品信息

### PUT /api/v1/works/:id — 更新作品

- **权限：** `works.write`
- **行为：** 更新内容 + 自动创建版本记录（content_revisions）

### DELETE /api/v1/works/:id — 删除作品（软删除）

- **权限：** `works.delete`

### PUT /api/v1/works/:id/publish — 发布作品

- **权限：** `works.publish`
- **行为：** 将 status 改为 `published`，设置 `published_at` 为当前时间
- **请求：** 无 body（或可选 `{ "published_at": "2025-07-01T10:00:00Z" }` 定时发布）

### PUT /api/v1/works/:id/unpublish — 撤回发布

- **权限：** `works.publish`
- **行为：** 将 status 改回 `draft`，清除 `published_at`

### GET /api/v1/works/:id/preview — 草稿预览

- **权限：** 需认证（或使用一次性预览 token）
- **返回：** 即使是 draft 状态也返回完整内容
- **使用场景：** 发布前检查效果

### GET /api/v1/works/:id/revisions — 版本历史列表

- **权限：** `works.read`
- **返回：** 版本号 + 修改时间 + 修改人 + 变更说明

### GET /api/v1/works/:id/revisions/:rev_id — 版本详情

- **权限：** `works.read`
- **返回：** 该版本的完整快照

### POST /api/v1/works/:id/revisions/:rev_id/revert — 恢复版本

- **权限：** `works.write`
- **行为：** 用历史快照覆盖当前内容，同时产生新版本记录

---

## 4.8 Posts 模块

接口结构与 Works 完全一致，将路径中的 `works` 替换为 `posts`。

额外接口：

### GET /api/v1/posts/:id/revisions — 同 Works

---

## 4.9 Timeline 模块

### GET /api/v1/timeline — 时间线列表

- **权限：** 无需认证（前台公开 published）
- **排序：** `?sort=date&order=desc`（默认按日期倒序）
- **不支持分页：** 时间线通常数量有限，全量返回
- **返回：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "date": "2025-06-01",
      "icon_name": "Rocket",
      "sort_order": 1,
      "status": "published",
      "translations": {
        "en": { "title": "Launched Portfolio", "description": "..." },
        "zh": { "title": "发布个人网站", "description": "..." }
      }
    }
  ]
}
```

### POST /api/v1/timeline — 创建里程碑

### GET /api/v1/timeline/:id — 里程碑详情

### PUT /api/v1/timeline/:id — 更新里程碑

### DELETE /api/v1/timeline/:id — 删除里程碑

- **权限：** 与其他模块类似

---

## 4.10 About 模块

### GET /api/v1/about — 获取关于页全部内容

- **权限：** 无需认证（前台公开）
- **返回：**
```json
{
  "code": 0,
  "data": {
    "sections": [
      {
        "id": 1,
        "section_key": "bio",
        "sort_order": 1,
        "translations": {
          "en": { "title": "About Me", "content": ["Paragraph 1", "Paragraph 2"] },
          "zh": { "title": "关于我", "content": ["段落1", "段落2"] }
        }
      },
      {
        "id": 2,
        "section_key": "values",
        "sort_order": 2,
        "translations": {
          "en": { "title": "Values", "content": [{"title": "...", "description": "...", "iconName": "Shield"}] },
          "zh": { "title": "价值观", "content": [{"title": "...", "description": "...", "iconName": "Shield"}] }
        }
      },
      {
        "id": 3,
        "section_key": "quote",
        "sort_order": 3,
        "translations": {
          "en": { "title": "Quote", "content": {"text": "Design is...", "author": "Charles Eames"} },
          "zh": { "title": "名言", "content": {"text": "设计是...", "author": "Charles Eames"} }
        }
      },
      {
        "id": 4,
        "section_key": "tech_stack",
        "sort_order": 4,
        "translations": {
          "en": { "title": "Tech Stack", "content": ["React", "Go", "MySQL"] },
          "zh": { "title": "技术栈", "content": ["React", "Go", "MySQL"] }
        }
      }
    ]
  }
}
```

### PUT /api/v1/about/:section_id — 更新区块内容

- **权限：** `about.write`
- **请求：**
```json
{
  "sort_order": 1,
  "translations": {
    "en": { "title": "About Me", "content": ["Updated paragraph"] },
    "zh": { "title": "关于我", "content": ["更新后的段落"] }
  }
}
```

---

## 4.11 Site Settings 模块

### GET /api/v1/settings — 获取全部站点设置

- **权限：** 无需认证（前台获取只读配置），需认证（后台获取全部）
- **返回：**
```json
{
  "code": 0,
  "data": {
    "hero": { "brandText": {"en": "Bol G", "zh": "Bol G"}, ... },
    "navigation": { "links": [...] },
    "footer": { "brandDescription": {...}, ... },
    "seo": { "siteTitle": {...}, ... },
    "general": { "language": "zh", "colorScheme": "dark" }
  }
}
```

### GET /api/v1/settings/:key — 获取单项设置

- **权限：** 无需认证（前台），需认证（后台）
- **路径参数：** `key` = hero | navigation | footer | seo | general

### PUT /api/v1/settings/:key — 更新单项设置

- **权限：** `settings.write`
- **请求：**
```json
{
  "value": {
    "brandText": { "en": "Bol G", "zh": "Bol G" },
    "headingText": { "en": "Hello", "zh": "你好" }
  }
}
```

---

## 4.12 Media 模块

### POST /api/v1/media/upload — 上传文件

- **权限：** `media.write`
- **Content-Type：** `multipart/form-data`
- **请求参数：**
  - `file` — 文件（必填）
  - `folder` — 虚拟文件夹：works | posts | avatars | general（可选，默认 general）
  - `alt_text` — alt 文本（可选）

- **返回：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "filename": "a1b2c3d4.jpg",
    "original_name": "cover-photo.jpg",
    "mime_type": "image/jpeg",
    "file_size": 204800,
    "width": 1920,
    "height": 1080,
    "url": "/uploads/works/a1b2c3d4.jpg",
    "thumbnail_url": "/uploads/works/thumb_a1b2c3d4.jpg",
    "folder": "works",
    "created_at": "2025-06-01T00:00:00Z"
  }
}
```

- **服务端处理：**
  1. 生成 UUID 文件名（防冲突）
  2. 验证文件类型（白名单：jpg, png, gif, webp, svg, mp4）
  3. 验证文件大小（图片 ≤ 10MB，视频 ≤ 100MB）
  4. 图片自动生成缩略图（300x300）
  5. 返回 URL 和元数据

### GET /api/v1/media — 媒体列表

- **权限：** `media.read`
- **筛选：** `?folder=works&mime_type=image/jpeg&q=关键词`
- **分页：** 支持
- **排序：** `?sort=created_at&order=desc`

### GET /api/v1/media/:id — 媒体详情

### DELETE /api/v1/media/:id — 删除媒体

- **权限：** `media.delete`
- **行为：** 删除文件 + 删除数据库记录

### PUT /api/v1/media/:id — 更新媒体信息

- **权限：** `media.write`
- **请求：** `{ "alt_text": "New description", "folder": "posts" }`

---

## 4.13 Search 模块

### GET /api/v1/search — 全局搜索

- **权限：** 无需认证（前台），需认证（后台，结果包含 draft）
- **参数：**
  - `q` — 搜索关键词（必填）
  - `type` — 搜索范围：works | posts | all（可选，默认 all）
  - `lang` — 语言过滤：en | zh（可选）
  - `page`, `per_page` — 分页

- **返回：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "type": "work",
        "id": 1,
        "slug": "my-project",
        "title": "My Project",
        "excerpt": "...match keyword...",
        "url": "/works/my-project",
        "cover_image_url": "...",
        "score": 0.95
      }
    ],
    "meta": { "current_page": 1, "per_page": 20, "total_items": 12, "total_pages": 1 }
  }
}
```

- **实现方式：** MySQL FULLTEXT INDEX + UNION 查询，后续可升级为 Elasticsearch

### GET /api/v1/search/suggest — 搜索建议（自动补全）

- **参数：** `?q=关键词&type=works`
- **返回：** 匹配的标题列表（最多 10 条）

---

## 4.14 Revisions 模块

### GET /api/v1/revisions — 版本历史列表（全局）

- **权限：** 具备对应模块读权限
- **筛选：** `?entity_type=work&entity_id=1&page=1&per_page=20`
- **返回：** 版本列表

### GET /api/v1/revisions/:id — 版本快照详情

- **权限：** 具备对应模块读权限
- **返回：** 完整的 JSON 快照

---

## 4.15 Logs 模块

### GET /api/v1/logs — 审计日志列表

- **权限：** `logs.read`（或 admin 角色）
- **筛选：** `?user_id=1&action=update&entity_type=work&from=2025-01-01&to=2025-12-31`
- **分页：** 支持
- **排序：** 默认按 created_at 倒序

### GET /api/v1/logs/:id — 日志详情

- **返回：** 包含 old_value/new_value 的完整日志

---

## 4.16 Frontend Public API

前台公开接口使用统一前缀，与后台管理接口区分：

| 后台管理 | 前台公开 |
|----------|----------|
| `GET /api/v1/works?status=all` | `GET /api/v1/public/works` |
| `GET /api/v1/posts?status=all` | `GET /api/v1/public/posts` |

### 公开接口列表

```
GET /api/v1/public/works          — 仅返回 published 作品
GET /api/v1/public/works/:slug    — 作品详情（按 slug）
GET /api/v1/public/posts          — 仅返回 published 文章
GET /api/v1/public/posts/:slug    — 文章详情（按 slug）
GET /api/v1/public/categories     — 分类列表
GET /api/v1/public/tags           — 标签列表
GET /api/v1/public/timeline       — 时间线（仅 published）
GET /api/v1/public/about          — 关于页
GET /api/v1/public/settings       — 站点设置（只读）
GET /api/v1/public/search         — 搜索（仅 published 内容）
GET /api/v1/public/sitemap        — 站点地图数据
```

**区别：**
- 公开接口无需认证
- 公开接口自动过滤 `status=published`
- 公开接口不返回敏感字段（如 `created_by`, `updated_by`）
- 公开接口按 `published_at` 排序
- 公开接口返回 slug 作为标识（非 ID）

---

## 4.17 权限中间件设计

```go
// 中间件伪代码
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := extractBearerToken(c.Request.Header.Get("Authorization"))
        if token == "" {
            abortWithCode(c, ErrCodeUnauthorized, "Missing token")
            return
        }
        claims, err := validateAccessToken(token)
        if err != nil {
            abortWithCode(c, ErrCodeTokenInvalid, "Invalid token")
            return
        }
        user := getUserByID(claims.UserID)
        if !user.IsActive {
            abortWithCode(c, ErrCodeAccountDisabled, "Account disabled")
            return
        }
        c.Set("user", user)
        c.Set("permissions", getUserPermissions(user.RoleID))
        c.Next()
    }
}

func RequirePermission(perm string) gin.HandlerFunc {
    return func(c *gin.Context) {
        perms := c.GetStringSlice("permissions")
        if !contains(perms, perm) && !contains(perms, "super.admin") {
            abortWithCode(c, ErrCodeForbidden, "Permission denied")
            return
        }
        c.Next()
    }
}
```

**路由注册示例：**
```go
api := router.Group("/api/v1")
api.POST("/auth/login", authHandler.Login)
api.POST("/auth/refresh", authHandler.Refresh)

// 需要认证的路由
protected := api.Group("", AuthMiddleware())

// 作品管理
works := protected.Group("/works")
works.GET("", RequirePermission("works.read"), workHandler.List)
works.POST("", RequirePermission("works.write"), workHandler.Create)
works.GET("/:id", RequirePermission("works.read"), workHandler.Get)
works.PUT("/:id", RequirePermission("works.write"), workHandler.Update)
works.DELETE("/:id", RequirePermission("works.delete"), workHandler.Delete)
works.PUT("/:id/publish", RequirePermission("works.publish"), workHandler.Publish)
works.PUT("/:id/unpublish", RequirePermission("works.publish"), workHandler.Unpublish)

// 前台公开路由（无需认证）
public := api.Group("/public")
public.GET("/works", publicHandler.ListWorks)
public.GET("/works/:slug", publicHandler.GetWork)
```

---

## 4.18 草稿预览接口

```
GET /api/v1/works/:id/preview?token=preview_xxx
```

**机制：**
1. 管理员在后台点击"预览"
2. 后端生成一次性预览 token（有效期 1 小时，存 Redis 或数据库）
3. 返回预览 URL：`/preview/works/:id?token=preview_xxx`
4. 前端预览页面调用该接口，验证 token 后返回 draft 内容
5. Token 使用后失效（或在有效期内可重复使用）

---

## 4.19 通用文件上传与媒体资源返回

**上传流程：**
1. 客户端发送 `multipart/form-data`
2. 后端验证文件类型、大小
3. 生成 UUID 文件名
4. 保存到存储（本地 `./uploads/` 或 OSS）
5. 图片生成缩略图
6. 写入 `media_assets` 表
7. 返回完整资源信息

**存储路径规划：**
```
uploads/
├── works/           — 作品封面
├── posts/           — 文章配图
├── avatars/         — 用户头像
├── general/         — 其他媒体
└── thumbnails/      — 缩略图
```

---

## 4.20 日志中间件

```go
func AuditLogMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 仅记录写操作
        if c.Request.Method == "GET" {
            c.Next()
            return
        }
        c.Next()

        // 操作完成后记录
        user := getUserFromContext(c)
        createActivityLog(ActivityLog{
            UserID:     user.ID,
            Action:     mapMethodToAction(c.Request.Method),
            EntityType: extractEntityType(c.Request.URL.Path),
            EntityID:   extractEntityID(c.Request.URL.Path),
            NewValue:   getRequestBody(c),
            IPAddress:  c.ClientIP(),
            UserAgent:  c.Request.UserAgent(),
        })
    }
}
```

---

# 5. 技术栈与目录结构建议

## 5.1 推荐技术栈

### 前端（已有）
| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Next.js (App Router) | 15.x |
| UI 库 | React | 19.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 组件 | shadcn/ui (base-ui) | v3 |
| 状态管理 | Zustand | 5.x |
| 表格 | TanStack Table | v8 |
| 图表 | Recharts | 2.x |
| 表单 | React Hook Form + Zod | 7.x / 3.x |
| 图标 | Lucide React | latest |
| 请求 | fetch API / TanStack Query | — / 5.x |
| HTTP 缓存 | TanStack Query (推荐引入) | 5.x |

### 后端（新增）
| 层 | 技术 | 版本 | 理由 |
|----|------|------|------|
| 语言 | Go | 1.22+ | 性能优秀、部署简单、标准库强大 |
| HTTP 框架 | Gin | 1.10+ | 生态成熟、性能好、中间件丰富 |
| ORM | GORM | 1.25+ | Go 最流行的 ORM，支持迁移 |
| 数据库 | MySQL | 8.0+ | 成熟稳定、全文索引、JSON 支持 |
| 认证 | golang-jwt/jwt/v5 | — | 标准 JWT 实现 |
| 验证 | go-playground/validator | v10 | 结构体标签验证 |
| 日志 | zerolog | 1.30+ | 高性能结构化日志 |
| 配置 | Viper | 1.18+ | 灵活的配置管理 |
| 文件处理 | gocv / imaging | — | 图片缩放/裁剪 |
| 缓存 | Redis (可选) | 7.x | 预览 token、Session、限流 |

### 部署
| 层 | 技术 |
|----|------|
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |
| SSL | Let's Encrypt / Certbot |
| CI/CD | GitHub Actions |
| 监控 | Sentry (错误) + Uptime 监控 |
| 存储 | 本地磁盘（MVP） → 阿里云 OSS / AWS S3（扩展） |

### 为什么后端选 Go 而不是 Node.js：
1. **性能：** Go 编译为原生二进制，无 GC 停顿问题
2. **部署：** 单二进制部署，无 node_modules
3. **并发：** Goroutine 天然支持高并发
4. **类型安全：** 编译期捕获更多错误
5. **与前端互补：** 前端用 TypeScript（动态语言），后端用 Go（静态语言），优势互补
6. **个人品牌展示：** 如果博主也做后端开发，Go 是一个很好的技术标签

---

## 5.2 后端目录结构

```
bolg-api/
├── cmd/
│   └── server/
│       └── main.go                  # 程序入口
├── config/
│   ├── config.go                    # 配置结构定义
│   └── config.yaml                  # 默认配置文件
├── internal/
│   ├── handler/                     # HTTP 处理器
│   │   ├── auth.go
│   │   ├── user.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── category.go
│   │   ├── tag.go
│   │   ├── timeline.go
│   │   ├── about.go
│   │   ├── setting.go
│   │   ├── media.go
│   │   ├── search.go
│   │   ├── revision.go
│   │   ├── log.go
│   │   └── public.go               # 前台公开接口
│   ├── middleware/                   # 中间件
│   │   ├── auth.go                  # JWT 认证
│   │   ├── permission.go            # 权限检查
│   │   ├── logger.go               # 请求日志
│   │   ├── cors.go                  # 跨域
│   │   ├── ratelimit.go            # 限流
│   │   └── recovery.go             # panic 恢复
│   ├── model/                       # 数据模型（GORM）
│   │   ├── user.go
│   │   ├── role.go
│   │   ├── permission.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── category.go
│   │   ├── tag.go
│   │   ├── timeline.go
│   │   ├── about.go
│   │   ├── setting.go
│   │   ├── media.go
│   │   ├── revision.go
│   │   └── activity_log.go
│   ├── repository/                  # 数据访问层
│   │   ├── user.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── category.go
│   │   ├── tag.go
│   │   ├── timeline.go
│   │   ├── about.go
│   │   ├── setting.go
│   │   ├── media.go
│   │   ├── revision.go
│   │   └── log.go
│   ├── service/                     # 业务逻辑层
│   │   ├── auth.go
│   │   ├── user.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── category.go
│   │   ├── tag.go
│   │   ├── timeline.go
│   │   ├── about.go
│   │   ├── setting.go
│   │   ├── media.go
│   │   ├── search.go
│   │   ├── revision.go
│   │   └── log.go
│   ├── dto/                         # 请求/响应数据传输对象
│   │   ├── auth.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── category.go
│   │   ├── pagination.go           # 通用分页 DTO
│   │   └── response.go             # 通用响应格式
│   ├── router/                      # 路由定义
│   │   ├── router.go               # 主路由注册
│   │   ├── auth.go
│   │   ├── work.go
│   │   ├── post.go
│   │   ├── public.go
│   │   └── ...
│   └── pkg/                         # 内部工具包
│       ├── jwt/                     # JWT 工具
│       ├── hash/                    # 密码哈希
│       ├── validator/               # 自定义验证
│       ├── storage/                 # 文件存储抽象
│       └── image/                   # 图片处理
├── migrations/
│   ├── 001_create_roles.up.sql
│   ├── 001_create_roles.down.sql
│   ├── 002_create_permissions.up.sql
│   └── ...
├── uploads/                         # 上传文件存储
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
└── Makefile
```

### 前端目录调整（在现有基础上）

```
admin/
├── src/
│   ├── lib/
│   │   ├── api/                     # 新增：API 客户端
│   │   │   ├── client.ts           # fetch 封装、Token 管理
│   │   │   ├── auth.ts             # 登录/登出/刷新
│   │   │   ├── works.ts            # 作品 API
│   │   │   ├── posts.ts            # 文章 API
│   │   │   ├── categories.ts
│   │   │   ├── tags.ts
│   │   │   ├── timeline.ts
│   │   │   ├── about.ts
│   │   │   ├── settings.ts
│   │   │   ├── media.ts
│   │   │   ├── search.ts
│   │   │   └── revisions.ts
│   │   ├── hooks/                   # 新增：React Query hooks
│   │   │   ├── use-works.ts
│   │   │   ├── use-posts.ts
│   │   │   └── ...
│   │   ├── store/
│   │   │   ├── types.ts            # 保留（与 API 响应对齐）
│   │   │   └── auth-store.ts       # 新增：认证状态
│   │   ├── i18n.tsx
│   │   └── validations.ts
│   ├── app/
│   │   ├── (auth)/                  # 新增：登录页
│   │   │   └── login/page.tsx
│   │   ├── (admin)/                 # 后台路由组
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── works/
│   │   │   ├── posts/               # 新增
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── timeline/
│   │   │   ├── about/
│   │   │   ├── settings/
│   │   │   ├── media/               # 新增
│   │   │   ├── search/
│   │   │   └── logs/                # 新增
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── components/
│       ├── layout/
│       ├── data-table/
│       ├── forms/
│       └── dashboard/
```

---

# 6. MVP 与后续扩展建议

## 6.1 MVP 定义（第一阶段，4-6 周）

**目标：** 将现有本地存储版本升级为真正可用的服务端版本。

**必须包含：**
- ✅ Go 后端基础框架
- ✅ MySQL 数据库建表 + 迁移
- ✅ JWT 认证（管理员一个账号）
- ✅ 作品/分类/标签/时间线/关于/站点设置 CRUD
- ✅ 双语存储和读取
- ✅ 图片上传（本地存储）
- ✅ 草稿/发布状态
- ✅ 前台 API 对接
- ✅ 后台 API 对接
- ✅ 基础审计日志（写操作记录）

**可以先做简版：**
- 权限系统先做 admin/viewer 两个角色
- 媒体先本地存储，不走 OSS
- 搜索先用 LIKE 查询
- 没有版本历史
- 没有定时发布
- 没有文章系统

## 6.2 第二阶段（2-3 周）

- 文章/博客系统
- 版本历史 + 回滚
- 草稿预览
- SEO 基础字段
- 前台搜索
- 内容导出/导入

## 6.3 第三阶段（2-3 周）

- 媒体库管理
- 图片裁剪/压缩
- 定时发布
- 批量操作
- Open Graph / Sitemap
- 密码重置邮件
- 前台语言切换

## 6.4 长期扩展

- 专辑/合集
- 视频支持
- CDN 集成
- 2FA 安全
- OAuth 登录
- CI/CD + Docker 自动部署
- 错误监控（Sentry）
- 全文搜索（Elasticsearch）
- 自动保存

## 6.5 迁移策略

从现有 localStorage 方案迁移到服务端：

1. **第一步：** 后端 API 全部写好，用 Postman/测试验证
2. **第二步：** 将 `defaults.ts` 中的数据通过 API 导入数据库
3. **第三步：** 前端创建 `api/` 层，将所有 Zustand store 的操作替换为 API 调用
4. **第四步：** 创建 `auth-store.ts`，管理 Token 和用户状态
5. **第五步：** 添加登录页，未登录重定向
6. **第六步：** 移除 localStorage store，保留 types.ts（与 API DTO 对齐）

## 6.6 替代方案说明

**为什么不用 tRPC：** 前后端分离更灵活，且 Go 不支持 tRPC。如果全栈 TypeScript 可以考虑。

**为什么不用 GraphQL：** 个人品牌站数据关系不复杂，REST 完全够用。GraphQL 增加了不必要的复杂度。

**为什么不用 Prisma：** Go 生态中 GORM 更成熟。如果用 Node.js 后端可以考虑 Prisma。

**关于 Elasticsearch：** MVP 阶段 MySQL FULLTEXT INDEX 足够。内容量到数千条时再考虑升级。
