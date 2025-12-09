// 问题单据数据类型 (对应 problem_document 表)
export interface ProblemDocument {
  id: number;
  problemNumber: string; // 对应 problem_number
  projectNumber: string; // 对应 project_number
  vulnerabilityLevel: 1 | 2 | 3 | 4; // 对应 vulnerability_level
  vulnerabilityNum: string; // 对应 vulnerability_num
  isRedLine: 0 | 1; // 对应 is_red_line
  isSoftware?: 0 | 1; // 对应 is_software
  scanItem: string; // 对应 scan_item
  componentName?: string; // 对应 component_name
  componentVersion?: string; // 对应 component_version
  ip?: string; // IP地址
  api?: string; // API
  descriptionRief: string; // 对应 description_rief
  descriptionDetailed: string; // 对应 description_detailed
  expectedDate: string; // 对应 expected_date
  status: 1 | 2 | 3 | 4; // 对应 status
  conclusion?: 1 | 2 | 3 | 4 | 5 | 6; // 对应 conclusion
  fixAddress?: string; // 对应 fix_address
  fixVersion?: string; // 对应 fix_version
  descriptionDisposal?: string; // 对应 description_disposal
  responsiblePerson: string; // 对应 responsible_person
  approvalList?: string[]; // 对应 approval_list
}

// 审批单据数据类型 (对应 approval_document 表)
export interface ApprovalDocument {
  id: number;
  approvalNumber: string; // 对应 approval_number
  problemList: string[]; // 对应 problem_list
  conclusion: 1 | 2 | 3 | 4 | 5 | 6; // 对应 conclusion
  status: 1 | 2 | 3 | 4; // 对应 status
  vulnerabilityLevel: 1 | 2 | 3 | 4; // 对应 vulnerability_level
  descriptionDisposal: string; // 对应 description_disposal
  approvalPerson: string; // 对应 approval_person
  softwarePerson?: string; // 对应 software_person
  createTime: string; // 对应 create_time
  createPerson: string; // 对应 create_person
}

// 审批记录数据类型 (对应 approval_record 表)
export interface ApprovalRecord {
  id: number;
  approvalNumber: string; // 对应 approval_number
  approvalNode: string; // 对应 approval_node
  approvalPerson: string; // 对应 approval_person
  approvalResult: string; // 对应 approval_result
  approvalComments: string; // 对应 approval_comments
  approvalTime?: string; // 对应 approval_time
}

// 项目数据类型 (对应 projects 表)
export interface Project {
  id: number;
  projectNumber: string; // 对应 project_number
  planningVersion?: string; // 对应 planning_version
  manager: string; // 项目经理
  status: 1 | 2 | 3 | 4; // 对应 status(1已创建,2处置中,3审批中,4关闭)
  createTime: string; // 对应 create_time
  completionTime?: string; // 对应 completion_time
}

// 项目问题单快照数据类型 (对应 project_problem_snapshot 表)
export interface ProjectProblemSnapshot {
  id: number;
  projectNumber: string; // 对应 project_number
  tr6Number: string; // 对应 tr6_number
  createTime: string; // 对应 create_time
  snapshotContent: any; // 对应 snapshot_content (JSON)
}


// API 响应的通用类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  total?: number;
}

// 分页请求参数
export interface PaginationParams {
  current?: number;
  pageSize?: number;
}

// 分页响应数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
}

// 枚举值映射常量
export const ENUMS = {
  // 漏洞等级
  VULNERABILITY_LEVEL: {
    1: '严重',
    2: '高危',
    3: '中危',
    4: '低危'
  } as const,

  // 状态
  STATUS: {
    1: '已创建',
    2: '处置中',
    3: '审批中',
    4: '关闭'
  } as const,

  // 结论
  CONCLUSION: {
    1: '误报',
    2: '不受影响',
    3: '版本升级修复',
    4: '补丁修复',
    5: '有修复方案接受风险',
    6: '无修复方案接受风险'
  } as const
};

// 删除已废弃的类型别名，直接使用具体的类型名称

// 前端显示用的枚举类型（字符串）
export type VulnerabilityLevelString = 'critical' | 'high' | 'medium' | 'low';
export type StatusString = 'pending' | 'processing' | 'approved' | 'rejected';
export type ConclusionString = 'false_positive' | 'unaffected' | 'version_upgrade' | 'patch_fix' | 'accept_risk_with_fix' | 'accept_risk_without_fix';

// 字符串枚举映射
export const STRING_ENUMS = {
  VULNERABILITY_LEVEL: {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4
  } as const,

  STATUS: {
    pending: 1,
    processing: 2,
    approved: 3,
    rejected: 4
  } as const,

  CONCLUSION: {
    false_positive: 1,
    unaffected: 2,
    version_upgrade: 3,
    patch_fix: 4,
    accept_risk_with_fix: 5,
    accept_risk_without_fix: 6
  } as const
};

// 反向映射
export const REVERSE_STRING_ENUMS = {
  VULNERABILITY_LEVEL: {
    1: 'critical',
    2: 'high',
    3: 'medium',
    4: 'low'
  } as const,

  STATUS: {
    1: 'pending',
    2: 'processing',
    3: 'approved',
    4: 'rejected'
  } as const,

  CONCLUSION: {
    1: 'false_positive',
    2: 'unaffected',
    3: 'version_upgrade',
    4: 'patch_fix',
    5: 'accept_risk_with_fix',
    6: 'accept_risk_without_fix'
  } as const
};