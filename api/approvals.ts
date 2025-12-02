import { ApprovalService } from '../database/services/approvalService';

// 审批单管理API端点
export default {
  // 获取审批单列表
  'GET /api/approval': async (req: any, res: any) => {
    try {
      const { page = 1, pageSize = 10, status } = req.query;

      const result = await ApprovalService.getAllApprovals({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
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
      console.error('获取审批单列表失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 根据ID获取审批单详情
  'GET /api/approval/:id': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const approval = await ApprovalService.getApprovalById(id);

      if (!approval) {
        return res.json({
          code: 404,
          message: '审批单不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取成功',
        data: approval
      });
    } catch (error) {
      console.error('获取审批单详情失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 创建审批单
  'POST /api/approval': async (req: any, res: any) => {
    try {
      const approvalData = req.body;
      const newApproval = await ApprovalService.createApproval(approvalData);

      res.json({
        code: 200,
        message: '创建成功',
        data: newApproval
      });
    } catch (error) {
      console.error('创建审批单失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 提交审批单处理结果
  'POST /api/approval/:id/submit': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const submitData = req.body;

      const success = await ApprovalService.submitApproval({
        approvalId: id,
        ...submitData
      });

      if (!success) {
        return res.json({
          code: 400,
          message: '提交失败'
        });
      }

      res.json({
        code: 200,
        message: '提交成功'
      });
    } catch (error) {
      console.error('提交审批单失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 获取审批单历史记录
  'GET /api/approval/:id/history': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const history = await ApprovalService.getApprovalHistory(id);

      res.json({
        code: 200,
        message: '获取成功',
        data: history
      });
    } catch (error) {
      console.error('获取审批历史失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 获取审批单关联的漏洞
  'GET /api/vuln/approval/:approvalId': async (req: any, res: any) => {
    try {
      const { approvalId } = req.params;
      const vulnerabilities = await ApprovalService.getApprovalVulnerabilities(approvalId);

      res.json({
        code: 200,
        message: '获取成功',
        data: vulnerabilities
      });
    } catch (error) {
      console.error('获取审批单漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 从审批单中移除漏洞
  'POST /api/approval/:id/remove-vuln': async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { vulnerabilityId } = req.body;

      const result = await ApprovalService.removeVulnerabilityFromApproval(
        vulnerabilityId,
        id
      );

      if (!result.success) {
        return res.json({
          code: 400,
          message: '移除失败'
        });
      }

      res.json({
        code: 200,
        message: '漏洞移除成功',
        data: {
          removedVulnId: vulnerabilityId,
          removeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          approvalClosed: result.approvalClosed,
          remainingVulnCount: result.remainingCount,
          dataSynced: true
        }
      });
    } catch (error) {
      console.error('移除漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  },

  // 批量分配漏洞到审批单
  'POST /api/approval/batch-assign': async (req: any, res: any) => {
    try {
      const { vulnerabilityIds, approvalId } = req.body;

      if (!vulnerabilityIds || !Array.isArray(vulnerabilityIds) || vulnerabilityIds.length === 0) {
        return res.json({
          code: 400,
          message: '请提供有效的漏洞ID数组'
        });
      }

      await ApprovalService.assignVulnerabilitiesToApproval(vulnerabilityIds, approvalId);

      res.json({
        code: 200,
        message: '批量分配成功',
        data: {
          assignedCount: vulnerabilityIds.length,
          approvalId
        }
      });
    } catch (error) {
      console.error('批量分配漏洞失败:', error);
      res.json({
        code: 500,
        message: '服务器内部错误'
      });
    }
  }
};