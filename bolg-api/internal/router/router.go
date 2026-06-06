package router

import (
	"bolg-api/internal/handler"
	"bolg-api/internal/middleware"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func Setup(mode string) *gin.Engine {
	gin.SetMode(mode)
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.AuditLogger())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// Serve index.html (public portfolio page)
	r.GET("/", func(c *gin.Context) {
		wd, _ := os.Getwd()
		projectRoot := filepath.Dir(wd)
		c.File(filepath.Join(projectRoot, "index.html"))
	})

	// Serve works.html (all works page)
	r.GET("/works", func(c *gin.Context) {
		wd, _ := os.Getwd()
		projectRoot := filepath.Dir(wd)
		c.File(filepath.Join(projectRoot, "works.html"))
	})

	// API v1
	api := r.Group("/api/v1")
	// Public routes
	publicHandler := handler.NewPublicHandler()
	public := api.Group("/public")
	{
		public.GET("/sitemap", publicHandler.Sitemap)
		public.GET("/home", publicHandler.Home)
		public.GET("/categories", publicHandler.Categories)
		public.GET("/works", publicHandler.Works)
		public.GET("/works/:slug", publicHandler.WorkBySlug)
		public.GET("/posts", publicHandler.Posts)
		public.GET("/posts/:slug", publicHandler.PostBySlug)
		public.GET("/timeline", publicHandler.Timeline)
		public.GET("/about", publicHandler.About)
		public.GET("/settings", publicHandler.Settings)
		public.GET("/search", publicHandler.Search)
		public.GET("/rss", publicHandler.RSSFeed)
	}

	// Auth routes (no auth required)
	authHandler := handler.NewAuthHandler()
	auth := api.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
	}

	// Protected routes
	protected := api.Group("", middleware.AuthRequired())
	{
		// Auth (protected)
		protected.POST("/auth/logout", authHandler.Logout)
		protected.GET("/auth/me", authHandler.Me)
		protected.PUT("/auth/password", authHandler.ChangePassword)
		// Search
		searchHandler := handler.NewSearchHandler()
		protected.GET("/search", searchHandler.Search)

		// Works
		workHandler := handler.NewWorkHandler()
		works := protected.Group("/works")
		{
			works.GET("", middleware.RequirePermission("works.read"), workHandler.List)
			works.POST("", middleware.RequirePermission("works.write"), workHandler.Create)
			works.GET("/:id", middleware.RequirePermission("works.read"), workHandler.Get)
			works.PUT("/:id", middleware.RequirePermission("works.write"), workHandler.Update)
			works.DELETE("/:id", middleware.RequirePermission("works.delete"), workHandler.Delete)
			works.PUT("/:id/publish", middleware.RequirePermission("works.publish"), workHandler.Publish)
			works.PUT("/:id/unpublish", middleware.RequirePermission("works.publish"), workHandler.Unpublish)
			works.POST("/batch-delete", middleware.RequirePermission("works.delete"), workHandler.BatchDelete)
			works.PUT("/batch-publish", middleware.RequirePermission("works.publish"), workHandler.BatchPublish)
			works.PUT("/batch-unpublish", middleware.RequirePermission("works.publish"), workHandler.BatchUnpublish)
			works.PUT("/:id/schedule", middleware.RequirePermission("works.publish"), workHandler.SchedulePublish)
		}

		// Posts
		postHandler := handler.NewPostHandler()
		posts := protected.Group("/posts")
		{
			posts.GET("", middleware.RequirePermission("posts.read"), postHandler.List)
			posts.POST("", middleware.RequirePermission("posts.write"), postHandler.Create)
			posts.GET("/:id", middleware.RequirePermission("posts.read"), postHandler.Get)
			posts.PUT("/:id", middleware.RequirePermission("posts.write"), postHandler.Update)
			posts.DELETE("/:id", middleware.RequirePermission("posts.delete"), postHandler.Delete)
			posts.PUT("/:id/publish", middleware.RequirePermission("posts.publish"), postHandler.Publish)
			posts.PUT("/:id/unpublish", middleware.RequirePermission("posts.publish"), postHandler.Unpublish)
			posts.POST("/batch-delete", middleware.RequirePermission("posts.delete"), postHandler.BatchDelete)
			posts.PUT("/batch-publish", middleware.RequirePermission("posts.publish"), postHandler.BatchPublish)
			posts.PUT("/batch-unpublish", middleware.RequirePermission("posts.publish"), postHandler.BatchUnpublish)
			posts.PUT("/:id/schedule", middleware.RequirePermission("posts.publish"), postHandler.SchedulePublish)
		}

		// Categories
		categoryHandler := handler.NewCategoryHandler()
		categories := protected.Group("/categories")
		{
			categories.GET("", categoryHandler.List)
			categories.POST("", middleware.RequirePermission("categories.write"), categoryHandler.Create)
			categories.GET("/:id", categoryHandler.Get)
			categories.PUT("/:id", middleware.RequirePermission("categories.write"), categoryHandler.Update)
			categories.DELETE("/:id", middleware.RequirePermission("categories.delete"), categoryHandler.Delete)
			categories.POST("/batch-delete", middleware.RequirePermission("categories.delete"), categoryHandler.BatchDelete)
		}

		// Tags
		tagHandler := handler.NewTagHandler()
		tags := protected.Group("/tags")
		{
			tags.GET("", tagHandler.List)
			tags.POST("", middleware.RequirePermission("tags.write"), tagHandler.Create)
			tags.GET("/:id", tagHandler.Get)
			tags.PUT("/:id", middleware.RequirePermission("tags.write"), tagHandler.Update)
			tags.DELETE("/:id", middleware.RequirePermission("tags.delete"), tagHandler.Delete)
			tags.POST("/batch-delete", middleware.RequirePermission("tags.delete"), tagHandler.BatchDelete)
		}

		// Timeline
		timelineHandler := handler.NewTimelineHandler()
		timeline := protected.Group("/timeline")
		{
			timeline.GET("", timelineHandler.List)
			timeline.POST("", middleware.RequirePermission("timeline.write"), timelineHandler.Create)
			timeline.GET("/:id", timelineHandler.Get)
			timeline.PUT("/:id", middleware.RequirePermission("timeline.write"), timelineHandler.Update)
			timeline.DELETE("/:id", middleware.RequirePermission("timeline.delete"), timelineHandler.Delete)
		}

		// About
		aboutHandler := handler.NewAboutHandler()
		about := protected.Group("/about")
		{
			about.GET("", aboutHandler.GetSections)
			about.PUT("/:id", middleware.RequirePermission("about.write"), aboutHandler.UpdateSection)
		}

		// Settings
		settingHandler := handler.NewSettingHandler()
		settings := protected.Group("/settings")
		{
			settings.GET("", settingHandler.GetAll)
			settings.GET("/:key", settingHandler.GetByKey)
			settings.PUT("/:key", middleware.RequirePermission("settings.write"), settingHandler.Update)
		}

		// Media
		mediaHandler := handler.NewMediaHandler()
		media := protected.Group("/media")
		{
			media.GET("", mediaHandler.List)
			media.POST("/upload", mediaHandler.Upload)
			media.GET("/:id", mediaHandler.Get)
			media.DELETE("/:id", mediaHandler.Delete)
		}

		// Revision routes
		revisionHandler := handler.NewRevisionHandler()
		{
			protected.GET("/revisions", middleware.RequirePermission("works.read"), revisionHandler.List)
			protected.GET("/revisions/:id", middleware.RequirePermission("works.read"), revisionHandler.Get)
			protected.POST("/revisions/:id/rollback", middleware.RequirePermission("works.write"), revisionHandler.Rollback)
		}

		// Export/Import routes
		exportHandler := handler.NewExportHandler()
		{
			protected.GET("/export", middleware.RequirePermission("works.read"), exportHandler.Export)
			protected.GET("/export/preview", middleware.RequirePermission("works.read"), exportHandler.ExportPreview)
			protected.POST("/import", middleware.RequirePermission("works.write"), exportHandler.Import)
		}

		// Preview token generation (protected)
		previewHandler := handler.NewPreviewHandler()
		protected.POST("/preview/token", middleware.RequirePermission("works.read"), previewHandler.GenerateToken)

		// Log routes
		logHandler := handler.NewLogHandler()
		protected.GET("/logs", middleware.RequirePermission("works.read"), logHandler.List)
	}

	// Preview data endpoints (no auth required - handler checks token internally)
	previewHandler2 := handler.NewPreviewHandler()
	api.GET("/preview/work/:id", previewHandler2.WorkPreview)
	api.GET("/preview/post/:id", previewHandler2.PostPreview)

	return r
}
