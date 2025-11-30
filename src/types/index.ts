// 漏洞数据类型
export interface Vulnerability {
  id: string;
  name: string;
  source: string; // IAST, SCA 等
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  discoveryTime: string;
  expectedBlockTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  description?: string;
  severity?: string;
  affectedComponent?: string;
  recommendation?: string;
  approvalId?: string;
}

// 审批单数据类型
export interface Approval {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  createTime: string;
  updateTime: string;
  approver: string;
  vulnerabilities: Vulnerability[];
  comments?: string;
  priority: 'urgent' | 'normal' | 'low';
  department?: string;
}

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