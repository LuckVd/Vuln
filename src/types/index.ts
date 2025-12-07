// 问题单据数据类型 (对应 problem_document 表)
export interface ProblemDocument {
  id: number;
  problemNumber: string; // 问题单据编号
  projectNumber: string; // 关联项目编号
  vulnerabilityLevel: 1 | 2 | 3 | 4; // 漏洞等级(1严重,2高危,3中危,4低危)
  vulnerabilityNum: string; // 漏洞编号
  isRedLine: 0 | 1; // 是否红线(0否,1是)
  isSoftware?: 0 | 1; // 是否软件平台(0否,1是)
  scanItem: string; // 扫描项
  componentName?: string; // 开源组件名称
  componentVersion?: string; // 开源组件版本
  ip?: string; // IP地址
  api?: string; // API
  descriptionBrief: string; // 简要描述 (注意：数据库中是description_rief)
  descriptionDetailed: string; // 详细描述
  expectedDate: string; // 期望解决日期
  status: 1 | 2 | 3 | 4; // 当前节点状态(1已创建,2处置中,3审批中,4关闭)
  conclusion?: 1 | 2 | 3 | 4 | 5 | 6; // 结论(1误报,2不受影响,3版本升级修复,4补丁修复,5有修复方案接受风险,6无修复方案接受风险)
  fixAddress?: string; // 修复地址
  fixVersion?: string; // 修复版本
  descriptionDisposal?: string; // 处置描述
  responsiblePerson: string; // 责任人
  approvalList?: string[]; // 关联审批单据
}

// 审批单据数据类型 (对应 approval_document 表)
export interface ApprovalDocument {
  id: number;
  approvalNumber: string; // 审批单据编号
  problemList: string[]; // 关联问题单据
  conclusion: 1 | 2 | 3 | 4 | 5 | 6; // 结论(1误报,2不受影响,3版本升级修复,4补丁修复,5有修复方案接受风险,6无修复方案接受风险)
  status: 1 | 2 | 3 | 4; // 当前节点状态(1已创建,2处置中,3审批中,4关闭)
  vulnerabilityLevel: 1 | 2 | 3 | 4; // 漏洞等级(1严重,2高危,3中危,4低危)
  descriptionDisposal: string; // 处置描述
  approvalPerson: string; // 当前审批人
  softwarePerson?: string; // 软研安全专家
  createTime: string; // 创建时间
  createPerson: string; // 创建者
}

// 审批记录数据类型 (对应 approval_record 表)
export interface ApprovalRecord {
  id: number;
  approvalNumber: string; // 审批单据编号
  approvalNode: string; // 当前审批节点
  approvalPerson: string; // 当前审批人
  approvalResult: string; // 审批结果
  approvalComments: string; // 审批意见
  approvalTime?: string; // 审批时间
}

// 项目数据类型 (对应 projects 表)
export interface Project {
  id: number;
  projectNumber: string; // 项目编号
  planningVersion?: string; // 规划版本
  manager: string; // 项目经理
  status: 1 | 2 | 3 | 4; // 状态(1已创建,2处置中,3审批中,4关闭)
  createTime: string; // 创建时间
  completionTime?: string; // 结项时间
}

// 项目问题单快照数据类型 (对应 project_problem_snapshot 表)
export interface ProjectProblemSnapshot {
  id: number;
  projectNumber: string; // 关联项目编号
  tr6Number: string; // TR6单据号
  createTime: string; // 创建时间
  snapshotContent: any; // 快照内容 (JSON)
}

// 审批单据数据类型 (为了向后兼容，使用 ApprovalDocument 的别名)
export type Approval = ApprovalDocument;

// 审批历史记录数据类型 (为了向后兼容，使用 ApprovalRecord 的别名)
export type ApprovalHistory = ApprovalRecord;

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