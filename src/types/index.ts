// 问题单据数据类型 (对应 problem_document 表)
export interface ProblemDocument {
  id: number;
  problemNumber: string; // 问题单据编号
  projectNumber: string; // 关联项目编号
  vulnerabilityLevel: '严重' | '高危' | '中危' | '低危'; // 漏洞等级
  vulnerabilityNum: string; // 漏洞编号
  isRedLine: boolean; // 是否红线(0否,1是)
  isSoftware?: boolean; // 是否软件平台(0否,1是)
  scanItem: string; // 扫描项
  componentName?: string; // 开源组件名称
  componentVersion?: string; // 开源组件版本
  ip?: string; // IP地址
  api?: string; // API
  descriptionBrief: string; // 简要描述
  descriptionDetailed: string; // 详细描述
  expectedDate: string; // 期望解决日期
  status: '已创建' | '处置中' | '审批中' | '关闭'; // 当前节点状态
  conclusion?: '误报' | '不受影响' | '版本升级修复' | '补丁修复' | '有修复方案接受风险' | '无修复方案接受风险'; // 结论
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
  conclusion: '误报' | '不受影响' | '版本升级修复' | '补丁修复' | '有修复方案接受风险' | '无修复方案接受风险'; // 结论
  status: '已创建' | '处置中' | '审批中' | '关闭'; // 当前节点状态
  vulnerabilityLevel: '严重' | '高危' | '中危' | '低危'; // 漏洞等级
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
  status: '已创建' | '处置中' | '审批中' | '关闭'; // 状态
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

// 为了保持向后兼容，保留原有的 Vulnerability 类型作为 ProblemDocument 的别名
export type Vulnerability = ProblemDocument;

// 审批单别名，保持向后兼容
export type Approval = ApprovalDocument;

// 审批流程记录
export interface ApprovalHistory {
  id: string;
  approvalId: string;
  step: string;
  operator: string;
  operation: string;
  time: string;
  comments?: string;
}