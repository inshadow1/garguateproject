USE stuff;

-- 修改invitee_email字段，允许为NULL
ALTER TABLE invitations MODIFY COLUMN invitee_email VARCHAR(255) NULL;

-- 修改invitee_id的外键约束，允许为NULL
ALTER TABLE invitations MODIFY COLUMN invitee_id BIGINT NULL;

-- 查看修改后的表结构
DESCRIBE invitations; 