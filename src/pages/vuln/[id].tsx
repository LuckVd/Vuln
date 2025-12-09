import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert, Divider, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd';
const { Option } = Select;
import { ArrowLeftOutlined, EyeOutlined, EditOutlined, SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { ProblemDocument, ENUMS, REVERSE_STRING_ENUMS } from '@/types';

const VulnerabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // 暂存编辑相关状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // 创建审批单相关状态
  const [createApprovalModalVisible, setCreateApprovalModalVisible] = useState(false);
  const [createApprovalForm] = Form.useForm();
  const [createApprovalLoading, setCreateApprovalLoading] = useState(false);

  // 获取问题单据详情
  const fetchProblemDetail = async (problemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/problem/${problemId}`);
      const result = await response.json();

      if (result.code === 200) {
        setProblem(result.data);
      } else {
        setProblem(null);
      }
    } catch (error) {
      console.error('获取问题单据详情失败:', error);
      setProblem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProblemDetail(id);
    }
  }, [id]);

  // 返回列表页
  const goBack = () => {
    history.push('/vuln');
  };

  // 查看审批单
  const viewApproval = (approvalId: string) => {
    history.push(`/approval/${approvalId}`);
  };

  // 打开编辑模态框
  const openEditModal = () => {
    if (!problem) return;

    // 填充表单数据
    const formData = {
      problemNumber: problem.problemNumber,
      descriptionRief: problem.descriptionRief,
      vulnerabilityLevel: problem.vulnerabilityLevel,
      scanItem: problem.scanItem,
      projectNumber: problem.projectNumber,
      expectedDate: problem.expectedDate,
      status: problem.status,
      descriptionDetailed: problem.descriptionDetailed,
      componentName: problem.componentName,
      componentVersion: problem.componentVersion,
      ip: problem.ip,
      api: problem.api,
      fixAddress: problem.fixAddress,
      fixVersion: problem.fixVersion,
      descriptionDisposal: problem.descriptionDisposal,
      responsiblePerson: problem.responsiblePerson,
      isRedLine: problem.isRedLine,
      isSoftware: problem.isSoftware,
      conclusion: problem.conclusion,
      vulnerabilityNum: problem.vulnerabilityNum,
    };

    editForm.setFieldsValue(formData);
    setEditModalVisible(true);
  };

  // 暂存编辑
  const submitStagedEdit = async (values: any) => {
    if (!problem) return;

    setEditLoading(true);
    try {
      const response = await fetch('/api/problem/stage/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: [{
            problemId: problem.id,
            stagedData: values,
          }],
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('暂存成功');
        setEditModalVisible(false);
        editForm.resetFields();
        // 刷新问题单据详情
        fetchProblemDetail(problem.id.toString());
      } else {
        message.error(result.message || '暂存失败');
      }
    } catch (error) {
      console.error('暂存失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setEditLoading(false);
    }
  };

  // 更新问题单据
  const updateProblem = async (values: any) => {
    if (!problem) return;

    setEditLoading(true);
    try {
      const response = await fetch(`/api/problem/${problem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('更新成功');
        setEditModalVisible(false);
        editForm.resetFields();
        // 刷新问题单据详情
        fetchProblemDetail(problem.id.toString());
      } else {
        message.error(result.message || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setEditLoading(false);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditModalVisible(false);
    editForm.resetFields();
  };

  // 打开创建审批单模态框
  const openCreateApprovalModal = () => {
    if (!problem) return;
    setCreateApprovalModalVisible(true);
  };

  // 创建审批单
  const submitCreateApproval = async (values: any) => {
    if (!problem) return;

    setCreateApprovalLoading(true);
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
          problemIds: [problem.id],
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('审批单创建成功');
        setCreateApprovalModalVisible(false);
        createApprovalForm.resetFields();
        // 刷新问题单据详情
        fetchProblemDetail(problem.id.toString());
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      console.error('创建审批单失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setCreateApprovalLoading(false);
    }
  };

  // 取消创建审批单
  const cancelCreateApproval = () => {
    setCreateApprovalModalVisible(false);
    createApprovalForm.resetFields();
  };

  // 漏洞等级标签
  const getVulnerabilityLevelTag = (level: number) => {
    const config = {
      1: { color: 'red', text: '严重' },
      2: { color: 'orange', text: '高危' },
      3: { color: 'gold', text: '中危' },
      4: { color: 'green', text: '低危' },
    };
    const { color, text } = config[level] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 状态标签
  const getStatusTag = (status: number) => {
    const config = {
      1: { color: 'blue', text: '已创建' },
      2: { color: 'orange', text: '处置中' },
      3: { color: 'purple', text: '审批中' },
      4: { color: 'green', text: '关闭' },
    };
    const { color, text } = config[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 结论标签
  const getConclusionTag = (conclusion?: number) => {
    if (!conclusion) return <Tag color="default">未处理</Tag>;

    const config = {
      1: { color: 'gray', text: '误报' },
      2: { color: 'cyan', text: '不受影响' },
      3: { color: 'green', text: '版本升级修复' },
      4: { color: 'blue', text: '补丁修复' },
      5: { color: 'orange', text: '有修复方案接受风险' },
      6: { color: 'red', text: '无修复方案接受风险' },
    };
    const { color, text } = config[conclusion] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回列表
          </Button>
        </Space>
        <Alert
          message="问题单据不存在"
          description="请检查问题单据编号是否正确，或返回列表重新选择。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="problem-detail">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          返回列表
        </Button>
        {problem.approvalList && problem.approvalList.length > 0 && (
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => viewApproval(problem.approvalList[0])}
          >
            查看审批单
          </Button>
        )}
      </Space>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="问题编号">{problem.problemNumber}</Descriptions.Item>
          <Descriptions.Item label="漏洞编号">{problem.vulnerabilityNum}</Descriptions.Item>
          <Descriptions.Item label="项目编号">{problem.projectNumber}</Descriptions.Item>
          <Descriptions.Item label="扫描项">{problem.scanItem}</Descriptions.Item>
          <Descriptions.Item label="漏洞等级">
            {getVulnerabilityLevelTag(problem.vulnerabilityLevel)}
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            {getStatusTag(problem.status)}
          </Descriptions.Item>
          <Descriptions.Item label="责任人">{problem.responsiblePerson}</Descriptions.Item>
          <Descriptions.Item label="预期解决时间">{problem.expectedDate}</Descriptions.Item>
          <Descriptions.Item label="是否红线">
            {problem.isRedLine ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="是否软件平台">
            {problem.isSoftware ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="组件名称">
            {problem.componentName || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="组件版本">
            {problem.componentVersion || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="IP地址">
            {problem.ip || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="API接口">
            {problem.api || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="结论">
            {getConclusionTag(problem.conclusion)}
          </Descriptions.Item>
          <Descriptions.Item label="审批单" span={2}>
            {problem.approvalList && problem.approvalList.length > 0 ? (
              <Space>
                {problem.approvalList.map((approvalId, index) => (
                  <Button
                    key={index}
                    type="link"
                    size="small"
                    onClick={() => viewApproval(approvalId)}
                  >
                    {approvalId}
                  </Button>
                ))}
              </Space>
            ) : (
              '未关联'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 漏洞简要描述 */}
      <Card title="漏洞简要描述" style={{ marginBottom: 16 }}>
        <div>
          <p style={{ lineHeight: 1.8, fontSize: 14 }}>
            {problem.descriptionRief || '暂无简要描述'}
          </p>
        </div>
      </Card>

      {/* 漏洞详细描述 */}
      <Card title="详细描述" style={{ marginBottom: 16 }}>
        <div>
          <p style={{ lineHeight: 1.8, fontSize: 14 }}>
            {problem.descriptionDetailed || '暂无详细描述'}
          </p>
        </div>
      </Card>

      {/* 修复信息 */}
      <Card title="修复信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="修复地址">
            {problem.fixAddress ? (
              <a href={problem.fixAddress} target="_blank" rel="noopener noreferrer">
                {problem.fixAddress}
              </a>
            ) : (
              '无'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="修复版本">
            {problem.fixVersion || '无'}
          </Descriptions.Item>
          <Descriptions.Item label="处置描述" span={2}>
            {problem.descriptionDisposal || '暂无处置描述'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 状态评估 */}
      <Card title="状态评估">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>漏洞等级</div>
            <div>{getVulnerabilityLevelTag(problem.vulnerabilityLevel)}</div>
          </div>
          <Divider type="vertical" style={{ height: '60px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>处理状态</div>
            <div>{getStatusTag(problem.status)}</div>
          </div>
          <Divider type="vertical" style={{ height: '60px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>预期解决时间</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              {problem.expectedDate}
            </div>
          </div>
          <Divider type="vertical" style={{ height: '60px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>结论</div>
            <div>{getConclusionTag(problem.conclusion)}</div>
          </div>
        </div>
      </Card>

      {/* 操作按钮区域 */}
      {(!problem.approvalList || problem.approvalList.length === 0) && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                问题单据操作
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                修改问题单据信息，或直接创建审批单
              </div>
            </div>
            <Space size="large">
              <Button
                icon={<EditOutlined />}
                onClick={openEditModal}
                size="large"
              >
                编辑问题单据
              </Button>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={openCreateApprovalModal}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                创建审批单
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* 编辑模态框 */}
      <Modal
        title="编辑问题单据"
        open={editModalVisible}
        onCancel={cancelEdit}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={updateProblem}
        >
          <Form.Item
            name="problemNumber"
            label="问题编号"
            rules={[{ required: true, message: '请输入问题编号' }]}
          >
            <Input placeholder="请输入问题编号" />
          </Form.Item>

          <Form.Item
            name="vulnerabilityNum"
            label="漏洞编号"
            rules={[{ required: true, message: '请输入漏洞编号' }]}
          >
            <Input placeholder="请输入漏洞编号" />
          </Form.Item>

          <Form.Item
            name="projectNumber"
            label="项目编号"
            rules={[{ required: true, message: '请输入项目编号' }]}
          >
            <Input placeholder="请输入项目编号" />
          </Form.Item>

          <Form.Item
            name="scanItem"
            label="扫描项"
            rules={[{ required: true, message: '请输入扫描项' }]}
          >
            <Input placeholder="请输入扫描项" />
          </Form.Item>

          <Form.Item
            name="vulnerabilityLevel"
            label="漏洞等级"
            rules={[{ required: true, message: '请选择漏洞等级' }]}
          >
            <Select placeholder="请选择漏洞等级">
              <Select.Option value={1}>严重</Select.Option>
              <Select.Option value={2}>高危</Select.Option>
              <Select.Option value={3}>中危</Select.Option>
              <Select.Option value={4}>低危</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value={1}>已创建</Select.Option>
              <Select.Option value={2}>处置中</Select.Option>
              <Select.Option value={3}>审批中</Select.Option>
              <Select.Option value={4}>关闭</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="responsiblePerson"
            label="责任人"
            rules={[{ required: true, message: '请输入责任人' }]}
          >
            <Input placeholder="请输入责任人" />
          </Form.Item>

          <Form.Item
            name="expectedDate"
            label="预期解决时间"
            rules={[{ required: true, message: '请选择预期解决时间' }]}
          >
            <Input placeholder="请输入预期解决时间（YYYY-MM-DD）" />
          </Form.Item>

          <Form.Item
            name="isRedLine"
            label="是否红线"
          >
            <Select placeholder="请选择是否红线">
              <Select.Option value={0}>否</Select.Option>
              <Select.Option value={1}>是</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isSoftware"
            label="是否软件平台"
          >
            <Select placeholder="请选择是否软件平台">
              <Select.Option value={0}>否</Select.Option>
              <Select.Option value={1}>是</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="descriptionRief"
            label="简要描述"
            rules={[{ required: true, message: '请输入简要描述' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入简要描述..."
            />
          </Form.Item>

          <Form.Item
            name="descriptionDetailed"
            label="详细描述"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入详细描述..."
            />
          </Form.Item>

          <Form.Item
            name="componentName"
            label="组件名称"
          >
            <Input placeholder="请输入组件名称" />
          </Form.Item>

          <Form.Item
            name="componentVersion"
            label="组件版本"
          >
            <Input placeholder="请输入组件版本" />
          </Form.Item>

          <Form.Item
            name="ip"
            label="IP地址"
          >
            <Input placeholder="请输入IP地址" />
          </Form.Item>

          <Form.Item
            name="api"
            label="API接口"
          >
            <Input placeholder="请输入API接口" />
          </Form.Item>

          <Form.Item
            name="fixAddress"
            label="修复地址"
          >
            <Input placeholder="请输入修复地址" />
          </Form.Item>

          <Form.Item
            name="fixVersion"
            label="修复版本"
          >
            <Input placeholder="请输入修复版本" />
          </Form.Item>

          <Form.Item
            name="descriptionDisposal"
            label="处置描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入处置描述..."
            />
          </Form.Item>

          <Form.Item
            name="conclusion"
            label="结论"
          >
            <Select placeholder="请选择结论" allowClear>
              <Select.Option value={1}>误报</Select.Option>
              <Select.Option value={2}>不受影响</Select.Option>
              <Select.Option value={3}>版本升级修复</Select.Option>
              <Select.Option value={4}>补丁修复</Select.Option>
              <Select.Option value={5}>有修复方案接受风险</Select.Option>
              <Select.Option value={6}>无修复方案接受风险</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={cancelEdit}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
              >
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建审批单模态框 */}
      <Modal
        title="创建审批单"
        open={createApprovalModalVisible}
        onCancel={cancelCreateApproval}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={createApprovalForm}
          layout="vertical"
          onFinish={submitCreateApproval}
        >
          <Form.Item
            name="title"
            label="审批标题"
            rules={[{ required: true, message: '请输入审批标题' }]}
            initialValue={`${problem?.descriptionRief || '问题单据'} - 修复审批`}
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
              <Select.Option value="urgent">紧急</Select.Option>
              <Select.Option value="normal">普通</Select.Option>
              <Select.Option value="low">低优先级</Select.Option>
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
            <Input.TextArea
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
                loading={createApprovalLoading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
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

export default VulnerabilityDetail;