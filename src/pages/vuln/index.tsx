import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Tag, Button, Card, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import { Vulnerability } from '@/types';

const { Option } = Select;

const VulnerabilityList: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 获取漏洞列表
  const fetchVulnerabilities = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
      });

      if (searchText) {
        params.append('search', searchText);
      }
      if (riskLevelFilter) {
        params.append('riskLevel', riskLevelFilter);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/vuln?${params}`);
      const result = await response.json();

      if (result.code === 200) {
        setVulnerabilities(result.data);
        setTotal(result.total);
      } else {
        message.error('获取漏洞列表失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities(current, pageSize);
  }, [current, pageSize]);

  // 搜索处理
  const handleSearch = () => {
    setCurrent(1);
    fetchVulnerabilities(1, pageSize);
  };

  // 重置筛选
  const handleReset = () => {
    setSearchText('');
    setRiskLevelFilter('');
    setStatusFilter('');
    setCurrent(1);
    fetchVulnerabilities(1, pageSize);
  };

  // 分页处理
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
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

  // 状态标签
  const getStatusTag = (status: string) => {
    const config = {
      pending: { color: 'orange', text: '待审批' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
      processing: { color: 'blue', text: '处理中' },
    };
    const { color, text } = config[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<Vulnerability> = [
    {
      title: '漏洞编号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string, record: Vulnerability) => (
        <Link to={`/vuln/${text}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
          {text}
        </Link>
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
      title: '预期拦截时间',
      dataIndex: 'expectedBlockTime',
      key: 'expectedBlockTime',
      width: 180,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: Vulnerability) => (
        <Link to={`/approval/${record.approvalId}`} style={{ textDecoration: 'none' }}>
          {getStatusTag(status)}
        </Link>
      ),
    },
  ];

  return (
    <div className="vulnerability-list">
      <Card title="漏洞管理" extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchVulnerabilities(current, pageSize)}
        >
          刷新
        </Button>
      }>
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Input
              placeholder="搜索漏洞名称或编号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Select
              placeholder="风险等级"
              value={riskLevelFilter}
              onChange={setRiskLevelFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="critical">严重</Option>
              <Option value="high">高危</Option>
              <Option value="medium">中危</Option>
              <Option value="low">低危</Option>
            </Select>
            <Select
              placeholder="审批状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="pending">待审批</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="processing">处理中</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={vulnerabilities}
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
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default VulnerabilityList;