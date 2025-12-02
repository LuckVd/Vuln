import mockVulnerabilities from './vuln';
import mockApprovals from './approval';

// 简化Mock配置，优先使用真实数据，数据库不可用时回退到Mock数据
export default {
  // 漏洞管理API - 优先尝试数据库，失败时使用Mock数据
  'GET /api/vuln': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/vuln');
    try {
      // 尝试从数据库获取数据
      require('../api/vulnerabilities').getVulnerabilities(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      // 数据库不可用时使用原始Mock数据
      const mockData = require('./vuln')['GET /api/vuln'];
      mockData(req, res);
    }
  },
  'GET /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/vuln/:id');
    try {
      require('../api/vulnerabilities').getVulnerabilityById(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./vuln')['GET /api/vuln/:id'];
      mockData(req, res);
    }
  },
  'GET /api/vuln/unassigned': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/vuln/unassigned');
    try {
      require('../api/vulnerabilities').getUnassignedVulnerabilities(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./vuln')['GET /api/vuln/unassigned'];
      mockData(req, res);
    }
  },
  'POST /api/vuln': (req: any, res: any) => {
    console.log('🔄 API调用: POST /api/vuln');
    try {
      require('../api/vulnerabilities').createVulnerability(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./vuln')['POST /api/vuln'];
      mockData(req, res);
    }
  },
  'PUT /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 API调用: PUT /api/vuln/:id');
    try {
      require('../api/vulnerabilities').updateVulnerability(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./vuln')['PUT /api/vuln/:id'];
      mockData(req, res);
    }
  },
  'DELETE /api/vuln/:id': (req: any, res: any) => {
    console.log('🔄 API调用: DELETE /api/vuln/:id');
    try {
      require('../api/vulnerabilities').deleteVulnerability(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./vuln')['DELETE /api/vuln/:id'];
      mockData(req, res);
    }
  },

  // 审批单管理API - 优先尝试数据库，失败时使用Mock数据
  'GET /api/approval': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/approval');
    try {
      require('../api/approvals').getApprovals(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['GET /api/approval'];
      mockData(req, res);
    }
  },
  'GET /api/approval/:id': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/approval/:id');
    try {
      require('../api/approvals').getApprovalById(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['GET /api/approval/:id'];
      mockData(req, res);
    }
  },
  'POST /api/approval': (req: any, res: any) => {
    console.log('🔄 API调用: POST /api/approval');
    try {
      require('../api/approvals').createApproval(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['POST /api/approval'];
      mockData(req, res);
    }
  },
  'GET /api/approval/:id/history': (req: any, res: any) => {
    console.log('🔄 API调用: GET /api/approval/:id/history');
    try {
      require('../api/approvals').getApprovalHistory(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['GET /api/approval/:id/history'];
      mockData(req, res);
    }
  },
  'POST /api/approval/:id/submit': (req: any, res: any) => {
    console.log('🔄 API调用: POST /api/approval/:id/submit');
    try {
      require('../api/approvals').submitApproval(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['POST /api/approval/:id/submit'];
      mockData(req, res);
    }
  },
  'POST /api/approval/:id/remove-vuln': (req: any, res: any) => {
    console.log('🔄 API调用: POST /api/approval/:id/remove-vuln');
    try {
      require('../api/approvals').removeVulnerabilityFromApproval(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['POST /api/approval/:id/remove-vuln'];
      mockData(req, res);
    }
  },
  'POST /api/approval/batch-assign': (req: any, res: any) => {
    console.log('🔄 API调用: POST /api/approval/batch-assign');
    try {
      require('../api/approvals').batchAssignVulnerabilities(req, res);
    } catch (error) {
      console.log('⚠️  数据库不可用，使用Mock数据');
      const mockData = require('./approval')['POST /api/approval/batch-assign'];
      mockData(req, res);
    }
  },

  // 保留一些原有的mock数据作为fallback（当数据库API不可用时）
  ...mockVulnerabilities,
  ...mockApprovals
};