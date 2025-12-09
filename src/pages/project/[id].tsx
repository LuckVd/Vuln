import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import {
  Card, Descriptions, Tag, Button, Space, Spin, Alert, Tabs, Table, Modal,
  Form, Input, Select, DatePicker, message, Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
  CameraOutlined, DeleteFilled
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Project, ProjectProblemSnapshot, ProblemDocument } from '@/types';

const { Option } = Select;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [snapshots, setSnapshots] = useState<ProjectProblemSnapshot[]>([]);
  const [relatedProblems, setRelatedProblems] = useState<ProblemDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [snapshotModalVisible, setSnapshotModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [snapshotForm] = Form.useForm();

  // 获取项目详情
  const fetchProjectDetail = async (projectId: string) => {
    setLoading(true);
    try {
      // 获取项目基本信息
      const projectResponse = await fetch(`/api/project/${projectId}`);
      const projectResult = await projectResponse.json();

      if (projectResult.code === 200) {
        setProject(projectResult.data);

        // 获取项目快照
        const snapshotResponse = await fetch(`/api/project/${projectId}/snapshots`);
        const snapshotResult = await snapshotResponse.json();
        if (snapshotResult.code === 200) {
          setSnapshots(snapshotResult.data);
        }

        // 获取相关问题单据（这里需要根据实际情况调整API）
        const problemResponse = await fetch(`/api/problem?projectNumber=${projectResult.data.projectNumber}`);
        const problemResult = await problemResponse.json();
        if (problemResult.code === 200) {
          setRelatedProblems(problemResult.data.list || []);
        }
      } else {
        message.error(projectResult.message);
      }
    } catch (error) {
      message.error('获取项目详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetail(id);
    }
  }, [id]);

  // 返回列表
  const goBack = () => {
    history.push('/project');
  };

  // 编辑项目
  const handleEdit = async (values: any) => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目更新成功');
        setEditModalVisible(false);
        form.resetFields();
        fetchProjectDetail(id);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('更新项目失败');
      console.error(error);
    }
  };

  // 删除项目
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目删除成功');
        history.push('/project');
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除项目失败');
      console.error(error);
    }
  };

  // 项目结项
  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/project/${id}/complete`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('项目结项成功');
        fetchProjectDetail(id);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('项目结项失败');
      console.error(error);
    }
  };

  // 创建快照
  const handleCreateSnapshot = async (values: any) => {
    try {
      const response = await fetch(`/api/project/${id}/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tr6Number: values.tr6Number,
          snapshotContent: {
            totalProblems: relatedProblems.length,
            severeProblems: relatedProblems.filter(p => p.vulnerabilityLevel === 1).length,
            highProblems: relatedProblems.filter(p => p.vulnerabilityLevel === 2).length,
            mediumProblems: relatedProblems.filter(p => p.vulnerabilityLevel === 3).length,
            lowProblems: relatedProblems.filter(p => p.vulnerabilityLevel === 4).length,
            problemNumbers: relatedProblems.map(p => p.problemNumber),
            snapshotTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ...values.snapshotContent
          }
        }),
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('快照创建成功');
        setSnapshotModalVisible(false);
        snapshotForm.resetFields();
        fetchProjectDetail(id);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('创建快照失败');
      console.error(error);
    }
  };

  // 删除快照
  const handleDeleteSnapshot = async (snapshotId: number) => {
    try {
      const response = await fetch(`/api/project/snapshot/${snapshotId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.code === 200) {
        message.success('快照删除成功');
        fetchProjectDetail(id);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除快照失败');
      console.error(error);
    }
  };

  // 状态标签
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

  // 问题单据表格列
  const problemColumns: ColumnsType<ProblemDocument> = [
    {
      title: '问题编号',
      dataIndex: 'problemNumber',
      key: 'problemNumber',
      width: 140,
      render: (text: string) => (
        <Button type="link" onClick={() => history.push(`/vuln/${text}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '漏洞等级',
      dataIndex: 'vulnerabilityLevel',
      key: 'vulnerabilityLevel',
      width: 100,
      render: (level: number) => {
        const levelConfig = {
          1: { color: 'red', text: '严重' },
          2: { color: 'orange', text: '高危' },
          3: { color: 'gold', text: '中危' },
          4: { color: 'green', text: '低危' },
        };
        const config = levelConfig[level] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '简要描述',
      dataIndex: 'descriptionRief',
      key: 'descriptionRief',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusConfig = {
          1: { color: 'blue', text: '已创建' },
          2: { color: 'orange', text: '处置中' },
          3: { color: 'purple', text: '审批中' },
          4: { color: 'green', text: '关闭' },
        };
        const config = statusConfig[status] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // 快照表格列
  const snapshotColumns: ColumnsType<ProjectProblemSnapshot> = [
    {
      title: 'TR6编号',
      dataIndex: 'tr6Number',
      key: 'tr6Number',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '问题总数',
      key: 'totalProblems',
      width: 100,
      render: (_, record) => record.snapshotContent?.totalProblems || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这个快照吗？"
          onConfirm={() => handleDeleteSnapshot(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            danger
            icon={<DeleteFilled />}
            size="small"
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Alert
        message="项目不存在"
        description="请检查项目ID是否正确"
        type="error"
        showIcon
      />
    );
  }

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="项目编号">{project.projectNumber}</Descriptions.Item>
          <Descriptions.Item label="规划版本">{project.planningVersion || '-'}</Descriptions.Item>
          <Descriptions.Item label="项目经理">{project.manager}</Descriptions.Item>
          <Descriptions.Item label="项目状态">{getStatusTag(project.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{project.createTime}</Descriptions.Item>
          <Descriptions.Item label="结项时间">{project.completionTime || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'problems',
      label: `关联问题单据 (${relatedProblems.length})`,
      children: (
        <Table
          columns={problemColumns}
          dataSource={relatedProblems}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      ),
    },
    {
      key: 'snapshots',
      label: `问题快照 (${snapshots.length})`,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<CameraOutlined />}
              onClick={() => setSnapshotModalVisible(true)}
            >
              创建快照
            </Button>
          </div>
          <Table
            columns={snapshotColumns}
            dataSource={snapshots}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部操作栏 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回列表
          </Button>
          <Button icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue(project);
            setEditModalVisible(true);
          }}>
            编辑
          </Button>
          {project.status !== 4 && (
            <Popconfirm
              title="确定要结项这个项目吗？"
              onConfirm={handleComplete}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                结项
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除这个项目吗？此操作不可恢复！"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card title={`项目详情 - ${project.projectNumber}`}>
        <Tabs items={tabItems} />
      </Card>

      {/* 编辑项目弹窗 */}
      <Modal
        title="编辑项目"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
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
                setEditModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建快照弹窗 */}
      <Modal
        title="创建问题快照"
        open={snapshotModalVisible}
        onCancel={() => {
          setSnapshotModalVisible(false);
          snapshotForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={snapshotForm}
          layout="vertical"
          onFinish={handleCreateSnapshot}
        >
          <Form.Item
            name="tr6Number"
            label="TR6编号"
            rules={[{ required: true, message: '请输入TR6编号' }]}
          >
            <Input placeholder="请输入TR6编号" />
          </Form.Item>

          <Alert
            message="快照信息"
            description={`将保存当前项目的所有问题单据信息，共 ${relatedProblems.length} 个问题单据`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setSnapshotModalVisible(false);
                snapshotForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建快照
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;