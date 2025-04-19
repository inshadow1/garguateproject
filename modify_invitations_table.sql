USE stuff;

-- 修改数据库表中的invitee_email字段，允许为NULL
ALTER TABLE invitations MODIFY COLUMN invitee_email varchar(255) NULL;

-- 修改数据库表中的invitee_id字段，允许为NULL
ALTER TABLE invitations MODIFY COLUMN invitee_id bigint NULL;

-- 修改外键约束
ALTER TABLE invitations DROP FOREIGN KEY FK88f0ea4w8fhwtsy1tkc0sl1xp;
ALTER TABLE invitations ADD CONSTRAINT FK88f0ea4w8fhwtsy1tkc0sl1xp FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 查看修改后的表结构
DESCRIBE invitations; 