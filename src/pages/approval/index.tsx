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
        current: page.toString(),
        pageSize: size.toString()
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

  
  // 状态标签
  const getStatusTag = (status: number) => {
    const statusMap = {
      1: { color: 'blue', text: '已创建' },
      2: { color: 'orange', text: '处置中' },
      3: { color: 'purple', text: '审批中' },
      4: { color: 'green', text: '关闭' }
    };
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 漏洞等级标签
  const getLevelTag = (level: number) => {
    const levelMap = {
      1: { color: 'red', text: '严重' },
      2: { color: 'orange', text: '高危' },
      3: { color: 'gold', text: '中危' },
      4: { color: 'green', text: '低危' }
    };
    const { color, text } = levelMap[level] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 结论标签
  const getConclusionTag = (conclusion: number) => {
    const conclusionMap = {
      1: { color: 'green', text: '误报' },
      2: { color: 'blue', text: '不受影响' },
      3: { color: 'cyan', text: '版本升级' },
      4: { color: 'purple', text: '补丁修复' },
      5: { color: 'orange', text: '接受风险' },
      6: { color: 'volcano', text: '无修复方案' }
    };
    const { color, text } = conclusionMap[conclusion] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<Approval> = [
    {
      title: '审批单号',
      dataIndex: 'approvalNumber',
      key: 'approvalNumber',
      width: 150,
      render: (text: string, record: Approval) => (
        <Link to={`/approval/${record.id}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
          {text}
        </Link>
      ),
    },
    {
      title: '关联问题',
      dataIndex: 'problemList',
      key: 'problemList',
      width: 120,
      render: (problems: string[]) => (
        <Tag color="blue">{problems.length}个问题</Tag>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'vulnerabilityLevel',
      key: 'vulnerabilityLevel',
      width: 100,
      render: (level: number) => getLevelTag(level),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '结论',
      dataIndex: 'conclusion',
      key: 'conclusion',
      width: 120,
      render: (conclusion: number) => getConclusionTag(conclusion),
    },
    {
      title: '审批人',
      dataIndex: 'approvalPerson',
      key: 'approvalPerson',
      width: 120,
    },
    {
      title: '软研专家',
      dataIndex: 'softwarePerson',
      key: 'softwarePerson',
      width: 120,
      render: (person: string) => person || <Tag color="default">未分配</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'createPerson',
      key: 'createPerson',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
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
              显示所有状态的审批单（已创建、处置中、审批中、关闭）
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