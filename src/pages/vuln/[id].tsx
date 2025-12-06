import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert, Divider, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, EditOutlined, SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { Vulnerability } from '@/types';

const VulnerabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vulnerability, setVulnerability] = useState<Vulnerability | null>(null);
  const [loading, setLoading] = useState(true);

  // 暂存编辑相关状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // 创建审批单相关状态
  const [createApprovalModalVisible, setCreateApprovalModalVisible] = useState(false);
  const [createApprovalForm] = Form.useForm();
  const [createApprovalLoading, setCreateApprovalLoading] = useState(false);

  // 获取漏洞详情
  const fetchVulnerabilityDetail = async (vulnId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vuln/${vulnId}`);
      const result = await response.json();

      if (result.code === 200) {
        setVulnerability(result.data);
      } else {
        // 如果API不存在，使用模拟数据
        const mockVulnerabilities: Vulnerability[] = [
          {
            id: 'VUL-2024-001',
            name: 'SQL注入漏洞',
            source: 'IAST',
            riskLevel: 'critical',
            discoveryTime: '2024-01-15 10:30:00',
            expectedBlockTime: '2024-01-20 00:00:00',
            status: 'approved',
            description: '在用户登录模块发现SQL注入漏洞，攻击者可以通过构造恶意SQL语句获取数据库敏感信息。该漏洞存在于登录表单的username参数处理逻辑中，未对用户输入进行充分的参数化处理。',
            severity: '严重',
            affectedComponent: 'user/login',
            recommendation: '立即使用参数化查询替换字符串拼接，对所有用户输入进行严格验证，实施输入验证和输出编码。建议使用PreparedStatement或ORM框架来防止SQL注入攻击。',
            approvalId: 'APP-2024-001'
          },
          {
            id: 'VUL-2024-002',
            name: 'XSS跨站脚本攻击',
            source: 'DAST',
            riskLevel: 'high',
            discoveryTime: '2024-01-16 14:20:00',
            expectedBlockTime: '2024-01-22 00:00:00',
            status: 'processing',
            description: '在评论功能中发现存储型XSS漏洞，攻击者可以注入恶意脚本在用户浏览器中执行。漏洞出现在评论提交和展示功能中，未对用户输入进行适当的HTML编码处理。',
            severity: '高危',
            affectedComponent: 'product/comments',
            recommendation: '对用户输入进行HTML编码，使用CSP头部保护，实施内容安全策略。建议使用成熟的XSS防护库，如DOMPurify，对所有用户生成内容进行净化处理。',
            approvalId: 'APP-2024-002'
          }
        ];

        const vuln = mockVulnerabilities.find(item => item.id === vulnId);
        if (vuln) {
          setVulnerability(vuln);
        } else {
          setVulnerability(null);
        }
      }
    } catch (error) {
      console.error('获取漏洞详情失败:', error);
      setVulnerability(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVulnerabilityDetail(id);
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
    if (!vulnerability) return;

    // 如果有暂存数据，使用暂存数据填充表单
    const formData = {
      name: vulnerability.stagedData?.name || vulnerability.name,
      riskLevel: vulnerability.stagedData?.riskLevel || vulnerability.riskLevel,
      description: vulnerability.stagedData?.description || vulnerability.description,
      severity: vulnerability.stagedData?.severity || vulnerability.severity,
      affectedComponent: vulnerability.stagedData?.affectedComponent || vulnerability.affectedComponent,
      recommendation: vulnerability.stagedData?.recommendation || vulnerability.recommendation,
    };

    editForm.setFieldsValue(formData);
    setEditModalVisible(true);
  };

  // 暂存编辑
  const submitStagedEdit = async (values: any) => {
    if (!vulnerability) return;

    setEditLoading(true);
    try {
      const response = await fetch('/api/vuln/stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vulnId: vulnerability.id,
          stagedData: values,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('暂存成功');
        setEditModalVisible(false);
        editForm.resetFields();
        // 刷新漏洞详情
        fetchVulnerabilityDetail(vulnerability.id);
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

  // 应用暂存修改
  const applyStagedChanges = async () => {
    if (!vulnerability) return;

    try {
      const response = await fetch(`/api/vuln/stage/apply/${vulnerability.id}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('暂存修改已应用');
        fetchVulnerabilityDetail(vulnerability.id);
      } else {
        message.error(result.message || '应用失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    }
  };

  // 取消暂存修改
  const cancelStagedChanges = async () => {
    if (!vulnerability) return;

    try {
      const response = await fetch(`/api/vuln/stage/${vulnerability.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('暂存修改已取消');
        fetchVulnerabilityDetail(vulnerability.id);
      } else {
        message.error(result.message || '取消失败');
      }
    } catch (error) {
      message.error('网络错误，请重试');
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditModalVisible(false);
    editForm.resetFields();
  };

  // 打开创建审批单模态框
  const openCreateApprovalModal = () => {
    if (!vulnerability) return;
    setCreateApprovalModalVisible(true);
  };

  // 创建审批单
  const submitCreateApproval = async (values: any) => {
    if (!vulnerability) return;

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
          vulnerabilityIds: [vulnerability.id],
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('审批单创建成功');
        setCreateApprovalModalVisible(false);
        createApprovalForm.resetFields();
        // 刷新漏洞详情
        fetchVulnerabilityDetail(vulnerability.id);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!vulnerability) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回列表
          </Button>
        </Space>
        <Alert
          message="漏洞不存在"
          description="请检查漏洞编号是否正确，或返回漏洞列表重新选择。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="vulnerability-detail">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          返回列表
        </Button>
        {vulnerability.approvalId && (
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => viewApproval(vulnerability.approvalId!)}
          >
            查看审批单
          </Button>
        )}
      </Space>

      {/* 暂存状态提示 */}
      {vulnerability.isStaged && (
        <Alert
          message="当前漏洞有暂存的修改"
          description={`暂存时间: ${vulnerability.stageTime}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="漏洞编号">{vulnerability.id}</Descriptions.Item>
          <Descriptions.Item label="漏洞名称">
            <div>
              <div>{vulnerability.name}</div>
              {vulnerability.isStaged && vulnerability.stagedData?.name && (
                <div style={{ fontSize: '12px', color: '#52c41a', fontStyle: 'italic' }}>
                  → {vulnerability.stagedData.name}
                </div>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="漏洞来源">{vulnerability.source}</Descriptions.Item>
          <Descriptions.Item label="危害等级">
            <div>
              {getRiskLevelTag(vulnerability.riskLevel)}
              {vulnerability.isStaged && vulnerability.stagedData?.riskLevel && vulnerability.stagedData.riskLevel !== vulnerability.riskLevel && (
                <div style={{ marginTop: 4 }}>
                  {getRiskLevelTag(vulnerability.stagedData.riskLevel)}
                </div>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="发现时间">{vulnerability.discoveryTime}</Descriptions.Item>
          <Descriptions.Item label="预期拦截时间">{vulnerability.expectedBlockTime}</Descriptions.Item>
          <Descriptions.Item label="当前状态">{getStatusTag(vulnerability.status)}</Descriptions.Item>
          <Descriptions.Item label="严重程度">
            <div>
              <div>{vulnerability.severity || '未定义'}</div>
              {vulnerability.isStaged && vulnerability.stagedData?.severity && (
                <div style={{ fontSize: '12px', color: '#52c41a', fontStyle: 'italic' }}>
                  → {vulnerability.stagedData.severity}
                </div>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="影响组件" span={2}>
            <div>
              <div>{vulnerability.affectedComponent || '未定义'}</div>
              {vulnerability.isStaged && vulnerability.stagedData?.affectedComponent && (
                <div style={{ fontSize: '12px', color: '#52c41a', fontStyle: 'italic' }}>
                  → {vulnerability.stagedData.affectedComponent}
                </div>
              )}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="审批单ID" span={2}>
            {vulnerability.approvalId ? (
              <Button
                type="link"
                size="small"
                onClick={() => viewApproval(vulnerability.approvalId!)}
              >
                {vulnerability.approvalId}
              </Button>
            ) : (
              '未关联'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 漏洞描述 */}
      <Card title="漏洞描述" style={{ marginBottom: 16 }}>
        <div>
          <p style={{ lineHeight: 1.8, fontSize: 14 }}>
            {vulnerability.description || '暂无详细描述'}
          </p>
          {vulnerability.isStaged && vulnerability.stagedData?.description && (
            <div style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold', marginBottom: '4px' }}>
                暂存的修改:
              </div>
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: 13 }}>
                {vulnerability.stagedData.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 修复建议 */}
      <Card title="修复建议" style={{ marginBottom: 16 }}>
        <div>
          {vulnerability.recommendation ? (
            <div style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              padding: '16px'
            }}>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 14 }}>
                {vulnerability.recommendation}
              </p>
            </div>
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>暂无修复建议</p>
          )}
          {vulnerability.isStaged && vulnerability.stagedData?.recommendation && (
            <div style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#fa8c16', fontWeight: 'bold', marginBottom: '4px' }}>
                暂存的修改:
              </div>
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: 13 }}>
                {vulnerability.stagedData.recommendation}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 风险评估 */}
      <Card title="风险评估">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>风险等级</div>
            <div>{getRiskLevelTag(vulnerability.riskLevel)}</div>
          </div>
          <Divider type="vertical" style={{ height: '60px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>处理状态</div>
            <div>{getStatusTag(vulnerability.status)}</div>
          </div>
          <Divider type="vertical" style={{ height: '60px' }} />
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>时间限制</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              {vulnerability.expectedBlockTime}
            </div>
          </div>
        </div>
      </Card>

      {/* 操作按钮区域 */}
      {!vulnerability.approvalId && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                漏洞操作
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {!vulnerability.isStaged ? '修改漏洞信息并暂存，或直接创建审批单' : '已暂存修改，可继续编辑或创建审批单'}
              </div>
            </div>
            <Space size="large">
              <Button
                icon={<EditOutlined />}
                onClick={openEditModal}
                size="large"
              >
                {vulnerability.isStaged ? '继续编辑' : '修改漏洞'}
              </Button>
              {vulnerability.isStaged && (
                <>
                  <Popconfirm
                    title="确定要应用暂存的修改吗？"
                    description="应用后漏洞信息将被更新"
                    onConfirm={applyStagedChanges}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      type="default"
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      应用修改
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="确定要取消暂存的修改吗？"
                    description="取消后将丢失所有未应用的修改"
                    onConfirm={cancelStagedChanges}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      size="large"
                    >
                      取消暂存
                    </Button>
                  </Popconfirm>
                </>
              )}
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
        title={vulnerability.isStaged ? '编辑暂存' : '编辑漏洞'}
        open={editModalVisible}
        onCancel={cancelEdit}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={submitStagedEdit}
        >
          <Form.Item
            name="name"
            label="漏洞名称"
            rules={[{ required: true, message: '请输入漏洞名称' }]}
          >
            <Input placeholder="请输入漏洞名称" />
          </Form.Item>

          <Form.Item
            name="riskLevel"
            label="风险等级"
            rules={[{ required: true, message: '请选择风险等级' }]}
          >
            <Select placeholder="请选择风险等级">
              <Select.Option value="critical">严重</Select.Option>
              <Select.Option value="high">高危</Select.Option>
              <Select.Option value="medium">中危</Select.Option>
              <Select.Option value="low">低危</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="漏洞描述"
            rules={[{ required: true, message: '请输入漏洞描述' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请详细描述漏洞的情况..."
            />
          </Form.Item>

          <Form.Item
            name="severity"
            label="严重程度"
          >
            <Input placeholder="请输入严重程度" />
          </Form.Item>

          <Form.Item
            name="affectedComponent"
            label="影响组件"
          >
            <Input placeholder="请输入影响组件" />
          </Form.Item>

          <Form.Item
            name="recommendation"
            label="修复建议"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入修复建议..."
            />
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
                暂存修改
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
            initialValue={`${vulnerability?.name || '漏洞'} - 修复审批`}
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