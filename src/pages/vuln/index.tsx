import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Tag, Button, Card, message, Modal, Form, DatePicker, Popconfirm, Badge, Avatar } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, LinkOutlined, EditOutlined, SaveOutlined, CloseOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, history } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import { EditableProTable } from '@ant-design/pro-table';
import { ProblemDocument, ENUMS, REVERSE_STRING_ENUMS } from '@/types';
import { renderVulnerabilityLevelTag, renderStatusTag, renderConclusionTag } from '@/utils/tagRenderers';

const { Option } = Select;
const { TextArea } = Input;

const VulnerabilityList: React.FC = () => {
  const [problems, setProblems] = useState<ProblemDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [vulnerabilityLevelFilter, setVulnerabilityLevelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // 暂存相关状态
  const [batchEditModalVisible, setBatchEditModalVisible] = useState(false);
  const [batchEditLoading, setBatchEditLoading] = useState(false);
  const [selectedProblemsForEdit, setSelectedProblemsForEdit] = useState<ProblemDocument[]>([]);
  const [editingProblemsData, setEditingProblemsData] = useState<Record<number, Partial<ProblemDocument>>>({});

  // 获取漏洞列表
  const fetchProblems = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        current: page.toString(),
        pageSize: size.toString(),
      });

      if (searchText) {
        params.append('search', searchText);
      }
      if (vulnerabilityLevelFilter) {
        params.append('vulnerabilityLevel', vulnerabilityLevelFilter);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/problem?${params}`);
      const result = await response.json();

      if (result.code === 200) {
        setProblems(result.data.list);
        setTotal(result.data.total);
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
    fetchProblems(current, pageSize);
  }, [current, pageSize]);

  // 搜索处理
  const handleSearch = () => {
    setCurrent(1);
    fetchProblems(1, pageSize);
  };

  // 重置筛选
  const handleReset = () => {
    setSearchText('');
    setVulnerabilityLevelFilter('');
    setStatusFilter('');
    setCurrent(1);
    fetchProblems(1, pageSize);
  };

  // 分页处理
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // 多选处理
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 创建审批单
  const handleCreateApproval = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择漏洞');
      return;
    }

    // 检查选择的漏洞是否符合条件
    const selectedProblems = problems.filter(p => selectedRowKeys.includes(p.id));
    const hasApprovalList = selectedProblems.some(p => p.approvalList && p.approvalList.length > 0);
    const projects = [...new Set(selectedProblems.map(p => p.projectNumber))];

    if (hasApprovalList) {
      message.error('选择的漏洞中包含已关联审批单的漏洞，请取消选择');
      return;
    }

    if (projects.length > 1) {
      message.error('只能选择相同项目的漏洞创建审批单');
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
          problemIds: selectedRowKeys,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('审批单创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        setSelectedRowKeys([]);
        // 刷新列表
        fetchProblems(current, pageSize);
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
    const selectedProblemsForEdit = problems.filter(p => selectedRowKeys.includes(p.id));
    setSelectedProblemsForEdit(selectedProblemsForEdit);

    // 初始化编辑数据
    const initialEditData: Record<number, Partial<ProblemDocument>> = {};
    selectedProblemsForEdit.forEach(problem => {
      initialEditData[problem.id] = {
        descriptionRief: problem.descriptionRief,
        vulnerabilityLevel: problem.vulnerabilityLevel,
        descriptionDetailed: problem.descriptionDetailed,
        componentName: problem.componentName,
        responsiblePerson: problem.responsiblePerson,
        expectedDate: problem.expectedDate,
      };
    });
    setEditingProblemsData(initialEditData);
    setBatchEditModalVisible(true);
  };

  // 提交批量编辑
  const submitBatchEdit = async (problemDataList: any[]) => {
    if (problemDataList.length === 0) {
      message.error('没有修改的数据');
      return;
    }

    setBatchEditLoading(true);
    try {
      // 构建批量操作数据
      const operations = problemDataList.map(problem => ({
        problemId: problem.id,
        stagedData: {
          ...(problem.descriptionRief && { descriptionRief: problem.descriptionRief }),
          ...(problem.descriptionDetailed && { descriptionDetailed: problem.descriptionDetailed }),
          ...(problem.vulnerabilityLevel && { vulnerabilityLevel: problem.vulnerabilityLevel }),
          ...(problem.componentName && { componentName: problem.componentName }),
          ...(problem.responsiblePerson && { responsiblePerson: problem.responsiblePerson }),
          ...(problem.expectedDate && { expectedDate: problem.expectedDate }),
        }
      }));

      const response = await fetch('/api/problem/stage/batch', {
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
        setSelectedProblemsForEdit([]);
        setSelectedRowKeys([]);
        // 刷新列表
        fetchProblems(current, pageSize);
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

  // EditableProTable会自动处理数据更新，不再需要手动更新函数

  // 取消批量编辑
  const cancelBatchEdit = () => {
    setBatchEditModalVisible(false);
    setSelectedProblemsForEdit([]);
    setEditingProblemsData({});
  };

  // 数据转换函数
  const getVulnerabilityLevelString = (level: number): string => {
    return REVERSE_STRING_ENUMS.VULNERABILITY_LEVEL[level] || 'low';
  };

  const getStatusString = (status: number): string => {
    return REVERSE_STRING_ENUMS.STATUS[status] || 'pending';
  };

  // 获取风险等级颜色
  const getRiskLevelColor = (level: number) => {
    const colors = {
      1: '#ff4d4f', // 严重
      2: '#fa8c16', // 高危
      3: '#faad14', // 中危
      4: '#52c41a'  // 低危
    };
    return colors[level] || '#d9d9d9';
  };

  // 获取风险等级背景色
  const getRiskLevelBgColor = (level: number) => {
    const colors = {
      1: '#fff2f0', // 严重
      2: '#fff7e6', // 高危
      3: '#fffbe6', // 中危
      4: '#f6ffed'  // 低危
    };
    return colors[level] || '#fafafa';
  };

  // 可编辑表格列定义 - 使用problem字段结构
  const editableColumns = [
    {
      title: '修改状态',
      dataIndex: 'editStatus',
      width: 80,
      editable: () => false,
      render: (_: any, record: any) => {
        const hasChanges = editingProblemsData[record.id] && Object.keys(editingProblemsData[record.id]).some(key => {
          const newValue = editingProblemsData[record.id][key as keyof ProblemDocument];
          const originalValue = record[key as keyof ProblemDocument];
          return newValue !== undefined && newValue !== originalValue;
        });

        return hasChanges ? (
          <Badge status="processing" text="已修改" />
        ) : (
          <span style={{ color: '#999' }}>未修改</span>
        );
      },
    },
    {
      title: '问题编号',
      dataIndex: 'problemNumber',
      width: 150,
      editable: () => false,
      render: (text: string, record: ProblemDocument) => (
        <div>
          <span style={{ color: '#1890ff', fontWeight: 600 }}>{text}</span>
          {record.isStaged && (
            <Tag color="purple" style={{ marginLeft: 8, fontSize: '12px' }}>
              暂存
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '漏洞名称',
      dataIndex: 'descriptionRief',
      width: 200,
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '请输入漏洞名称' }],
      },
      fieldProps: (text, record) => {
        return {
          placeholder: '请输入漏洞名称',
        };
      },
    },
    {
      title: '扫描项/来源',
      dataIndex: 'scanItem',
      width: 120,
      editable: () => false,
      valueType: 'text',
    },
    {
      title: '危害等级',
      dataIndex: 'vulnerabilityLevel',
      width: 120,
      valueType: 'select',
      valueEnum: {
        1: { text: '严重', status: 'Error' },
        2: { text: '高危', status: 'Warning' },
        3: { text: '中危', status: 'Processing' },
        4: { text: '低危', status: 'Success' },
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择危害等级' }],
      },
    },
    {
      title: '项目编号',
      dataIndex: 'projectNumber',
      width: 120,
      editable: () => false,
      valueType: 'text',
    },
    {
      title: '预期解决时间',
      dataIndex: 'expectedDate',
      width: 180,
      valueType: 'date',
      fieldProps: {
        placeholder: '请选择预期解决时间',
      },
    },
    {
      title: '组件名称',
      dataIndex: 'componentName',
      width: 150,
      valueType: 'text',
      fieldProps: {
        placeholder: '请输入组件名称',
      },
    },
    {
      title: '组件版本',
      dataIndex: 'componentVersion',
      width: 120,
      valueType: 'text',
      fieldProps: {
        placeholder: '请输入组件版本',
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 120,
      valueType: 'text',
      fieldProps: {
        placeholder: '请输入IP地址',
      },
    },
    {
      title: 'API接口',
      dataIndex: 'api',
      width: 150,
      valueType: 'text',
      fieldProps: {
        placeholder: '请输入API接口',
      },
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePerson',
      width: 120,
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '请输入责任人' }],
      },
      fieldProps: {
        placeholder: '请输入责任人',
      },
    },
    {
      title: '详细描述',
      dataIndex: 'descriptionDetailed',
      width: 300,
      valueType: 'textarea',
      formItemProps: {
        rules: [{ required: true, message: '请输入详细描述' }],
      },
      fieldProps: {
        placeholder: '请输入详细描述',
        autoSize: { minRows: 3, maxRows: 6 },
        maxLength: 1000,
      },
    },
  ];

  // 检查是否可以创建审批单
  const canCreateApproval = () => {
    if (selectedRowKeys.length === 0) return false;

    const selectedProblems = problems.filter(p => selectedRowKeys.includes(p.id));
    const hasApprovalList = selectedProblems.some(p => p.approvalList && p.approvalList.length > 0);
    const projects = [...new Set(selectedProblems.map(p => p.projectNumber))];

    return !hasApprovalList && projects.length <= 1;
  };

  // 风险等级标签
  const getRiskLevelTag = (level: number) => {
    return (
      <Tag color={getRiskLevelColor(level)}>
        {ENUMS.VULNERABILITY_LEVEL[level]}
      </Tag>
    );
  };

  // 状态标签
  const getStatusTag = (status: number) => {
    const colorMap = {
      1: 'blue',    // 已创建
      2: 'orange',  // 处置中
      3: 'purple',  // 审批中
      4: 'green',   // 关闭
    };
    const color = colorMap[status] || 'default';
    return (
      <Tag color={color}>
        {ENUMS.STATUS[status]}
      </Tag>
    );
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: ProblemDocument) => ({
      disabled: !!(record.approvalList && record.approvalList.length > 0), // 已关联审批单的漏洞不能选择
    }),
  };

  const columns: ColumnsType<ProblemDocument> = [
    {
      title: '问题编号',
      dataIndex: 'problemNumber',
      key: 'problemNumber',
      width: 150,
      render: (text: string, record: ProblemDocument) => (
        <div>
          <Link to={`/vuln/${record.id}`} style={{ color: '#1890ff', textDecoration: 'underline' }}>
            {text}
          </Link>
          {record.isStaged && (
            <Tag color="purple" style={{ marginLeft: 8, fontSize: '12px' }}>
              暂存
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '漏洞名称',
      dataIndex: 'descriptionRief',
      key: 'descriptionRief',
      width: 200,
      render: (text: string, record: ProblemDocument) => (
        <div>
          <div>{text}</div>
          {record.isStaged && record.stagedData?.descriptionRief && record.stagedData.descriptionRief !== text && (
            <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              → {record.stagedData.descriptionRief}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '扫描项/来源',
      dataIndex: 'scanItem',
      key: 'scanItem',
      width: 120,
    },
    {
      title: '危害等级',
      dataIndex: 'vulnerabilityLevel',
      key: 'vulnerabilityLevel',
      width: 120,
      render: (level: number, record: ProblemDocument) => (
        <div>
          {getRiskLevelTag(level)}
          {record.isStaged && record.stagedData?.vulnerabilityLevel && record.stagedData.vulnerabilityLevel !== level && (
            <div style={{ marginTop: 4 }}>
              {getRiskLevelTag(record.stagedData.vulnerabilityLevel)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '项目编号',
      dataIndex: 'projectNumber',
      key: 'projectNumber',
      width: 120,
    },
    {
      title: '预期解决时间',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 150,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number, record: ProblemDocument) => {
        const approvalId = record.approvalList && record.approvalList.length > 0 ? record.approvalList[0] : null;
        return approvalId ? (
          <Link to={`/approval/${approvalId}`} style={{ textDecoration: 'none' }}>
            {getStatusTag(status)}
          </Link>
        ) : (
          getStatusTag(status)
        );
      },
    },
    {
      title: '审批单',
      dataIndex: 'approvalList',
      key: 'approvalList',
      width: 150,
      render: (approvalList: string[], record: ProblemDocument) => (
        approvalList && approvalList.length > 0 ? (
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => history.push(`/approval/${approvalList[0]}`)}
          >
            {approvalList[0]}
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
            icon={<EditOutlined />}
            onClick={handleBatchEdit}
            disabled={selectedRowKeys.length === 0}
          >
            批量编辑 ({selectedRowKeys.length})
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchProblems(current, pageSize)}
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
              value={vulnerabilityLevelFilter}
              onChange={setVulnerabilityLevelFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="1">严重</Option>
              <Option value="2">高危</Option>
              <Option value="3">中危</Option>
              <Option value="4">低危</Option>
            </Select>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="1">已创建</Option>
              <Option value="2">处置中</Option>
              <Option value="3">审批中</Option>
              <Option value="4">关闭</Option>
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
          dataSource={problems}
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
            <Input placeholder="请输入审批标题" />
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
            <Input placeholder="请输入负责部门" />
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

      {/* 批量编辑模态框 - 全屏可编辑列表 */}
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
              {selectedProblemsForEdit.length}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                批量编辑漏洞
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {selectedProblemsForEdit.length} 个漏洞正在编辑中 · 可快速编辑所有字段
              </div>
            </div>
          </div>
        }
        open={batchEditModalVisible}
        onCancel={cancelBatchEdit}
        footer={[
          <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedProblemsForEdit.filter(problem => {
                const editedData = editingProblemsData[problem.id];
                return editedData && Object.keys(editedData).some(key => {
                  const newValue = editedData[key as keyof ProblemDocument];
                  const originalValue = problem[key as keyof ProblemDocument];
                  return newValue !== undefined && newValue !== originalValue;
                });
              }).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1890ff' }}>
                  <CheckCircleOutlined />
                  <span style={{ fontSize: '13px' }}>
                    {selectedProblemsForEdit.filter(problem => {
                      const editedData = editingProblemsData[problem.id];
                      return editedData && Object.keys(editedData).some(key => {
                        const newValue = editedData[key as keyof ProblemDocument];
                        const originalValue = problem[key as keyof ProblemDocument];
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
                  const problemDataList: any[] = [];

                  selectedProblemsForEdit.forEach(problem => {
                    const editedData = editingProblemsData[problem.id];
                    if (!editedData) return;

                    // 检查是否有修改
                    const hasChanges = Object.keys(editedData).some(key => {
                      const newValue = editedData[key as keyof ProblemDocument];
                      const originalValue = problem[key as keyof ProblemDocument];
                      return newValue !== undefined && newValue !== originalValue;
                    });

                    if (hasChanges) {
                      problemDataList.push({
                        id: problem.id,
                        ...editedData
                      });
                    }
                  });

                  if (problemDataList.length > 0) {
                    submitBatchEdit(problemDataList);
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
        width="98%"
        style={{
          top: 10,
          maxWidth: 'none',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        bodyStyle={{
          padding: 0,
          background: '#fafafa',
          height: 'calc(100vh - 180px)',
          minHeight: '700px'
        }}
      >
        <div style={{
          padding: '16px',
          height: 'calc(100vh - 180px)',
          overflow: 'auto'
        }}>
          <EditableProTable
            columns={editableColumns}
            value={selectedProblemsForEdit}
            onChange={(data) => {
              // 处理数据变更
              setSelectedProblemsForEdit(data as ProblemDocument[]);
            }}
            editable={{
              type: 'multiple',
              editableKeys: selectedProblemsForEdit.map(item => item.id),
              onSave: async (key, row) => {
                // 保存编辑数据
                const problemId = Number(key);
                setEditingProblemsData(prev => ({
                  ...prev,
                  [problemId]: {
                    ...prev[problemId],
                    descriptionRief: row.descriptionRief,
                    vulnerabilityLevel: row.vulnerabilityLevel,
                    descriptionDetailed: row.descriptionDetailed,
                    componentName: row.componentName,
                    responsiblePerson: row.responsiblePerson,
                    expectedDate: row.expectedDate,
                    componentVersion: row.componentVersion,
                    ip: row.ip,
                    api: row.api,
                  }
                }));
                return true;
              },
              actionRender: (row, config, dom) => [dom.save, dom.cancel],
              editableKeys: selectedProblemsForEdit.map(item => item.id),
              toolbar: false,
            }}
            recordCreatorProps={false}
            rowKey="id"
            pagination={{
              pageSize: 25,
              showSizeChanger: true,
              pageSizeOptions: ['20', '50', '100', '200'],
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              position: ['bottomCenter'],
              size: 'small'
            }}
            search={false}
            dateFormatter="string"
            headerTitle="批量编辑漏洞列表"
            options={{
              density: false,
              fullScreen: true,
              reload: false,
              setting: false,
            }}
            scroll={{ x: 1600, y: 'calc(100vh - 380px)' }}
            size="small"
            className="editable-table-enhanced"
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          />
        </div>
        <style jsx>{`
          :global(.editable-table-enhanced .ant-pro-table-list-toolbar-title) {
            display: none !important;
          }
          :global(.editable-table-enhanced .ant-pro-table-list-toolbar-container) {
            display: none !important;
          }
        `}</style>
      </Modal>
    </div>
  );
};

export default VulnerabilityList;