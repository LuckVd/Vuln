-- 漏洞管理系统数据库初始化脚本

-- 创建漏洞表
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL,
  risk_level ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  discovery_time DATETIME NOT NULL,
  expected_block_time DATETIME,
  status ENUM('pending', 'processing', 'approved', 'unassigned') DEFAULT 'pending',
  description TEXT,
  severity VARCHAR(20) NOT NULL,
  affected_component VARCHAR(255),
  recommendation TEXT,
  approval_id VARCHAR(50),
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_approval_id (approval_id),
  INDEX idx_risk_level (risk_level),
  INDEX idx_status (status),
  INDEX idx_discovery_time (discovery_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建审批单表
CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'closed') DEFAULT 'pending',
  create_time DATETIME NOT NULL,
  update_time DATETIME NOT NULL,
  approver VARCHAR(50),
  priority ENUM('urgent', 'normal', 'low') DEFAULT 'normal',
  department VARCHAR(100) NOT NULL,
  comments TEXT,
  created_by VARCHAR(50),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_create_time (create_time),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建审批历史表
CREATE TABLE IF NOT EXISTS approval_history (
  id VARCHAR(50) PRIMARY KEY,
  approval_id VARCHAR(50) NOT NULL,
  step VARCHAR(100) NOT NULL,
  operator VARCHAR(50) NOT NULL,
  operation VARCHAR(20) NOT NULL,
  time DATETIME NOT NULL,
  comments TEXT,
  INDEX idx_approval_id (approval_id),
  INDEX idx_time (time),
  FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始漏洞数据
INSERT INTO vulnerabilities (
  id, name, source, risk_level, discovery_time, expected_block_time,
  status, description, severity, affected_component, recommendation,
  approval_id, created_by
) VALUES
  ('VUL-2024-001', 'SQL注入漏洞', 'IAST', '2024-01-15 10:30:00', '2024-01-20 00:00:00',
  'approved', '在用户登录模块发现SQL注入漏洞，攻击者可以通过构造恶意SQL语句获取数据库敏感信息', '严重', 'user/login',
  '立即使用参数化查询替换字符串拼接，对所有用户输入进行严格验证', 'APP-2024-001', 'system'),

  ('VUL-2024-002', 'XSS跨站脚本攻击', 'DAST', '2024-01-16 14:20:00', '2024-01-22 00:00:00',
  'approved', '在评论功能中发现存储型XSS漏洞，攻击者可以注入恶意脚本执行', '高危', 'product/comments',
  '对用户输入进行HTML编码，使用CSP头部保护', 'APP-2024-001', 'system'),

  ('VUL-2024-003', '敏感信息泄露', 'SCA', '2024-01-17 09:15:00', '2024-01-25 00:00:00',
  'approved', 'API接口返回包含用户密码哈希等敏感信息', '中危', 'api/user/profile',
  '移除敏感信息字段，仅返回必要的用户信息', 'APP-2024-002', 'system'),

  ('VUL-2024-004', 'CSRF跨站请求伪造', 'IAST', '2024-01-18 16:45:00', '2024-01-26 00:00:00',
  'approved', '关键业务操作缺少CSRF保护，可能导致恶意操作', '中危', 'user/settings',
  '添加CSRF令牌验证，使用SameSite Cookie', 'APP-2024-003', 'system'),

  ('VUL-2024-005', '文件上传漏洞', 'DAST', '2024-01-19 11:00:00', '2024-01-27 00:00:00',
  'pending', '文件上传功能存在类型绕过，可能导致恶意文件上传', '高危', 'file/upload',
  '严格验证文件类型，使用安全的文件存储策略', NULL, 'system'),

  ('VUL-2024-006', '权限绕过', 'IAST', '2024-01-20 15:30:00', '2024-01-28 00:00:00',
  'pending', '管理后台存在权限验证缺陷，普通用户可访问管理员功能', '严重', 'admin/panel',
  '实施严格的权限检查，使用基于角色的访问控制', NULL, 'system');

-- 插入初始审批单数据
INSERT INTO approvals (
  id, title, status, create_time, update_time, approver, priority, department, comments, created_by
) VALUES
  ('APP-2024-001', '紧急漏洞修复审批', 'completed', '2024-01-15 11:00:00', '2024-01-20 16:30:00',
  '张三', 'urgent', '安全部', '本次漏洞涉及SQL注入和CSRF两个高危漏洞，需要紧急处理', 'system'),

  ('APP-2024-002', 'XSS漏洞修复审批', 'completed', '2024-01-16 15:00:00', '2024-01-22 14:20:00',
  '李四', 'normal', '开发部', '评论功能XSS漏洞，需要尽快修复', 'system'),

  ('APP-2024-003', '敏感信息泄露修复审批', 'completed', '2024-01-17 10:00:00', '2024-01-25 17:00:00',
  '王五', 'normal', '产品部', 'API接口敏感信息泄露问题', 'system'),

  ('APP-2024-004', '密码策略优化审批', 'pending', '2024-01-18 13:45:00', '2024-01-18 13:45:00',
  '赵六', 'low', 'IT部', '建议增强密码复杂度要求，添加双因素认证', 'system');

-- 插入初始审批历史数据
INSERT INTO approval_history (
  id, approval_id, step, operator, operation, time, comments
) VALUES
  ('HIS-APP-2024-001-01', 'APP-2024-001', '提交申请', '张三', '提交', '2024-01-15 11:00:00', '发现SQL注入和CSRF漏洞，申请紧急修复'),
  ('HIS-APP-2024-001-02', 'APP-2024-001', '安全评估', '李四', '审核通过', '2024-01-16 10:00:00', '漏洞确实存在，风险等级评估准确'),
  ('HIS-APP-2024-001-03', 'APP-2024-001', '技术方案评审', '王五', '审核通过', '2024-01-17 14:00:00', '修复方案可行，建议立即实施'),
  ('HIS-APP-2024-001-04', 'APP-2024-001', '最终审批', '赵六', '审批完成', '2024-01-20 16:30:00', '审批通过，请立即开始修复工作'),

  ('HIS-APP-2024-002-01', 'APP-2024-002', '提交申请', '李四', '提交', '2024-01-16 15:00:00', '发现XSS漏洞，申请修复'),
  ('HIS-APP-2024-002-02', 'APP-2024-002', '技术评审', '张三', '审核通过', '2024-01-17 09:00:00', '修复方案合理，建议前端框架升级'),
  ('HIS-APP-2024-002-03', 'APP-2024-002', '最终审批', '王五', '审批完成', '2024-01-22 14:20:00', '审批通过，请开发团队立即实施'),
  ('HIS-APP-2024-003-01', 'APP-2024-003', '提交申请', '王五', '提交', '2024-01-17 10:00:00', '发现API接口敏感信息泄露问题'),
  ('HIS-APP-2024-003-02', 'APP-2024-003', '安全审核', '张三', '审核通过', '2024-01-18 15:00:00', '问题确实存在，建议立即修复'),
  ('HIS-APP-2024-003-03', 'APP-2024-003', '最终审批', '赵六', '审批完成', '2024-01-25 17:00:00', '审批通过，请立即开始修复工作');

-- 创建数据库用户（如果需要）
-- CREATE USER IF NOT EXISTS 'vuln_user'@'%' IDENTIFIED BY 'vuln_password';
-- GRANT ALL PRIVILEGES ON vulnerability_management.* TO 'vuln_user'@'%';
-- FLUSH PRIVILEGES;