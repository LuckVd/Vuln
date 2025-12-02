import mockVulnerabilities from './vuln';
import mockApprovals from './approval';

// 纯Mock模式配置 - 完全基于Mock数据，不依赖数据库
export default {
  // 漏洞管理API - 纯Mock模式
  'GET /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln');
    const mockHandler = mockVulnerabilities['GET /api/vuln'];
    mockHandler(req, res);
  },
  'GET /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/:id');
    const mockHandler = mockVulnerabilities['GET /api/vuln/:id'];
    mockHandler(req, res);
  },
  'GET /api/vuln/unassigned': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/vuln/unassigned');
    const mockHandler = mockVulnerabilities['GET /api/vuln/unassigned'];
    mockHandler(req, res);
  },
  'POST /api/vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/vuln');
    const mockHandler = mockVulnerabilities['POST /api/vuln'];
    mockHandler(req, res);
  },
  'PUT /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: PUT /api/vuln/:id');
    const mockHandler = mockVulnerabilities['PUT /api/vuln/:id'];
    mockHandler(req, res);
  },
  'DELETE /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: DELETE /api/vuln/:id');
    const mockHandler = mockVulnerabilities['DELETE /api/vuln/:id'];
    mockHandler(req, res);
  },

  // 审批单管理API - 纯Mock模式
  'GET /api/approval': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval');
    const mockHandler = mockApprovals['GET /api/approval'];
    mockHandler(req, res);
  },
  'GET /api/approval/:id': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval/:id');
    const mockHandler = mockApprovals['GET /api/approval/:id'];
    mockHandler(req, res);
  },
  'POST /api/approval/create': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/create');
    const mockHandler = mockApprovals['POST /api/approval/create'];
    mockHandler(req, res);
  },
  'GET /api/approval/:id/history': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: GET /api/approval/:id/history');
    const mockHandler = mockApprovals['GET /api/approval/:id/history'];
    mockHandler(req, res);
  },
  'POST /api/approval/:id/submit': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/:id/submit');
    const mockHandler = mockApprovals['POST /api/approval/:id/submit'];
    mockHandler(req, res);
  },
  'POST /api/approval/:id/remove-vuln': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/:id/remove-vuln');
    const mockHandler = mockApprovals['POST /api/approval/:id/remove-vuln'];
    mockHandler(req, res);
  },
  'POST /api/approval/batch-assign': (req: any, res: any) => {
    console.log('🔄 [Mock] API调用: POST /api/approval/batch-assign');
    const mockHandler = mockApprovals['POST /api/approval/batch-assign'];
    mockHandler(req, res);
  },

  // 不需要导出...操作符，因为已经明确定义了所有API
};