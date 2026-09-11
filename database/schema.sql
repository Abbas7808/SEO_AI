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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Audits Table
CREATE TABLE IF NOT EXISTS `audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `website_url` VARCHAR(2048) NOT NULL,
  `seo_score` INT DEFAULT 0,
  `mobile_score` INT DEFAULT 0,
  `desktop_score` INT DEFAULT 0,
  `status` ENUM('pending', 'crawling', 'analyzing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `pages_crawled` INT DEFAULT 0,
  `max_pages` INT DEFAULT 20,
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
  INDEX `idx_audits_status` (`status`),
  INDEX `idx_audits_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Pages Table
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

-- 4. SEO Issues Table
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
  `status` ENUM('open', 'resolved', 'ignored') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`audit_id`) REFERENCES `audits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE,
  INDEX `idx_issues_audit_id` (`audit_id`),
  INDEX `idx_issues_page_id` (`page_id`),
  INDEX `idx_issues_severity` (`severity`),
  INDEX `idx_issues_type` (`issue_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI Recommendations Table
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
