import { VulnerabilityService } from '../database/services/vulnerabilityService';

// 漏洞管理API端点
export default {
  // 获取漏洞列表
  'GET /api/vuln': async (req: any, res: any) => {
    try {
      const { page = 1, pageSize = 10, search, riskLevel, status } = req.query;

      const result = await VulnerabilityService.getVulnerabilitiesByFilter({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        search: search as string,
        riskLevel: riskLevel as string,
        status: status as string
      });

      res.json({
        code: 200,
        message: '获取成功',
        data: result.data,
        total: result.total,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      });
    } catch (error) {
      console.error('获取漏洞列表失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 根据ID获取漏洞详情
  'GET /api/vuln/:id': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const vulnerability = await VulnerabilityService.getVulnerabilityById(id);

      if (!vulnerability) {
        return res.json({
          code: 404,
          message: '漏洞不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取成功',
        data: vulnerability
      });
    } catch (error) {
      console.error('获取漏洞详情失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 创建漏洞
  'POST /api/vuln': async (req: any, res: any) => {
    try {
      const vulnerabilityData = req.body;
      const newVulnerability = await VulnerabilityService.createVulnerability(vulnerabilityData);

      res.json({
        code: 200,
        message: '创建成功',
        data: newVulnerability
      });
    } catch (error) {
      console.error('创建漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 更新漏洞
  'PUT /api/vuln/:id': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const success = await VulnerabilityService.updateVulnerability(id, updateData);

      if (!success) {
        return res.json({
          code: 400,
          message: '更新失败'
        });
      }

      const updatedVulnerability = await VulnerabilityService.getVulnerabilityById(id);

      res.json({
        code: 200,
        message: '更新成功',
        data: updatedVulnerability
      });
    } catch (error) {
      console.error('更新漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 获取未分配的漏洞
  'GET /api/vuln/unassigned': async (req: any, res: any) => {
    try {
      const vulnerabilities = await VulnerabilityService.getUnassignedVulnerabilities();

      res.json({
        code: 200,
        message: '获取成功',
        data: vulnerabilities
      });
    } catch (error) {
      console.error('获取未分配漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 删除漏洞
  'DELETE /api/vuln/:id': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const success = await VulnerabilityService.deleteVulnerability(id);

      if (!success) {
        return res.json({
          code: 404,
          message: '漏洞不存在或删除失败'
        });
      }

      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  }
};