import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert, Divider, Form, Input, Select, DatePicker, message, Popconfirm, Modal } from 'antd';
const { Option } = Select;
const { TextArea } = Input;
const { Item: FormItem } = Form;
import { ArrowLeftOutlined, EyeOutlined, EditOutlined, SaveOutlined, CloudUploadOutlined, CloseOutlined } from '@ant-design/icons';
import { ProblemDocument, ENUMS, REVERSE_STRING_ENUMS } from '@/types';

// 可编辑字段组件
const EditableField: React.FC<{
  isEditMode: boolean;
  label: string;
  value: any;
  form: any;
  name: string;
  type?: 'input' | 'select' | 'textarea';
  options?: Array<{ label: string; value: any }>;
  render?: (value: any) => React.ReactNode;
}> = ({ isEditMode, label, value, form, name, type = 'input', options = [], render }) => {
  if (isEditMode) {
    switch (type) {
      case 'select':
        return (
          <FormItem name={name} style={{ margin: 0 }}>
            <Select placeholder={`请选择${label}`} style={{ width: '100%' }}>
              {options.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FormItem>
        );
      case 'textarea':
        return (
          <FormItem name={name} style={{ margin: 0 }}>
            <TextArea placeholder={`请输入${label}`} rows={3} />
          </FormItem>
        );
      default:
        return (
          <FormItem name={name} style={{ margin: 0 }}>
            <Input placeholder={`请输入${label}`} />
          </FormItem>
        );
    }
  }

  return render ? render(value) : <span>{value || '-'}</span>;
};

const VulnerabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // 编辑模式相关状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [originalProblem, setOriginalProblem] = useState<ProblemDocument | null>(null);

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
        setOriginalProblem(result.data);
        // 更新表单数据
        editForm.setFieldsValue({
          problemNumber: result.data.problemNumber,
          vulnerabilityNum: result.data.vulnerabilityNum,
          descriptionRief: result.data.descriptionRief,
          vulnerabilityLevel: result.data.vulnerabilityLevel,
          scanItem: result.data.scanItem,
          projectNumber: result.data.projectNumber,
          expectedDate: result.data.expectedDate,
          status: result.data.status,
          descriptionDetailed: result.data.descriptionDetailed,
          componentName: result.data.componentName,
          componentVersion: result.data.componentVersion,
          ip: result.data.ip,
          api: result.data.api,
          fixAddress: result.data.fixAddress,
          fixVersion: result.data.fixVersion,
          descriptionDisposal: result.data.descriptionDisposal,
          responsiblePerson: result.data.responsiblePerson,
          isRedLine: result.data.isRedLine,
          isSoftware: result.data.isSoftware,
          conclusion: result.data.conclusion,
        });
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

  // 进入编辑模式
  const enterEditMode = () => {
    if (!problem) return;
    setIsEditMode(true);
  };

  // 退出编辑模式
  const exitEditMode = () => {
    setIsEditMode(false);
    if (originalProblem) {
      // 恢复原始数据
      setProblem(originalProblem);
      editForm.setFieldsValue({
        problemNumber: originalProblem.problemNumber,
        vulnerabilityNum: originalProblem.vulnerabilityNum,
        descriptionRief: originalProblem.descriptionRief,
        vulnerabilityLevel: originalProblem.vulnerabilityLevel,
        scanItem: originalProblem.scanItem,
        projectNumber: originalProblem.projectNumber,
        expectedDate: originalProblem.expectedDate,
        status: originalProblem.status,
        descriptionDetailed: originalProblem.descriptionDetailed,
        componentName: originalProblem.componentName,
        componentVersion: originalProblem.componentVersion,
        ip: originalProblem.ip,
        api: originalProblem.api,
        fixAddress: originalProblem.fixAddress,
        fixVersion: originalProblem.fixVersion,
        descriptionDisposal: originalProblem.descriptionDisposal,
        responsiblePerson: originalProblem.responsiblePerson,
        isRedLine: originalProblem.isRedLine,
        isSoftware: originalProblem.isSoftware,
        conclusion: originalProblem.conclusion,
      });
    }
  };

  // 保存编辑
  const saveEdit = async () => {
    if (!problem) return;

    try {
      const values = await editForm.validateFields();
      console.log('🔧 开始保存，表单数据:', values);
      setEditLoading(true);

      const requestData = {
        operations: [{
          problemId: problem.id,
          stagedData: values,
        }],
      };
      console.log('📤 发送请求数据:', requestData);

      const response = await fetch('/api/problem/stage/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('📥 收到响应:', result);

      if (result.code === 200) {
        message.success('保存成功');
        setIsEditMode(false);
        // 更新本地状态
        const updatedProblem = { ...problem, ...values };
        setProblem(updatedProblem);
        setOriginalProblem(updatedProblem);
        console.log('✅ 本地状态已更新:', updatedProblem);
        // 刷新问题单据详情
        fetchProblemDetail(problem.id.toString());
      } else {
        console.error('❌ 保存失败:', result.message);
        message.error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('❌ 保存异常:', error);
      message.error('网络错误，请重试');
    } finally {
      setEditLoading(false);
    }
  };

  // 处理表单值变化
  const handleFormChange = (changedFields: any, allFields: any) => {
    if (problem && isEditMode) {
      // 实时更新本地状态
      setProblem(prev => prev ? { ...prev, ...changedFields } : null);
    }
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
      <Card
        title="基本信息"
        style={{ marginBottom: 16 }}
        extra={
          isEditMode ? (
            <Space>
              <Button icon={<CloseOutlined />} onClick={exitEditMode}>
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={saveEdit}
                loading={editLoading}
              >
                保存
              </Button>
            </Space>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={enterEditMode}
              disabled={!!(problem.approvalList && problem.approvalList.length > 0)}
            >
              编辑
            </Button>
          )
        }
      >
        <Form
          form={editForm}
          onValuesChange={handleFormChange}
          style={{ width: '100%' }}
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="问题编号">
              <span style={{ color: '#1890ff', fontWeight: 600 }}>{problem.problemNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="漏洞编号">
              <EditableField
                isEditMode={isEditMode}
                label="漏洞编号"
                value={problem.vulnerabilityNum}
                form={editForm}
                name="vulnerabilityNum"
              />
            </Descriptions.Item>
            <Descriptions.Item label="项目编号">
              <EditableField
                isEditMode={isEditMode}
                label="项目编号"
                value={problem.projectNumber}
                form={editForm}
                name="projectNumber"
              />
            </Descriptions.Item>
            <Descriptions.Item label="扫描项">
              <EditableField
                isEditMode={isEditMode}
                label="扫描项"
                value={problem.scanItem}
                form={editForm}
                name="scanItem"
              />
            </Descriptions.Item>
            <Descriptions.Item label="漏洞等级">
              <EditableField
                isEditMode={isEditMode}
                label="漏洞等级"
                value={problem.vulnerabilityLevel}
                form={editForm}
                name="vulnerabilityLevel"
                type="select"
                options={[
                  { label: '严重', value: 1 },
                  { label: '高危', value: 2 },
                  { label: '中危', value: 3 },
                  { label: '低危', value: 4 }
                ]}
                render={getVulnerabilityLevelTag}
              />
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <EditableField
                isEditMode={isEditMode}
                label="当前状态"
                value={problem.status}
                form={editForm}
                name="status"
                type="select"
                options={[
                  { label: '已创建', value: 1 },
                  { label: '处置中', value: 2 },
                  { label: '审批中', value: 3 },
                  { label: '关闭', value: 4 }
                ]}
                render={getStatusTag}
              />
            </Descriptions.Item>
            <Descriptions.Item label="责任人">
              <EditableField
                isEditMode={isEditMode}
                label="责任人"
                value={problem.responsiblePerson}
                form={editForm}
                name="responsiblePerson"
              />
            </Descriptions.Item>
            <Descriptions.Item label="预期解决时间">
              <EditableField
                isEditMode={isEditMode}
                label="预期解决时间"
                value={problem.expectedDate}
                form={editForm}
                name="expectedDate"
              />
            </Descriptions.Item>
            <Descriptions.Item label="是否红线">
              <EditableField
                isEditMode={isEditMode}
                label="是否红线"
                value={problem.isRedLine}
                form={editForm}
                name="isRedLine"
                type="select"
                options={[
                  { label: '否', value: 0 },
                  { label: '是', value: 1 }
                ]}
                render={(value) => value ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>}
              />
            </Descriptions.Item>
            <Descriptions.Item label="是否软件平台">
              <EditableField
                isEditMode={isEditMode}
                label="是否软件平台"
                value={problem.isSoftware}
                form={editForm}
                name="isSoftware"
                type="select"
                options={[
                  { label: '否', value: 0 },
                  { label: '是', value: 1 }
                ]}
                render={(value) => value ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>}
              />
            </Descriptions.Item>
            <Descriptions.Item label="组件名称">
              <EditableField
                isEditMode={isEditMode}
                label="组件名称"
                value={problem.componentName}
                form={editForm}
                name="componentName"
              />
            </Descriptions.Item>
            <Descriptions.Item label="组件版本">
              <EditableField
                isEditMode={isEditMode}
                label="组件版本"
                value={problem.componentVersion}
                form={editForm}
                name="componentVersion"
              />
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">
              <EditableField
                isEditMode={isEditMode}
                label="IP地址"
                value={problem.ip}
                form={editForm}
                name="ip"
              />
            </Descriptions.Item>
            <Descriptions.Item label="API接口">
              <EditableField
                isEditMode={isEditMode}
                label="API接口"
                value={problem.api}
                form={editForm}
                name="api"
              />
            </Descriptions.Item>
            <Descriptions.Item label="结论">
              <EditableField
                isEditMode={isEditMode}
                label="结论"
                value={problem.conclusion}
                form={editForm}
                name="conclusion"
                type="select"
                options={[
                  { label: '误报', value: 1 },
                  { label: '不受影响', value: 2 },
                  { label: '版本升级修复', value: 3 },
                  { label: '补丁修复', value: 4 },
                  { label: '有修复方案接受风险', value: 5 },
                  { label: '无修复方案接受风险', value: 6 }
                ]}
                render={getConclusionTag}
              />
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
        </Form>
      </Card>

      {/* 漏洞简要描述 */}
      <Card title="漏洞简要描述" style={{ marginBottom: 16 }}>
        {isEditMode ? (
          <Form form={editForm} onValuesChange={handleFormChange}>
            <FormItem name="descriptionRief" style={{ margin: 0 }}>
              <TextArea
                placeholder="请输入漏洞简要描述"
                rows={3}
                showCount
                maxLength={500}
              />
            </FormItem>
          </Form>
        ) : (
          <div>
            <p style={{ lineHeight: 1.8, fontSize: 14 }}>
              {problem.descriptionRief || '暂无简要描述'}
            </p>
          </div>
        )}
      </Card>

      {/* 漏洞详细描述 */}
      <Card title="详细描述" style={{ marginBottom: 16 }}>
        {isEditMode ? (
          <Form form={editForm} onValuesChange={handleFormChange}>
            <FormItem name="descriptionDetailed" style={{ margin: 0 }}>
              <TextArea
                placeholder="请输入详细描述"
                rows={4}
                showCount
                maxLength={1000}
              />
            </FormItem>
          </Form>
        ) : (
          <div>
            <p style={{ lineHeight: 1.8, fontSize: 14 }}>
              {problem.descriptionDetailed || '暂无详细描述'}
            </p>
          </div>
        )}
      </Card>

      {/* 修复信息 */}
      <Card title="修复信息" style={{ marginBottom: 16 }}>
        {isEditMode ? (
          <Form form={editForm} onValuesChange={handleFormChange}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="修复地址">
                <FormItem name="fixAddress" style={{ margin: 0 }}>
                  <Input placeholder="请输入修复地址" />
                </FormItem>
              </Descriptions.Item>
              <Descriptions.Item label="修复版本">
                <FormItem name="fixVersion" style={{ margin: 0 }}>
                  <Input placeholder="请输入修复版本" />
                </FormItem>
              </Descriptions.Item>
              <Descriptions.Item label="处置描述" span={2}>
                <FormItem name="descriptionDisposal" style={{ margin: 0 }}>
                  <TextArea
                    placeholder="请输入处置描述"
                    rows={3}
                    showCount
                    maxLength={1000}
                  />
                </FormItem>
              </Descriptions.Item>
            </Descriptions>
          </Form>
        ) : (
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
        )}
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
      {(!problem.approvalList || problem.approvalList.length === 0) && !isEditMode && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '4px', textAlign: 'center' }}>
                问题单据操作
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>
                可以直接创建审批单，或点击基本信息卡片右上角的"编辑"按钮修改问题信息
              </div>
              <div style={{ textAlign: 'center' }}>
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
              </div>
            </div>
          </div>
        </Card>
      )}

    
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