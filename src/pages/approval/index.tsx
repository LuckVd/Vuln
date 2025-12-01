import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, message, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import { Approval } from '@/types';

// 漏洞统计组件
const VulnerabilityStats: React.FC<{ approvalId: string }> = ({ approvalId }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/vuln/approval/${approvalId}`);
        const result = await response.json();

        if (result.code === 200) {
          const vulns = result.data;
          const newStats = {
            total: vulns.length,
            critical: vulns.filter((v: any) => v.riskLevel === 'critical').length,
            high: vulns.filter((v: any) => v.riskLevel === 'high').length,
            medium: vulns.filter((v: any) => v.riskLevel === 'medium').length,
            low: vulns.filter((v: any) => v.riskLevel === 'low').length,
          };
          setStats(newStats);
        }
      } catch (error) {
        console.error('获取漏洞统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [approvalId]);

  if (loading) {
    return <Tag color="default">加载中...</Tag>;
  }

  if (!stats || stats.total === 0) {
    return <Tag color="default">无漏洞</Tag>;
  }

  const riskTags = [];
  if (stats.critical > 0) {
    riskTags.push(<Tag key="critical" color="red">{stats.critical}严重</Tag>);
  }
  if (stats.high > 0) {
    riskTags.push(<Tag key="high" color="orange">{stats.high}高危</Tag>);
  }
  if (stats.medium > 0) {
    riskTags.push(<Tag key="medium" color="gold">{stats.medium}中危</Tag>);
  }
  if (stats.low > 0) {
    riskTags.push(<Tag key="low" color="green">{stats.low}低危</Tag>);
  }

  return (
    <Tooltip title={`总计 ${stats.total} 个漏洞`}>
      <Space size="small" wrap>
        {riskTags}
      </Space>
    </Tooltip>
  );
};

const ApprovalList: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 获取审批单列表
  const fetchApprovals = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        status: 'completed' // 只获取已完成的审批单
      });

      const response = await fetch(`/api/approval?${params}`);
      const result = await response.json();

      if (result.code === 200) {
        setApprovals(result.data);
        setTotal(result.total);
      } else {
        message.error('获取审批单列表失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(current, pageSize);
  }, [current, pageSize]);

  // 分页处理
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
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

  
  const columns: ColumnsType<Approval> = [
    {
      title: '审批单号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string) => (
        <Link to={`/approval/${text}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
          {text}
        </Link>
      ),
    },
    {
      title: '审批标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: () => <Tag color="green">已完成</Tag>,
    },
    {
      title: '漏洞统计',
      key: 'vulnerabilityStats',
      width: 200,
      render: (_, record: Approval) => (
        <VulnerabilityStats approvalId={record.id} />
      ),
    },
    {
      title: '审批人',
      dataIndex: 'approver',
      key: 'approver',
      width: 120,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record: Approval) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            window.location.href = `/approval/${record.id}`;
          }}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="approval-list">
      <Card title="审批管理" extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchApprovals(current, pageSize)}
        >
          刷新
        </Button>
      }>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span style={{ color: '#666' }}>
              注：仅显示已完成的审批单
            </span>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={approvals}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default ApprovalList;