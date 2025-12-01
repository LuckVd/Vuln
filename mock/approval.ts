import { Approval, ApprovalHistory } from '@/types';
import vulnApi, { __mockVulnerabilities } from './vuln';

// 初始化审批单漏洞关联关系
const initializeApprovalVulnerabilityMap = () => {
  mockApprovals.forEach(approval => {
    approvalVulnerabilityMap.set(approval.id, []);
  });
};

// Mock 审批单数据
const mockApprovals: Approval[] = [
  {
    id: 'APP-2024-001',
    title: '紧急漏洞修复审批',
    status: 'completed',
    createTime: '2024-01-15 11:00:00',
    updateTime: '2024-01-20 16:30:00',
    approver: '张三',
    priority: 'urgent',
    department: '安全部',
    comments: '本次漏洞涉及SQL注入和CSRF两个高危漏洞，需要紧急处理',
    vulnerabilities: [] // 会在API调用时动态填充
  },
  {
    id: 'APP-2024-002',
    title: 'XSS漏洞修复审批',
    status: 'completed',
    createTime: '2024-01-16 15:00:00',
    updateTime: '2024-01-22 14:20:00',
    approver: '李四',
    priority: 'normal',
    department: '开发部',
    comments: '评论功能XSS漏洞，需要尽快修复',
    vulnerabilities: []
  },
  {
    id: 'APP-2024-003',
    title: '敏感信息泄露修复审批',
    status: 'completed',
    createTime: '2024-01-17 10:00:00',
    updateTime: '2024-01-25 17:00:00',
    approver: '王五',
    priority: 'normal',
    department: '产品部',
    comments: 'API接口敏感信息泄露问题',
    vulnerabilities: []
  },
  {
    id: 'APP-2024-004',
    title: '密码策略优化审批',
    status: 'completed',
    createTime: '2024-01-19 12:00:00',
    updateTime: '2024-01-30 18:00:00',
    approver: '赵六',
    priority: 'low',
    department: '运维部',
    comments: '用户密码策略需要加强',
    vulnerabilities: []
  },
  {
    id: 'APP-2024-005',
    title: '文件上传安全修复审批',
    status: 'completed',
    createTime: '2024-01-20 14:00:00',
    updateTime: '2024-01-28 16:45:00',
    approver: '钱七',
    priority: 'urgent',
    department: '安全部',
    comments: '头像上传功能存在严重安全隐患',
    vulnerabilities: []
  },
  {
    id: 'APP-2024-006',
    title: '访问控制漏洞修复审批',
    status: 'completed',
    createTime: '2024-01-21 16:00:00',
    updateTime: '2024-01-29 17:30:00',
    approver: '孙八',
    priority: 'normal',
    department: '开发部',
    comments: '订单详情接口存在越权访问问题',
    vulnerabilities: []
  },
  {
    id: 'APP-2024-007',
    title: 'Log4j漏洞紧急修复审批',
    status: 'completed',
    createTime: '2024-01-22 11:00:00',
    updateTime: '2024-01-23 20:00:00',
    approver: '周九',
    priority: 'urgent',
    department: '运维部',
    comments: 'Log4j远程代码执行漏洞，需要立即处理',
    vulnerabilities: []
  }
];

// Mock 审批历史记录
let mockApprovalHistory: ApprovalHistory[] = [
  {
    id: 'HIS-2024-001-01',
    approvalId: 'APP-2024-001',
    step: '提交申请',
    operator: '张三',
    operation: '提交',
    time: '2024-01-15 11:00:00',
    comments: '发现SQL注入和CSRF漏洞，申请紧急修复'
  },
  {
    id: 'HIS-2024-001-02',
    approvalId: 'APP-2024-001',
    step: '安全评估',
    operator: '李四',
    operation: '审核通过',
    time: '2024-01-16 10:00:00',
    comments: '漏洞确实存在，风险等级评估准确'
  },
  {
    id: 'HIS-2024-001-03',
    approvalId: 'APP-2024-001',
    step: '技术方案评审',
    operator: '王五',
    operation: '审核通过',
    time: '2024-01-17 14:00:00',
    comments: '修复方案可行，建议立即实施'
  },
  {
    id: 'HIS-2024-001-04',
    approvalId: 'APP-2024-001',
    step: '最终审批',
    operator: '赵六',
    operation: '审批完成',
    time: '2024-01-20 16:30:00',
    comments: '审批通过，请立即开始修复工作'
  },
  {
    id: 'HIS-2024-002-01',
    approvalId: 'APP-2024-002',
    step: '提交申请',
    operator: '李四',
    operation: '提交',
    time: '2024-01-16 15:00:00',
    comments: '评论功能XSS漏洞需要修复'
  },
  {
    id: 'HIS-2024-002-02',
    approvalId: 'APP-2024-002',
    step: '安全评估',
    operator: '张三',
    operation: '审核通过',
    time: '2024-01-17 09:00:00',
    comments: 'XSS漏洞确认，建议使用HTML编码'
  },
  {
    id: 'HIS-2024-002-03',
    approvalId: 'APP-2024-002',
    step: '最终审批',
    operator: '钱七',
    operation: '审批完成',
    time: '2024-01-22 14:20:00',
    comments: '审批通过，请注意测试验证'
  },
  {
    id: 'HIS-2024-003-01',
    approvalId: 'APP-2024-003',
    step: '提交申请',
    operator: '王五',
    operation: '提交',
    time: '2024-01-17 10:00:00',
    comments: 'API接口敏感信息泄露问题'
  },
  {
    id: 'HIS-2024-003-02',
    approvalId: 'APP-2024-003',
    step: '安全评估',
    operator: '张三',
    operation: '审核通过',
    time: '2024-01-18 09:00:00',
    comments: '信息泄露确实存在'
  },
  {
    id: 'HIS-2024-003-03',
    approvalId: 'APP-2024-003',
    step: '最终审批',
    operator: '王五',
    operation: '审批完成',
    time: '2024-01-25 17:00:00',
    comments: '审批通过，请立即移除敏感信息'
  },
  {
    id: 'HIS-2024-004-01',
    approvalId: 'APP-2024-004',
    step: '提交申请',
    operator: '赵六',
    operation: '提交',
    time: '2024-01-19 12:00:00',
    comments: '用户密码策略过于简单，容易被暴力破解'
  },
  {
    id: 'HIS-2024-004-02',
    approvalId: 'APP-2024-004',
    step: '技术方案评审',
    operator: '孙八',
    operation: '审核通过',
    time: '2024-01-20 16:00:00',
    comments: '密码策略改进方案可行'
  },
  {
    id: 'HIS-2024-004-03',
    approvalId: 'APP-2024-004',
    step: '最终审批',
    operator: '赵六',
    operation: '审批完成',
    time: '2024-01-30 18:00:00',
    comments: '审批通过，请实施强密码策略'
  },
  {
    id: 'HIS-2024-005-01',
    approvalId: 'APP-2024-005',
    step: '提交申请',
    operator: '钱七',
    operation: '提交',
    time: '2024-01-20 14:00:00',
    comments: '文件上传功能缺少类型和大小限制'
  },
  {
    id: 'HIS-2024-005-02',
    approvalId: 'APP-2024-005',
    step: '安全评估',
    operator: '李四',
    operation: '审核通过',
    time: '2024-01-21 10:00:00',
    comments: '上传漏洞确实存在，风险严重'
  },
  {
    id: 'HIS-2024-005-03',
    approvalId: 'APP-2024-005',
    step: '最终审批',
    operator: '钱七',
    operation: '审批完成',
    time: '2024-01-28 16:45:00',
    comments: '审批通过，请立即修复文件上传安全'
  },
  {
    id: 'HIS-2024-006-01',
    approvalId: 'APP-2024-006',
    step: '提交申请',
    operator: '孙八',
    operation: '提交',
    time: '2024-01-21 16:00:00',
    comments: '订单详情接口存在越权访问漏洞'
  },
  {
    id: 'HIS-2024-006-02',
    approvalId: 'APP-2024-006',
    step: '技术方案评审',
    operator: '张三',
    operation: '审核通过',
    time: '2024-01-22 10:00:00',
    comments: '访问控制问题确实存在，修复方案可行'
  },
  {
    id: 'HIS-2024-006-03',
    approvalId: 'APP-2024-006',
    step: '最终审批',
    operator: '孙八',
    operation: '审批完成',
    time: '2024-01-29 17:30:00',
    comments: '审批通过，请立即实施访问控制修复'
  },
  {
    id: 'HIS-2024-007-01',
    approvalId: 'APP-2024-007',
    step: '提交申请',
    operator: '周九',
    operation: '提交',
    time: '2024-01-22 11:00:00',
    comments: '检测到Log4j远程代码执行漏洞(CVE-2021-44228)'
  },
  {
    id: 'HIS-2024-007-02',
    approvalId: 'APP-2024-007',
    step: '安全评估',
    operator: '周九',
    operation: '审核通过',
    time: '2024-01-22 15:00:00',
    comments: 'Log4j漏洞风险极高，需要立即处理'
  },
  {
    id: 'HIS-2024-007-03',
    approvalId: 'APP-2024-007',
    step: '最终审批',
    operator: '周九',
    operation: '审批完成',
    time: '2024-01-23 20:00:00',
    comments: '审批通过，请立即升级Log4j到安全版本'
  }
];

// 用于生成新的审批记录ID
let nextHistoryId = 100;

// API 模拟
export default {
  // 获取审批单列表
  'GET /api/approval': (req: any, res: any) => {
    const { page = 1, pageSize = 10, status } = req.query;

    let filteredData = mockApprovals;

    // 状态过滤
    if (status) {
      filteredData = mockApprovals.filter(item => item.status === status);
    }

    // 只返回已完成的审批单
    filteredData = filteredData.filter(item => item.status === 'completed');

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
      code: 200,
      data: paginatedData,
      total: filteredData.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  },

  // 根据ID获取审批单详情
  'GET /api/approval/:id': (req: any, res: any) => {
    const { id } = req.params;
    const approval = mockApprovals.find(item => item.id === id);

    if (approval) {
      res.json({
        code: 200,
        data: approval
      });
    } else {
      res.json({
        code: 404,
        message: '审批单不存在'
      });
    }
  },

  // 获取审批单历史记录
  'GET /api/approval/:id/history': (req: any, res: any) => {
    const { id } = req.params;
    const history = mockApprovalHistory.filter(item => item.approvalId === id);

    res.json({
      code: 200,
      data: history
    });
  },

  // 提交审批
  'POST /api/approval/:id/submit': (req: any, res: any) => {
    const { id } = req.params;
    const { result, assignTo, comment, dueDate } = req.body;

    // 获取当前时间
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 创建新的审批记录
    const newHistory: ApprovalHistory = {
      id: `HIS-${id}-${nextHistoryId}`,
      approvalId: id,
      step: '用户审批',
      operator: '当前用户',
      operation: getOperationText(result),
      time: timeStr,
      comments: comment
    };

    // 添加到审批历史
    mockApprovalHistory.push(newHistory);
    nextHistoryId++;

    // 更新审批单状态
    const approval = mockApprovals.find(item => item.id === id);
    if (approval) {
      approval.updateTime = timeStr;
      approval.comments = `${approval.comments || ''}\n\n最新审批:\n结果: ${getOperationText(result)}\n转派给: ${assignTo}\n截止日期: ${dueDate}\n意见: ${comment}`;
    }

    res.json({
      code: 200,
      message: '审批提交成功',
      data: newHistory
    });
  },

  // 移除漏洞
  'POST /api/approval/:id/remove-vuln': (req: any, res: any) => {
    const { id } = req.params;
    const { vulnerabilityId } = req.body;

    // 获取当前时间
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 查找审批单
    const approval = mockApprovals.find(item => item.id === id);
    if (!approval) {
      return res.json({
        code: 404,
        message: '审批单不存在'
      });
    }

    // 查找并更新对应的漏洞数据
    const targetVuln = __mockVulnerabilities.find(v => v.id === vulnerabilityId);
    if (!targetVuln) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    // 检查漏洞是否确实属于该审批单
    if (targetVuln.approvalId !== id) {
      return res.json({
        code: 400,
        message: '漏洞不属于该审批单'
      });
    }

    // 真正更新漏洞数据：移除审批单关联，更新状态为未分配
    targetVuln.approvalId = undefined;
    targetVuln.status = 'unassigned';
    console.log(`✅ 漏洞 ${vulnerabilityId} 已从审批单 ${id} 中移除，状态更新为未分配`);

    // 创建移除操作记录
    const removeHistory: ApprovalHistory = {
      id: `HIS-${id}-${nextHistoryId}`,
      approvalId: id,
      step: '漏洞移除',
      operator: '当前用户',
      operation: '移除',
      time: timeStr,
      comments: `已将漏洞 ${vulnerabilityId} 从审批单中移除，漏洞状态已更新为未分配`
    };

    mockApprovalHistory.push(removeHistory);
    nextHistoryId++;

    // 更新审批单的备注和时间
    approval.updateTime = timeStr;
    approval.comments = `${approval.comments || ''}\n\n[${timeStr}] 漏洞移除操作：${vulnerabilityId}`;

    // 检查是否还有其他漏洞与此审批单关联
    const remainingVulns = __mockVulnerabilities.filter(v => v.approvalId === id);
    const shouldCloseApproval = remainingVulns.length === 0;

    if (shouldCloseApproval) {
      // 如果没有漏洞了，关闭审批单
      approval.status = 'closed';
      approval.comments += `\n[${timeStr}] 所有漏洞已处理完毕，审批单自动关闭`;
      console.log(`✅ 审批单 ${id} 已自动关闭（所有漏洞已移除）`);
    }

    res.json({
      code: 200,
      message: '漏洞移除成功',
      data: {
        removedVulnId: vulnerabilityId,
        removeTime: timeStr,
        approvalClosed: shouldCloseApproval,
        remainingVulnCount: remainingVulns.length,
        // 告知前端数据已真正同步
        dataSynced: true
      }
    });
  }
};

// 获取操作结果文本
function getOperationText(result: string): string {
  const operationMap = {
    'approved': '通过',
    'rejected': '拒绝',
    'returned': '退回修改'
  };
  return operationMap[result] || '未知操作';
}