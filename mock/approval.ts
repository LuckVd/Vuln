import { Approval, ApprovalHistory } from '@/types';

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
const mockApprovalHistory: ApprovalHistory[] = [
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
  }
];

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
  }
};