import { Vulnerability, StageOperation, ProblemDocument } from '@/types';

// 内部Mock问题单据数据（复制一份以避免导入问题）
const mockProblemDocuments: ProblemDocument[] = [
  {
    id: 1,
    problemNumber: 'PROB-2024-001',
    projectNumber: 'PRJ-001',
    vulnerabilityLevel: '严重',
    vulnerabilityNum: 'VULN-SEC-001',
    isRedLine: true,
    isSoftware: false,
    scanItem: 'SQL注入',
    componentName: undefined,
    componentVersion: undefined,
    ip: '192.168.1.100',
    api: '/api/user/login',
    descriptionBrief: '登录接口存在SQL注入漏洞',
    descriptionDetailed: '登录接口对用户输入的参数未进行充分的过滤和验证，导致攻击者可以通过构造恶意SQL语句来获取或修改数据库中的敏感信息。',
    expectedDate: '2024-02-15',
    status: '处置中',
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
    vulnerabilityLevel: '高危',
    vulnerabilityNum: 'VULN-HIGH-002',
    isRedLine: false,
    isSoftware: true,
    scanItem: '组件漏洞',
    componentName: 'log4j',
    componentVersion: '2.14.1',
    ip: undefined,
    api: undefined,
    descriptionBrief: 'Log4j组件存在远程代码执行漏洞',
    descriptionDetailed: '项目使用的Log4j版本存在CVE-2021-44228漏洞，攻击者可以通过构造恶意的JNDI查询字符串来触发远程代码执行。',
    expectedDate: '2024-02-10',
    status: '已创建',
    conclusion: undefined,
    fixAddress: undefined,
    fixVersion: undefined,
    descriptionDisposal: undefined,
    responsiblePerson: '李四',
    approvalList: []
  }
];

// 暂存操作数据
let stageOperations: StageOperation[] = [];

// 生成暂存操作ID
function generateStageOperationId(): string {
  return `STAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 导出以供其他文件使用
export { mockProblemDocuments as __mockVulnerabilities };

export default {
  // 获取漏洞列表 - 重用问题单据API，保持向后兼容
  'GET /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln (重定向到问题单据API)');

    // 直接处理数据，模拟问题单据API的行为
    const { current = 1, pageSize = 10, projectNumber, status, vulnerabilityLevel } = req.query;

    let filteredProblems = [...mockProblemDocuments];

    // 按项目编号过滤
    if (projectNumber) {
      filteredProblems = filteredProblems.filter(p => p.projectNumber === projectNumber);
    }

    // 按状态过滤
    if (status) {
      filteredProblems = filteredProblems.filter(p => p.status === status);
    }

    // 按漏洞等级过滤
    if (vulnerabilityLevel) {
      filteredProblems = filteredProblems.filter(p => p.vulnerabilityLevel === vulnerabilityLevel);
    }

    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredProblems.slice(startIndex, endIndex);

    res.json({
      code: 200,
      message: '获取漏洞列表成功',
      data: paginatedData,
      total: filteredProblems.length
    });
  },

  // 获取漏洞详情 - 重用问题单据API
  'GET /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/:id (重定向到问题单据API)');
    const { id } = req.params;

    const problem = mockProblemDocuments.find(p => p.id === parseInt(id));

    if (!problem) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取漏洞详情成功',
      data: problem
    });
  },

  // 获取未分配的漏洞 - 重用问题单据API
  'GET /api/vuln/unassigned': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/unassigned (重定向到问题单据API)');

    const unassignedProblems = mockProblemDocuments.filter(p => !p.responsiblePerson || p.responsiblePerson === '');

    res.json({
      code: 200,
      message: '获取未分配问题单据成功',
      data: unassignedProblems,
      total: unassignedProblems.length
    });
  },

  // 创建漏洞 - 简化版本
  'POST /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln');

    // 简化创建逻辑，直接返回成功
    const newId = Math.max(...mockProblemDocuments.map(p => p.id)) + 1;

    const newVuln = {
      id: newId,
      problemNumber: `PROB-2024-${String(newId).padStart(3, '0')}`,
      projectNumber: req.body.projectNumber || 'PRJ-DEFAULT',
      vulnerabilityLevel: req.body.riskLevel === 'critical' ? '严重' :
                         req.body.riskLevel === 'high' ? '高危' :
                         req.body.riskLevel === 'medium' ? '中危' : '低危',
      vulnerabilityNum: `VULN-${newId}`,
      isRedLine: req.body.riskLevel === 'critical',
      isSoftware: false,
      scanItem: req.body.source || '未知',
      componentName: req.body.affectedComponent,
      descriptionBrief: req.body.name || '未命名漏洞',
      descriptionDetailed: req.body.description || '暂无描述',
      expectedDate: req.body.expectedBlockTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: '已创建',
      responsiblePerson: req.body.responsiblePerson || '未分配',
      ip: req.body.ip,
      api: req.body.api,
      approvalList: []
    };

    res.json({
      code: 200,
      message: '创建漏洞成功',
      data: newVuln
    });
  },

  // 更新漏洞 - 简化版本
  'PUT /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: PUT /api/vuln/:id');
    const { id } = req.params;

    const index = mockProblemDocuments.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    // 简化更新逻辑
    res.json({
      code: 200,
      message: '更新漏洞成功',
      data: { ...mockProblemDocuments[index], ...req.body }
    });
  },

  // 删除漏洞 - 简化版本
  'DELETE /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: DELETE /api/vuln/:id');
    const { id } = req.params;

    const index = mockProblemDocuments.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除漏洞成功',
      data: mockProblemDocuments[index]
    });
  },

  // 批量分配漏洞 - 简化版本
  'POST /api/vuln/batch-assign': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/batch-assign');
    const { vulnIds, responsiblePerson } = req.body;

    const results = vulnIds.map((id: number) => ({
      vulnId: id,
      success: true,
      message: '分配成功'
    }));

    res.json({
      code: 200,
      message: '批量分配完成',
      data: {
        successCount: vulnIds.length,
        failedCount: 0,
        failedIds: []
      }
    });
  },

  // 以下是暂存相关功能，保持原有实现
  'POST /api/vuln/stage': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/stage');
    const { vulnId, stagedData } = req.body;

    // 由于现在是基于问题单据，暂存功能需要适配
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 创建暂存操作记录
    const stageOperation: StageOperation = {
      id: generateStageOperationId(),
      vulnId,
      operation: 'update',
      stagedData,
      createTime: timeStr
    };
    stageOperations.push(stageOperation);

    res.json({
      code: 200,
      message: '暂存成功',
      data: {
        vulnId,
        stagedData,
        stageTime: timeStr
      }
    });
  },

  'POST /api/vuln/stage/batch': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/stage/batch');
    const { operations } = req.body;
    const results = [];
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    for (const { vulnId, stagedData } of operations) {
      try {
        const stageOperation: StageOperation = {
          id: generateStageOperationId(),
          vulnId,
          operation: 'update',
          stagedData,
          createTime: timeStr
        };
        stageOperations.push(stageOperation);
        results.push({ vulnId, success: true, message: '暂存成功' });
      } catch (error) {
        results.push({ vulnId, success: false, message: '暂存失败' });
      }
    }

    res.json({
      code: 200,
      message: '批量暂存操作完成',
      data: results
    });
  },

  'GET /api/vuln/staged': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/staged');
    res.json({
      code: 200,
      data: stageOperations,
      total: stageOperations.length
    });
  },

  'POST /api/vuln/stage/apply/:vulnId': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/stage/apply/:vulnId');
    const { vulnId } = req.params;

    const operationIndex = stageOperations.findIndex(op => op.vulnId === vulnId);
    if (operationIndex === -1) {
      return res.json({
        code: 404,
        message: '暂存记录不存在'
      });
    }

    const operation = stageOperations[operationIndex];
    if (operation.stagedData) {
      // 删除暂存记录
      stageOperations.splice(operationIndex, 1);
      res.json({
        code: 200,
        message: '暂存修改已应用',
        data: operation.stagedData
      });
    } else {
      res.json({
        code: 400,
        message: '暂存数据为空'
      });
    }
  },

  'POST /api/vuln/stage/apply/batch': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/stage/apply/batch');
    const { vulnIds } = req.body;
    const results = [];

    for (const vulnId of vulnIds) {
      const operationIndex = stageOperations.findIndex(op => op.vulnId === vulnId);

      if (operationIndex === -1) {
        results.push({ vulnId, success: false, message: '暂存记录不存在' });
        continue;
      }

      const operation = stageOperations[operationIndex];
      if (operation.stagedData) {
        results.push({ vulnId, success: true, message: '暂存修改已应用' });
      } else {
        results.push({ vulnId, success: false, message: '暂存数据为空' });
      }
    }

    // 删除已应用的暂存操作记录
    stageOperations = stageOperations.filter(op => !vulnIds.includes(op.vulnId));

    res.json({
      code: 200,
      message: '批量应用暂存修改完成',
      data: results
    });
  },

  'DELETE /api/vuln/stage/:vulnId': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: DELETE /api/vuln/stage/:vulnId');
    const { vulnId } = req.params;

    const operationIndex = stageOperations.findIndex(op => op.vulnId === vulnId);
    if (operationIndex === -1) {
      return res.json({
        code: 404,
        message: '暂存记录不存在'
      });
    }

    stageOperations.splice(operationIndex, 1);

    res.json({
      code: 200,
      message: '暂存修改已取消',
      data: { vulnId }
    });
  },

  'DELETE /api/vuln/stage/batch': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: DELETE /api/vuln/stage/batch');
    const { vulnIds } = req.body;
    const results = [];

    for (const vulnId of vulnIds) {
      const operationIndex = stageOperations.findIndex(op => op.vulnId === vulnId);

      if (operationIndex !== -1) {
        stageOperations.splice(operationIndex, 1);
        results.push({ vulnId, success: true, message: '暂存修改已取消' });
      } else {
        results.push({ vulnId, success: false, message: '暂存记录不存在' });
      }
    }

    res.json({
      code: 200,
      message: '批量取消暂存修改完成',
      data: results
    });
  },

  'GET /api/vuln/stage/operations': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/stage/operations');
    res.json({
      code: 200,
      data: stageOperations,
      total: stageOperations.length
    });
  }
};