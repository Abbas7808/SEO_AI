-- ==========================================================
-- AI Website SEO Auditor Database Schema
-- Compatible with MySQL 5.7+ / 8.0+ and MariaDB 10.3+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `ai_seo_auditor` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ai_seo_auditor`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `agency_name` VARCHAR(255) NULL DEFAULT 'SEO Pro Agency',
  `agency_logo_url` VARCHAR(2048) NULL,
  `agency_email` VARCHAR(255) NULL,
  `agency_phone` VARCHAR(50) NULL,
  `agency_color` VARCHAR(20) NULL DEFAULT '#6366f1',
  `agency_tagline` VARCHAR(255) NULL,
  `default_currency` VARCHAR(10) NULL DEFAULT 'PKR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Clients Table (CRM)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `company` VARCHAR(255) NULL,
  `website_url` VARCHAR(2048) NULL,
  `notes` TEXT NULL,
  `avatar_color` VARCHAR(20) DEFAULT '#6366f1',
  `status` ENUM('active','paused','churned','lead') NOT NULL DEFAULT 'active',
  `monthly_fee` DECIMAL(12,2) DEFAULT 0,
  `currency` VARCHAR(10) DEFAULT 'PKR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_clients_user_id` (`user_id`),
  INDEX `idx_clients_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `website_url` VARCHAR(2048) NOT NULL,
  `target_keywords` TEXT NULL,
  `status` ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_projects_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Audits Table
CREATE TABLE IF NOT EXISTS `audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `client_id` INT NULL,
  `project_id` INT NULL,
  `website_url` VARCHAR(2048) NOT NULL,
  `seo_score` INT DEFAULT 0,
  `mobile_score` INT DEFAULT 0,
  `desktop_score` INT DEFAULT 0,
  `status` ENUM('pending', 'crawling', 'analyzing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `pages_crawled` INT DEFAULT 0,
  `max_pages` INT DEFAULT 20,
  `scan_mode` ENUM('online', 'local') NOT NULL DEFAULT 'online',
  `project_path` VARCHAR(1024) NULL,
  `target_keyword` VARCHAR(255) NULL,
  `business_name` VARCHAR(255) NULL,
  `business_location` VARCHAR(255) NULL,
  `technical_score` INT DEFAULT 0,
  `onpage_score` INT DEFAULT 0,
  `content_score` INT DEFAULT 0,
  `performance_score` INT DEFAULT 0,
  `structured_data_score` INT DEFAULT 0,
  `social_score` INT DEFAULT 0,
  `local_score` INT DEFAULT 0,
  `ai_summary` TEXT NULL,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_audits_user_id` (`user_id`),
  INDEX `idx_audits_client_id` (`client_id`),
  INDEX `idx_audits_project_id` (`project_id`),
  INDEX `idx_audits_status` (`status`),
  INDEX `idx_audits_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pages Table
CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` INT NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `status_code` INT DEFAULT 200,
  `title` TEXT NULL,
  `meta_description` TEXT NULL,
  `canonical_url` VARCHAR(2048) NULL,
  `h1_count` INT DEFAULT 0,
  `word_count` INT DEFAULT 0,
  `image_count` INT DEFAULT 0,
  `internal_link_count` INT DEFAULT 0,
  `external_link_count` INT DEFAULT 0,
  `seo_score` INT DEFAULT 0,
  `load_time_ms` INT DEFAULT 0,
  `page_size_kb` FLOAT DEFAULT 0,
  `content_details` LONGTEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON DELETE CASCADE,
  INDEX `idx_pages_audit_id` (`audit_id`),
  INDEX `idx_pages_status_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SEO Issues Table
CREATE TABLE IF NOT EXISTS `seo_issues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` INT NOT NULL,
  `page_id` INT NULL,
  `issue_type` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'technical',
  `severity` ENUM('critical', 'high', 'medium', 'low', 'passed') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `impact` TEXT NOT NULL,
  `recommendation` TEXT NOT NULL,
  `suggested_fix` TEXT NULL,
  `solution_steps` TEXT NULL,
  `page_url` VARCHAR(2048) NULL,
  `file_path` VARCHAR(1024) NULL,
  `line_number` INT NULL,
  `code_snippet` TEXT NULL,
  `code_diff` TEXT NULL,
  `status` ENUM('open', 'resolved', 'ignored') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE,
  INDEX `idx_issues_audit_id` (`audit_id`),
  INDEX `idx_issues_page_id` (`page_id`),
  INDEX `idx_issues_severity` (`severity`),
  INDEX `idx_issues_type` (`issue_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AI Recommendations Table
CREATE TABLE IF NOT EXISTS `ai_recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` INT NOT NULL,
  `issue_id` INT NULL,
  `priority_rank` INT DEFAULT 1,
  `recommendation` TEXT NOT NULL,
  `suggested_fix` TEXT NULL,
  `fix_type` VARCHAR(50) DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`issue_id`) REFERENCES `seo_issues`(`id`) ON DELETE SET NULL,
  INDEX `idx_ai_rec_audit_id` (`audit_id`),
  INDEX `idx_ai_rec_issue_id` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tracked Keywords Table
CREATE TABLE IF NOT EXISTS `tracked_keywords` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NULL,
  `user_id` INT NULL,
  `keyword` VARCHAR(500) NOT NULL,
  `target_url` VARCHAR(2048) NULL,
  `country` VARCHAR(10) DEFAULT 'pk',
  `device` ENUM('desktop','mobile') DEFAULT 'desktop',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tk_project` (`project_id`),
  INDEX `idx_tk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Keyword Rankings History Table
CREATE TABLE IF NOT EXISTS `keyword_rankings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tracked_keyword_id` INT NOT NULL,
  `position` INT DEFAULT 0,
  `previous_position` INT NULL,
  `search_engine` VARCHAR(20) DEFAULT 'google',
  `serp_url` VARCHAR(2048) NULL,
  `serp_title` VARCHAR(500) NULL,
  `tracked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tracked_keyword_id`) REFERENCES `tracked_keywords`(`id`) ON DELETE CASCADE,
  INDEX `idx_kr_keyword` (`tracked_keyword_id`),
  INDEX `idx_kr_tracked_at` (`tracked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Scheduled Audits Table
CREATE TABLE IF NOT EXISTS `scheduled_audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NULL,
  `client_id` INT NULL,
  `user_id` INT NULL,
  `website_url` VARCHAR(2048) NOT NULL,
  `frequency` ENUM('daily','weekly','biweekly','monthly') NOT NULL DEFAULT 'weekly',
  `max_pages` INT DEFAULT 20,
  `target_keyword` VARCHAR(255) NULL,
  `next_run_at` TIMESTAMP NULL,
  `last_run_at` TIMESTAMP NULL,
  `last_audit_id` INT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sa_project` (`project_id`),
  INDEX `idx_sa_next_run` (`next_run_at`),
  INDEX `idx_sa_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Portal Links Table (shareable client dashboards)
CREATE TABLE IF NOT EXISTS `portal_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `audit_id` INT NULL,
  `client_id` INT NULL,
  `project_id` INT NULL,
  `user_id` INT NULL,
  `token` VARCHAR(128) NOT NULL UNIQUE,
  `title` VARCHAR(255) NULL,
  `expires_at` TIMESTAMP NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `view_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_portal_token` (`token`),
  INDEX `idx_portal_audit` (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Proposals Table
CREATE TABLE IF NOT EXISTS `proposals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NULL,
  `user_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `scope_description` TEXT NULL,
  `deliverables` TEXT NULL,
  `price` DECIMAL(12,2) DEFAULT 0,
  `currency` VARCHAR(10) DEFAULT 'PKR',
  `status` ENUM('draft','sent','accepted','rejected') DEFAULT 'draft',
  `valid_until` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_prop_client` (`client_id`),
  INDEX `idx_prop_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Invoices Table
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT NULL,
  `user_id` INT NULL,
  `proposal_id` INT NULL,
  `invoice_number` VARCHAR(50) NULL,
  `title` VARCHAR(255) NULL DEFAULT 'SEO Services',
  `items` TEXT NULL,
  `amount` DECIMAL(12,2) DEFAULT 0,
  `currency` VARCHAR(10) DEFAULT 'PKR',
  `status` ENUM('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  `due_date` DATE NULL,
  `paid_at` TIMESTAMP NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_inv_client` (`client_id`),
  INDEX `idx_inv_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

