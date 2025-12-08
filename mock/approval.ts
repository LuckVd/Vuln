import { ApprovalDocument, ApprovalRecord, ApiResponse, PaginatedData } from '../src/types';
// Mock 审批单据数据 (使用新的数字类型枚举)
let mockApprovalDocuments: ApprovalDocument[] = [
  {
    id: 1,
    approvalNumber: 'APP-2024-001',
    problemList: ['PROB-2024-001'],
    conclusion: 4, // 补丁修复
    status: 3, // 审批中
    vulnerabilityLevel: 1, // 严重
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
    conclusion: 3, // 版本升级修复
    status: 2, // 处置中
    vulnerabilityLevel: 3, // 中危
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
    conclusion: 1, // 误报
    status: 4, // 关闭
    vulnerabilityLevel: 4, // 低危
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
    conclusion: 4, // 补丁修复
    status: 1, // 已创建
    vulnerabilityLevel: 1, // 严重
    descriptionDisposal: '已修复权限验证逻辑中的缺陷，增加了多层次的权限检查机制，包括角色验证、资源权限验证和操作权限验证。修复方案已通过回归测试。',
    approvalPerson: '钱经理',
    softwarePerson: undefined,
    createTime: '2024-01-18 16:45:00',
    createPerson: '周九'
  },
  {
    id: 5,
    approvalNumber: 'APP-2024-005',
    problemList: ['PROB-2024-002', 'PROB-2024-005'],
    conclusion: 3, // 版本升级修复
    status: 3, // 审批中
    vulnerabilityLevel: 1, // 严重
    descriptionDisposal: '批量升级Log4j组件到安全版本2.17.1，同时升级Spring Framework到5.3.21版本。升级过程已在测试环境充分验证，系统稳定性良好，性能无明显影响。',
    approvalPerson: '孙总监',
    softwarePerson: '吴专家',
    createTime: '2024-01-19 11:20:00',
    createPerson: '李四'
  },
  {
    id: 6,
    approvalNumber: 'APP-2024-006',
    problemList: ['PROB-2024-006'],
    conclusion: 4, // 补丁修复
    status: 2, // 处置中
    vulnerabilityLevel: 2, // 高危
    descriptionDisposal: '已为管理员操作接口添加CSRF Token防护机制，并对所有敏感操作增加二次确认。修复方案已在预发布环境测试完成。',
    approvalPerson: '周主管',
    softwarePerson: '郑专家',
    createTime: '2024-01-20 13:45:00',
    createPerson: '孙八'
  },
  {
    id: 7,
    approvalNumber: 'APP-2024-007',
    problemList: ['PROB-2024-008'],
    conclusion: 2, // 不受影响
    status: 4, // 关闭
    vulnerabilityLevel: 3, // 中危
    descriptionDisposal: '经核实，该漏洞影响的组件在实际业务环境中未启用相关功能，当前配置不受到此漏洞影响。建议后续版本升级中移除该组件。',
    approvalPerson: '吴经理',
    softwarePerson: '冯专家',
    createTime: '2024-01-21 09:15:00',
    createPerson: '钱七'
  },
  {
    id: 8,
    approvalNumber: 'APP-2024-008',
    problemList: ['PROB-2024-009'],
    conclusion: 5, // 有修复方案接受风险
    status: 3, // 审批中
    vulnerabilityLevel: 2, // 高危
    descriptionDisposal: '该漏洞需要升级核心业务系统，影响范围较大。短期内可通过网络隔离和访问控制降低风险，已制定详细的修复计划，预计在下个季度完成升级。',
    approvalPerson: '郑总监',
    softwarePerson: '陈专家',
    createTime: '2024-01-22 15:30:00',
    createPerson: '孙八'
  },
  {
    id: 9,
    approvalNumber: 'APP-2024-009',
    problemList: ['PROB-2024-010'],
    conclusion: 6, // 无修复方案接受风险
    status: 4, // 关闭
    vulnerabilityLevel: 3, // 中危
    descriptionDisposal: '该漏洞为第三方框架底层设计问题，暂无完美的修复方案。已通过配置优化和监控加强来降低风险，业务影响可接受。',
    approvalPerson: '王经理',
    softwarePerson: '卫专家',
    createTime: '2024-01-23 10:45:00',
    createPerson: '周九'
  },
  {
    id: 10,
    approvalNumber: 'APP-2024-010',
    problemList: ['PROB-2024-011', 'PROB-2024-012', 'PROB-2024-013'],
    conclusion: 4, // 补丁修复
    status: 1, // 已创建
    vulnerabilityLevel: 1, // 严重
    descriptionDisposal: '发现多个严重漏洞，涉及权限绕过、SQL注入、文件上传等多个安全问题。已开发综合补丁包，包含完整的安全修复方案。',
    approvalPerson: '蒋主管',
    softwarePerson: '沈专家',
    createTime: '2024-01-24 16:20:00',
    createPerson: '吴六'
  },
  {
    id: 11,
    approvalNumber: 'APP-2024-011',
    problemList: ['PROB-2024-014'],
    conclusion: 3, // 版本升级修复
    status: 3, // 审批中
    vulnerabilityLevel: 4, // 低危
    descriptionDisposal: '升级日志组件到最新版本，修复信息泄露问题。新版本同时改进了日志格式和性能表现。',
    approvalPerson: '韩经理',
    softwarePerson: '杨专家',
    createTime: '2024-01-25 08:30:00',
    createPerson: '郑七'
  },
  {
    id: 12,
    approvalNumber: 'APP-2024-012',
    problemList: ['PROB-2024-015'],
    conclusion: 1, // 误报
    status: 4, // 关闭
    vulnerabilityLevel: 2, // 高危
    descriptionDisposal: '安全扫描报告的XSS漏洞为误报，经过代码审查和渗透测试确认，相关输入输出都有适当的过滤和编码处理。',
    approvalPerson: '朱总监',
    softwarePerson: '秦专家',
    createTime: '2024-01-26 14:10:00',
    createPerson: '王八'
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
let nextApprovalId = 13;
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
    const { current = 1, pageSize = 10, status, vulnerabilityLevel } = req.query;
    let filteredApprovals = [...mockApprovalDocuments];
    // 按状态过滤
    if (status) {
      const statusNum = parseInt(status);
      filteredApprovals = filteredApprovals.filter(a => a.status === statusNum);
    }
    // 按漏洞等级过滤
    if (vulnerabilityLevel) {
      const levelNum = parseInt(vulnerabilityLevel);
      filteredApprovals = filteredApprovals.filter(a => a.vulnerabilityLevel === levelNum);
    }
    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredApprovals.slice(startIndex, endIndex);
    res.json({
      code: 200,
      message: '获取审批单据列表成功',
      data: paginatedData,
      total: filteredApprovals.length
    });
  },
  // 获取审批单据详情
  'GET /api/approval/:id': (req: any, res: any) => {
    const { id } = req.params;
    // 先尝试按数字ID查找
    let approval = mockApprovalDocuments.find(a => a.id === parseInt(id));
    // 如果数字ID找不到，尝试按审批编号查找
    if (!approval) {
      approval = mockApprovalDocuments.find(a => a.approvalNumber === id);
    }
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
  // 根据审批编号获取审批单据详情
  'GET /api/approval/number/:approvalNumber': (req: any, res: any) => {
    const { approvalNumber } = req.params;
    const approval = mockApprovalDocuments.find(a => a.approvalNumber === approvalNumber);
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
      conclusion: parseInt(conclusion),
      status: 1, // 已创建
      vulnerabilityLevel: parseInt(vulnerabilityLevel),
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
    const { id } = req.params;
    const updateData = req.body;
    const index = mockApprovalDocuments.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }
    // 转换字符串枚举为数字
    if (updateData.conclusion) {
      updateData.conclusion = parseInt(updateData.conclusion);
    }
    if (updateData.status) {
      updateData.status = parseInt(updateData.status);
    }
    if (updateData.vulnerabilityLevel) {
      updateData.vulnerabilityLevel = parseInt(updateData.vulnerabilityLevel);
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
        mockApprovalDocuments[approvalIndex].status = nextNode === '关闭' ? 4 : 3; // 4关闭, 3审批中
        mockApprovalDocuments[approvalIndex].approvalPerson = nextNode === '关闭' ? approvalPerson : '待分配';
      } else {
        mockApprovalDocuments[approvalIndex].status = 4; // 关闭
      }
    } else if (approvalResult === '驳回') {
      mockApprovalDocuments[approvalIndex].status = 2; // 处置中
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
    const { id } = req.params;
    // 先尝试按数字ID查找
    let approval = mockApprovalDocuments.find(a => a.id === parseInt(id));
    // 如果数字ID找不到，尝试按审批编号查找
    if (!approval) {
      approval = mockApprovalDocuments.find(a => a.approvalNumber === id);
    }
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
  // 获取审批单据的问题统计
  'GET /api/approval/:id/stats': (req: any, res: any) => {
    const { id } = req.params;
    const approval = mockApprovalDocuments.find(a => a.id === parseInt(id));
    if (!approval) {
      return res.json({
        code: 404,
        message: '审批单据不存在'
      });
    }
    // 基于审批单的漏洞等级生成统计
    const stats = {
      total: approval.problemList.length,
      critical: approval.vulnerabilityLevel === 1 ? approval.problemList.length : 0,
      high: approval.vulnerabilityLevel === 2 ? approval.problemList.length : 0,
      medium: approval.vulnerabilityLevel === 3 ? approval.problemList.length : 0,
      low: approval.vulnerabilityLevel === 4 ? approval.problemList.length : 0,
    };
    res.json({
      code: 200,
      message: '获取问题统计成功',
      data: stats
    });
  },
  // 批量分配审批单据
  'POST /api/approval/batch-assign': (req: any, res: any) => {
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