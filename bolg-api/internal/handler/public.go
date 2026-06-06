package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PublicHandler struct{}

func NewPublicHandler() *PublicHandler {
	return &PublicHandler{}
}

// Sitemap returns XML sitemap for search engines
func (h *PublicHandler) Sitemap(c *gin.Context) {
	type sitemapURL struct {
		Loc        string
		LastMod    string
		ChangeFreq string
		Priority   string
	}

	var urls []sitemapURL

	// Static pages
	urls = append(urls,
		sitemapURL{Loc: "/", ChangeFreq: "weekly", Priority: "1.0"},
		sitemapURL{Loc: "/works", ChangeFreq: "weekly", Priority: "0.9"},
		sitemapURL{Loc: "/posts", ChangeFreq: "weekly", Priority: "0.9"},
		sitemapURL{Loc: "/categories", ChangeFreq: "monthly", Priority: "0.7"},
		sitemapURL{Loc: "/timeline", ChangeFreq: "monthly", Priority: "0.6"},
		sitemapURL{Loc: "/about", ChangeFreq: "monthly", Priority: "0.5"},
	)

	// Published works
	var works []model.Work
	database.DB.Where("status = ?", "published").Find(&works)
	for _, w := range works {
		lastMod := w.UpdatedAt.Format("2006-01-02")
		urls = append(urls, sitemapURL{
			Loc:        "/works/" + w.Slug,
			LastMod:    lastMod,
			ChangeFreq: "monthly",
			Priority:   "0.8",
		})
	}

	// Published posts
	var posts []model.Post
	database.DB.Where("status = ?", "published").Find(&posts)
	for _, p := range posts {
		lastMod := p.UpdatedAt.Format("2006-01-02")
		urls = append(urls, sitemapURL{
			Loc:        "/posts/" + p.Slug,
			LastMod:    lastMod,
			ChangeFreq: "monthly",
			Priority:   "0.8",
		})
	}

	// Categories
	var categories []model.Category
	database.DB.Where("status = ?", "active").Find(&categories)
	for _, cat := range categories {
		urls = append(urls, sitemapURL{
			Loc:        "/categories/" + cat.Slug,
			LastMod:    cat.UpdatedAt.Format("2006-01-02"),
			ChangeFreq: "monthly",
			Priority:   "0.6",
		})
	}

	// Build XML
	xml := `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
	for _, u := range urls {
		xml += "\n\t<url>"
		xml += "\n\t\t<loc>" + u.Loc + "</loc>"
		if u.LastMod != "" {
			xml += "\n\t\t<lastmod>" + u.LastMod + "</lastmod>"
		}
		xml += "\n\t\t<changefreq>" + u.ChangeFreq + "</changefreq>"
		xml += "\n\t\t<priority>" + u.Priority + "</priority>"
		xml += "\n\t</url>"
	}
	xml += "\n</urlset>"

	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.String(http.StatusOK, xml)
}

// Home returns aggregated homepage data in a single call
func (h *PublicHandler) Home(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")

	// Categories
	var categories []model.Category
	database.DB.Where("status = ?", "active").Preload("Translations").Order("sort_order ASC").Find(&categories)

	catList := make([]gin.H, 0, len(categories))
	for _, cat := range categories {
		name := ""
		desc := ""
		for _, t := range cat.Translations {
			if t.Lang == lang {
				name = t.Name
				desc = t.Description
				break
			}
		}
		if name == "" && len(cat.Translations) > 0 {
			name = cat.Translations[0].Name
			desc = cat.Translations[0].Description
		}
		catList = append(catList, gin.H{
			"id":             cat.ID,
			"slug":           cat.Slug,
			"icon_name":      cat.IconName,
			"color":          cat.Color,
			"cover_image_url": cat.CoverImageURL,
			"name":           name,
			"description":    desc,
		})
	}

	// Featured works (published, featured first, then by date)
	var works []model.Work
	database.DB.Where("status = ?", "published").
		Preload("Translations").
		Preload("Category.Translations").
		Preload("Tags.Translations").
		Order("featured DESC, sort_order ASC, date DESC").
		Limit(12).
		Find(&works)

	workList := make([]gin.H, 0, len(works))
	for _, w := range works {
		title := ""
		excerpt := ""
		for _, t := range w.Translations {
			if t.Lang == lang {
				title = t.Title
				excerpt = t.Excerpt
				break
			}
		}
		if title == "" && len(w.Translations) > 0 {
			title = w.Translations[0].Title
			excerpt = w.Translations[0].Excerpt
		}

		catName := ""
		if w.Category != nil {
			for _, t := range w.Category.Translations {
				if t.Lang == lang {
					catName = t.Name
					break
				}
			}
			if catName == "" && len(w.Category.Translations) > 0 {
				catName = w.Category.Translations[0].Name
			}
		}

		tags := make([]gin.H, 0, len(w.Tags))
		for _, tag := range w.Tags {
			tagName := tag.Slug
			for _, t := range tag.Translations {
				if t.Lang == lang {
					tagName = t.Name
					break
				}
			}
			tags = append(tags, gin.H{"id": tag.ID, "slug": tag.Slug, "name": tagName})
		}

		work := gin.H{
			"id":             w.ID,
			"slug":           w.Slug,
			"cover_image_url": w.CoverImageURL,
			"gradient":       w.Gradient,
			"date":           w.Date.Format("2006-01-02"),
			"featured":       w.Featured,
			"title":          title,
			"excerpt":        excerpt,
			"tags":           tags,
		}
		if w.Category != nil {
			work["category"] = gin.H{"id": w.Category.ID, "slug": w.Category.Slug, "name": catName}
		}
		workList = append(workList, work)
	}

	// Timeline milestones
	var milestones []model.TimelineMilestone
	database.DB.Where("status = ?", "published").Preload("Translations").Order("`date` DESC, sort_order ASC").Find(&milestones)

	timelineList := make([]gin.H, 0, len(milestones))
	for _, m := range milestones {
		title := ""
		desc := ""
		for _, t := range m.Translations {
			if t.Lang == lang {
				title = t.Title
				desc = t.Description
				break
			}
		}
		if title == "" && len(m.Translations) > 0 {
			title = m.Translations[0].Title
			desc = m.Translations[0].Description
		}
		timelineList = append(timelineList, gin.H{
			"id":          m.ID,
			"date":        m.Date.Format("2006-01-02"),
			"year":        m.Date.Format("2006"),
			"icon_name":   m.IconName,
			"title":       title,
			"description": desc,
		})
	}

	// About sections
	var sections []model.AboutSection
	database.DB.Preload("Translations").Order("sort_order ASC").Find(&sections)

	aboutList := make([]gin.H, 0, len(sections))
	for _, s := range sections {
		title := ""
		content := model.JSONContent{}
		for _, t := range s.Translations {
			if t.Lang == lang {
				title = t.Title
				content = t.Content
				break
			}
		}
		if title == "" && len(s.Translations) > 0 {
			title = s.Translations[0].Title
			content = s.Translations[0].Content
		}
		aboutList = append(aboutList, gin.H{
			"id":         s.ID,
			"section_key": s.SectionKey,
			"title":      title,
			"content":    content,
		})
	}

	// Site settings
	var settings []model.SiteSetting
	database.DB.Find(&settings)
	settingsMap := make(map[string]model.JSONContent)
	for _, s := range settings {
		settingsMap[s.SettingKey] = s.SettingValue
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"categories": catList,
		"works":      workList,
		"timeline":   timelineList,
		"about":      aboutList,
		"settings":   settingsMap,
	}))
}

// Categories returns active categories with translations
func (h *PublicHandler) Categories(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")

	var categories []model.Category
	database.DB.Where("status = ?", "active").Preload("Translations").Order("sort_order ASC").Find(&categories)

	list := make([]gin.H, 0, len(categories))
	for _, cat := range categories {
		name := ""
		desc := ""
		for _, t := range cat.Translations {
			if t.Lang == lang {
				name = t.Name
				desc = t.Description
				break
			}
		}
		if name == "" && len(cat.Translations) > 0 {
			name = cat.Translations[0].Name
			desc = cat.Translations[0].Description
		}
		list = append(list, gin.H{
			"id":             cat.ID,
			"slug":           cat.Slug,
			"icon_name":      cat.IconName,
			"color":          cat.Color,
			"cover_image_url": cat.CoverImageURL,
			"name":           name,
			"description":    desc,
		})
	}

	c.JSON(http.StatusOK, dto.Success(list))
}

// Works returns published works with pagination
func (h *PublicHandler) Works(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	categorySlug := c.Query("category")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	query := database.DB.Model(&model.Work{}).Where("status = ?", "published")

	if categorySlug != "" {
		query = query.Joins("JOIN categories ON categories.id = works.category_id").
			Where("categories.slug = ?", categorySlug)
	}

	var total int64
	query.Count(&total)

	var works []model.Work
	offset := (page - 1) * limit
	query.Preload("Translations").
		Preload("Category.Translations").
		Preload("Tags.Translations").
		Order("sort_order ASC, date DESC").
		Offset(offset).Limit(limit).
		Find(&works)

	list := make([]gin.H, 0, len(works))
	for _, w := range works {
		title := ""
		excerpt := ""
		for _, t := range w.Translations {
			if t.Lang == lang {
				title = t.Title
				excerpt = t.Excerpt
				break
			}
		}
		if title == "" && len(w.Translations) > 0 {
			title = w.Translations[0].Title
			excerpt = w.Translations[0].Excerpt
		}

		catName := ""
		if w.Category != nil {
			for _, t := range w.Category.Translations {
				if t.Lang == lang {
					catName = t.Name
					break
				}
			}
			if catName == "" && len(w.Category.Translations) > 0 {
				catName = w.Category.Translations[0].Name
			}
		}

		work := gin.H{
			"id":             w.ID,
			"slug":           w.Slug,
			"cover_image_url": w.CoverImageURL,
			"gradient":       w.Gradient,
			"date":           w.Date.Format("2006-01-02"),
			"featured":       w.Featured,
			"title":          title,
			"excerpt":        excerpt,
		}
		if w.Category != nil {
			work["category"] = gin.H{"id": w.Category.ID, "slug": w.Category.Slug, "name": catName}
		}
		list = append(list, work)
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"items": list,
		"total": total,
		"page":  page,
		"limit": limit,
	}))
}

// WorkBySlug returns a single published work
func (h *PublicHandler) WorkBySlug(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")
	slug := c.Param("slug")

	var work model.Work
	err := database.DB.Where("status = ? AND slug = ?", "published", slug).
		Preload("Translations").
		Preload("Category.Translations").
		Preload("Tags.Translations").
		First(&work).Error
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Work not found"))
		return
	}

	title := ""
	excerpt := ""
	content := ""
	for _, t := range work.Translations {
		if t.Lang == lang {
			title = t.Title
			excerpt = t.Excerpt
			content = t.Content
			break
		}
	}
	if title == "" && len(work.Translations) > 0 {
		title = work.Translations[0].Title
		excerpt = work.Translations[0].Excerpt
		content = work.Translations[0].Content
	}

	tags := make([]gin.H, 0, len(work.Tags))
	for _, tag := range work.Tags {
		tagName := tag.Slug
		for _, t := range tag.Translations {
			if t.Lang == lang {
				tagName = t.Name
				break
			}
		}
		tags = append(tags, gin.H{"id": tag.ID, "slug": tag.Slug, "name": tagName})
	}

	result := gin.H{
		"id":             work.ID,
		"slug":           work.Slug,
		"cover_image_url": work.CoverImageURL,
		"video_url":      work.VideoURL,
		"link":           work.Link,
		"gradient":       work.Gradient,
		"date":           work.Date.Format("2006-01-02"),
		"featured":       work.Featured,
		"title":          title,
		"excerpt":        excerpt,
		"content":        content,
		"tags":           tags,
		"seo_title":      work.SeoTitle,
		"seo_description": work.SeoDescription,
	}
	if work.Category != nil {
		catName := ""
		for _, t := range work.Category.Translations {
			if t.Lang == lang {
				catName = t.Name
				break
			}
		}
		if catName == "" && len(work.Category.Translations) > 0 {
			catName = work.Category.Translations[0].Name
		}
		result["category"] = gin.H{"id": work.Category.ID, "slug": work.Category.Slug, "name": catName}
	}

	c.JSON(http.StatusOK, dto.Success(result))
}

// Timeline returns published timeline milestones
func (h *PublicHandler) Timeline(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")

	var milestones []model.TimelineMilestone
	database.DB.Where("status = ?", "published").Preload("Translations").Order("`date` DESC, sort_order ASC").Find(&milestones)

	list := make([]gin.H, 0, len(milestones))
	for _, m := range milestones {
		title := ""
		desc := ""
		for _, t := range m.Translations {
			if t.Lang == lang {
				title = t.Title
				desc = t.Description
				break
			}
		}
		if title == "" && len(m.Translations) > 0 {
			title = m.Translations[0].Title
			desc = m.Translations[0].Description
		}
		list = append(list, gin.H{
			"id":          m.ID,
			"date":        m.Date.Format("2006-01-02"),
			"year":        m.Date.Format("2006"),
			"icon_name":   m.IconName,
			"title":       title,
			"description": desc,
		})
	}

	c.JSON(http.StatusOK, dto.Success(list))
}

// About returns about sections
func (h *PublicHandler) About(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")

	var sections []model.AboutSection
	database.DB.Preload("Translations").Order("sort_order ASC").Find(&sections)

	list := make([]gin.H, 0, len(sections))
	for _, s := range sections {
		title := ""
		content := model.JSONContent{}
		for _, t := range s.Translations {
			if t.Lang == lang {
				title = t.Title
				content = t.Content
				break
			}
		}
		if title == "" && len(s.Translations) > 0 {
			title = s.Translations[0].Title
			content = s.Translations[0].Content
		}
		list = append(list, gin.H{
			"id":          s.ID,
			"section_key": s.SectionKey,
			"title":       title,
			"content":     content,
		})
	}

	c.JSON(http.StatusOK, dto.Success(list))
}

// Settings returns site settings
func (h *PublicHandler) Settings(c *gin.Context) {
	var settings []model.SiteSetting
	database.DB.Find(&settings)

	result := make(map[string]model.JSONContent)
	for _, s := range settings {
		result[s.SettingKey] = s.SettingValue
	}

	c.JSON(http.StatusOK, dto.Success(result))
}

func (h *PublicHandler) Posts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	lang := c.Query("lang")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var posts []model.Post
	var total int64

	query := database.DB.Model(&model.Post{}).Where("status = ?", "published")
	query.Count(&total)

	offset := (page - 1) * perPage
	query.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		Order("published_at DESC").
		Offset(offset).Limit(perPage).
		Find(&posts)

	postService := service.NewPostService()
	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = postService.ToPostResponse(p, lang)
	}

	c.JSON(http.StatusOK, dto.Paginated(responses, total, page, perPage))
}

func (h *PublicHandler) PostBySlug(c *gin.Context) {
	slug := c.Param("slug")
	lang := c.Query("lang")

	var post model.Post
	err := database.DB.Where("slug = ? AND status = ?", slug, "published").
		Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		First(&post).Error
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Post not found"))
		return
	}

	// Increment view count
	database.DB.Model(&post).UpdateColumn("view_count", gorm.Expr("view_count + 1"))
	post.ViewCount++

	postService := service.NewPostService()
	resp := postService.ToPostResponse(post, lang)
	c.JSON(http.StatusOK, dto.Success(resp))
}

// Search searches published works and posts
func (h *PublicHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "q is required"))
		return
	}
	lang := c.DefaultQuery("lang", "en")
	searchType := c.DefaultQuery("type", "all")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	if page < 1 { page = 1 }
	if perPage < 1 || perPage > 50 { perPage = 20 }

	likeQ := "%" + q + "%"
	type result struct {
		Type    string `json:"type"`
		ID      uint   `json:"id"`
		Slug    string `json:"slug"`
		Title   string `json:"title"`
		Excerpt string `json:"excerpt"`
		Date    string `json:"date"`
	}

	var results []result

	if searchType == "all" || searchType == "works" {
		var works []model.Work
		database.DB.Model(&model.Work{}).Where("status = ?", "published").
			Joins("JOIN work_translations wt ON wt.work_id = works.id").
			Where("wt.title LIKE ? OR wt.excerpt LIKE ?", likeQ, likeQ).
			Preload("Translations").Order("published_at DESC").Find(&works)
		for _, w := range works {
			title, excerpt := "", ""
			for _, tr := range w.Translations {
				if tr.Lang == lang { title = tr.Title; excerpt = tr.Excerpt; break }
			}
			if title == "" && len(w.Translations) > 0 {
				title = w.Translations[0].Title; excerpt = w.Translations[0].Excerpt
			}
			d := w.Date.Format("2006-01-02")
			results = append(results, result{"work", w.ID, w.Slug, title, excerpt, d})
		}
	}

	if searchType == "all" || searchType == "posts" {
		var posts []model.Post
		database.DB.Model(&model.Post{}).Where("status = ?", "published").
			Joins("JOIN post_translations pt ON pt.post_id = posts.id").
			Where("pt.title LIKE ? OR pt.excerpt LIKE ?", likeQ, likeQ).
			Preload("Translations").Order("published_at DESC").Find(&posts)
		for _, p := range posts {
			title, excerpt := "", ""
			for _, tr := range p.Translations {
				if tr.Lang == lang { title = tr.Title; excerpt = tr.Excerpt; break }
			}
			if title == "" && len(p.Translations) > 0 {
				title = p.Translations[0].Title; excerpt = p.Translations[0].Excerpt
			}
			d := ""
			if p.PublishedAt != nil { d = p.PublishedAt.Format("2006-01-02") }
			results = append(results, result{"post", p.ID, p.Slug, title, excerpt, d})
		}
	}

	start := (page - 1) * perPage
	end := start + perPage
	if start > len(results) { start = len(results) }
	if end > len(results) { end = len(results) }
	paged := results[start:end]
	if paged == nil { paged = []result{} }

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"items": paged,
		"total": len(results),
		"page":  page,
		"limit": perPage,
	}))
}


// RSSFeed returns an RSS 2.0 XML feed of published works and posts
func (h *PublicHandler) RSSFeed(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")
	siteURL := c.DefaultQuery("site_url", "http://localhost:3000/site")

	type feedItem struct {
		Title       string
		Link        string
		Description string
		PubDate     string
		GUID        string
	}

	var items []feedItem

	// Published works
	var works []model.Work
	database.DB.Where("status = ?", "published").Preload("Translations").Order("published_at DESC").Limit(20).Find(&works)
	for _, w := range works {
		title, excerpt := "", ""
		for _, tr := range w.Translations {
			if tr.Lang == lang { title = tr.Title; excerpt = tr.Excerpt; break }
		}
		if title == "" && len(w.Translations) > 0 {
			title = w.Translations[0].Title; excerpt = w.Translations[0].Excerpt
		}
		pubDate := w.UpdatedAt.Format("Mon, 02 Jan 2006 15:04:05 -0700")
		if w.PublishedAt != nil {
			pubDate = w.PublishedAt.Format("Mon, 02 Jan 2006 15:04:05 -0700")
		}
		items = append(items, feedItem{
			Title: title, Link: siteURL + "/works/" + w.Slug,
			Description: excerpt, PubDate: pubDate, GUID: siteURL + "/works/" + w.Slug,
		})
	}

	// Published posts
	var posts []model.Post
	database.DB.Where("status = ?", "published").Preload("Translations").Order("published_at DESC").Limit(20).Find(&posts)
	for _, p := range posts {
		title, excerpt := "", ""
		for _, tr := range p.Translations {
			if tr.Lang == lang { title = tr.Title; excerpt = tr.Excerpt; break }
		}
		if title == "" && len(p.Translations) > 0 {
			title = p.Translations[0].Title; excerpt = p.Translations[0].Excerpt
		}
		pubDate := p.UpdatedAt.Format("Mon, 02 Jan 2006 15:04:05 -0700")
		if p.PublishedAt != nil {
			pubDate = p.PublishedAt.Format("Mon, 02 Jan 2006 15:04:05 -0700")
		}
		items = append(items, feedItem{
			Title: title, Link: siteURL + "/posts/" + p.Slug,
			Description: excerpt, PubDate: pubDate, GUID: siteURL + "/posts/" + p.Slug,
		})
	}

	xml := "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\">\n<channel>\n\t<title>Bol G</title>\n\t<link>" + siteURL + "</link>\n\t<description>Bol G Portfolio &amp; Blog</description>\n\t<language>" + lang + "</language>"
	for _, item := range items {
		xml += "\n\t<item>"
		xml += "\n\t\t<title><![CDATA[" + item.Title + "]]></title>"
		xml += "\n\t\t<link>" + item.Link + "</link>"
		xml += "\n\t\t<description><![CDATA[" + item.Description + "]]></description>"
		xml += "\n\t\t<pubDate>" + item.PubDate + "</pubDate>"
		xml += "\n\t\t<guid>" + item.GUID + "</guid>"
		xml += "\n\t</item>"
	}
	xml += "\n</channel>\n</rss>"

	c.Header("Content-Type", "application/rss+xml; charset=utf-8")
	c.String(200, xml)
}
