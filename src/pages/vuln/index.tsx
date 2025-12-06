import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Tag, Button, Card, message, Modal, Form, DatePicker, Input as AntInput, Divider, Popconfirm, Badge, Avatar } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, LinkOutlined, EditOutlined, SaveOutlined, CloseOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

  // 暂存相关状态
  const [batchEditModalVisible, setBatchEditModalVisible] = useState(false);
  const [batchEditLoading, setBatchEditLoading] = useState(false);
  const [selectedVulnsForEdit, setSelectedVulnsForEdit] = useState<Vulnerability[]>([]);
  const [editingVulnsData, setEditingVulnsData] = useState<Record<string, Partial<Vulnerability>>>({});

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

  // 批量编辑漏洞
  const handleBatchEdit = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要编辑的漏洞');
      return;
    }

    // 获取选中的漏洞详情
    const selectedVulns = vulnerabilities.filter(v => selectedRowKeys.includes(v.id));
    setSelectedVulnsForEdit(selectedVulns);

    // 初始化编辑数据
    const initialEditData: Record<string, Partial<Vulnerability>> = {};
    selectedVulns.forEach(vuln => {
      initialEditData[vuln.id] = {
        name: vuln.name,
        riskLevel: vuln.riskLevel,
        description: vuln.description,
        severity: vuln.severity,
        affectedComponent: vuln.affectedComponent,
        recommendation: vuln.recommendation,
      };
    });
    setEditingVulnsData(initialEditData);
    setBatchEditModalVisible(true);
  };

  // 提交批量编辑
  const submitBatchEdit = async (vulnDataList: any[]) => {
    if (vulnDataList.length === 0) {
      message.error('没有修改的数据');
      return;
    }

    setBatchEditLoading(true);
    try {
      // 构建批量操作数据
      const operations = vulnDataList.map(vuln => ({
        vulnId: vuln.id,
        stagedData: {
          ...(vuln.name && { name: vuln.name }),
          ...(vuln.description && { description: vuln.description }),
          ...(vuln.severity && { severity: vuln.severity }),
          ...(vuln.affectedComponent && { affectedComponent: vuln.affectedComponent }),
          ...(vuln.recommendation && { recommendation: vuln.recommendation }),
          ...(vuln.riskLevel && { riskLevel: vuln.riskLevel }),
        }
      }));

      const response = await fetch('/api/vuln/stage/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('批量暂存成功');
        setBatchEditModalVisible(false);
        setSelectedVulnsForEdit([]);
        setSelectedRowKeys([]);
        // 刷新列表
        fetchVulnerabilities(current, pageSize);
      } else {
        message.error(result.message || '批量暂存失败');
      }
    } catch (error) {
      console.error('批量暂存失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setBatchEditLoading(false);
    }
  };

  // 更新单个漏洞的编辑数据
  const updateVulnEditData = (vulnId: string, field: keyof Vulnerability, value: string) => {
    setEditingVulnsData(prev => ({
      ...prev,
      [vulnId]: {
        ...prev[vulnId],
        [field]: value
      }
    }));
  };

  // 取消批量编辑
  const cancelBatchEdit = () => {
    setBatchEditModalVisible(false);
    setSelectedVulnsForEdit([]);
    setEditingVulnsData({});
  };

  // 获取风险等级颜色
  const getRiskLevelColor = (level: string) => {
    const colors = {
      critical: '#ff4d4f',
      high: '#fa8c16',
      medium: '#faad14',
      low: '#52c41a'
    };
    return colors[level] || '#d9d9d9';
  };

  // 获取风险等级背景色
  const getRiskLevelBgColor = (level: string) => {
    const colors = {
      critical: '#fff2f0',
      high: '#fff7e6',
      medium: '#fffbe6',
      low: '#f6ffed'
    };
    return colors[level] || '#fafafa';
  };

  // 可编辑表格列定义
  const editableColumns: ColumnsType<Vulnerability> = [
    {
      title: '',
      dataIndex: 'status',
      width: 40,
      fixed: 'left',
      render: (_, record) => {
        const hasChanges = editingVulnsData[record.id] && Object.keys(editingVulnsData[record.id]).some(key => {
          const newValue = editingVulnsData[record.id][key as keyof Vulnerability];
          const originalValue = record[key as keyof Vulnerability];
          return newValue !== undefined && newValue !== originalValue;
        });

        return hasChanges ? (
          <Badge status="processing" />
        ) : (
          <div style={{ width: 8, height: 8 }} />
        );
      },
    },
    {
      title: '漏洞编号',
      dataIndex: 'id',
      width: 140,
      fixed: 'left',
      render: (text: string, record: Vulnerability) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            size="small"
            style={{
              backgroundColor: getRiskLevelColor(record.riskLevel),
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {record.id.slice(-2)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#262626' }}>{text}</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{record.source}</div>
          </div>
        </div>
      ),
    },
    {
      title: '漏洞名称',
      dataIndex: 'name',
      width: 220,
      render: (text: string, record: Vulnerability) => (
        <Input
          value={editingVulnsData[record.id]?.name || ''}
          onChange={(e) => updateVulnEditData(record.id, 'name', e.target.value)}
          placeholder="请输入漏洞名称"
          style={{
            borderRadius: '6px',
            border: editingVulnsData[record.id]?.name && editingVulnsData[record.id].name !== record.name ? '2px solid #1890ff' : '1px solid #d9d9d9'
          }}
        />
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 130,
      render: (level: string, record: Vulnerability) => (
        <Select
          value={editingVulnsData[record.id]?.riskLevel || level}
          onChange={(value) => updateVulnEditData(record.id, 'riskLevel', value)}
          style={{
            width: '100%',
            borderRadius: '6px',
            border: editingVulnsData[record.id]?.riskLevel && editingVulnsData[record.id].riskLevel !== record.riskLevel ? '2px solid #1890ff' : '1px solid #d9d9d9'
          }}
          suffixIcon={
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getRiskLevelColor(editingVulnsData[record.id]?.riskLevel || level),
                marginRight: '4px'
              }}
            />
          }
        >
          <Option value="critical">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
              严重
            </div>
          </Option>
          <Option value="high">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fa8c16' }} />
              高危
            </div>
          </Option>
          <Option value="medium">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#faad14' }} />
              中危
            </div>
          </Option>
          <Option value="low">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }} />
              低危
            </div>
          </Option>
        </Select>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 120,
      render: (text: string, record: Vulnerability) => (
        <Input
          value={editingVulnsData[record.id]?.severity || ''}
          onChange={(e) => updateVulnEditData(record.id, 'severity', e.target.value)}
          placeholder="请输入严重程度"
          style={{
            borderRadius: '6px',
            border: editingVulnsData[record.id]?.severity && editingVulnsData[record.id].severity !== record.severity ? '2px solid #1890ff' : '1px solid #d9d9d9'
          }}
        />
      ),
    },
    {
      title: '影响组件',
      dataIndex: 'affectedComponent',
      width: 180,
      render: (text: string, record: Vulnerability) => (
        <Input
          value={editingVulnsData[record.id]?.affectedComponent || ''}
          onChange={(e) => updateVulnEditData(record.id, 'affectedComponent', e.target.value)}
          placeholder="请输入影响组件"
          style={{
            borderRadius: '6px',
            border: editingVulnsData[record.id]?.affectedComponent && editingVulnsData[record.id].affectedComponent !== record.affectedComponent ? '2px solid #1890ff' : '1px solid #d9d9d9'
          }}
        />
      ),
    },
    {
      title: '漏洞描述',
      dataIndex: 'description',
      width: 280,
      render: (text: string, record: Vulnerability) => (
        <div>
          <TextArea
            value={editingVulnsData[record.id]?.description || ''}
            onChange={(e) => updateVulnEditData(record.id, 'description', e.target.value)}
            placeholder="请输入漏洞描述"
            rows={3}
            maxLength={500}
            showCount
            style={{
              borderRadius: '6px',
              border: editingVulnsData[record.id]?.description && editingVulnsData[record.id].description !== record.description ? '2px solid #1890ff' : '1px solid #d9d9d9'
            }}
          />
          {editingVulnsData[record.id]?.description && editingVulnsData[record.id].description !== record.description && (
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#1890ff' }}>
              <CheckCircleOutlined style={{ marginRight: '4px' }} />
              已修改
            </div>
          )}
        </div>
      ),
    },
    {
      title: '修复建议',
      dataIndex: 'recommendation',
      width: 280,
      render: (text: string, record: Vulnerability) => (
        <div>
          <TextArea
            value={editingVulnsData[record.id]?.recommendation || ''}
            onChange={(e) => updateVulnEditData(record.id, 'recommendation', e.target.value)}
            placeholder="请输入修复建议"
            rows={3}
            maxLength={500}
            showCount
            style={{
              borderRadius: '6px',
              border: editingVulnsData[record.id]?.recommendation && editingVulnsData[record.id].recommendation !== record.recommendation ? '2px solid #1890ff' : '1px solid #d9d9d9'
            }}
          />
          {editingVulnsData[record.id]?.recommendation && editingVulnsData[record.id].recommendation !== record.recommendation && (
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#1890ff' }}>
              <CheckCircleOutlined style={{ marginRight: '4px' }} />
              已修改
            </div>
          )}
        </div>
      ),
    },
  ];

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
        <div>
          <Link to={`/vuln/${text}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
            {text}
          </Link>
          {record.isStaged && (
            <Tag color="purple" size="small" style={{ marginLeft: 8 }}>
              暂存
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '漏洞名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Vulnerability) => (
        <div>
          <div>{text}</div>
          {record.isStaged && record.stagedData?.name && (
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              → {record.stagedData.name}
            </div>
          )}
        </div>
      ),
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
      render: (level: string, record: Vulnerability) => (
        <div>
          {getRiskLevelTag(level)}
          {record.isStaged && record.stagedData?.riskLevel && record.stagedData.riskLevel !== level && (
            <div style={{ marginTop: 4 }}>
              {getRiskLevelTag(record.stagedData.riskLevel)}
            </div>
          )}
        </div>
      ),
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
      <style jsx>{`
        .editable-row-even td {
          background-color: #fafafa !important;
        }
        .editable-row-odd td {
          background-color: #ffffff !important;
        }
        .editable-row-even:hover td,
        .editable-row-odd:hover td {
          background-color: #f0f8ff !important;
        }
      `}</style>
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
            icon={<EditOutlined />}
            onClick={handleBatchEdit}
            disabled={selectedRowKeys.length === 0}
          >
            批量编辑 ({selectedRowKeys.length})
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

      {/* 批量编辑模态框 - 美化版本 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {selectedVulnsForEdit.length}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                批量编辑漏洞
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {selectedVulnsForEdit.length} 个漏洞正在编辑中
              </div>
            </div>
          </div>
        }
        open={batchEditModalVisible}
        onCancel={cancelBatchEdit}
        footer={[
          <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedVulnsForEdit.filter(vuln => {
                const editedData = editingVulnsData[vuln.id];
                return editedData && Object.keys(editedData).some(key => {
                  const newValue = editedData[key as keyof Vulnerability];
                  const originalValue = vuln[key as keyof Vulnerability];
                  return newValue !== undefined && newValue !== originalValue;
                });
              }).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1890ff' }}>
                  <CheckCircleOutlined />
                  <span style={{ fontSize: '13px' }}>
                    {selectedVulnsForEdit.filter(vuln => {
                      const editedData = editingVulnsData[vuln.id];
                      return editedData && Object.keys(editedData).some(key => {
                        const newValue = editedData[key as keyof Vulnerability];
                        const originalValue = vuln[key as keyof Vulnerability];
                        return newValue !== undefined && newValue !== originalValue;
                      });
                    }).length} 个漏洞已修改
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={cancelBatchEdit} size="large">
                取消
              </Button>
              <Popconfirm
                title={
                  <div style={{ textAlign: 'center' }}>
                    <WarningOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                      确定要暂存这些修改吗？
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      系统会保存您对漏洞信息的修改
                    </div>
                  </div>
                }
                onConfirm={() => {
                  // 收集修改的数据
                  const vulnDataList: any[] = [];

                  selectedVulnsForEdit.forEach(vuln => {
                    const editedData = editingVulnsData[vuln.id];
                    if (!editedData) return;

                    // 检查是否有修改
                    const hasChanges = Object.keys(editedData).some(key => {
                      const newValue = editedData[key as keyof Vulnerability];
                      const originalValue = vuln[key as keyof Vulnerability];
                      return newValue !== undefined && newValue !== originalValue;
                    });

                    if (hasChanges) {
                      vulnDataList.push({
                        id: vuln.id,
                        ...editedData
                      });
                    }
                  });

                  if (vulnDataList.length > 0) {
                    submitBatchEdit(vulnDataList);
                  } else {
                    message.warning('没有修改的数据');
                  }
                }}
                disabled={batchEditLoading}
                okText="确认暂存"
                cancelText="取消"
              >
                <Button
                  type="primary"
                  loading={batchEditLoading}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {batchEditLoading ? '暂存中...' : '暂存修改'}
                </Button>
              </Popconfirm>
            </div>
          </div>
        ]}
        width={1500}
        style={{
          top: 20,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        bodyStyle={{
          padding: 0,
          background: '#fafafa'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <EditOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                  批量编辑模式
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  💡 直接在表格中编辑漏洞信息，蓝色边框表示该字段已修改
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                padding: '8px 16px',
                background: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#666',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                编辑状态: <span style={{ color: '#1890ff', fontWeight: 600 }}>实时</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <Table
            columns={editableColumns}
            dataSource={selectedVulnsForEdit}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1300, y: 500 }}
            size="middle"
            className="editable-table-enhanced"
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? 'editable-row-even' : 'editable-row-odd'
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default VulnerabilityList;