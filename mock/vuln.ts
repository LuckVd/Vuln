import { Vulnerability } from '@/types';

// Mock 漏洞数据
const mockVulnerabilities: Vulnerability[] = [
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
  }
];

// API 模拟
export default {
  // 获取漏洞列表
  'GET /api/vuln': (req: any, res: any) => {
    const { page = 1, pageSize = 10, search } = req.query;

    let filteredData = mockVulnerabilities;

    // 搜索过滤
    if (search) {
      filteredData = mockVulnerabilities.filter(item =>
        item.name.includes(search) ||
        item.id.includes(search) ||
        item.source.includes(search)
      );
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
  }
};