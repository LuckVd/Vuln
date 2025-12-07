import { ApprovalDocument, ApprovalRecord, ApiResponse, PaginatedData } from '@/types';

// Mock 审批单据数据
let mockApprovalDocuments: ApprovalDocument[] = [
  {
    id: 1,
    approvalNumber: 'APP-2024-001',
    problemList: ['PROB-2024-001'],
    conclusion: '补丁修复',
    status: '审批中',
    vulnerabilityLevel: '严重',
    descriptionDisposal: '已修复SQL注入漏洞，使用参数化查询替换字符串拼接，并增加了输入验证机制。修复方案经过充分测试，不会影响现有功能。',
    approvalPerson: '张经理',
    softwarePerson: '李专家',
    createTime: '2024-01-15 09:30:00',
    createPerson: '张三'
  },
  {
    id: 2,
    approvalNumber: 'APP-2024-002',
    problemList: ['PROB-2024-003'],
    conclusion: '版本升级修复',
    status: '处置中',
    vulnerabilityLevel: '中危',
    descriptionDisposal: '已升级前端框架到最新版本，并集成了XSS过滤中间件。升级后系统性能有轻微提升，兼容性测试通过。',
    approvalPerson: '王主管',
    softwarePerson: '陈专家',
    createTime: '2024-01-16 14:20:00',
    createPerson: '王五'
  },
  {
    id: 3,
    approvalNumber: 'APP-2024-003',
    problemList: ['PROB-2024-004'],
    conclusion: '误报',
    status: '关闭',
    vulnerabilityLevel: '低危',
    descriptionDisposal: '经安全专家确认，该调试接口仅在测试环境使用，生产环境已通过配置文件禁用，不构成实际安全威胁。',
    approvalPerson: '赵总监',
    softwarePerson: '周专家',
    createTime: '2024-01-17 10:15:00',
    createPerson: '赵六'
  },
  {
    id: 4,
    approvalNumber: 'APP-2024-004',
    problemList: ['PROB-2024-007'],
    conclusion: '补丁修复',
    status: '已创建',
    vulnerabilityLevel: '严重',
    descriptionDisposal: '已修复权限验证逻辑中的缺陷，增加了多层次的权限检查机制，包括角色验证、资源权限验证和操作权限验证。修复方案已通过回归测试。',
    approvalPerson: '钱经理',
    softwarePerson: undefined,
    createTime: '2024-01-18 16:45:00',
    createPerson: '周九'
  }
];

// Mock 审批记录数据
let mockApprovalRecords: ApprovalRecord[] = [
  {
    id: 1,
    approvalNumber: 'APP-2024-001',
    approvalNode: '安全专家审核',
    approvalPerson: '李专家',
    approvalResult: '通过',
    approvalComments: '修复方案合理，测试充分，同意处置结论。',
    approvalTime: '2024-01-15 11:00:00'
  },
  {
    id: 2,
    approvalNumber: 'APP-2024-001',
    approvalNode: '技术主管审核',
    approvalPerson: '张经理',
    approvalResult: '审核中',
    approvalComments: '正在评估修复方案对系统性能的影响。',
    approvalTime: undefined
  },
  {
    id: 3,
    approvalNumber: 'APP-2024-002',
    approvalNode: '安全专家审核',
    approvalPerson: '陈专家',
    approvalResult: '通过',
    approvalComments: '版本升级方案可行，已确认新版本不存在其他已知漏洞。',
    approvalTime: '2024-01-16 15:30:00'
  },
  {
    id: 4,
    approvalNumber: 'APP-2024-002',
    approvalNode: '技术主管审核',
    approvalPerson: '王主管',
    approvalResult: '通过',
    approvalComments: '同意处置，请安排上线部署。',
    approvalTime: '2024-01-16 16:00:00'
  },
  {
    id: 5,
    approvalNumber: 'APP-2024-003',
    approvalNode: '安全专家审核',
    approvalPerson: '周专家',
    approvalResult: '通过',
    approvalComments: '确认误报，建议完善文档说明。',
    approvalTime: '2024-01-17 10:30:00'
  },
  {
    id: 6,
    approvalNumber: 'APP-2024-003',
    approvalNode: '技术总监审核',
    approvalPerson: '赵总监',
    approvalResult: '通过',
    approvalComments: '同意关闭该问题。',
    approvalTime: '2024-01-17 11:00:00'
  }
];

// 用于生成新的审批单据ID
let nextApprovalId = 5;
let nextRecordId = 7;

// 生成审批单据编号
function generateApprovalNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequence = String(mockApprovalDocuments.length + 1).padStart(3, '0');
  return `APP-${year}-${month}-${sequence}`;
}

export default {
  // 获取审批单据列表
  'GET /api/approval': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval');

    const { current = 1, pageSize = 10, status, vulnerabilityLevel } = req.query;

    let filteredApprovals = [...mockApprovalDocuments];

    // 按状态过滤
    if (status) {
      filteredApprovals = filteredApprovals.filter(a => a.status === status);
    }

    // 按漏洞等级过滤
    if (vulnerabilityLevel) {
      filteredApprovals = filteredApprovals.filter(a => a.vulnerabilityLevel === vulnerabilityLevel);
    }

    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredApprovals.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedData<ApprovalDocument>> = {
      code: 200,
      message: '获取审批单据列表成功',
      data: {
        list: paginatedData,
        total: filteredApprovals.length,
        current: parseInt(current),
        pageSize: parseInt(pageSize)
      }
    };

    res.json(response);
  },

  // 获取审批单据详情
  'GET /api/approval/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval/:id');
    const { id } = req.params;

    const approval = mockApprovalDocuments.find(a => a.id === parseInt(id));

    if (!approval) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取审批单据详情成功',
      data: approval
    });
  },

  // 创建审批单据
  'POST /api/approval/create': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/create');
    const {
      problemNumbers,
      conclusion,
      vulnerabilityLevel,
      descriptionDisposal,
      approvalPerson,
      softwarePerson,
      createPerson
    } = req.body;

    const newApproval: ApprovalDocument = {
      id: nextApprovalId++,
      approvalNumber: generateApprovalNumber(),
      problemList: problemNumbers,
      conclusion,
      status: '已创建',
      vulnerabilityLevel,
      descriptionDisposal,
      approvalPerson,
      softwarePerson,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createPerson
    };

    mockApprovalDocuments.push(newApproval);

    // 创建第一条审批记录
    const firstRecord: ApprovalRecord = {
      id: nextRecordId++,
      approvalNumber: newApproval.approvalNumber,
      approvalNode: '安全专家审核',
      approvalPerson: softwarePerson || '待分配',
      approvalResult: '待审核',
      approvalComments: '等待安全专家审核',
      approvalTime: undefined
    };

    mockApprovalRecords.push(firstRecord);

    res.json({
      code: 200,
      message: '创建审批单据成功',
      data: newApproval
    });
  },

  // 更新审批单据
  'PUT /api/approval/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: PUT /api/approval/:id');
    const { id } = req.params;
    const updateData = req.body;

    const index = mockApprovalDocuments.findIndex(a => a.id === parseInt(id));

    if (index === -1) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }

    mockApprovalDocuments[index] = { ...mockApprovalDocuments[index], ...updateData };

    res.json({
      code: 200,
      message: '更新审批单据成功',
      data: mockApprovalDocuments[index]
    });
  },

  // 提交审批
  'POST /api/approval/:id/submit': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/:id/submit');
    const { id } = req.params;
    const { approvalNode, approvalPerson, approvalResult, approvalComments } = req.body;

    const approvalIndex = mockApprovalDocuments.findIndex(a => a.id === parseInt(id));

    if (approvalIndex === -1) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }

    // 创建审批记录
    const newRecord: ApprovalRecord = {
      id: nextRecordId++,
      approvalNumber: mockApprovalDocuments[approvalIndex].approvalNumber,
      approvalNode,
      approvalPerson,
      approvalResult,
      approvalComments,
      approvalTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    mockApprovalRecords.push(newRecord);

    // 更新审批单状态
    if (approvalResult === '通过') {
      // 判断是否还有后续节点
      const nextNodeMap: { [key: string]: string } = {
        '安全专家审核': '技术主管审核',
        '技术主管审核': '安全总监审核',
        '安全总监审核': '关闭'
      };

      const nextNode = nextNodeMap[approvalNode];
      if (nextNode) {
        mockApprovalDocuments[approvalIndex].status = nextNode === '关闭' ? '关闭' : '审批中';
        mockApprovalDocuments[approvalIndex].approvalPerson = nextNode === '关闭' ? approvalPerson : '待分配';
      } else {
        mockApprovalDocuments[approvalIndex].status = '关闭';
      }
    } else if (approvalResult === '驳回') {
      mockApprovalDocuments[approvalIndex].status = '处置中';
    }

    res.json({
      code: 200,
      message: '审批提交成功',
      data: {
        approval: mockApprovalDocuments[approvalIndex],
        record: newRecord
      }
    });
  },

  // 获取审批历史记录
  'GET /api/approval/:id/history': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval/:id/history');
    const { id } = req.params;

    const approval = mockApprovalDocuments.find(a => a.id === parseInt(id));

    if (!approval) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }

    const records = mockApprovalRecords.filter(r => r.approvalNumber === approval.approvalNumber);

    res.json({
      code: 200,
      message: '获取审批历史成功',
      data: records,
      total: records.length
    });
  },

  // 从审批单中移除问题单据
  'POST /api/approval/:id/remove-problem': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/:id/remove-problem');
    const { id } = req.params;
    const { problemNumber } = req.body;

    const approvalIndex = mockApprovalDocuments.findIndex(a => a.id === parseInt(id));

    if (approvalIndex === -1) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }

    const approval = mockApprovalDocuments[approvalIndex];
    const problemIndex = approval.problemList.indexOf(problemNumber);

    if (problemIndex === -1) {
      return res.json({
        code: 404,
        message: '问题单据不在该审批单中'
      });
    }

    approval.problemList.splice(problemIndex, 1);

    res.json({
      code: 200,
      message: '移除问题单据成功',
      data: approval
    });
  },

  // 批量分配审批单据
  'POST /api/approval/batch-assign': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/batch-assign');
    const { approvalIds, approvalPerson } = req.body;

    let successCount = 0;
    const failedIds: number[] = [];

    approvalIds.forEach((id: number) => {
      const index = mockApprovalDocuments.findIndex(a => a.id === id);
      if (index !== -1) {
        mockApprovalDocuments[index].approvalPerson = approvalPerson;
        successCount++;
      } else {
        failedIds.push(id);
      }
    });

    res.json({
      code: 200,
      message: '批量分配完成',
      data: {
        successCount,
        failedCount: failedIds.length,
        failedIds
      }
    });
  }
};