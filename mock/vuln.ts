import { Vulnerability } from '@/types';

// Mock 漏洞数据
let mockVulnerabilities: Vulnerability[] = [
  {
    id: 'VUL-2024-001',
    name: 'SQL注入漏洞',
    source: 'IAST',
    riskLevel: 'critical',
    discoveryTime: '2024-01-15 10:30:00',
    expectedBlockTime: '2024-01-20 00:00:00',
    status: 'approved',
    description: '在用户登录模块发现SQL注入漏洞，攻击者可以通过构造恶意SQL语句获取数据库敏感信息',
    severity: '严重',
    affectedComponent: 'user/login',
    recommendation: '立即使用参数化查询替换字符串拼接，对所有用户输入进行严格验证',
    approvalId: 'APP-2024-001'
  },
  {
    id: 'VUL-2024-002',
    name: 'XSS跨站脚本攻击',
    source: 'DAST',
    riskLevel: 'high',
    discoveryTime: '2024-01-16 14:20:00',
    expectedBlockTime: '2024-01-22 00:00:00',
    status: 'processing',
    description: '在评论功能中发现存储型XSS漏洞，攻击者可以注入恶意脚本执行',
    severity: '高危',
    affectedComponent: 'product/comments',
    recommendation: '对用户输入进行HTML编码，使用CSP头部保护',
    approvalId: 'APP-2024-002'
  },
  {
    id: 'VUL-2024-003',
    name: '敏感信息泄露',
    source: 'SCA',
    riskLevel: 'medium',
    discoveryTime: '2024-01-17 09:15:00',
    expectedBlockTime: '2024-01-25 00:00:00',
    status: 'pending',
    description: 'API接口返回包含用户密码哈希等敏感信息',
    severity: '中危',
    affectedComponent: 'api/user/profile',
    recommendation: '移除敏感信息字段，仅返回必要的用户信息',
    approvalId: 'APP-2024-003'
  },
  {
    id: 'VUL-2024-004',
    name: 'CSRF跨站请求伪造',
    source: 'IAST',
    riskLevel: 'medium',
    discoveryTime: '2024-01-18 16:45:00',
    expectedBlockTime: '2024-01-26 00:00:00',
    status: 'approved',
    description: '关键业务操作缺少CSRF保护，可能导致恶意操作',
    severity: '中危',
    affectedComponent: 'user/settings',
    recommendation: '实施CSRF Token机制，对状态改变操作进行保护',
    approvalId: 'APP-2024-001'
  },
  {
    id: 'VUL-2024-005',
    name: '弱密码策略',
    source: 'SCA',
    riskLevel: 'low',
    discoveryTime: '2024-01-19 11:30:00',
    expectedBlockTime: '2024-01-30 00:00:00',
    status: 'processing',
    description: '用户密码策略过于简单，容易被暴力破解',
    severity: '低危',
    affectedComponent: 'auth/password',
    recommendation: '实施强密码策略，增加密码复杂度要求和账户锁定机制',
    approvalId: 'APP-2024-004'
  },
  {
    id: 'VUL-2024-006',
    name: '文件上传漏洞',
    source: 'DAST',
    riskLevel: 'critical',
    discoveryTime: '2024-01-20 13:20:00',
    expectedBlockTime: '2024-01-28 00:00:00',
    status: 'pending',
    description: '文件上传功能缺少类型和大小限制，可能导致任意文件上传',
    severity: '严重',
    affectedComponent: 'upload/avatar',
    recommendation: '严格限制文件类型和大小，对上传文件进行病毒扫描',
    approvalId: 'APP-2024-005'
  },
  {
    id: 'VUL-2024-007',
    name: '不安全的直接对象引用',
    source: 'IAST',
    riskLevel: 'high',
    discoveryTime: '2024-01-21 15:10:00',
    expectedBlockTime: '2024-01-29 00:00:00',
    status: 'rejected',
    description: '用户可以直接访问未授权的资源ID',
    severity: '高危',
    affectedComponent: 'api/order/detail',
    recommendation: '实施严格的访问控制，验证用户权限后再返回数据',
    approvalId: 'APP-2024-006'
  },
  {
    id: 'VUL-2024-008',
    name: 'Log4j远程代码执行',
    source: 'SCA',
    riskLevel: 'critical',
    discoveryTime: '2024-01-22 10:00:00',
    expectedBlockTime: '2024-01-23 00:00:00',
    status: 'approved',
    description: '检测到Log4j远程代码执行漏洞(CVE-2021-44228)',
    severity: '严重',
    affectedComponent: 'logging',
    recommendation: '立即升级Log4j到安全版本，移除JNDI Lookup功能',
    approvalId: 'APP-2024-007'
  },
  // 添加没有审批单关联的漏洞
  {
    id: 'VUL-2024-009',
    name: '目录遍历漏洞',
    source: 'IAST',
    riskLevel: 'high',
    discoveryTime: '2024-01-23 09:30:00',
    expectedBlockTime: '2024-01-30 00:00:00',
    status: 'unassigned',
    description: '文件下载功能存在目录遍历漏洞，攻击者可能访问系统敏感文件',
    severity: '高危',
    affectedComponent: 'api/file/download',
    recommendation: '严格校验文件路径，使用白名单限制可访问目录'
  },
  {
    id: 'VUL-2024-010',
    name: '命令注入漏洞',
    source: 'DAST',
    riskLevel: 'critical',
    discoveryTime: '2024-01-23 14:15:00',
    expectedBlockTime: '2024-01-30 00:00:00',
    status: 'unassigned',
    description: '系统命令执行接口未对用户输入进行过滤，可能导致任意命令执行',
    severity: '严重',
    affectedComponent: 'api/system/exec',
    recommendation: '避免直接执行用户输入，使用白名单验证输入参数'
  },
  {
    id: 'VUL-2024-011',
    name: '服务端请求伪造(SSRF)',
    source: 'IAST',
    riskLevel: 'medium',
    discoveryTime: '2024-01-24 11:20:00',
    expectedBlockTime: '2024-01-31 00:00:00',
    status: 'unassigned',
    description: '图片处理功能允许攻击者构造内网请求，可能访问内网敏感资源',
    severity: '中危',
    affectedComponent: 'api/image/process',
    recommendation: '限制可请求的目标地址范围，使用URL白名单'
  },
  {
    id: 'VUL-2024-012',
    name: '反序列化漏洞',
    source: 'SCA',
    riskLevel: 'critical',
    discoveryTime: '2024-01-24 16:45:00',
    expectedBlockTime: '2024-01-31 00:00:00',
    status: 'unassigned',
    description: '使用不安全的反序列化库，可能导致远程代码执行',
    severity: '严重',
    affectedComponent: 'data/serializer',
    recommendation: '升级序列化库到安全版本，实施输入验证和签名'
  },
  {
    id: 'VUL-2024-013',
    name: 'XML外部实体注入(XXE)',
    source: 'DAST',
    riskLevel: 'high',
    discoveryTime: '2024-01-25 10:10:00',
    expectedBlockTime: '2024-02-01 00:00:00',
    status: 'unassigned',
    description: 'XML解析器未禁用外部实体，可能导致敏感信息泄露或服务器请求伪造',
    severity: '高危',
    affectedComponent: 'api/xml/parser',
    recommendation: '禁用XML外部实体解析，使用安全的JSON替代XML'
  },
  {
    id: 'VUL-2024-014',
    name: '权限绕过漏洞',
    source: 'IAST',
    riskLevel: 'medium',
    discoveryTime: '2024-01-25 15:30:00',
    expectedBlockTime: '2024-02-01 00:00:00',
    status: 'unassigned',
    description: '用户权限检查逻辑存在缺陷，普通用户可访问管理员功能',
    severity: '中危',
    affectedComponent: 'api/admin/users',
    recommendation: '完善权限检查机制，确保所有接口都有正确的权限验证'
  }
];

// 用于生成新的审批单ID（避免与其他模块冲突）
let nextVulnApprovalId = 8;

// 计算预期阻断时间
function calculateExpectedBlockTime(riskLevel: string): string {
  const now = new Date();
  let daysToAdd = 0;

  switch (riskLevel) {
    case 'critical':
      daysToAdd = 3;
      break;
    case 'high':
      daysToAdd = 7;
      break;
    case 'medium':
      daysToAdd = 14;
      break;
    case 'low':
      daysToAdd = 30;
      break;
    default:
      daysToAdd = 7;
  }

  const expectedDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return expectedDate.toISOString().replace('T', ' ').substring(0, 19);
}

// 导出漏洞数据供其他模块使用（避免API冲突）
export const __mockVulnerabilities = mockVulnerabilities;

// API 模拟
export default {
  // 导出漏洞数据访问器
  __mockVulnerabilities,

  // 获取漏洞列表
  'GET /api/vuln': (req: any, res: any) => {
    const { page = 1, pageSize = 10, search, riskLevel, status } = req.query;

    let filteredData = mockVulnerabilities;

    // 搜索过滤
    if (search) {
      filteredData = mockVulnerabilities.filter(item =>
        item.name.includes(search) ||
        item.id.includes(search) ||
        item.source.includes(search)
      );
    }

    // 风险等级过滤
    if (riskLevel) {
      filteredData = filteredData.filter(item => item.riskLevel === riskLevel);
    }

    // 状态过滤
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }

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

  // 根据ID获取漏洞详情
  'GET /api/vuln/:id': (req: any, res: any) => {
    const { id } = req.params;
    const vulnerability = mockVulnerabilities.find(item => item.id === id);

    if (vulnerability) {
      res.json({
        code: 200,
        data: vulnerability
      });
    } else {
      res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }
  },

  // 根据审批单ID获取相关漏洞
  'GET /api/vuln/approval/:approvalId': (req: any, res: any) => {
    const { approvalId } = req.params;
    const vulnerabilities = mockVulnerabilities.filter(item => item.approvalId === approvalId);

    res.json({
      code: 200,
      data: vulnerabilities
    });
  },

  // 获取未分配的漏洞
  'GET /api/vuln/unassigned': (req: any, res: any) => {
    const { page = 1, pageSize = 10, search, riskLevel } = req.query;

    let filteredData = mockVulnerabilities.filter(item => !item.approvalId && item.status === 'unassigned');

    // 搜索过滤
    if (search) {
      filteredData = filteredData.filter(item =>
        item.name.includes(search) ||
        item.id.includes(search) ||
        item.source.includes(search)
      );
    }

    // 风险等级过滤
    if (riskLevel) {
      filteredData = filteredData.filter(item => item.riskLevel === riskLevel);
    }

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

  // 创建漏洞
  'POST /api/vuln': (req: any, res: any) => {
    const { name, source, riskLevel, description, severity, affectedComponent, recommendation } = req.body;

    // 生成新的漏洞ID
    const nextId = mockVulnerabilities.length + 1;
    const newVulnId = `VUL-2024-${String(nextId).padStart(3, '0')}`;

    // 获取当前时间
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 计算预期阻断时间（根据风险等级）
    const expectedBlockTime = calculateExpectedBlockTime(riskLevel);

    // 创建新漏洞
    const newVulnerability: Vulnerability = {
      id: newVulnId,
      name,
      source,
      riskLevel,
      discoveryTime: timeStr,
      expectedBlockTime,
      status: 'unassigned',
      description,
      severity,
      affectedComponent,
      recommendation
    };

    // 添加到数组
    mockVulnerabilities.push(newVulnerability);

    res.json({
      code: 200,
      message: '漏洞创建成功',
      data: newVulnerability
    });
  },

  // 更新漏洞
  'PUT /api/vuln/:id': (req: any, res: any) => {
    const { id } = req.params;
    const { name, source, riskLevel, description, severity, affectedComponent, recommendation } = req.body;

    const vulnerabilityIndex = mockVulnerabilities.findIndex(item => item.id === id);

    if (vulnerabilityIndex === -1) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    // 更新漏洞信息
    const updatedVulnerability = {
      ...mockVulnerabilities[vulnerabilityIndex],
      name: name || mockVulnerabilities[vulnerabilityIndex].name,
      source: source || mockVulnerabilities[vulnerabilityIndex].source,
      riskLevel: riskLevel || mockVulnerabilities[vulnerabilityIndex].riskLevel,
      description: description || mockVulnerabilities[vulnerabilityIndex].description,
      severity: severity || mockVulnerabilities[vulnerabilityIndex].severity,
      affectedComponent: affectedComponent || mockVulnerabilities[vulnerabilityIndex].affectedComponent,
      recommendation: recommendation || mockVulnerabilities[vulnerabilityIndex].recommendation
    };

    // 更新预期阻断时间（如果风险等级改变）
    if (riskLevel && riskLevel !== mockVulnerabilities[vulnerabilityIndex].riskLevel) {
      updatedVulnerability.expectedBlockTime = calculateExpectedBlockTime(riskLevel);
    }

    mockVulnerabilities[vulnerabilityIndex] = updatedVulnerability;

    res.json({
      code: 200,
      message: '漏洞更新成功',
      data: updatedVulnerability
    });
  },

  // 删除漏洞
  'DELETE /api/vuln/:id': (req: any, res: any) => {
    const { id } = req.params;

    const vulnerabilityIndex = mockVulnerabilities.findIndex(item => item.id === id);

    if (vulnerabilityIndex === -1) {
      return res.json({
        code: 404,
        message: '漏洞不存在'
      });
    }

    // 检查漏洞是否已关联审批单
    const vulnerability = mockVulnerabilities[vulnerabilityIndex];
    if (vulnerability.approvalId) {
      return res.json({
        code: 400,
        message: '漏洞已关联审批单，无法删除'
      });
    }

    // 删除漏洞
    mockVulnerabilities.splice(vulnerabilityIndex, 1);

    res.json({
      code: 200,
      message: '漏洞删除成功',
      data: { deletedVulnId: id }
    });
  },

  // 创建审批单
  'POST /api/approval/create': (req: any, res: any) => {
    const { title, priority, department, comments, dueDate, vulnerabilityIds } = req.body;

    // 验证漏洞是否有效且无审批单
    const selectedVulns = mockVulnerabilities.filter(v => vulnerabilityIds.includes(v.id));
    const hasApprovalId = selectedVulns.some(v => v.approvalId);
    const sources = [...new Set(selectedVulns.map(v => v.source))];

    if (hasApprovalId) {
      return res.json({
        code: 400,
        message: '选择的漏洞中包含已关联审批单的漏洞'
      });
    }

    if (sources.length > 1) {
      return res.json({
        code: 400,
        message: '只能选择相同来源的漏洞创建审批单'
      });
    }

    // 生成新的审批单ID
    const newApprovalId = `APP-2024-${String(nextVulnApprovalId).padStart(3, '0')}`;
    nextVulnApprovalId++;

    // 获取当前时间
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // 更新漏洞的审批单ID和状态
    selectedVulns.forEach(vuln => {
      vuln.approvalId = newApprovalId;
      vuln.status = 'pending';
    });

    res.json({
      code: 200,
      message: '审批单创建成功',
      data: {
        approvalId: newApprovalId,
        title,
        priority,
        department,
        comments,
        dueDate,
        vulnerabilityIds,
        vulnerabilityCount: vulnerabilityIds.length
      }
    });
  }
};