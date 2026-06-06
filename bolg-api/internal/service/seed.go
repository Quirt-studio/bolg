package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"bolg-api/internal/pkg/hash"
	"log"
	"time"
)

func Seed() {
	db := database.DB

	// Check if already seeded
	var roleCount int64
	db.Model(&model.Role{}).Count(&roleCount)
	if roleCount == 0 {
		log.Println("Seeding database...")

		// Create roles
		adminRole := model.Role{Name: "admin", DisplayName: "Administrator", Description: "Full access", IsSystem: true}
		editorRole := model.Role{Name: "editor", DisplayName: "Editor", Description: "Content editor", IsSystem: true}
		viewerRole := model.Role{Name: "viewer", DisplayName: "Viewer", Description: "Read-only", IsSystem: true}
		db.Create(&adminRole)
		db.Create(&editorRole)
		db.Create(&viewerRole)

		// Create permissions
		modules := []string{"works", "posts", "categories", "tags", "timeline", "about", "media", "settings", "users", "logs"}
		actions := []string{"read", "write", "delete", "publish", "manage"}

		var allPerms []model.Permission
		for _, m := range modules {
			for _, a := range actions {
				p := model.Permission{
					Name:        m + "." + a,
					Module:      m,
					Action:      a,
					Description: m + " " + a + " permission",
				}
				db.Create(&p)
				allPerms = append(allPerms, p)
			}
		}

		// Admin gets all permissions
		db.Model(&adminRole).Association("Permissions").Append(&allPerms)

		// Editor gets read, write, publish (not delete, manage)
		for _, p := range allPerms {
			if p.Action == "read" || p.Action == "write" || p.Action == "publish" {
				db.Model(&editorRole).Association("Permissions").Append(&p)
			}
		}

		// Viewer gets read only
		for _, p := range allPerms {
			if p.Action == "read" {
				db.Model(&viewerRole).Association("Permissions").Append(&p)
			}
		}

		// Create admin user
		hashedPassword, _ := hash.HashPassword("admin123")
		adminUser := model.User{
			Username:     "admin",
			Email:        "admin@bolg.com",
			PasswordHash: hashedPassword,
			DisplayName:  "Administrator",
			RoleID:       adminRole.ID,
			IsActive:     true,
		}
		db.Create(&adminUser)
	}

	// Seed categories if empty
	var catCount int64
	db.Model(&model.Category{}).Count(&catCount)
	if catCount == 0 {
		log.Println("Seeding categories...")
		categories := []struct {
			slug   string
			icon   string
			color  string
			enName string
			enDesc string
			zhName string
			zhDesc string
		}{
			{"coding", "Code2", "#667eea", "Coding", "Full-stack web development, AI integration, system architecture.", "编程开发", "全栈 Web 开发、AI 集成、系统架构。"},
			{"animation", "Film", "#f093fb", "Animation", "Animation production, video editing, motion graphics.", "动画制作", "动画制作、视频剪辑、动态图形。"},
			{"lifestyle", "Heart", "#4facfe", "Lifestyle", "Calligraphy, cocktail crafting, home cooking, and daily aesthetics.", "生活日常", "书法、调酒、家常烹饪与日常美学。"},
			{"creative", "Palette", "#43e97b", "Creative", "Visual design, creative coding, generative art.", "创意设计", "视觉设计、创意编程、生成艺术。"},
		}

		for i, cat := range categories {
			c := model.Category{
				Slug:      cat.slug,
				IconName:  cat.icon,
				Color:     cat.color,
				SortOrder: i + 1,
				Status:    "active",
			}
			db.Create(&c)
			db.Create(&model.CategoryTranslation{CategoryID: c.ID, Lang: "en", Name: cat.enName, Description: cat.enDesc})
			db.Create(&model.CategoryTranslation{CategoryID: c.ID, Lang: "zh", Name: cat.zhName, Description: cat.zhDesc})
		}
	}

	// Seed site settings if empty
	var settingCount int64
	db.Model(&model.SiteSetting{}).Count(&settingCount)
	if settingCount == 0 {
		log.Println("Seeding site settings...")
		settings := []struct {
			key   string
			value model.JSONContent
		}{
			{"hero", model.JSONContent{
				"brandText":    model.JSONContent{"en": "Bol G", "zh": "Bol G"},
				"headingText":  model.JSONContent{"en": "Building creative things", "zh": "创造有趣的事物"},
				"subtitleText": model.JSONContent{"en": "A multidisciplinary creator exploring the intersection of code, art, and life.", "zh": "一个探索代码、艺术与生活交汇的跨领域创作者。"},
				"primaryCTA":   model.JSONContent{"text": model.JSONContent{"en": "View Works", "zh": "查看作品"}, "href": "/works"},
				"stats": []model.JSONContent{
					{"value": "3+", "label": model.JSONContent{"en": "Years Experience", "zh": "年经验"}},
					{"value": "50+", "label": model.JSONContent{"en": "Projects", "zh": "个项目"}},
				},
			}},
			{"navigation", model.JSONContent{
				"links": []model.JSONContent{
					{"label": model.JSONContent{"en": "Works", "zh": "作品"}, "href": "/works", "order": 1},
					{"label": model.JSONContent{"en": "About", "zh": "关于"}, "href": "/about", "order": 2},
					{"label": model.JSONContent{"en": "Contact", "zh": "联系"}, "href": "/contact", "order": 3},
				},
			}},
			{"footer", model.JSONContent{
				"brandDescription": model.JSONContent{"en": "Personal brand portfolio", "zh": "个人品牌作品集"},
				"socialLinks":      []model.JSONContent{},
				"contactInfo":      model.JSONContent{"email": "hello@bolg.com"},
			}},
			{"seo", model.JSONContent{
				"siteTitle":       model.JSONContent{"en": "Bol G - Creative Developer", "zh": "Bol G - 创意开发者"},
				"siteDescription": model.JSONContent{"en": "Personal portfolio and blog", "zh": "个人作品集和博客"},
			}},
			{"general", model.JSONContent{
				"language":    "zh",
				"colorScheme": "dark",
			}},
		}

		for _, s := range settings {
			db.Create(&model.SiteSetting{SettingKey: s.key, SettingValue: s.value})
		}
	}

	// Seed timeline milestones if empty
	var timelineCount int64
	db.Model(&model.TimelineMilestone{}).Count(&timelineCount)
	if timelineCount == 0 {
		log.Println("Seeding timeline milestones...")
		milestones := []struct {
			dateStr string
			enTitle string
			enDesc  string
			zhTitle string
			zhDesc  string
		}{
			{"2026-01-01", "Full-Stack Creative Studio", "Building a personal creative studio that merges development, design, and content creation.", "全栈创意工作室", "构建一个融合开发、设计与内容创作的个人创意工作室。"},
			{"2025-06-01", "Deep Dive into Animation & Motion", "Spent six months learning motion design principles, GSAP, Framer Motion, and After Effects.", "深入动画与动态设计", "花六个月学习动态设计原理、GSAP、Framer Motion 与 After Effects。"},
			{"2024-01-01", "Content & Community Building", "Started writing consistently about the intersection of technology and creative practice.", "内容创作与社群建设", "开始持续撰写关于技术与创意实践交汇的文章。"},
			{"2023-01-01", "First Full-Stack Product", "Designed, developed, and shipped a SaaS product from scratch.", "第一个全栈产品", "从零开始设计、开发并发布了一个 SaaS 产品。"},
			{"2022-01-01", "The Beginning", "Wrote the first line of code. Discovered that programming is not just logic — it's a medium for creative expression.", "一切的开始", "写下了第一行代码。发现编程不仅是逻辑——它是一种创意表达的媒介。"},
		}

		for _, m := range milestones {
			milestone := model.TimelineMilestone{
				Date:      parseDate(m.dateStr),
				Status:    "published",
				SortOrder: 0,
			}
			db.Create(&milestone)
			db.Create(&model.TimelineTranslation{MilestoneID: milestone.ID, Lang: "en", Title: m.enTitle, Description: m.enDesc})
			db.Create(&model.TimelineTranslation{MilestoneID: milestone.ID, Lang: "zh", Title: m.zhTitle, Description: m.zhDesc})
		}
	}

	// Seed about sections if empty
	var aboutCount int64
	db.Model(&model.AboutSection{}).Count(&aboutCount)
	if aboutCount == 0 {
		log.Println("Seeding about sections...")
		section := model.AboutSection{
			SectionKey: "bio",
			SortOrder:  1,
		}
		db.Create(&section)

		enContent := model.JSONContent{
			"title": "Technology is a craft. Life is the canvas.",
			"body":  "I'm a multi-disciplinary creator working at the intersection of software development, visual arts, and everyday aesthetics. This site is my digital studio — a space where engineering meets art.",
		}
		zhContent := model.JSONContent{
			"title": "技术是手艺，生活是画布。",
			"body":  "我是一名跨领域创作者，工作在软件开发、视觉艺术与日常美学的交汇处。这个网站是我的数字工作室——一个工程与艺术交汇的空间。",
		}
		db.Create(&model.AboutTranslation{SectionID: section.ID, Lang: "en", Title: "The Person Behind the Work", Content: enContent})
		db.Create(&model.AboutTranslation{SectionID: section.ID, Lang: "zh", Title: "作品背后的人", Content: zhContent})
	}

	// Seed sample works if empty
	var workCount int64
	db.Model(&model.Work{}).Count(&workCount)
	if workCount == 0 {
		log.Println("Seeding sample works...")

		// Get first user for created_by
		var user model.User
		db.First(&user)

		works := []struct {
			slug       string
			catID      uint
			gradient   string
			dateStr    string
			featured   bool
			enTitle    string
			enExcerpt  string
			zhTitle    string
			zhExcerpt  string
		}{
			{"creative-portfolio-nextjs", 1, "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)", "2026-05-15", true,
				"Building a Creative Portfolio with Next.js and Framer Motion",
				"A deep dive into building an immersive, animation-rich personal portfolio that balances performance with visual storytelling.",
				"用 Next.js 和 Framer Motion 构建创意作品集",
				"深入探讨如何构建一个沉浸式的、动画丰富的个人作品集，在性能与视觉叙事之间取得平衡。"},
			{"art-of-slowness", 3, "linear-gradient(135deg, #2D1B69 0%, #11998E 100%)", "2026-05-08", true,
				"The Art of Slowness in a Fast World",
				"Why deliberate pacing matters in both creative work and daily life.",
				"快世界中的慢艺术",
				"为什么在创意工作和日常生活中，有意识的节奏至关重要。"},
			{"api-design-products", 1, "linear-gradient(135deg, #434343 0%, #000000 100%)", "2026-04-22", true,
				"Designing APIs That Feel Like Products",
				"Treating developer experience as a first-class design concern.",
				"设计像产品一样的 API",
				"将开发者体验视为一等公民的设计考量。"},
			{"old-fashioned-rethink", 3, "linear-gradient(135deg, #4A2C2A 0%, #8B6F4E 100%)", "2026-04-10", false,
				"Weekend Cocktails: The Old Fashioned, Rethought",
				"A personal take on the classic, with homemade bitters and local honey.",
				"周末调酒：重新构想古典鸡尾酒",
				"用自制苦精和本地蜂蜜，对经典配方的个人诠释。"},
			{"motion-design-ui", 4, "linear-gradient(135deg, #1B2838 0%, #2A4858 100%)", "2026-03-28", true,
				"Motion Design: Breathing Life into Static Interfaces",
				"Principles of meaningful animation in UI — micro-interactions that tell a story.",
				"动态设计：为静态界面注入生命",
				"UI 中有意义动画的原则——讲述故事的微交互。"},
		}

		for _, w := range works {
			date, _ := time.Parse("2006-01-02", w.dateStr)
			work := model.Work{
				Slug:       w.slug,
				CategoryID: &w.catID,
				Gradient:   w.gradient,
				Date:       date,
				Featured:   w.featured,
				Status:     "published",
				SortOrder:  0,
				CreatedBy:  &user.ID,
				UpdatedBy:  &user.ID,
			}
			publishedAt := date
			work.PublishedAt = &publishedAt
			db.Create(&work)
			db.Create(&model.WorkTranslation{WorkID: work.ID, Lang: "en", Title: w.enTitle, Excerpt: w.enExcerpt, Content: "<p>" + w.enExcerpt + "</p>"})
			db.Create(&model.WorkTranslation{WorkID: work.ID, Lang: "zh", Title: w.zhTitle, Excerpt: w.zhExcerpt, Content: "<p>" + w.zhExcerpt + "</p>"})
		}
	}

	log.Println("Database seeding complete.")
}

func parseDate(s string) time.Time {
	t, _ := time.Parse("2006-01-02", s)
	return t
}
