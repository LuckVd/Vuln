import { executeQuery, executeTransaction } from '../config/database';
import {
  Approval,
  ApprovalHistory,
  CreateApprovalInput,
  ApprovalSubmitInput
} from '../models/Approval';

export class ApprovalService {

  // 获取所有审批单
  static async getAllApprovals(filter: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ data: Approval[]; total: number }> {
    let whereConditions = [];
    let params = [];

    if (filter.status) {
      whereConditions.push('status = ?');
      params.push(filter.status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM approvals ${whereClause}`;
    const [countResult] = await executeQuery(countQuery, params);
    const total = countResult.total;

    // 获取分页数据
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const dataQuery = `
      SELECT * FROM approvals
      ${whereClause}
      ORDER BY create_time DESC
      LIMIT ? OFFSET ?
    `;
    params.push(pageSize, offset);

    const data = await executeQuery(dataQuery, params);

    return { data, total };
  }

  // 根据ID获取审批单
  static async getApprovalById(id: string): Promise<Approval | null> {
    const query = 'SELECT * FROM approvals WHERE id = ?';
    const results = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  // 获取审批单历史记录
  static async getApprovalHistory(approvalId: string): Promise<ApprovalHistory[]> {
    const query = `
      SELECT * FROM approval_history
      WHERE approval_id = ?
      ORDER BY time ASC
    `;
    return await executeQuery(query, [approvalId]);
  }

  // 获取审批单关联的漏洞
  static async getApprovalVulnerabilities(approvalId: string): Promise<any[]> {
    const query = `
      SELECT * FROM vulnerabilities
      WHERE approval_id = ?
      ORDER BY risk_level DESC, discovery_time DESC
    `;
    return await executeQuery(query, [approvalId]);
  }

  // 创建审批单
  static async createApproval(input: CreateApprovalInput): Promise<Approval | null> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const approvalId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const query = `
      INSERT INTO approvals (
        id, title, status, create_time, update_time, priority, department, comments, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      approvalId,
      input.title,
      'pending',
      now,
      now,
      input.priority,
      input.department,
      input.comments,
      input.createdBy || 'system'
    ];

    try {
      await executeQuery(query, params);
      console.log(`✅ 审批单 ${approvalId} 创建成功`);

      // 创建历史记录
      await this.createApprovalHistory({
        approvalId,
        step: '提交申请',
        operator: input.createdBy || 'system',
        operation: '提交',
        time: now,
        comments: '创建审批单申请'
      });

      // 批量关联漏洞
      if (input.vulnerabilityIds && input.vulnerabilityIds.length > 0) {
        await this.assignVulnerabilitiesToApproval(input.vulnerabilityIds, approvalId);
      }

      // 返回创建的审批单
      return await this.getApprovalById(approvalId);
    } catch (error) {
      console.error('创建审批单失败:', error);
      return null;
    }
  }

  // 提交审批单处理结果
  static async submitApproval(input: ApprovalSubmitInput): Promise<boolean> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const approvalId = input.approvalId;

    const updateQuery = `
      UPDATE approvals
      SET status = 'completed', update_time = ?, approver = ?, comments = CONCAT(IFNULL(comments, ''), '\n\n[', ?, '] ', IFNULL(?, ''))
      WHERE id = ?
    `;

    try {
      await executeQuery(updateQuery, [now, input.assignTo, now, input.assignTo, input.comment, approvalId]);

      // 创建历史记录
      await this.createApprovalHistory({
        approvalId,
        step: '最终审批',
        operator: input.submittedBy || 'system',
        operation: input.result,
        time: now,
        comments: input.comment
      });

      console.log(`✅ 审批单 ${approvalId} 提交成功`);
      return true;
    } catch (error) {
      console.error('提交审批单失败:', error);
      return false;
    }
  }

  // 移除审批单中的漏洞
  static async removeVulnerabilityFromApproval(
    vulnerabilityId: string,
    approvalId: string
  ): Promise<{ success: boolean; approvalClosed: boolean; remainingCount: number }> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const queries = [
      {
        query: 'SELECT id FROM vulnerabilities WHERE id = ? AND approval_id = ?',
        params: [vulnerabilityId, approvalId]
      },
      {
        query: 'UPDATE vulnerabilities SET approval_id = NULL, status = \'unassigned\', updated_at = ? WHERE id = ? AND approval_id = ?',
        params: [now, vulnerabilityId, approvalId]
      }
    ];

    try {
      const result = await executeTransaction(queries);

      if (!result.success) {
        throw result.error;
      }

      // 检查审批单是否还有其他漏洞
      const countQuery = 'SELECT COUNT(*) as count FROM vulnerabilities WHERE approval_id = ?';
      const [countResult] = await executeQuery(countQuery, [approvalId]);
      const remainingCount = countResult.count;
      const approvalClosed = remainingCount === 0;

      // 如果没有漏洞了，关闭审批单
      if (approvalClosed) {
        await executeQuery(
          'UPDATE approvals SET status = \'closed\', update_time = ?, comments = CONCAT(IFNULL(comments, \'\'), \'\n\n[\', ?, \'] 所有漏洞已处理完毕，审批单自动关闭\') WHERE id = ?',
          [now, now, approvalId]
        );
      }

      // 创建移除操作历史记录
      await this.createApprovalHistory({
        approvalId,
        step: '漏洞移除',
        operator: '当前用户',
        operation: '移除',
        time: now,
        comments: `已将漏洞 ${vulnerabilityId} 从审批单中移除，漏洞状态已更新为未分配`
      });

      console.log(`✅ 漏洞 ${vulnerabilityId} 已从审批单 ${approvalId} 中移除，状态更新为未分配`);
      if (approvalClosed) {
        console.log(`✅ 审批单 ${approvalId} 已自动关闭（所有漏洞已移除）`);
      }

      return {
        success: true,
        approvalClosed,
        remainingCount
      };
    } catch (error) {
      console.error('移除漏洞关联失败:', error);
      return { success: false, approvalClosed: false, remainingCount: 0 };
    }
  }

  // 创建审批历史记录
  private static async createApprovalHistory(history: Omit<ApprovalHistory, 'id'>): Promise<void> {
    const historyId = `HIS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const query = `
      INSERT INTO approval_history (
        id, approval_id, step, operator, operation, time, comments
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      historyId,
      history.approvalId,
      history.step,
      history.operator,
      history.operation,
      history.time,
      history.comments
    ];

    await executeQuery(query, params);
  }

  // 批量分配漏洞到审批单
  private static async assignVulnerabilitiesToApproval(
    vulnerabilityIds: string[],
    approvalId: string
  ): Promise<void> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const queries = vulnerabilityIds.map(vulnId => ({
      query: 'UPDATE vulnerabilities SET approval_id = ?, status = \'approved\', updated_at = ? WHERE id = ?',
      params: [approvalId, now, vulnId]
    }));

    await executeTransaction(queries);
    console.log(`✅ 批量分配 ${vulnerabilityIds.length} 个漏洞到审批单 ${approvalId}`);
  }
}