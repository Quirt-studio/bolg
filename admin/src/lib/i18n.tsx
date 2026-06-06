"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "zh";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

// ── Translations ──
export const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  "sidebar.brand": { en: "Bol G Admin", zh: "Bol G 管理后台" },
  "sidebar.brandSub": { en: "Content Manager", zh: "内容管理" },
  "sidebar.content": { en: "Content", zh: "内容" },
  "sidebar.config": { en: "Configuration", zh: "配置" },
  "sidebar.dashboard": { en: "Dashboard", zh: "仪表盘" },
  "sidebar.works": { en: "Works", zh: "作品" },
  "sidebar.categories": { en: "Categories", zh: "分类" },
  "sidebar.timeline": { en: "Timeline", zh: "时间线" },
  "sidebar.about": { en: "About", zh: "关于" },
  "sidebar.media": { en: "Media", zh: "媒体库" },
  "sidebar.settings": { en: "Settings", zh: "设置" },
  "sidebar.hero": { en: "Hero", zh: "主视觉" },
  "sidebar.navigation": { en: "Navigation", zh: "导航" },
  "sidebar.footer": { en: "Footer", zh: "页脚" },
  "sidebar.translations": { en: "Translations", zh: "翻译" },
  "sidebar.posts": { en: "Posts", zh: "文章" },
  "sidebar.search": { en: "Search", zh: "搜索" },
  "sidebar.revisions": { en: "Revisions", zh: "版本历史" },
  "sidebar.exportImport": { en: "Export/Import", zh: "导出/导入" },

  // Header
  "header.reset": { en: "Reset to defaults", zh: "重置为默认" },
  "header.export": { en: "Export JSON", zh: "导出 JSON" },
  "header.preview": { en: "Preview Site", zh: "预览站点" },
  "header.toggleTheme": { en: "Toggle theme", zh: "切换主题" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", zh: "仪表盘" },
  "dashboard.desc": { en: "Manage your portfolio content from one place.", zh: "在一个地方管理你的作品集内容。" },
  "dashboard.newWork": { en: "New Work", zh: "新建作品" },
  "dashboard.works": { en: "Works", zh: "作品" },
  "dashboard.categories": { en: "Categories", zh: "分类" },
  "dashboard.timeline": { en: "Timeline", zh: "时间线" },
  "dashboard.posts": { en: "Posts", zh: "文章" },
  "dashboard.itemsManaged": { en: "items managed", zh: "个管理项" },
  "dashboard.distribution": { en: "Content Distribution", zh: "内容分布" },
  "dashboard.noWorks": { en: "No works yet", zh: "暂无作品" },
  "dashboard.recentActivity": { en: "Recent Activity", zh: "最近活动" },
  "dashboard.noActivity": { en: "No recent activity", zh: "暂无活动" },
  "dashboard.manage": { en: "Manage", zh: "管理" },
  "dashboard.clickToManage": { en: "Click to manage content", zh: "点击管理内容" },
  "dashboard.recentlyUpdated": { en: "Recently Updated", zh: "最近更新" },

  // Works
  "works.title": { en: "Works", zh: "作品管理" },
  "works.desc": { en: "Manage your portfolio works — articles, projects, and creative pieces.", zh: "管理你的作品集——文章、项目和创意作品。" },
  "works.new": { en: "New Work", zh: "新建作品" },
  "works.search": { en: "Search works...", zh: "搜索作品..." },
  "works.column.title": { en: "Title", zh: "标题" },
  "works.column.category": { en: "Category", zh: "分类" },
  "works.column.date": { en: "Date", zh: "日期" },
  "works.column.featured": { en: "Featured", zh: "精选" },
  "works.column.order": { en: "Order", zh: "排序" },
  "works.edit": { en: "Edit", zh: "编辑" },
  "works.delete": { en: "Delete", zh: "删除" },
  "works.deleteConfirm": { en: "Are you sure you want to delete this work?", zh: "确定要删除这个作品吗？" },
  "works.deleted": { en: "Work deleted", zh: "作品已删除" },
  "works.newTitle": { en: "New Work", zh: "新建作品" },
  "works.newDesc": { en: "Add a new article, project, or creative piece to your portfolio.", zh: "向作品集添加新的文章、项目或创意作品。" },
  "works.editTitle": { en: "Edit Work", zh: "编辑作品" },
  "works.editDesc": { en: "Update the details of your work.", zh: "更新作品的详细信息。" },
  "works.form.content": { en: "Content", zh: "内容" },
  "works.form.title": { en: "Title", zh: "标题" },
  "works.form.excerpt": { en: "Excerpt", zh: "摘要" },
  "works.form.appearance": { en: "Appearance", zh: "外观" },
  "works.form.gradient": { en: "Gradient", zh: "渐变色" },
  "works.form.icon": { en: "Icon", zh: "图标" },
  "works.form.settings": { en: "Settings", zh: "设置" },
  "works.form.tag": { en: "Tag", zh: "标签" },
  "works.form.category": { en: "Category", zh: "分类" },
  "works.form.date": { en: "Date", zh: "日期" },
  "works.form.order": { en: "Order", zh: "排序" },
  "works.form.featured": { en: "Featured", zh: "精选" },
  "works.form.preview": { en: "Preview", zh: "预览" },
  "works.form.create": { en: "Create Work", zh: "创建作品" },
  "works.form.update": { en: "Update Work", zh: "更新作品" },
  "works.form.cancel": { en: "Cancel", zh: "取消" },
  "works.created": { en: "Work created successfully", zh: "作品创建成功" },
  "works.updated": { en: "Work updated successfully", zh: "作品更新成功" },
  "works.notFound": { en: "Work not found", zh: "作品未找到" },

  // Categories
  "categories.title": { en: "Categories", zh: "分类管理" },
  "categories.desc": { en: "Manage the four content categories displayed on your portfolio.", zh: "管理作品集中展示的四个内容分类。" },
  "categories.new": { en: "New Category", zh: "新建分类" },
  "categories.edit": { en: "Edit", zh: "编辑" },
  "categories.editTitle": { en: "Edit Category", zh: "编辑分类" },
  "categories.newTitle": { en: "New Category", zh: "新建分类" },
  "categories.newDesc": { en: "Add a new content category to your portfolio.", zh: "向作品集添加新的内容分类。" },
  "categories.form.content": { en: "Content", zh: "内容" },
  "categories.form.title": { en: "Title", zh: "标题" },
  "categories.form.description": { en: "Description", zh: "描述" },
  "categories.form.tags": { en: "Tags", zh: "标签" },
  "categories.form.appearance": { en: "Appearance", zh: "外观" },
  "categories.form.coverImage": { en: "Cover Image", zh: "封面图片" },
  "categories.form.icon": { en: "Icon", zh: "图标" },
  "categories.form.colorScheme": { en: "Color Scheme", zh: "配色方案" },
  "categories.form.create": { en: "Create Category", zh: "创建分类" },
  "categories.form.update": { en: "Update Category", zh: "更新分类" },
  "categories.form.cancel": { en: "Cancel", zh: "取消" },
  "categories.created": { en: "Category created successfully", zh: "分类创建成功" },
  "categories.updated": { en: "Category updated successfully", zh: "分类更新成功" },
  "categories.deleteConfirm": { en: "Are you sure you want to delete this category?", zh: "确定要删除这个分类吗？" },
  "categories.deleted": { en: "Category deleted successfully", zh: "分类删除成功" },
  "categories.notFound": { en: "Category not found", zh: "分类未找到" },

  // Timeline
  "timeline.title": { en: "Timeline", zh: "时间线管理" },
  "timeline.desc": { en: "Manage your journey milestones.", zh: "管理你的旅程里程碑。" },
  "timeline.new": { en: "New Milestone", zh: "新建里程碑" },
  "timeline.present": { en: "Present", zh: "当前" },
  "timeline.deleteConfirm": { en: "Are you sure you want to delete this milestone?", zh: "确定要删除这个里程碑吗？" },
  "timeline.deleted": { en: "Milestone deleted", zh: "里程碑已删除" },
  "timeline.newTitle": { en: "New Milestone", zh: "新建里程碑" },
  "timeline.newDesc": { en: "Add a new milestone to your journey.", zh: "向你的旅程添加新里程碑。" },
  "timeline.editTitle": { en: "Edit Milestone", zh: "编辑里程碑" },
  "timeline.editDesc": { en: "Update the milestone.", zh: "更新里程碑信息。" },
  "timeline.form.content": { en: "Content", zh: "内容" },
  "timeline.form.title": { en: "Title", zh: "标题" },
  "timeline.form.description": { en: "Description", zh: "描述" },
  "timeline.form.tags": { en: "Tags", zh: "标签" },
  "timeline.form.settings": { en: "Settings", zh: "设置" },
  "timeline.form.year": { en: "Year", zh: "年份" },
  "timeline.form.isPresent": { en: "Is Present", zh: "是否当前" },
  "timeline.form.order": { en: "Order", zh: "排序" },
  "timeline.form.create": { en: "Create Milestone", zh: "创建里程碑" },
  "timeline.form.update": { en: "Update Milestone", zh: "更新里程碑" },
  "timeline.form.cancel": { en: "Cancel", zh: "取消" },
  "timeline.created": { en: "Milestone created successfully", zh: "里程碑创建成功" },
  "timeline.updated": { en: "Milestone updated successfully", zh: "里程碑更新成功" },
  "timeline.notFound": { en: "Milestone not found", zh: "里程碑未找到" },

  // About
  "about.title": { en: "About Page", zh: "关于页面" },
  "about.desc": { en: "Manage your personal bio, values, and tech stack.", zh: "管理个人简介、价值观和技术栈。" },
  "about.save": { en: "Save Changes", zh: "保存更改" },
  "about.saved": { en: "About page updated successfully", zh: "关于页面更新成功" },
  "about.bio": { en: "Bio", zh: "简介" },
  "about.subtitle": { en: "Subtitle", zh: "副标题" },
  "about.paragraph": { en: "Paragraph", zh: "段落" },
  "about.values": { en: "Values", zh: "价值观" },
  "about.value": { en: "Value", zh: "价值观" },
  "about.quote": { en: "Quote", zh: "名言" },
  "about.author": { en: "Author", zh: "作者" },
  "about.techStack": { en: "Tech Stack", zh: "技术栈" },
  "about.technologies": { en: "Technologies", zh: "技术" },

  // Settings
  "settings.title": { en: "Settings", zh: "设置" },
  "settings.desc": { en: "Configure your portfolio site settings.", zh: "配置你的作品集站点设置。" },
  "settings.configure": { en: "Configure", zh: "配置" },

  "settings.hero.title": { en: "Hero Settings", zh: "主视觉设置" },
  "settings.hero.desc": { en: "Configure the hero section of your portfolio.", zh: "配置作品集的主视觉区域。" },
  "settings.hero.save": { en: "Save Changes", zh: "保存更改" },
  "settings.hero.saved": { en: "Hero settings saved", zh: "主视觉设置已保存" },
  "settings.hero.mainContent": { en: "Main Content", zh: "主要内容" },
  "settings.hero.eyebrow": { en: "Eyebrow", zh: "标签" },
  "settings.hero.heroTitle": { en: "Title (supports <em> for italic)", zh: "标题（支持 <em> 斜体）" },
  "settings.hero.subtitle": { en: "Subtitle", zh: "副标题" },
  "settings.hero.ctaButtons": { en: "CTA Buttons", zh: "操作按钮" },
  "settings.hero.cta1": { en: "CTA 1", zh: "按钮 1" },
  "settings.hero.cta1Link": { en: "CTA 1 Link", zh: "按钮 1 链接" },
  "settings.hero.cta2": { en: "CTA 2", zh: "按钮 2" },
  "settings.hero.cta2Link": { en: "CTA 2 Link", zh: "按钮 2 链接" },
  "settings.hero.statistics": { en: "Statistics", zh: "统计数据" },
  "settings.hero.articlesCount": { en: "Articles Count", zh: "文章数量" },
  "settings.hero.projectsCount": { en: "Projects Count", zh: "项目数量" },
  "settings.hero.articlesLabel": { en: "Articles Label", zh: "文章标签" },
  "settings.hero.projectsLabel": { en: "Projects Label", zh: "项目标签" },

  "settings.nav.title": { en: "Navigation", zh: "导航设置" },
  "settings.nav.desc": { en: "Manage the navigation links in your header.", zh: "管理页眉中的导航链接。" },
  "settings.nav.save": { en: "Save Changes", zh: "保存更改" },
  "settings.nav.saved": { en: "Navigation saved", zh: "导航已保存" },
  "settings.nav.links": { en: "Nav Links", zh: "导航链接" },
  "settings.nav.label": { en: "Label", zh: "名称" },
  "settings.nav.link": { en: "Link (href)", zh: "链接地址" },
  "settings.nav.add": { en: "Add Link", zh: "添加链接" },

  "settings.footer.title": { en: "Footer Settings", zh: "页脚设置" },
  "settings.footer.desc": { en: "Configure the footer section of your portfolio.", zh: "配置作品集的页脚区域。" },
  "settings.footer.save": { en: "Save Changes", zh: "保存更改" },
  "settings.footer.saved": { en: "Footer settings saved", zh: "页脚设置已保存" },
  "settings.footer.brand": { en: "Brand", zh: "品牌" },
  "settings.footer.brandDesc": { en: "Brand Description", zh: "品牌描述" },
  "settings.footer.copyright": { en: "Copyright", zh: "版权" },
  "settings.footer.connect": { en: "Connect Links", zh: "社交链接" },
  "settings.footer.contact": { en: "Contact Links", zh: "联系方式" },
  "settings.footer.social": { en: "Social Links", zh: "社交链接" },
  "settings.footer.addLink": { en: "Add Link", zh: "添加链接" },

  "settings.password.title": { en: "Password", zh: "修改密码" },
  "settings.password.desc": { en: "Change your account password.", zh: "修改你的账户密码。" },
  "settings.password.change": { en: "Change Password", zh: "修改密码" },
  "settings.password.old": { en: "Current Password", zh: "当前密码" },
  "settings.password.new": { en: "New Password", zh: "新密码" },
  "settings.password.confirm": { en: "Confirm Password", zh: "确认密码" },
  "settings.password.save": { en: "Change Password", zh: "修改密码" },
  "settings.password.cancel": { en: "Cancel", zh: "取消" },

  "settings.seo.title": { en: "SEO Settings", zh: "SEO 设置" },
  "settings.seo.desc": { en: "Configure site SEO metadata and Open Graph settings.", zh: "配置站点 SEO 元数据和 Open Graph 设置。" },
  "settings.seo.save": { en: "Save Changes", zh: "保存更改" },
  "settings.seo.cancel": { en: "Cancel", zh: "取消" },
  "settings.seo.saved": { en: "SEO settings saved", zh: "SEO 设置已保存" },
  "settings.seo.meta": { en: "Meta Tags", zh: "Meta 标签" },
  "settings.seo.siteTitle": { en: "Site Title", zh: "站点标题" },
  "settings.seo.siteDesc": { en: "Site Description", zh: "站点描述" },
  "settings.seo.og": { en: "Open Graph", zh: "Open Graph" },
  "settings.seo.ogImage": { en: "OG Image URL", zh: "OG 图片地址" },
  "settings.seo.ogImageHint": { en: "Recommended size: 1200x630px", zh: "推荐尺寸：1200x630px" },

  // i18n
  "i18n.title": { en: "Translations", zh: "翻译管理" },
  "i18n.desc": { en: "View all EN/ZH bilingual content across your portfolio.", zh: "查看作品集中所有中英文双语内容。" },
  "i18n.export": { en: "Export JSON", zh: "导出 JSON" },
  "i18n.search": { en: "Search translations...", zh: "搜索翻译..." },
  "i18n.entries": { en: "entries", zh: "条目" },
  "i18n.key": { en: "Key", zh: "键名" },
  "i18n.section": { en: "Section", zh: "分组" },
  "i18n.english": { en: "English", zh: "English" },
  "i18n.chinese": { en: "中文", zh: "中文" },
  "i18n.noResults": { en: "No translations found", zh: "未找到翻译" },
  "i18n.exported": { en: "Translations exported", zh: "翻译已导出" },

  // Media
  "media.title": { en: "Media Library", zh: "媒体库" },
  "media.desc": { en: "Upload and manage your media files.", zh: "上传和管理媒体文件。" },
  "media.upload": { en: "Upload", zh: "上传" },
  "media.search": { en: "Search files...", zh: "搜索文件..." },
  "media.delete": { en: "Delete", zh: "删除" },
  "media.deleteConfirm": { en: "Are you sure you want to delete this file?", zh: "确定要删除这个文件吗？" },
  "media.deleted": { en: "File deleted", zh: "文件已删除" },
  "media.uploaded": { en: "File uploaded", zh: "文件已上传" },
  "media.noFiles": { en: "No files uploaded yet", zh: "暂无上传文件" },
  "media.allTypes": { en: "All Types", zh: "所有类型" },
  "media.images": { en: "Images", zh: "图片" },

  // Common
  "common.reset": { en: "Reset", zh: "重置" },
  "common.resetConfirm": { en: "Are you sure you want to reset all content to defaults? This cannot be undone.", zh: "确定要将所有内容重置为默认值吗？此操作不可撤销。" },
  "common.resetDone": { en: "Content reset to defaults", zh: "内容已重置为默认值" },
  "common.exportDone": { en: "JSON exported successfully", zh: "JSON 导出成功" },
  "common.noResults": { en: "No results.", zh: "无结果。" },
  "common.rowsPerPage": { en: "Rows per page", zh: "每页行数" },
  "common.selected": { en: "of", zh: "/" },
  "common.page": { en: "Page", zh: "第" },
  "common.of": { en: "of", zh: "共" },
  "common.loading": { en: "Loading...", zh: "加载中..." },
  "common.saving": { en: "Saving...", zh: "保存中..." },
  "common.uploading": { en: "Uploading...", zh: "上传中..." },
  "common.searching": { en: "Searching...", zh: "搜索中..." },
  "common.importing": { en: "Importing...", zh: "导入中..." },
  "common.restoring": { en: "Restoring...", zh: "恢复中..." },
  "common.cancel": { en: "Cancel", zh: "取消" },
  "common.save": { en: "Save", zh: "保存" },
  "common.create": { en: "Create", zh: "创建" },
  "common.update": { en: "Update", zh: "更新" },
  "common.delete": { en: "Delete", zh: "删除" },
  "common.back": { en: "Back", zh: "返回" },
  "common.close": { en: "Close", zh: "关闭" },
  "common.previous": { en: "Previous", zh: "上一页" },
  "common.next": { en: "Next", zh: "下一页" },
  "common.all": { en: "All", zh: "全部" },
  "common.publish": { en: "Publish", zh: "发布" },
  "common.unpublish": { en: "Unpublish", zh: "取消发布" },
  "common.schedule": { en: "Schedule", zh: "定时发布" },
  "common.compare": { en: "Compare", zh: "对比" },
  "common.view": { en: "View", zh: "查看" },
  "common.restore": { en: "Restore", zh: "恢复" },
  "common.showDiff": { en: "Show diff", zh: "显示差异" },
  "common.old": { en: "Old", zh: "旧版本" },
  "common.new": { en: "New", zh: "新版本" },
  "common.type": { en: "Type", zh: "类型" },
  "common.video": { en: "Video", zh: "视频" },
  "common.file": { en: "file", zh: "个文件" },
  "common.files": { en: "files", zh: "个文件" },
  "common.user": { en: "User", zh: "用户" },
  "common.minRead": { en: "min read", zh: "分钟阅读" },
  "common.min": { en: "min", zh: "分钟" },
  "common.untitled": { en: "Untitled", zh: "无标题" },
  "common.justNow": { en: "just now", zh: "刚刚" },
  "common.mAgo": { en: "m ago", zh: "分钟前" },
  "common.hAgo": { en: "h ago", zh: "小时前" },
  "common.dAgo": { en: "d ago", zh: "天前" },
  "common.label": { en: "Label", zh: "标签" },
  "common.url": { en: "URL", zh: "URL" },
  "common.brandText": { en: "Brand Text", zh: "品牌文字" },
  "common.heading": { en: "Heading", zh: "标题" },
  "common.subtitle": { en: "Subtitle", zh: "副标题" },
  "common.newLink": { en: "New Link", zh: "新链接" },
  "common.english": { en: "English", zh: "English" },
  "common.selectedLabel": { en: "Selected: ", zh: "已选择：" },

  // Error messages
  "error.loadFailed": { en: "Failed to load", zh: "加载失败" },
  "error.createFailed": { en: "Failed to create", zh: "创建失败" },
  "error.updateFailed": { en: "Failed to update", zh: "更新失败" },
  "error.deleteFailed": { en: "Failed to delete", zh: "删除失败" },
  "error.saveFailed": { en: "Failed to save", zh: "保存失败" },
  "error.publishFailed": { en: "Failed to publish", zh: "发布失败" },
  "error.unpublishFailed": { en: "Failed to unpublish", zh: "取消发布失败" },
  "error.scheduleFailed": { en: "Failed to schedule", zh: "定时发布失败" },
  "error.uploadFailed": { en: "Upload failed", zh: "上传失败" },
  "error.exportFailed": { en: "Failed to download export", zh: "导出下载失败" },
  "error.importFailed": { en: "Import failed", zh: "导入失败" },
  "error.previewFailed": { en: "Failed to load preview", zh: "加载预览失败" },
  "error.previewLinkFailed": { en: "Failed to generate preview link", zh: "生成预览链接失败" },
  "error.fillAllFields": { en: "Please fill in all fields", zh: "请填写所有字段" },
  "error.passwordTooShort": { en: "New password must be at least 6 characters", zh: "新密码至少需要6个字符" },
  "error.passwordMismatch": { en: "Passwords do not match", zh: "密码不一致" },
  "error.nameRequired": { en: "English name is required", zh: "英文名称为必填项" },
  "error.missingId": { en: "Missing id parameter", zh: "缺少 id 参数" },
  "error.notFound": { en: "Not found", zh: "未找到" },

  // Success messages
  "success.published": { en: "Published", zh: "已发布" },
  "success.unpublished": { en: "Unpublished", zh: "已取消发布" },
  "success.scheduled": { en: "Scheduled for publishing", zh: "已定时发布" },
  "success.deleted": { en: "Deleted", zh: "已删除" },
  "success.passwordChanged": { en: "Password changed successfully", zh: "密码修改成功" },
  "success.imported": { en: "Content has been imported successfully", zh: "内容已成功导入" },
  "success.saved": { en: "Translations saved", zh: "翻译已保存" },

  // Confirm messages
  "confirm.deleteWorks": { en: "Delete works?", zh: "确定删除作品？" },
  "confirm.deletePosts": { en: "Delete posts?", zh: "确定删除文章？" },
  "confirm.deleteThisPost": { en: "Delete this post?", zh: "确定删除这篇文章？" },
  "confirm.restoreVersion": { en: "Restore this version?", zh: "确定恢复此版本？" },
  "confirm.restoreDesc": { en: "This will revert the content to a previous version. A backup of the current state will be saved before restoring.", zh: "这将把内容恢复到之前的版本。恢复前会自动备份当前状态。" },

  // Posts
  "posts.title": { en: "Posts", zh: "文章管理" },
  "posts.desc": { en: "Manage your blog posts", zh: "管理你的博客文章" },
  "posts.new": { en: "New Post", zh: "新建文章" },
  "posts.search": { en: "Search posts...", zh: "搜索文章..." },
  "posts.newTitle": { en: "New Post", zh: "新建文章" },
  "posts.newDesc": { en: "Create a new blog post", zh: "创建新的博客文章" },
  "posts.editTitle": { en: "Edit Post", zh: "编辑文章" },
  "posts.editDesc": { en: "Update your blog post", zh: "更新你的博客文章" },
  "posts.postNotFound": { en: "Post not found", zh: "文章未找到" },
  "posts.column.title": { en: "Title", zh: "标题" },
  "posts.column.category": { en: "Category", zh: "分类" },
  "posts.column.read": { en: "Read", zh: "阅读" },
  "posts.column.status": { en: "Status", zh: "状态" },
  "posts.column.date": { en: "Date", zh: "日期" },
  "posts.column.featured": { en: "Featured", zh: "精选" },
  "posts.form.content": { en: "Content", zh: "内容" },
  "posts.form.title": { en: "Title", zh: "标题" },
  "posts.form.excerpt": { en: "Excerpt", zh: "摘要" },
  "posts.form.body": { en: "Body", zh: "正文" },
  "posts.form.contentEn": { en: "Content (EN)", zh: "内容 (EN)" },
  "posts.form.contentZh": { en: "Content (ZH)", zh: "内容 (ZH)" },
  "posts.form.writeEn": { en: "Write your content in English...", zh: "在此输入英文内容..." },
  "posts.form.appearance": { en: "Appearance", zh: "外观" },
  "posts.form.seo": { en: "SEO", zh: "SEO" },
  "posts.form.seoTitle": { en: "SEO Title", zh: "SEO 标题" },
  "posts.form.seoTitleHint": { en: "Page title for search engines", zh: "搜索引擎显示的页面标题" },
  "posts.form.seoDesc": { en: "SEO Description", zh: "SEO 描述" },
  "posts.form.seoDescHint": { en: "Brief description for search results...", zh: "搜索结果中显示的简短描述..." },
  "posts.form.seoKeywords": { en: "SEO Keywords", zh: "SEO 关键词" },
  "posts.form.seoKeywordsHint": { en: "keyword1, keyword2, keyword3", zh: "关键词1, 关键词2, 关键词3" },
  "posts.form.ogImage": { en: "OG Image URL", zh: "OG 图片地址" },
  "posts.form.ogImageHint": { en: "Recommended: 1200x630px for social sharing", zh: "推荐：1200x630px 用于社交分享" },
  "posts.form.settings": { en: "Settings", zh: "设置" },
  "posts.form.readingTime": { en: "Reading Time (min)", zh: "阅读时间（分钟）" },
  "posts.form.order": { en: "Order", zh: "排序" },
  "posts.form.featured": { en: "Featured", zh: "精选" },
  "posts.form.preview": { en: "Preview", zh: "预览" },

  // Schedule dialog
  "schedule.title": { en: "Schedule Publishing", zh: "定时发布" },
  "schedule.dateTime": { en: "Publish Date & Time", zh: "发布日期和时间" },

  // Search
  "search.title": { en: "Search", zh: "搜索" },
  "search.desc": { en: "Search across works and posts", zh: "在作品和文章中搜索" },
  "search.placeholder": { en: "Search by title or excerpt...", zh: "按标题或摘要搜索..." },
  "search.works": { en: "Works", zh: "作品" },
  "search.posts": { en: "Posts", zh: "文章" },
  "search.noResults": { en: "No results found for", zh: "未找到结果：" },

  // Activity logs
  "logs.title": { en: "Activity Logs", zh: "活动日志" },
  "logs.desc": { en: "events recorded", zh: "条记录" },
  "logs.noLogs": { en: "No logs found", zh: "暂无日志" },
  "logs.login": { en: "Login", zh: "登录" },
  "logs.loginFailed": { en: "Login Failed", zh: "登录失败" },
  "logs.logout": { en: "Logout", zh: "登出" },
  "logs.create": { en: "Create", zh: "创建" },
  "logs.update": { en: "Update", zh: "更新" },
  "logs.eventCreate": { en: "Create", zh: "创建" },
  "logs.eventUpdate": { en: "Update", zh: "更新" },
  "logs.eventDelete": { en: "Delete", zh: "删除" },

  // Revisions
  "revisions.title": { en: "Version History", zh: "版本历史" },
  "revisions.desc": { en: "View and restore previous versions of content", zh: "查看和恢复之前的内容版本" },
  "revisions.selectContent": { en: "Select Content", zh: "选择内容" },
  "revisions.selectContentDesc": { en: "Choose a content type and item to view its revision history", zh: "选择内容类型和项目以查看版本历史" },
  "revisions.selectItem": { en: "Select an item...", zh: "请选择..." },
  "revisions.revisions": { en: "Revisions", zh: "版本记录" },
  "revisions.selectTwo": { en: "Select two versions to compare.", zh: "请选择两个版本进行对比。" },
  "revisions.selected": { en: "selected.", zh: "个已选中。" },
  "revisions.noRevisions": { en: "No revisions found for this item.", zh: "该项目暂无版本记录。" },
  "revisions.noSummary": { en: "No summary", zh: "无摘要" },
  "revisions.revisionNum": { en: "Revision #", zh: "版本 #" },
  "revisions.versionComparison": { en: "Version Comparison", zh: "版本对比" },
  "revisions.preview": { en: "Preview", zh: "预览" },

  // Preview
  "preview.mode": { en: "Preview Mode", zh: "预览模式" },
  "preview.close": { en: "Close Preview", zh: "关闭预览" },
  "preview.seoPreview": { en: "SEO Preview", zh: "SEO 预览" },
  "preview.loadingPreview": { en: "Loading preview...", zh: "加载预览中..." },

  // Export/Import
  "export.title": { en: "Export / Import", zh: "导出 / 导入" },
  "export.desc": { en: "Backup your content as JSON or restore from a backup", zh: "将内容备份为 JSON 或从备份恢复" },
  "export.exportCard": { en: "Export", zh: "导出" },
  "export.exportDesc": { en: "Download all content as a JSON backup file", zh: "将所有内容下载为 JSON 备份文件" },
  "export.loadingPreview": { en: "Loading preview...", zh: "加载预览中..." },
  "export.downloadBtn": { en: "Download JSON Backup", zh: "下载 JSON 备份" },
  "export.importCard": { en: "Import", zh: "导入" },
  "export.importDesc": { en: "Restore content from a JSON backup file (upserts by slug)", zh: "从 JSON 备份文件恢复内容（按 slug 更新插入）" },
  "export.importBtn": { en: "Import from JSON", zh: "从 JSON 导入" },
  "export.importSuccess": { en: "Import Successful", zh: "导入成功" },
  "export.importSuccessDesc": { en: "Content has been imported successfully", zh: "内容已成功导入" },

  // Works form extra
  "works.form.contentEn": { en: "Content (EN)", zh: "内容 (EN)" },
  "works.form.contentZh": { en: "Content (ZH)", zh: "内容 (ZH)" },
  "works.form.writeEn": { en: "Write your content in English...", zh: "在此输入英文内容..." },
  "works.form.videoUrl": { en: "Video URL", zh: "视频链接" },
  "works.form.videoUrlHint": { en: "Bilibili, YouTube embed link, or direct video file URL", zh: "B站、YouTube 嵌入链接或直接视频文件 URL" },
  "works.form.link": { en: "Project Link", zh: "项目链接" },
  "works.form.linkHint": { en: "Live demo or repository URL shown in the detail view", zh: "展示在详情弹窗中的在线演示或仓库地址" },
  "works.form.seo": { en: "SEO", zh: "SEO" },
  "works.form.seoTitle": { en: "SEO Title", zh: "SEO 标题" },
  "works.form.seoTitleHint": { en: "Page title for search engines", zh: "搜索引擎显示的页面标题" },
  "works.form.seoDesc": { en: "SEO Description", zh: "SEO 描述" },
  "works.form.seoDescHint": { en: "Brief description for search results...", zh: "搜索结果中显示的简短描述..." },
  "works.form.seoKeywords": { en: "SEO Keywords", zh: "SEO 关键词" },
  "works.form.seoKeywordsHint": { en: "keyword1, keyword2, keyword3", zh: "关键词1, 关键词2, 关键词3" },
  "works.form.ogImage": { en: "OG Image URL", zh: "OG 图片地址" },
  "works.form.ogImageHint": { en: "Recommended: 1200x630px for social sharing", zh: "推荐：1200x630px 用于社交分享" },

  // Sidebar extra
  "sidebar.logs": { en: "Logs", zh: "日志" },
  "sidebar.export": { en: "Export", zh: "导出" },

  // Header extra
  "header.exportFailed": { en: "Export failed", zh: "导出失败" },
  "header.user": { en: "User", zh: "用户" },
  "header.admin": { en: "Admin", zh: "管理员" },
  "header.logout": { en: "Logout", zh: "退出登录" },

  // About extra
  "about.contentEn": { en: "Content (EN)", zh: "内容 (EN)" },
  "about.contentZh": { en: "Content (ZH)", zh: "内容 (ZH)" },
  "about.contentHint": { en: 'Plain text or JSON (e.g. ["paragraph1", "paragraph2"])', zh: '纯文本或 JSON（如 ["段落1", "段落2"]）' },

  // Tag input
  "tag.add": { en: "Add tag...", zh: "添加标签..." },
  "tag.en": { en: "Tag (EN)", zh: "标签 (EN)" },
  "tag.zh": { en: "标签 (ZH)", zh: "标签 (ZH)" },

  // Gradient picker
  "gradient.placeholder": { en: "Or enter custom gradient...", zh: "或输入自定义渐变..." },

  // Icon picker
  "icon.search": { en: "Search icons...", zh: "搜索图标..." },
  "icon.select": { en: "Select icon...", zh: "选择图标..." },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [overrides, setOverrides] = useState<Record<string, Record<Lang, string>>>({});

  useEffect(() => {
    const saved = localStorage.getItem("bolg-admin-lang") as Lang;
    if (saved === "en" || saved === "zh") {
      setLangState(saved);
    }
    try {
      const savedOverrides = JSON.parse(localStorage.getItem("bolg-admin-i18n-overrides") || "{}");
      setOverrides(savedOverrides);
    } catch { /* ignore */ }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("bolg-admin-lang", l);
  };

  const t = (key: string): string => {
    const override = overrides[key];
    if (override && override[lang]) return override[lang];
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
