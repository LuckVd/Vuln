import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Tag, Button, Card, message, Modal, Form, Popconfirm, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, history } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import { Project } from '@/types';

const { Option } = Select;

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [managerFilter, setManagerFilter] = useState<string>('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取项目列表
  const fetchProjects = async (params?: {
    current?: number;
    pageSize?: number;
    status?: number;
    manager?: string;
  }) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params?.current) queryParams.append('current', params.current.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.status !== undefined) queryParams.append('status', params.status.toString());
      if (params?.manager) queryParams.append('manager', params.manager);

      const response = await fetch(`/api/project?${queryParams}`);
      const result = await response.json();

      if (result.code === 200) {
        setProjects(result.data);
        setTotal(result.total);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProjects({ current, pageSize, status: statusFilter, manager: managerFilter });
  }, [current, pageSize, statusFilter, managerFilter]);

  // 创建项目
  const handleCreate = async (values: any) => {
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目创建成功');
        setCreateModalVisible(false);
        form.resetFields();
        fetchProjects({ current, pageSize, status: statusFilter, manager: managerFilter });
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('创建项目失败');
      console.error(error);
    }
  };

  // 删除项目
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目删除成功');
        fetchProjects({ current, pageSize, status: statusFilter, manager: managerFilter });
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除项目失败');
      console.error(error);
    }
  };

  // 项目结项
  const handleComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/project/${id}/complete`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目结项成功');
        fetchProjects({ current, pageSize, status: statusFilter, manager: managerFilter });
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('项目结项失败');
      console.error(error);
    }
  };

  // 搜索
  const handleSearch = () => {
    fetchProjects({
      current: 1,
      pageSize,
      status: statusFilter,
      manager: managerFilter || searchText,
    });
    setCurrent(1);
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setStatusFilter(undefined);
    setManagerFilter('');
    fetchProjects({ current: 1, pageSize });
    setCurrent(1);
  };

  // 项目状态标签
  const getStatusTag = (status: number) => {
    const statusConfig = {
      1: { color: 'blue', text: '已创建' },
      2: { color: 'orange', text: '处置中' },
      3: { color: 'purple', text: '审批中' },
      4: { color: 'green', text: '关闭' },
    };

    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'projectNumber',
      key: 'projectNumber',
      width: 140,
      render: (text: string, record: Project) => (
        <Link to={`/project/${record.id}`} style={{ color: '#1890ff' }}>
          {text}
        </Link>
      ),
    },
    {
      title: '规划版本',
      dataIndex: 'planningVersion',
      key: 'planningVersion',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '项目经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text: string) => text,
    },
    {
      title: '结项时间',
      dataIndex: 'completionTime',
      key: 'completionTime',
      width: 160,
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: Project) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => history.push(`/project/${record.id}`)}
          >
            查看
          </Button>
          {record.status !== 4 && (
            <Popconfirm
              title="确定要结项这个项目吗？"
              onConfirm={() => handleComplete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                结项
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="project-list">
      <Card title="项目管理" extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建项目
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchProjects({ current, pageSize, status: statusFilter, manager: managerFilter })}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }>
        {/* 搜索和过滤 */}
        <div style={{ marginBottom: 16 }}>
          <Space size="middle" wrap>
            <Input
              placeholder="搜索项目经理"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="项目状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={1}>已创建</Option>
              <Option value={2}>处置中</Option>
              <Option value={3}>审批中</Option>
              <Option value={4}>关闭</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        {/* 项目列表 */}
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新建项目弹窗 */}
      <Modal
        title="新建项目"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="planningVersion"
            label="规划版本"
            rules={[{ required: true, message: '请输入规划版本' }]}
          >
            <Input placeholder="请输入规划版本" />
          </Form.Item>

          <Form.Item
            name="manager"
            label="项目经理"
            rules={[{ required: true, message: '请输入项目经理' }]}
          >
            <Input placeholder="请输入项目经理" />
          </Form.Item>

          <Form.Item
            name="status"
            label="项目状态"
            initialValue={1}
            rules={[{ required: true, message: '请选择项目状态' }]}
          >
            <Select placeholder="请选择项目状态">
              <Option value={1}>已创建</Option>
              <Option value={2}>处置中</Option>
              <Option value={3}>审批中</Option>
              <Option value={4}>关闭</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;