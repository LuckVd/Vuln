import { ProblemDocument, ApiResponse, PaginatedData, ENUMS } from '../src/types';
// Mock 问题单据数据 (使用新的数字类型枚举)
export let mockProblemDocuments: ProblemDocument[] = [
  {
    id: 1,
    problemNumber: 'PROB-2024-001',
    projectNumber: 'PRJ-001',
    vulnerabilityLevel: 1, // 严重
    vulnerabilityNum: 'VULN-SEC-001',
    isRedLine: 1,
    isSoftware: 0,
    scanItem: 'SQL注入',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.100',
    api: '/api/user/login',
    descriptionRief: '登录接口存在SQL注入漏洞',
    descriptionDetailed: '登录接口对用户输入的参数未进行充分的过滤和验证，导致攻击者可以通过构造恶意SQL语句来获取或修改数据库中的敏感信息。该漏洞可能导致用户数据泄露、系统被控制等严重后果。',
    expectedDate: '2024-02-15',
    status: 2, // 处置中
    conclusion: undefined,
    fixAddress: 'https://github.com/project/fix/commit/abc123',
    fixVersion: 'v2.1.0',
    descriptionDisposal: '已修复SQL注入漏洞，使用参数化查询替换字符串拼接，并增加了输入验证机制',
    responsiblePerson: '张三',
    approvalList: ['APP-2024-001']
  },
  {
    id: 2,
    problemNumber: 'PROB-2024-002',
    projectNumber: 'PRJ-001',
    vulnerabilityLevel: 2, // 高危
    vulnerabilityNum: 'VULN-HIGH-002',
    isRedLine: 0,
    isSoftware: 1,
    scanItem: '组件漏洞',
    componentName: 'log4j',
    componentVersion: '2.14.1',
    ip: undefined,
    api: undefined,
    descriptionRief: 'Log4j组件存在远程代码执行漏洞',
    descriptionDetailed: '项目使用的Log4j版本存在CVE-2021-44228漏洞，攻击者可以通过构造恶意的JNDI查询字符串来触发远程代码执行，可能导致服务器被完全控制。',
    expectedDate: '2024-02-10',
    status: 1, // 已创建
    conclusion: undefined,
    fixAddress: undefined,
    fixVersion: undefined,
    descriptionDisposal: undefined,
    responsiblePerson: '李四',
    approvalList: []
  },
  {
    id: 3,
    problemNumber: 'PROB-2024-003',
    projectNumber: 'PRJ-002',
    vulnerabilityLevel: 3, // 中危
    vulnerabilityNum: 'VULN-MED-003',
    isRedLine: 0,
    isSoftware: 0,
    scanItem: 'XSS跨站脚本',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.200',
    api: '/api/comment',
    descriptionRief: '评论功能存在存储型XSS漏洞',
    descriptionDetailed: '用户评论内容未进行HTML编码和过滤，攻击者可以在评论中插入恶意脚本，当其他用户查看评论时，恶意脚本会在用户浏览器中执行，可能导致用户会话劫持、数据窃取等。',
    expectedDate: '2024-02-20',
    status: 3, // 审批中
    conclusion: 3, // 版本升级修复
    fixAddress: 'https://github.com/project/fix/commit/def456',
    fixVersion: 'v1.5.2',
    descriptionDisposal: '已升级前端框架版本，并增加了XSS过滤中间件',
    responsiblePerson: '王五',
    approvalList: ['APP-2024-002']
  },
  {
    id: 4,
    problemNumber: 'PROB-2024-004',
    projectNumber: 'PRJ-002',
    vulnerabilityLevel: 4, // 低危
    vulnerabilityNum: 'VULN-LOW-004',
    isRedLine: 0,
    isSoftware: 0,
    scanItem: '信息泄露',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.201',
    api: '/api/debug/info',
    descriptionRief: '调试接口泄露敏感信息',
    descriptionDetailed: '调试接口在生产环境中仍然开放，返回了系统内部信息包括数据库连接字符串、API密钥等敏感信息，可能被攻击者利用进行进一步攻击。',
    expectedDate: '2024-02-25',
    status: 4, // 关闭
    conclusion: 1, // 误报
    fixAddress: 'https://github.com/project/fix/commit/ghi789',
    fixVersion: 'v1.5.1',
    descriptionDisposal: '经确认该接口为内部测试接口，已在生产环境配置中禁用',
    responsiblePerson: '赵六',
    approvalList: ['APP-2024-003']
  },
  {
    id: 5,
    problemNumber: 'PROB-2024-005',
    projectNumber: 'PRJ-003',
    vulnerabilityLevel: 2, // 高危
    vulnerabilityNum: 'VULN-HIGH-005',
    isRedLine: 1,
    isSoftware: 1,
    scanItem: '组件漏洞',
    componentName: 'spring-framework',
    componentVersion: '5.3.15',
    ip: undefined,
    api: undefined,
    descriptionRief: 'Spring框架存在SpEL表达式注入漏洞',
    descriptionDetailed: '项目使用的Spring Framework版本存在CVE-2022-22965漏洞，攻击者可以通过构造恶意的SpEL表达式来执行任意代码，可能导致服务器被完全控制。',
    expectedDate: '2024-02-08',
    status: 2, // 处置中
    conclusion: undefined,
    fixAddress: undefined,
    fixVersion: undefined,
    descriptionDisposal: undefined,
    responsiblePerson: '钱七',
    approvalList: []
  },
  {
    id: 6,
    problemNumber: 'PROB-2024-006',
    projectNumber: 'PRJ-003',
    vulnerabilityLevel: 3, // 中危
    vulnerabilityNum: 'VULN-MED-006',
    isRedLine: 0,
    isSoftware: 0,
    scanItem: 'CSRF跨站请求伪造',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.300',
    api: '/api/admin/settings',
    descriptionRief: '管理员设置接口存在CSRF漏洞',
    descriptionDetailed: '管理员设置接口未实施CSRF防护机制，攻击者可以诱导已登录的管理员访问恶意网站，从而在管理员不知情的情况下执行恶意操作，如修改系统设置、创建管理员账户等。',
    expectedDate: '2024-02-18',
    status: 1, // 已创建
    conclusion: undefined,
    fixAddress: undefined,
    fixVersion: undefined,
    descriptionDisposal: undefined,
    responsiblePerson: '孙八',
    approvalList: []
  },
  {
    id: 7,
    problemNumber: 'PROB-2024-007',
    projectNumber: 'PRJ-004',
    vulnerabilityLevel: 1, // 严重
    vulnerabilityNum: 'VULN-SEC-007',
    isRedLine: 1,
    isSoftware: 0,
    scanItem: '权限绕过',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.400',
    api: '/api/admin/delete-user',
    descriptionRief: '用户删除接口存在权限绕过漏洞',
    descriptionDetailed: '用户删除接口的权限验证逻辑存在缺陷，普通用户可以通过构造特殊请求来删除其他用户的账户，包括管理员账户，可能导致系统权限混乱和数据丢失。',
    expectedDate: '2024-02-05',
    status: 3, // 审批中
    conclusion: 4, // 补丁修复
    fixAddress: 'https://github.com/project/fix/commit/jkl012',
    fixVersion: 'v3.2.1',
    descriptionDisposal: '已修复权限验证逻辑，增加了多层次的权限检查机制',
    responsiblePerson: '周九',
    approvalList: ['APP-2024-004']
  }
];
// 用于生成新的问题单据ID
let nextProblemId = 8;
// 生成问题单据编号
function generateProblemNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequence = String(mockProblemDocuments.length + 1).padStart(3, '0');
  return `PROB-${year}-${month}-${sequence}`;
}
// 生成漏洞编号
function generateVulnerabilityNum(): string {
  const sequence = String(mockProblemDocuments.length + 1).padStart(3, '0');
  return `VULN-${sequence}`;
}
export default {
  // 获取问题单据列表
  'GET /api/problem': (req: any, res: any) => {
    const { current = 1, pageSize = 10, projectNumber, status, vulnerabilityLevel } = req.query;
    let filteredProblems = [...mockProblemDocuments];
    // 按项目编号过滤
    if (projectNumber) {
      filteredProblems = filteredProblems.filter(p => p.projectNumber === projectNumber);
    }
    // 按状态过滤
    if (status) {
      const statusNum = parseInt(status);
      filteredProblems = filteredProblems.filter(p => p.status === statusNum);
    }
    // 按漏洞等级过滤
    if (vulnerabilityLevel) {
      const levelNum = parseInt(vulnerabilityLevel);
      filteredProblems = filteredProblems.filter(p => p.vulnerabilityLevel === levelNum);
    }
    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredProblems.slice(startIndex, endIndex);
    const response: ApiResponse<PaginatedData<ProblemDocument>> = {
      code: 200,
      message: '获取问题单据列表成功',
      data: {
        list: paginatedData,
        total: filteredProblems.length,
        current: parseInt(current),
        pageSize: parseInt(pageSize)
      }
    };
    res.json(response);
  },
  // 获取问题单据详情
  'GET /api/problem/:id': (req: any, res: any) => {
    const { id } = req.params;
    const problem = mockProblemDocuments.find(p => p.id === parseInt(id));
    if (!problem) {
      return res.json({
        code: 404,
        message: '问题单据不存在'
      });
    }
    res.json({
      code: 200,
      message: '获取问题单据详情成功',
      data: problem
    });
  },
  // 根据问题编号获取问题单据详情
  'GET /api/problem/number/:problemNumber': (req: any, res: any) => {
    const { problemNumber } = req.params;
    const problem = mockProblemDocuments.find(p => p.problemNumber === problemNumber);
    if (!problem) {
      return res.json({
        code: 404,
        message: '问题单据不存在'
      });
    }
    res.json({
      code: 200,
      message: '获取问题单据详情成功',
      data: problem
    });
  },
  // 创建问题单据
  'POST /api/problem': (req: any, res: any) => {
    const {
      projectNumber,
      vulnerabilityLevel,
      scanItem,
      componentName,
      componentVersion,
      ip,
      api,
      descriptionRief,
      descriptionDetailed,
      expectedDate,
      isRedLine = 0,
      isSoftware = 0,
      responsiblePerson
    } = req.body;
    const newProblem: ProblemDocument = {
      id: nextProblemId++,
      problemNumber: generateProblemNumber(),
      projectNumber,
      vulnerabilityLevel: parseInt(vulnerabilityLevel),
      vulnerabilityNum: generateVulnerabilityNum(),
      isRedLine: isRedLine ? 1 : 0,
      isSoftware: isSoftware ? 1 : 0,
      scanItem,
      componentName,
      componentVersion,
      ip,
      api,
      descriptionRief,
      descriptionDetailed,
      expectedDate,
      status: 1, // 已创建
      conclusion: undefined,
      fixAddress: undefined,
      fixVersion: undefined,
      descriptionDisposal: undefined,
      responsiblePerson,
      approvalList: []
    };
    mockProblemDocuments.push(newProblem);
    res.json({
      code: 200,
      message: '创建问题单据成功',
      data: newProblem
    });
  },
  // 更新问题单据
  'PUT /api/problem/:id': (req: any, res: any) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = mockProblemDocuments.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.json({
        code: 404,
        message: '问题单据不存在'
      });
    }
    // 转换字符串枚举为数字
    if (updateData.vulnerabilityLevel) {
      updateData.vulnerabilityLevel = parseInt(updateData.vulnerabilityLevel);
    }
    if (updateData.status) {
      updateData.status = parseInt(updateData.status);
    }
    if (updateData.conclusion) {
      updateData.conclusion = parseInt(updateData.conclusion);
    }
    mockProblemDocuments[index] = { ...mockProblemDocuments[index], ...updateData };
    res.json({
      code: 200,
      message: '更新问题单据成功',
      data: mockProblemDocuments[index]
    });
  },
  // 删除问题单据
  'DELETE /api/problem/:id': (req: any, res: any) => {
    const { id } = req.params;
    const index = mockProblemDocuments.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.json({
        code: 404,
        message: '问题单据不存在'
      });
    }
    const deletedProblem = mockProblemDocuments.splice(index, 1)[0];
    res.json({
      code: 200,
      message: '删除问题单据成功',
      data: deletedProblem
    });
  },
  // 批量分配问题单据
  'POST /api/problem/batch-assign': (req: any, res: any) => {
    const { problemIds, responsiblePerson } = req.body;
    let successCount = 0;
    const failedIds: number[] = [];
    problemIds.forEach((id: number) => {
      const index = mockProblemDocuments.findIndex(p => p.id === id);
          if (index !== -1) {
        mockProblemDocuments[index].responsiblePerson = responsiblePerson;
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
  },
  // 获取未分配的问题单据
  'GET /api/problem/unassigned': (req: any, res: any) => {
    const unassignedProblems = mockProblemDocuments.filter(p => !p.responsiblePerson || p.responsiblePerson === '');
    res.json({
      code: 200,
      message: '获取未分配问题单据成功',
      data: unassignedProblems,
      total: unassignedProblems.length
    });
  },
  'POST /api/problem/stage/batch': (req: any, res: any) => {
    const { operations } = req.body;
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        code: 400,
        message: '参数错误：operations必须是数组'
      });
    }
    try {
      // 模拟批量处理
      const processedCount = operations.length;
      res.json({
        code: 200,
        message: '批量暂存成功',
        data: {
          processedCount,
          operations
        }
      });
    } catch (error) {
      console.error('❌ 批量暂存失败:', error);
      res.status(500).json({
        code: 500,
        message: '批量暂存失败'
      });
    }
  }
};