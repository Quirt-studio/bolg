-- Bol G Personal Brand CMS - Database Init Script
-- Generated for MySQL 5.7+
-- Run: mysql -u root < migrations/001_init.sql

CREATE DATABASE IF NOT EXISTS bolg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bolg;

-- ============================================================
-- Roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    description     VARCHAR(255) DEFAULT NULL,
    is_system       TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    module          VARCHAR(50) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    description     VARCHAR(255) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_permissions_name (name),
    INDEX idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Role-Permission Junction
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         BIGINT UNSIGNED NOT NULL,
    permission_id   BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL,
    email           VARCHAR(255) NOT NULL,
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
    UNIQUE INDEX idx_users_username (username),
    UNIQUE INDEX idx_users_email (email),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_deleted_at (deleted_at),
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL,
    icon_name       VARCHAR(50) DEFAULT NULL,
    color           VARCHAR(20) DEFAULT NULL,
    parent_id       BIGINT UNSIGNED DEFAULT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,
    UNIQUE INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_status (status),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT DEFAULT NULL,
    UNIQUE INDEX idx_cat_trans (category_id, lang),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tag_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag_id          BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    UNIQUE INDEX idx_tag_trans (tag_id, lang),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Works
-- ============================================================
CREATE TABLE IF NOT EXISTS works (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(200) NOT NULL,
    category_id     BIGINT UNSIGNED DEFAULT NULL,
    cover_image_url VARCHAR(500) DEFAULT NULL,
    gradient        VARCHAR(255) DEFAULT NULL,
    date            DATE NOT NULL,
    featured        TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMP NULL DEFAULT NULL,
    seo_title       VARCHAR(200) DEFAULT NULL,
    seo_description VARCHAR(500) DEFAULT NULL,
    seo_keywords    VARCHAR(255) DEFAULT NULL,
    created_by      BIGINT UNSIGNED DEFAULT NULL,
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,
    UNIQUE INDEX idx_works_slug (slug),
    INDEX idx_works_category_id (category_id),
    INDEX idx_works_status (status),
    INDEX idx_works_featured (featured),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    work_id         BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    excerpt         TEXT DEFAULT NULL,
    content         LONGTEXT DEFAULT NULL,
    UNIQUE INDEX idx_work_trans (work_id, lang),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_tags (
    work_id         BIGINT UNSIGNED NOT NULL,
    tag_id          BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (work_id, tag_id),
    INDEX idx_work_tags_tag_id (tag_id),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(200) NOT NULL,
    category_id     BIGINT UNSIGNED DEFAULT NULL,
    cover_image_url VARCHAR(500) DEFAULT NULL,
    reading_time    INT DEFAULT 0,
    featured        TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMP NULL DEFAULT NULL,
    seo_title       VARCHAR(200) DEFAULT NULL,
    seo_description VARCHAR(500) DEFAULT NULL,
    seo_keywords    VARCHAR(255) DEFAULT NULL,
    created_by      BIGINT UNSIGNED DEFAULT NULL,
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,
    UNIQUE INDEX idx_posts_slug (slug),
    INDEX idx_posts_category_id (category_id),
    INDEX idx_posts_status (status),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    excerpt         TEXT DEFAULT NULL,
    content         LONGTEXT DEFAULT NULL,
    UNIQUE INDEX idx_post_trans (post_id, lang),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_tags (
    post_id         BIGINT UNSIGNED NOT NULL,
    tag_id          BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    INDEX idx_post_tags_tag_id (tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Timeline Milestones
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_milestones (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date            DATE NOT NULL,
    icon_name       VARCHAR(50) DEFAULT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'published',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_timeline_date (date),
    INDEX idx_timeline_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timeline_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    milestone_id    BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT DEFAULT NULL,
    UNIQUE INDEX idx_timeline_trans (milestone_id, lang),
    FOREIGN KEY (milestone_id) REFERENCES timeline_milestones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- About Sections
-- ============================================================
CREATE TABLE IF NOT EXISTS about_sections (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_key     VARCHAR(50) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_about_sections_key (section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS about_translations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_id      BIGINT UNSIGNED NOT NULL,
    lang            VARCHAR(2) NOT NULL,
    title           VARCHAR(200) DEFAULT NULL,
    content         JSON NOT NULL,
    UNIQUE INDEX idx_about_trans (section_id, lang),
    FOREIGN KEY (section_id) REFERENCES about_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Site Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL,
    setting_value   JSON NOT NULL,
    updated_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_settings_key (setting_key),
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Media Assets
-- ============================================================
CREATE TABLE IF NOT EXISTS media_assets (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename        VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT UNSIGNED NOT NULL,
    width           INT UNSIGNED DEFAULT 0,
    height          INT UNSIGNED DEFAULT 0,
    url             VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500) DEFAULT NULL,
    alt_text        VARCHAR(255) DEFAULT NULL,
    folder          VARCHAR(100) DEFAULT NULL,
    uploaded_by     BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_mime_type (mime_type),
    INDEX idx_media_folder (folder),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Content Revisions
-- ============================================================
CREATE TABLE IF NOT EXISTS content_revisions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT UNSIGNED NOT NULL,
    revision_number INT NOT NULL,
    snapshot        JSON NOT NULL,
    change_summary  VARCHAR(255) DEFAULT NULL,
    created_by      BIGINT UNSIGNED DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revisions_entity (entity_type, entity_id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Activity Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED DEFAULT NULL,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) DEFAULT NULL,
    entity_id       BIGINT UNSIGNED DEFAULT 0,
    entity_name     VARCHAR(200) DEFAULT NULL,
    description     VARCHAR(500) DEFAULT NULL,
    old_value       JSON DEFAULT NULL,
    new_value       JSON DEFAULT NULL,
    ip_address      VARCHAR(45) DEFAULT NULL,
    user_agent      VARCHAR(500) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_user_id (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
