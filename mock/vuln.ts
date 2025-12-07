import { Vulnerability, ProblemDocument, ApiResponse, PaginatedData, ENUMS, REVERSE_STRING_ENUMS } from '../src/types';
import { mockProblemDocuments } from './problem';

// 暂存操作数据
let stageOperations: any[] = [];

// 生成暂存操作ID
function generateStageOperationId(): string {
  return `STAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 将数据库数据转换为前端显示格式
function transformProblemToVulnerability(problem: ProblemDocument): any {
  return {
    id: problem.id,
    name: problem.descriptionBrief || '未命名漏洞',
    source: problem.scanItem || '未知',
    riskLevel: REVERSE_STRING_ENUMS.VULNERABILITY_LEVEL[problem.vulnerabilityLevel] || 'unknown',
    discoveryTime: problem.createTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
    expectedBlockTime: problem.expectedDate || '未设定',
    status: REVERSE_STRING_ENUMS.STATUS[problem.status] || 'unknown',
    description: problem.descriptionDetailed || '暂无描述',
    severity: ENUMS.VULNERABILITY_LEVEL[problem.vulnerabilityLevel] || '未知',
    affectedComponent: problem.componentName || '未定义',
    recommendation: problem.descriptionDisposal || '暂无建议',
    approvalId: problem.approvalList && problem.approvalList.length > 0 ? problem.approvalList[0] : undefined,
    responsiblePerson: problem.responsiblePerson || '未分配',
    // 保持数据库原始字段
    isRedLine: problem.isRedLine,
    isSoftware: problem.isSoftware,
    problemNumber: problem.problemNumber,
    projectNumber: problem.projectNumber,
    vulnerabilityNum: problem.vulnerabilityNum,
    ip: problem.ip,
    api: problem.api,
    expectedDate: problem.expectedDate,
    conclusion: problem.conclusion,
    fixAddress: problem.fixAddress,
    fixVersion: problem.fixVersion,
    descriptionDisposal: problem.descriptionDisposal,
    approvalList: problem.approvalList
  };
}

// 将前端请求数据转换为数据库格式
function transformVulnerabilityToProblem(data: any): any {
  return {
    vulnerabilityLevel: data.riskLevel ? (typeof data.riskLevel === 'string' ? data.riskLevel : parseInt(data.riskLevel)) : undefined,
    status: data.status ? (typeof data.status === 'string' ? data.status : parseInt(data.status)) : undefined,
    scanItem: data.source,
    componentName: data.affectedComponent,
    descriptionBrief: data.name,
    descriptionDetailed: data.description,
    expectedDate: data.expectedBlockTime,
    descriptionDisposal: data.recommendation,
    responsiblePerson: data.responsiblePerson,
    isRedLine: data.isRedLine ? (typeof data.isRedLine === 'boolean' ? (data.isRedLine ? 1 : 0) : parseInt(data.isRedLine)) : 0,
    isSoftware: data.isSoftware ? (typeof data.isSoftware === 'boolean' ? (data.isSoftware ? 1 : 0) : parseInt(data.isSoftware)) : 0,
    ip: data.ip,
    api: data.api
  };
}

export default {
  // 获取漏洞列表 - 基于problem数据转换
  'GET /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln');

    const { current = 1, pageSize = 10, projectNumber, status, vulnerabilityLevel } = req.query;

    let filteredProblems = [...mockProblemDocuments];

    // 按项目编号过滤
    if (projectNumber) {
      filteredProblems = filteredProblems.filter(p => p.projectNumber === projectNumber);
    }

    // 按状态过滤 - 需要转换前端状态到后端状态
    if (status) {
      const statusMap: { [key: string]: number } = {
        'pending': 1,
        'processing': 2,
        'approved': 3,
        'rejected': 4,
        'unassigned': 1
      };
      const backendStatus = statusMap[status] || parseInt(status);
      filteredProblems = filteredProblems.filter(p => p.status === backendStatus);
    }

    // 按漏洞等级过滤 - 需要转换前端等级到后端等级
    if (vulnerabilityLevel) {
      const levelMap: { [key: string]: number } = {
        'critical': 1,
        'high': 2,
        'medium': 3,
        'low': 4
      };
      const backendLevel = levelMap[vulnerabilityLevel] || parseInt(vulnerabilityLevel);
      filteredProblems = filteredProblems.filter(p => p.vulnerabilityLevel === backendLevel);
    }

    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredProblems.slice(startIndex, endIndex);

    // 转换为前端格式
    const transformedData = paginatedData.map(transformProblemToVulnerability);

    res.json({
      code: 200,
      message: '获取漏洞列表成功',
      data: transformedData,
      total: filteredProblems.length
    });
  },

  // 获取漏洞详情
  'GET /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/:id');
    const { id } = req.params;

    const problem = mockProblemDocuments.find(p => p.id === parseInt(id));

    if (!problem) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    const transformedData = transformProblemToVulnerability(problem);

    res.json({
      code: 200,
      message: '获取漏洞详情成功',
      data: transformedData
    });
  },

  // 获取未分配的漏洞
  'GET /api/vuln/unassigned': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/unassigned');

    const unassignedProblems = mockProblemDocuments.filter(p => !p.responsiblePerson || p.responsiblePerson === '');

    // 转换为前端格式
    const transformedData = unassignedProblems.map(transformProblemToVulnerability);

    res.json({
      code: 200,
      message: '获取未分配漏洞成功',
      data: transformedData,
      total: unassignedProblems.length
    });
  },

  // 创建漏洞
  'POST /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln');

    const transformedData = transformVulnerabilityToProblem(req.body);

    const newProblem: ProblemDocument = {
      id: Math.max(...mockProblemDocuments.map(p => p.id)) + 1,
      problemNumber: `PROB-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(mockProblemDocuments.length + 1).padStart(3, '0')}`,
      projectNumber: transformedData.projectNumber || 'PRJ-DEFAULT',
      vulnerabilityLevel: transformedData.vulnerabilityLevel || 3,
      vulnerabilityNum: `VULN-${mockProblemDocuments.length + 1}`,
      isRedLine: transformedData.isRedLine || 0,
      isSoftware: transformedData.isSoftware || 0,
      scanItem: transformedData.scanItem || '未知',
      componentName: transformedData.componentName,
      componentVersion: undefined,
      ip: transformedData.ip,
      api: transformedData.api,
      descriptionBrief: transformedData.descriptionBrief || '未命名漏洞',
      descriptionDetailed: transformedData.descriptionDetailed || '暂无描述',
      expectedDate: transformedData.expectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 1, // 已创建
      conclusion: undefined,
      fixAddress: undefined,
      fixVersion: undefined,
      descriptionDisposal: transformedData.descriptionDisposal,
      responsiblePerson: transformedData.responsiblePerson || '未分配',
      approvalList: []
    };

    mockProblemDocuments.push(newProblem);

    // 转换为前端格式返回
    const returnData = transformProblemToVulnerability(newProblem);

    res.json({
      code: 200,
      message: '创建漏洞成功',
      data: returnData
    });
  },

  // 更新漏洞
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

    const transformedData = transformVulnerabilityToProblem(req.body);
    mockProblemDocuments[index] = { ...mockProblemDocuments[index], ...transformedData };

    res.json({
      code: 200,
      message: '更新漏洞成功',
      data: transformProblemToVulnerability(mockProblemDocuments[index])
    });
  },

  // 删除漏洞
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

    const deletedProblem = mockProblemDocuments.splice(index, 1)[0];

    res.json({
      code: 200,
      message: '删除漏洞成功',
      data: transformProblemToVulnerability(deletedProblem)
    });
  },

  // 批量分配漏洞
  'POST /api/vuln/batch-assign': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/batch-assign');
    const { vulnIds, responsiblePerson } = req.body;

    let successCount = 0;
    const failedIds: number[] = [];

    vulnIds.forEach((id: number) => {
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

  // 暂存相关功能保持不变
  'POST /api/vuln/stage': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln/stage');
    const { vulnId, stagedData } = req.body;

    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const stageOperation = {
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
        const stageOperation = {
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
      const transformedData = transformVulnerabilityToProblem(operation.stagedData);
      const problemIndex = mockProblemDocuments.findIndex(p => p.id === parseInt(vulnId));

      if (problemIndex !== -1) {
        mockProblemDocuments[problemIndex] = { ...mockProblemDocuments[problemIndex], ...transformedData };
      }

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
        const transformedData = transformVulnerabilityToProblem(operation.stagedData);
        const problemIndex = mockProblemDocuments.findIndex(p => p.id === parseInt(vulnId));

        if (problemIndex !== -1) {
          mockProblemDocuments[problemIndex] = { ...mockProblemDocuments[problemIndex], ...transformedData };
        }

        results.push({ vulnId, success: true, message: '暂存修改已应用' });
      } else {
        results.push({ vulnId, success: false, message: '暂存数据为空' });
      }
    }

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