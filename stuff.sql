/*
 Navicat Premium Data Transfer

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : stuff

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 16/02/2025 22:44:33
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKghuylkwuedgl2qahxjt8g41kb`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKghuylkwuedgl2qahxjt8g41kb` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '五千多万', '擦拭', 1);
INSERT INTO `categories` VALUES (2, '二个', '个人各', 1);
INSERT INTO `categories` VALUES (3, '单位亲亲我', '测试1', 1);
INSERT INTO `categories` VALUES (4, '动物趣闻', '测试23', 1);
INSERT INTO `categories` VALUES (5, 'ff', 'ee', 9);
INSERT INTO `categories` VALUES (6, 'gg', 'gg', 9);
INSERT INTO `categories` VALUES (7, '测试', '测试1', 10);
INSERT INTO `categories` VALUES (8, '吃撒', '吃撒', 10);

-- ----------------------------
-- Table structure for families
-- ----------------------------
DROP TABLE IF EXISTS `families`;
CREATE TABLE `families`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `creator_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKj8fak95buv901fn0hbovvrua7`(`creator_id` ASC) USING BTREE,
  CONSTRAINT `FKj8fak95buv901fn0hbovvrua7` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of families
-- ----------------------------
INSERT INTO `families` VALUES (10, '2025-02-12 22:56:23', 'ddd', 'ddd', 1);
INSERT INTO `families` VALUES (11, '2025-02-12 22:56:39', 'ewfew', 'fefw', 1);
INSERT INTO `families` VALUES (13, '2025-02-12 23:01:38', 'dqw', 'dqw', 1);
INSERT INTO `families` VALUES (14, '2025-02-12 23:14:29', 'efwffew', 'feefwefw', 1);
INSERT INTO `families` VALUES (15, '2025-02-15 01:13:00', 'fewfew', 'fewfew', 1);
INSERT INTO `families` VALUES (16, '2025-02-15 01:14:57', '阿松大', '测试组', 1);

-- ----------------------------
-- Table structure for family_members
-- ----------------------------
DROP TABLE IF EXISTS `family_members`;
CREATE TABLE `family_members`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `join_time` datetime NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'MEMBER',
  `family_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKeynpxqr1l03689buyid3e1d8l`(`family_id` ASC) USING BTREE,
  INDEX `FKmdci0l8jglw0mya47m16lnutn`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKeynpxqr1l03689buyid3e1d8l` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKmdci0l8jglw0mya47m16lnutn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of family_members
-- ----------------------------
INSERT INTO `family_members` VALUES (12, '2025-02-12 22:56:23', 'ADMIN', 10, 1);
INSERT INTO `family_members` VALUES (13, '2025-02-12 22:56:39', 'ADMIN', 11, 1);
INSERT INTO `family_members` VALUES (15, '2025-02-12 23:01:38', 'ADMIN', 13, 1);
INSERT INTO `family_members` VALUES (17, '2025-02-12 23:14:29', 'ADMIN', 14, 1);
INSERT INTO `family_members` VALUES (19, '2025-02-12 23:18:54', 'MEMBER', 10, 2);
INSERT INTO `family_members` VALUES (20, '2025-02-15 01:09:17', 'GUEST', 13, 4);
INSERT INTO `family_members` VALUES (22, '2025-02-15 01:13:00', 'ADMIN', 15, 1);
INSERT INTO `family_members` VALUES (23, '2025-02-15 01:13:07', 'GUEST', 15, 4);
INSERT INTO `family_members` VALUES (24, '2025-02-15 01:14:57', 'ADMIN', 16, 1);
INSERT INTO `family_members` VALUES (25, '2025-02-15 01:15:03', 'MEMBER', 16, 9);
INSERT INTO `family_members` VALUES (26, '2025-02-16 21:17:51', 'MEMBER', 16, 10);

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `item_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKqknl7abn519k6qg1cquvnca4i`(`item_id` ASC) USING BTREE,
  INDEX `FKk7du8b8ewipawnnpg76d55fus`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKk7du8b8ewipawnnpg76d55fus` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKqknl7abn519k6qg1cquvnca4i` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorites
-- ----------------------------
INSERT INTO `favorites` VALUES (3, '2025-02-11 19:59:20', 14, 1);
INSERT INTO `favorites` VALUES (4, '2025-02-16 21:19:00', 20, 10);

-- ----------------------------
-- Table structure for invitations
-- ----------------------------
DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `create_time` datetime NOT NULL,
  `expire_time` datetime NOT NULL,
  `invitee_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `used` bit(1) NOT NULL,
  `family_id` bigint NOT NULL,
  `inviter_id` bigint NOT NULL,
  `invitee_id` bigint NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKkuuqtwqhb5qypuca03j1m3b0i`(`family_id` ASC) USING BTREE,
  INDEX `FKc93ihvftpd11j547qgc9fobmc`(`inviter_id` ASC) USING BTREE,
  INDEX `FK88f0ea4w8fhwtsy1tkc0sl1xp`(`invitee_id` ASC) USING BTREE,
  CONSTRAINT `FK88f0ea4w8fhwtsy1tkc0sl1xp` FOREIGN KEY (`invitee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKc93ihvftpd11j547qgc9fobmc` FOREIGN KEY (`inviter_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKkuuqtwqhb5qypuca03j1m3b0i` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of invitations
-- ----------------------------

-- ----------------------------
-- Table structure for items
-- ----------------------------
DROP TABLE IF EXISTS `items`;
CREATE TABLE `items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `image_url` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `quantity` int NOT NULL,
  `update_time` datetime NOT NULL,
  `category_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKjcdcde7htb3tyjgouo4g9xbmr`(`category_id` ASC) USING BTREE,
  INDEX `FKft8pmhndq1kntvyfaqcybhxvx`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKft8pmhndq1kntvyfaqcybhxvx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKjcdcde7htb3tyjgouo4g9xbmr` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of items
-- ----------------------------
INSERT INTO `items` VALUES (13, '2025-02-11 19:56:40', '44', 'blob:http://localhost:5173/37bec17f-ef95-4752-8d00-0528da42bcd9', '北京市东城区东华门街道天安门广场', 'dfbv', 44, '2025-02-11 19:56:40', 3, 1);
INSERT INTO `items` VALUES (14, '2025-02-11 19:59:17', 'erg', 'blob:http://localhost:5173/f3672740-7c68-49c2-a4a3-31d20039e8e0', '北京市东城区东华门街道南河沿大街73号北京市劳动人民文化宫', 'gre', 33, '2025-02-11 19:59:17', 2, 1);
INSERT INTO `items` VALUES (15, '2025-02-12 23:04:32', 'fwe', 'blob:http://localhost:5173/106e1edb-188e-4168-bd67-0c12645c1af5', 'eqw', 'fwe', 3, '2025-02-12 23:04:32', 3, 1);
INSERT INTO `items` VALUES (16, '2025-02-15 00:21:53', 'dqw', 'blob:http://localhost:5173/00892574-86fe-4f88-835b-9251063c1b3e', 'qw', 'ff', 23, '2025-02-15 00:45:11', 1, 1);
INSERT INTO `items` VALUES (17, '2025-02-15 01:49:10', 'e', 'blob:http://localhost:5173/e2db690a-bbee-4baf-b3f7-cbe4215fac0d', '3', 'ff', 3, '2025-02-15 01:49:10', 5, 9);
INSERT INTO `items` VALUES (18, '2025-02-15 01:49:31', '3', 'blob:http://localhost:5173/fd05e391-d56b-4060-bd53-8045cc808432', '3', 'f', 3, '2025-02-15 01:49:31', 5, 9);
INSERT INTO `items` VALUES (19, '2025-02-15 01:58:21', 'rr', 'blob:http://localhost:5173/5f5b9674-5863-434c-9b62-9abae17eda82', 'rr', 'ee', 23, '2025-02-15 01:58:33', 5, 9);
INSERT INTO `items` VALUES (20, '2025-02-16 21:18:57', '分为', 'blob:http://localhost:5173/6b717b4b-4840-4d7f-9b18-9de4f06f442d', '北京市东城区东华门街道中山公园', '啊飒飒的', 12, '2025-02-16 21:19:07', 8, 10);

-- ----------------------------
-- Table structure for reminders
-- ----------------------------
DROP TABLE IF EXISTS `reminders`;
CREATE TABLE `reminders`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `enabled` bit(1) NOT NULL,
  `last_usage_time` datetime NULL DEFAULT NULL,
  `stock_threshold` int NULL DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `update_time` datetime NOT NULL,
  `usage_interval` int NULL DEFAULT NULL,
  `item_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FKir9cch8ts8kv0bdxgaj2ne225`(`item_id` ASC) USING BTREE,
  INDEX `FKgibc0ij0e4s7bkldn4xybaanb`(`user_id` ASC) USING BTREE,
  CONSTRAINT `FKgibc0ij0e4s7bkldn4xybaanb` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKir9cch8ts8kv0bdxgaj2ne225` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reminders
-- ----------------------------
INSERT INTO `reminders` VALUES (9, '2025-02-11 19:56:40', b'1', NULL, 23, 'STOCK', '2025-02-11 19:56:40', NULL, 13, 1);
INSERT INTO `reminders` VALUES (10, '2025-02-11 19:56:40', b'1', '2025-02-11 19:56:40', NULL, 'USAGE', '2025-02-11 19:56:40', 33, 13, 1);
INSERT INTO `reminders` VALUES (11, '2025-02-11 19:59:17', b'1', NULL, 33, 'STOCK', '2025-02-11 19:59:17', NULL, 14, 1);
INSERT INTO `reminders` VALUES (12, '2025-02-11 19:59:17', b'1', '2025-02-15 00:20:56', NULL, 'USAGE', '2025-02-15 00:20:57', 23, 14, 1);
INSERT INTO `reminders` VALUES (13, '2025-02-12 23:04:32', b'1', NULL, 22, 'STOCK', '2025-02-12 23:04:32', NULL, 15, 1);
INSERT INTO `reminders` VALUES (14, '2025-02-12 23:04:32', b'1', '2025-02-12 23:04:32', NULL, 'USAGE', '2025-02-12 23:04:32', 12, 15, 1);
INSERT INTO `reminders` VALUES (15, '2025-02-15 00:21:53', b'1', NULL, 132, 'STOCK', '2025-02-15 00:37:51', NULL, 16, 1);
INSERT INTO `reminders` VALUES (16, '2025-02-15 00:21:53', b'1', '2025-02-15 00:39:13', NULL, 'USAGE', '2025-02-15 00:39:13', 12, 16, 1);
INSERT INTO `reminders` VALUES (17, '2025-02-15 01:49:10', b'1', NULL, 3, 'STOCK', '2025-02-15 01:49:10', NULL, 17, 9);
INSERT INTO `reminders` VALUES (18, '2025-02-15 01:49:10', b'1', '2025-02-15 01:49:10', NULL, 'USAGE', '2025-02-15 01:49:10', 3, 17, 9);
INSERT INTO `reminders` VALUES (19, '2025-02-15 01:49:31', b'1', NULL, 3, 'STOCK', '2025-02-15 01:49:31', NULL, 18, 9);
INSERT INTO `reminders` VALUES (20, '2025-02-15 01:49:31', b'1', '2025-02-15 01:49:31', NULL, 'USAGE', '2025-02-15 01:49:31', 3, 18, 9);
INSERT INTO `reminders` VALUES (21, '2025-02-15 01:58:21', b'1', NULL, 332, 'STOCK', '2025-02-15 01:58:37', NULL, 19, 9);
INSERT INTO `reminders` VALUES (22, '2025-02-15 01:58:21', b'1', '2025-02-15 01:58:21', NULL, 'USAGE', '2025-02-15 01:58:21', 3, 19, 9);
INSERT INTO `reminders` VALUES (23, '2025-02-16 21:18:57', b'1', NULL, 2, 'STOCK', '2025-02-16 21:18:57', NULL, 20, 10);
INSERT INTO `reminders` VALUES (24, '2025-02-16 21:18:57', b'1', '2025-02-16 21:19:10', NULL, 'USAGE', '2025-02-16 21:19:10', 1, 20, 10);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK_r43af9ap4edm43mmtq01oddj6`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '11111111111111111', 'firstuser', NULL, NULL, NULL, 'MEMBER', '2025-04-19 22:42:04');
INSERT INTO `users` VALUES (2, 'wqdqwdqw', 'asd', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (3, 'fewfew', 'fwqwd', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (4, 'dwqqdw', 'dwqw', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (5, 'fewefwfew', 'fewfe', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (6, 'wefefwfe', 'feefw', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (7, 'gergerr', 'geegrrge', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (8, 'gggg', 'grgrg', NULL, NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (9, '123', '测试1', '/api/uploads/avatars/6b19ff0e-52ba-4250-9b8f-a053edbf31fa.png', NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');
INSERT INTO `users` VALUES (10, 'qqq', 'qqq', '/api/uploads/avatars/bf67d4e7-93d0-4f78-8a10-5362dfae520e.png', NULL, NULL, 'MEMBER', '2025-02-16 22:42:04');

-- ----------------------------
-- Table structure for users_backup
-- ----------------------------
DROP TABLE IF EXISTS `users_backup`;
CREATE TABLE `users_backup`  (
  `id` bigint NOT NULL DEFAULT 0,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_backup
-- ----------------------------
INSERT INTO `users_backup` VALUES (1, '123', '123', '/api/uploads/avatars/ea43989b-0094-4711-9adc-955e10c7685f.png', 'fwe@qq.com', 'fweedqwdqw', '');
INSERT INTO `users_backup` VALUES (2, 'wqdqwdqw', 'asd', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (3, 'fewfew', 'fwqwd', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (4, 'dwqqdw', 'dwqw', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (5, 'fewefwfew', 'fewfe', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (6, 'wefefwfe', 'feefw', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (7, 'gergerr', 'geegrrge', NULL, NULL, NULL, '');
INSERT INTO `users_backup` VALUES (8, 'gggg', 'grgrg', NULL, NULL, NULL, '');

SET FOREIGN_KEY_CHECKS = 1;
