---
title: 数据库命名规范
description: 数据库表、字段、索引等的命名规范
category: backend
subcategory: database
tags:
  - database
  - naming
  - sql
  - schema
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# 数据库命名规范

本规范定义了数据库对象的命名标准，确保数据库设计的一致性和可维护性。

## 通用规则

### 基本原则

1. 使用**小写字母**
2. 使用**下划线**分隔单词（snake_case）
3. 避免使用数据库**保留字**
4. 名称应**简洁明了**，具有描述性
5. 避免使用**缩写**，除非是广泛认可的

```sql
-- ✅ 正确
user_profiles
order_items
created_at

-- ❌ 错误
UserProfiles    -- 不应使用大写
orderItems      -- 不应使用驼峰
user-profiles   -- 不应使用连字符
usr_prf         -- 不应使用不明确的缩写
```

## 表命名

### 规则

- 使用**复数**名词
- 使用 **snake_case**
- 避免前缀（如 `tbl_`）

```sql
-- ✅ 正确
CREATE TABLE users (...);
CREATE TABLE orders (...);
CREATE TABLE order_items (...);
CREATE TABLE user_permissions (...);

-- ❌ 错误
CREATE TABLE user (...);        -- 应使用复数
CREATE TABLE tbl_users (...);   -- 不应使用前缀
CREATE TABLE UserOrders (...);  -- 不应使用大写
```

### 关联表命名

关联表使用两个表名的组合，按字母顺序排列：

```sql
-- ✅ 正确（字母顺序：roles < users）
CREATE TABLE roles_users (
  role_id INT,
  user_id INT
);

-- 或者使用更具描述性的名称
CREATE TABLE user_role_assignments (
  user_id INT,
  role_id INT
);
```

## 字段命名

### 规则

- 使用 **snake_case**
- 使用**单数**名词
- 布尔字段使用 `is_`、`has_`、`can_` 前缀

```sql
-- ✅ 正确
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  has_two_factor BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- ❌ 错误
CREATE TABLE users (
  ID BIGINT,              -- 不应使用大写
  userName VARCHAR(50),   -- 不应使用驼峰
  active BOOLEAN,         -- 布尔字段应有前缀
  createdAt TIMESTAMP     -- 不应使用驼峰
);
```

### 主键

- 使用 `id` 作为主键名称
- 类型推荐使用 `BIGINT` 或 `UUID`

```sql
-- ✅ 推荐
id BIGINT AUTO_INCREMENT PRIMARY KEY
-- 或
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### 外键

- 使用 `[关联表单数]_id` 格式

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  status_id INT REFERENCES order_statuses(id)
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id)
);
```

### 时间戳字段

```sql
-- 标准时间戳字段
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,  -- 软删除

-- 业务时间字段
published_at TIMESTAMP,
expired_at TIMESTAMP,
started_at TIMESTAMP,
ended_at TIMESTAMP
```

### 状态字段

```sql
-- ✅ 使用枚举或字符串
status VARCHAR(20) CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))

-- ✅ 或使用状态表
status_id INT REFERENCES order_statuses(id)

-- ❌ 避免使用数字表示状态
status INT  -- 不清晰
```

## 索引命名

### 命名格式

```
idx_[表名]_[字段名1]_[字段名2]
```

```sql
-- 单字段索引
CREATE INDEX idx_users_email ON users(email);

-- 复合索引
CREATE INDEX idx_orders_user_id_status ON orders(user_id, status);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_username_unique ON users(username);

-- 全文索引
CREATE INDEX idx_products_name_fulltext ON products USING gin(to_tsvector('english', name));
```

## 约束命名

### 主键约束

```sql
-- pk_[表名]
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);
```

### 外键约束

```sql
-- fk_[当前表]_[关联表]_[字段]
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_users_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);
```

### 唯一约束

```sql
-- uk_[表名]_[字段]
ALTER TABLE users 
ADD CONSTRAINT uk_users_email UNIQUE (email);
```

### 检查约束

```sql
-- ck_[表名]_[描述]
ALTER TABLE products 
ADD CONSTRAINT ck_products_price_positive CHECK (price > 0);

ALTER TABLE users 
ADD CONSTRAINT ck_users_age_range CHECK (age >= 0 AND age <= 150);
```

## 视图命名

```sql
-- v_[描述性名称]
CREATE VIEW v_active_users AS
SELECT * FROM users WHERE is_active = true;

CREATE VIEW v_order_summary AS
SELECT 
  o.id,
  o.user_id,
  SUM(oi.quantity * oi.price) as total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id;
```

## 存储过程命名

```sql
-- sp_[动作]_[对象]
CREATE PROCEDURE sp_create_user(...)
CREATE PROCEDURE sp_update_order_status(...)
CREATE PROCEDURE sp_calculate_monthly_revenue(...)
```

## 函数命名

```sql
-- fn_[描述]
CREATE FUNCTION fn_get_user_full_name(user_id BIGINT)
CREATE FUNCTION fn_calculate_discount(price DECIMAL, discount_rate DECIMAL)
CREATE FUNCTION fn_is_valid_email(email VARCHAR)
```

## 触发器命名

```sql
-- tr_[表名]_[时机]_[操作]
CREATE TRIGGER tr_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW ...

CREATE TRIGGER tr_orders_after_update
AFTER UPDATE ON orders
FOR EACH ROW ...
```

## 序列命名

```sql
-- seq_[表名]_[字段]
CREATE SEQUENCE seq_users_id;
CREATE SEQUENCE seq_orders_order_number;
```

## 常见字段命名

### 用户相关

```sql
username        -- 用户名
email           -- 邮箱
password_hash   -- 密码哈希
phone           -- 手机号
avatar_url      -- 头像地址
first_name      -- 名
last_name       -- 姓
display_name    -- 显示名称
```

### 地址相关

```sql
country         -- 国家
province        -- 省份
city            -- 城市
district        -- 区县
street          -- 街道
postal_code     -- 邮编
address_line_1  -- 地址行1
address_line_2  -- 地址行2
```

### 金额相关

```sql
price           -- 价格
amount          -- 金额
total           -- 总计
subtotal        -- 小计
discount        -- 折扣
tax             -- 税费
currency        -- 货币
```

### 排序和层级

```sql
sort_order      -- 排序顺序
display_order   -- 显示顺序
parent_id       -- 父级ID
level           -- 层级
path            -- 路径（如 ltree）
```

## 避免的命名

```sql
-- ❌ 避免使用的名称
data            -- 太泛化
info            -- 太泛化
temp            -- 临时性质
test            -- 测试性质
new             -- 不明确
old             -- 不明确
flag            -- 不明确
type            -- 保留字
order           -- 保留字（使用 orders）
user            -- 保留字（使用 users）
```

## 数据库特定规范

### PostgreSQL

```sql
-- 使用 SERIAL 或 BIGSERIAL 自增
id BIGSERIAL PRIMARY KEY

-- 使用 TIMESTAMPTZ 存储时间
created_at TIMESTAMPTZ DEFAULT NOW()

-- 使用 TEXT 而非 VARCHAR（无性能差异）
description TEXT
```

### MySQL

```sql
-- 使用 BIGINT AUTO_INCREMENT
id BIGINT AUTO_INCREMENT PRIMARY KEY

-- 使用 DATETIME 或 TIMESTAMP
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

-- 指定字符集
DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

