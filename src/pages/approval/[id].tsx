import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert, Timeline, Table } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Approval, ApprovalHistory, Vulnerability } from '@/types';

const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取审批单详情
  const fetchApprovalDetail = async (approvalId: string) => {
    setLoading(true);
    try {
      // 获取审批单基本信息
      const approvalResponse = await fetch(`/api/approval/${approvalId}`);
      const approvalResult = await approvalResponse.json();

      // 获取审批历史
      const historyResponse = await fetch(`/api/approval/${approvalId}/history`);
      const historyResult = await historyResponse.json();

      // 获取相关漏洞
      const vulnResponse = await fetch(`/api/vuln/approval/${approvalId}`);
      const vulnResult = await vulnResponse.json();

      if (approvalResult.code === 200) {
        setApproval(approvalResult.data);
      } else {
        // 使用模拟数据
        const mockApproval: Approval = {
          id: 'APP-2024-001',
          title: '紧急漏洞修复审批',
          status: 'completed',
          createTime: '2024-01-15 11:00:00',
          updateTime: '2024-01-20 16:30:00',
          approver: '张三',
          priority: 'urgent',
          department: '安全部',
          comments: '本次漏洞涉及SQL注入和CSRF两个高危漏洞，需要紧急处理。请开发团队立即组织修复，测试团队重点验证。',
        };
        setApproval(mockApproval);
      }

      if (historyResult.code === 200) {
        setHistory(historyResult.data);
      } else {
        // 使用模拟数据
        const mockHistory: ApprovalHistory[] = [
          {
            id: 'HIS-2024-001-01',
            approvalId: approvalId,
            step: '提交申请',
            operator: '张三',
            operation: '提交',
            time: '2024-01-15 11:00:00',
            comments: '发现SQL注入和CSRF漏洞，申请紧急修复'
          },
          {
            id: 'HIS-2024-001-02',
            approvalId: approvalId,
            step: '安全评估',
            operator: '李四',
            operation: '审核通过',
            time: '2024-01-16 10:00:00',
            comments: '漏洞确实存在，风险等级评估准确'
          },
          {
            id: 'HIS-2024-001-03',
            approvalId: approvalId,
            step: '技术方案评审',
            operator: '王五',
            operation: '审核通过',
            time: '2024-01-17 14:00:00',
            comments: '修复方案可行，建议立即实施'
          },
          {
            id: 'HIS-2024-001-04',
            approvalId: approvalId,
            step: '最终审批',
            operator: '赵六',
            operation: '审批完成',
            time: '2024-01-20 16:30:00',
            comments: '审批通过，请立即开始修复工作'
          }
        ];
        setHistory(mockHistory);
      }

      if (vulnResult.code === 200) {
        setVulnerabilities(vulnResult.data);
      } else {
        // 使用模拟数据
        const mockVulns: Vulnerability[] = [
          {
            id: 'VUL-2024-001',
            name: 'SQL注入漏洞',
            source: 'IAST',
            riskLevel: 'critical',
            discoveryTime: '2024-01-15 10:30:00',
            expectedBlockTime: '2024-01-20 00:00:00',
            status: 'approved',
            description: '在用户登录模块发现SQL注入漏洞',
            severity: '严重',
            affectedComponent: 'user/login',
            approvalId: approvalId
          },
          {
            id: 'VUL-2024-004',
            name: 'CSRF跨站请求伪造',
            source: 'IAST',
            riskLevel: 'medium',
            discoveryTime: '2024-01-18 16:45:00',
            expectedBlockTime: '2024-01-26 00:00:00',
            status: 'approved',
            description: '关键业务操作缺少CSRF保护',
            severity: '中危',
            affectedComponent: 'user/settings',
            approvalId: approvalId
          }
        ];
        setVulnerabilities(mockVulns);
      }

    } catch (error) {
      console.error('获取审批单详情失败:', error);
      setApproval(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApprovalDetail(id);
    }
  }, [id]);

  // 返回列表页
  const goBack = () => {
    history.push('/approval');
  };

  // 查看漏洞详情
  const viewVulnerability = (vulnId: string) => {
    history.push(`/vuln/${vulnId}`);
  };

  // 优先级标签
  const getPriorityTag = (priority: string) => {
    const config = {
      urgent: { color: 'red', text: '紧急' },
      normal: { color: 'blue', text: '普通' },
      low: { color: 'green', text: '低优先级' },
    };
    const { color, text } = config[priority] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 风险等级标签
  const getRiskLevelTag = (level: string) => {
    const config = {
      critical: { color: 'red', text: '严重' },
      high: { color: 'orange', text: '高危' },
      medium: { color: 'gold', text: '中危' },
      low: { color: 'green', text: '低危' },
    };
    const { color, text } = config[level] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const vulnColumns: ColumnsType<Vulnerability> = [
    {
      title: '漏洞编号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string) => (
        <Button
          type="link"
          size="small"
          onClick={() => viewVulnerability(text)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '漏洞名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '漏洞来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
    },
    {
      title: '危害等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 120,
      render: (level: string) => getRiskLevelTag(level),
    },
    {
      title: '发现时间',
      dataIndex: 'discoveryTime',
      key: 'discoveryTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = {
          pending: { color: 'orange', text: '待审批' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          processing: { color: 'blue', text: '处理中' },
        };
        const { color, text } = config[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回列表
          </Button>
        </Space>
        <Alert
          message="审批单不存在"
          description="请检查审批单编号是否正确，或返回审批单列表重新选择。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="approval-detail">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          返回列表
        </Button>
      </Space>

      {/* 基本信息 */}
      <Card title="审批单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="审批单号">{approval.id}</Descriptions.Item>
          <Descriptions.Item label="审批标题">{approval.title}</Descriptions.Item>
          <Descriptions.Item label="优先级">{getPriorityTag(approval.priority)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="审批人">{approval.approver}</Descriptions.Item>
          <Descriptions.Item label="所属部门">{approval.department || '未指定'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{approval.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{approval.updateTime}</Descriptions.Item>
          <Descriptions.Item label="备注说明" span={2}>
            {approval.comments || '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* 审批流程 */}
        <Card title="审批流程" style={{ flex: 1, marginBottom: 16 }}>
          <Timeline
            mode="left"
            items={history.map((item) => ({
              dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
              children: (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {item.step} - {item.operator}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                    {item.time}
                  </div>
                  <div style={{ color: '#1890ff' }}>
                    {item.operation}
                  </div>
                  {item.comments && (
                    <div style={{ color: '#666', marginTop: '4px', fontSize: '13px' }}>
                      {item.comments}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        </Card>

        {/* 统计信息 */}
        <Card title="统计信息" style={{ width: '300px', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {vulnerabilities.length}
              </div>
              <div style={{ color: '#666' }}>涉及漏洞数量</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  {vulnerabilities.filter(v => v.riskLevel === 'critical').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>严重</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff7a45' }}>
                  {vulnerabilities.filter(v => v.riskLevel === 'high').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>高危</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffa940' }}>
                  {vulnerabilities.filter(v => v.riskLevel === 'medium').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>中危</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                  {vulnerabilities.filter(v => v.riskLevel === 'low').length}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>低危</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 相关漏洞 */}
      <Card title={`相关漏洞 (${vulnerabilities.length})`}>
        <Table
          columns={vulnColumns}
          dataSource={vulnerabilities}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ApprovalDetail;