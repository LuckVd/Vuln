import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Tag, Button, Card, message, Modal, Form, DatePicker, Input as AntInput } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons';
import { Link, history } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import { Vulnerability } from '@/types';

const { Option } = Select;
const { TextArea } = AntInput;

const VulnerabilityList: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

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

  // 多选处理
  const onSelectChange = (newSelectedRowKeys: string[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 创建审批单
  const handleCreateApproval = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择漏洞');
      return;
    }

    // 检查选择的漏洞是否符合条件
    const selectedVulns = vulnerabilities.filter(v => selectedRowKeys.includes(v.id));
    const hasApprovalId = selectedVulns.some(v => v.approvalId);
    const sources = [...new Set(selectedVulns.map(v => v.source))];

    if (hasApprovalId) {
      message.error('选择的漏洞中包含已关联审批单的漏洞，请取消选择');
      return;
    }

    if (sources.length > 1) {
      message.error('只能选择相同来源的漏洞创建审批单');
      return;
    }

    setCreateModalVisible(true);
  };

  // 提交创建审批单
  const submitCreateApproval = async (values: any) => {
    if (selectedRowKeys.length === 0) {
      message.error('请先选择漏洞');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/approval/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          priority: values.priority,
          department: values.department,
          comments: values.comments,
          dueDate: values.dueDate?.format('YYYY-MM-DD HH:mm:ss'),
          vulnerabilityIds: selectedRowKeys,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('审批单创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        setSelectedRowKeys([]);
        // 刷新列表
        fetchVulnerabilities(current, pageSize);
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      console.error('创建审批单失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setCreateLoading(false);
    }
  };

  // 取消创建
  const cancelCreateApproval = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  // 检查是否可以创建审批单
  const canCreateApproval = () => {
    if (selectedRowKeys.length === 0) return false;

    const selectedVulns = vulnerabilities.filter(v => selectedRowKeys.includes(v.id));
    const hasApprovalId = selectedVulns.some(v => v.approvalId);
    const sources = [...new Set(selectedVulns.map(v => v.source))];

    return !hasApprovalId && sources.length <= 1;
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
      unassigned: { color: 'gray', text: '未分配' },
    };
    const { color, text } = config[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: Vulnerability) => ({
      disabled: !!record.approvalId, // 已关联审批单的漏洞不能选择
    }),
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
    {
      title: '审批单',
      dataIndex: 'approvalId',
      key: 'approvalId',
      width: 150,
      render: (approvalId: string, record: Vulnerability) => (
        approvalId ? (
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => history.push(`/approval/${approvalId}`)}
          >
            {approvalId}
          </Button>
        ) : (
          <Tag color="default">未分配</Tag>
        )
      ),
    },
  ];

  return (
    <div className="vulnerability-list">
      <Card title="漏洞管理" extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateApproval}
            disabled={!canCreateApproval()}
          >
            创建审批单 ({selectedRowKeys.length})
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchVulnerabilities(current, pageSize)}
          >
            刷新
          </Button>
        </Space>
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
              <Option value="unassigned">未分配</Option>
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
          rowSelection={rowSelection}
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

      {/* 创建审批单模态框 */}
      <Modal
        title="创建审批单"
        open={createModalVisible}
        onCancel={cancelCreateApproval}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={submitCreateApproval}
        >
          <Form.Item
            name="title"
            label="审批标题"
            rules={[{ required: true, message: '请输入审批标题' }]}
          >
            <AntInput placeholder="请输入审批标题" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
            initialValue="normal"
          >
            <Select placeholder="请选择优先级">
              <Option value="urgent">紧急</Option>
              <Option value="normal">普通</Option>
              <Option value="low">低优先级</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="负责部门"
            rules={[{ required: true, message: '请输入负责部门' }]}
            initialValue="开发部"
          >
            <AntInput placeholder="请输入负责部门" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker
              showTime
              placeholder="请选择完成截止日期"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="comments"
            label="备注说明"
            rules={[{ required: true, message: '请填写备注说明' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细说明审批要求、处理建议等信息..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={cancelCreateApproval}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
              >
                创建审批单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VulnerabilityList;