export interface Approval {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'closed';
  createTime: string;
  updateTime: string;
  approver: string;
  priority: 'urgent' | 'normal' | 'low';
  department: string;
  comments?: string;
  createdBy?: string;
}

export interface ApprovalHistory {
  id: string;
  approvalId: string;
  step: string;
  operator: string;
  operation: string;
  time: string;
  comments: string;
}

export interface CreateApprovalInput {
  title: string;
  priority: string;
  department: string;
  comments?: string;
  vulnerabilityIds: string[]; // 关联的漏洞ID数组
  createdBy?: string;
}

export interface ApprovalSubmitInput {
  approvalId: string;
  result: string;
  assignTo: string;
  comment: string;
  dueDate?: string;
  submittedBy?: string;
}

// 数据库表创建SQL
export const CREATE_APPROVALS_TABLE = `
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
`;

export const CREATE_APPROVAL_HISTORY_TABLE = `
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
`;

// 插入初始数据SQL
export const INSERT_INITIAL_APPROVALS = `
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
`;

export const INSERT_INITIAL_APPROVAL_HISTORY = `
  INSERT INTO approval_history (
    id, approval_id, step, operator, operation, time, comments
  ) VALUES
    ('HIS-APP-2024-001-01', 'APP-2024-001', '提交申请', '张三', '提交', '2024-01-15 11:00:00', '发现SQL注入和CSRF漏洞，申请紧急修复'),
    ('HIS-APP-2024-001-02', 'APP-2024-001', '安全评估', '李四', '审核通过', '2024-01-16 10:00:00', '漏洞确实存在，风险等级评估准确'),
    ('HIS-APP-2024-001-03', 'APP-2024-001', '技术方案评审', '王五', '审核通过', '2024-01-17 14:00:00', '修复方案可行，建议立即实施'),
    ('HIS-APP-2024-001-04', 'APP-2024-001', '最终审批', '赵六', '审批完成', '2024-01-20 16:30:00', '审批通过，请立即开始修复工作'),

    ('HIS-APP-2024-002-01', 'APP-2024-002', '提交申请', '李四', '提交', '2024-01-16 15:00:00', '发现XSS漏洞，申请修复'),
    ('HIS-APP-2024-002-02', 'APP-2024-002', '技术评审', '张三', '审核通过', '2024-01-17 09:00:00', '修复方案合理，建议前端框架升级'),
    ('HIS-APP-2024-002-03', 'APP-2024-002', '最终审批', '王五', '审批完成', '2024-01-22 14:20:00', '审批通过，请开发团队立即实施');
`;

// 更新漏洞关联审批单的SQL
export const UPDATE_VULNERABILITY_APPROVAL = `
  UPDATE vulnerabilities
  SET approval_id = ?, status = 'approved', updated_at = NOW()
  WHERE id = ?
`;

// 移除漏洞关联审批单的SQL
export const REMOVE_VULNERABILITY_APPROVAL = `
  UPDATE vulnerabilities
  SET approval_id = NULL, status = 'unassigned', updated_at = NOW()
  WHERE id = ? AND approval_id = ?
`;

// 查询未分配漏洞的SQL
export const SELECT_UNASSIGNED_VULNERABILITIES = `
  SELECT * FROM vulnerabilities
  WHERE approval_id IS NULL
  ORDER BY discovery_time DESC
`;

// 查询审批单关联漏洞的SQL
export const SELECT_APPROVAL_VULNERABILITIES = `
  SELECT * FROM vulnerabilities
  WHERE approval_id = ?
  ORDER BY risk_level DESC, discovery_time DESC
`;