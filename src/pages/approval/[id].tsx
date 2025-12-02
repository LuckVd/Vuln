import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import {
  Card, Descriptions, Tag, Button, Space, Spin, Alert, Timeline, Table, Collapse,
  Select, Input, Form, DatePicker, message, Modal
} from 'antd';
import {
  ArrowLeftOutlined, ClockCircleOutlined, CheckCircleOutlined, BarChartOutlined,
  SendOutlined, UserOutlined, CommentOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Approval, ApprovalHistory, Vulnerability } from '@/types';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  // 管理三个部分的折叠状态
  const [activeKeys, setActiveKeys] = useState<string[]>(['1', '2', '3']);
  // 分页状态
  const [vulnCurrent, setVulnCurrent] = useState(1);
  const [vulnPageSize, setVulnPageSize] = useState(10);
  // 审批表单状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取审批单历史记录
  const fetchApprovalHistory = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approval/${approvalId}/history`);
      const result = await response.json();
      if (result.code === 200) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error('获取审批历史失败:', error);
    }
  };

  // 获取审批单详情
  const fetchApprovalDetail = async (approvalId: string) => {
    setLoading(true);
    try {
      // 获取审批单基本信息
      const approvalResponse = await fetch(`/api/approval/${approvalId}`);
      const approvalResult = await approvalResponse.json();

      // 获取审批历史
      const historyResponse = await fetch(`/api/approval/${approvalId}/history`);
      const historyResult = await historyResponse.json();

      // 获取相关漏洞
      const vulnResponse = await fetch(`/api/vuln/approval/${approvalId}`);
      const vulnResult = await vulnResponse.json();

      if (approvalResult.code === 200) {
        setApproval(approvalResult.data);
      } else {
        // 使用模拟数据
        const mockApproval: Approval = {
          id: 'APP-2024-001',
          title: '紧急漏洞修复审批',
          status: 'completed',
          createTime: '2024-01-15 11:00:00',
          updateTime: '2024-01-20 16:30:00',
          approver: '张三',
          priority: 'urgent',
          department: '安全部',
          comments: '本次漏洞涉及SQL注入和CSRF两个高危漏洞，需要紧急处理。请开发团队立即组织修复，测试团队重点验证。',
        };
        setApproval(mockApproval);
      }

      if (historyResult.code === 200) {
        setHistory(historyResult.data);
      } else {
        // 使用模拟数据
        const mockHistory: ApprovalHistory[] = [
          {
            id: 'HIS-2024-001-01',
            approvalId: approvalId,
            step: '提交申请',
            operator: '张三',
            operation: '提交',
            time: '2024-01-15 11:00:00',
            comments: '发现SQL注入和CSRF漏洞，申请紧急修复'
          },
          {
            id: 'HIS-2024-001-02',
            approvalId: approvalId,
            step: '安全评估',
            operator: '李四',
            operation: '审核通过',
            time: '2024-01-16 10:00:00',
            comments: '漏洞确实存在，风险等级评估准确'
          },
          {
            id: 'HIS-2024-001-03',
            approvalId: approvalId,
            step: '技术方案评审',
            operator: '王五',
            operation: '审核通过',
            time: '2024-01-17 14:00:00',
            comments: '修复方案可行，建议立即实施'
          },
          {
            id: 'HIS-2024-001-04',
            approvalId: approvalId,
            step: '最终审批',
            operator: '赵六',
            operation: '审批完成',
            time: '2024-01-20 16:30:00',
            comments: '审批通过，请立即开始修复工作'
          }
        ];
        setHistory(mockHistory);
      }

      if (vulnResult.code === 200) {
        setVulnerabilities(vulnResult.data);
      } else {
        // 使用模拟数据
        const mockVulns: Vulnerability[] = [
          {
            id: 'VUL-2024-001',
            name: 'SQL注入漏洞',
            source: 'IAST',
            riskLevel: 'critical',
            discoveryTime: '2024-01-15 10:30:00',
            expectedBlockTime: '2024-01-20 00:00:00',
            status: 'approved',
            description: '在用户登录模块发现SQL注入漏洞',
            severity: '严重',
            affectedComponent: 'user/login',
            approvalId: approvalId
          },
          {
            id: 'VUL-2024-004',
            name: 'CSRF跨站请求伪造',
            source: 'IAST',
            riskLevel: 'medium',
            discoveryTime: '2024-01-18 16:45:00',
            expectedBlockTime: '2024-01-26 00:00:00',
            status: 'approved',
            description: '关键业务操作缺少CSRF保护',
            severity: '中危',
            affectedComponent: 'user/settings',
            approvalId: approvalId
          }
        ];
        setVulnerabilities(mockVulns);
      }

    } catch (error) {
      console.error('获取审批单详情失败:', error);
      setApproval(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApprovalDetail(id);
    }
  }, [id]);

  // 返回列表页
  const goBack = () => {
    history.push('/approval');
  };

  // 查看漏洞详情
  const viewVulnerability = (vulnId: string) => {
    history.push(`/vuln/${vulnId}`);
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

  // 生成统计信息（简化版，仅显示风险等级分布）
  const getStatisticsContent = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
            {vulnerabilities.filter(v => v.riskLevel === 'critical').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>严重</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff7a45' }}>
            {vulnerabilities.filter(v => v.riskLevel === 'high').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>高危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffa940' }}>
            {vulnerabilities.filter(v => v.riskLevel === 'medium').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>中危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
            {vulnerabilities.filter(v => v.riskLevel === 'low').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>低危</div>
        </div>
      </div>
    );
  };

  // 提交审批
  const submitApproval = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await fetch(`/api/approval/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalId: id,
          result: values.result,
          assignTo: values.assignTo,
          comment: values.comment,
          dueDate: values.dueDate?.format('YYYY-MM-DD HH:mm:ss'),
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('审批提交成功');
        form.resetFields();
        // 重新获取审批历史
        fetchApprovalDetail(id!);
      } else {
        message.error(result.message || '审批提交失败');
      }
    } catch (error) {
      console.error('提交审批失败:', error);
      message.error('网络错误，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 移除漏洞
  const removeVulnerability = async (vulnId: string) => {
    try {
      const response = await fetch(`/api/approval/${id}/remove-vuln`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalId: id,
          vulnerabilityId: vulnId,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('漏洞移除成功');

        // 检查审批单是否被自动关闭
        if (result.data.approvalClosed) {
          message.info('该审批单的所有漏洞已处理完毕，审批单已自动关闭');
        }

        // 立即从本地状态中移除该漏洞，提供即时UI反馈
        setVulnerabilities(prev => prev.filter(v => v.id !== vulnId));

        // 同时重新从数据库获取最新数据以确保数据同步
        setTimeout(() => {
          fetchApprovalDetail(id!);
        }, 100); // 缩短延迟，确保数据库更新完成
      } else {
        message.error(result.message || '漏洞移除失败');
      }
    } catch (error) {
      console.error('移除漏洞失败:', error);
      message.error('网络错误，请重试');
    }
  };

  // 确认移除漏洞
  const confirmRemoveVulnerability = (vulnId: string, vulnName: string) => {
    Modal.confirm({
      title: '确认移除漏洞',
      content: `确定要将漏洞 ${vulnName} 从此审批单中移除吗？`,
      okText: '确认移除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => removeVulnerability(vulnId),
    });
  };

  const vulnColumns: ColumnsType<Vulnerability> = [
    {
      title: '漏洞编号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text: string) => (
        <Button
          type="link"
          size="small"
          onClick={() => viewVulnerability(text)}
        >
          {text}
        </Button>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = {
          pending: { color: 'orange', text: '待审批' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          processing: { color: 'blue', text: '处理中' },
        };
        const { color, text } = config[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (text: string, record: Vulnerability) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => confirmRemoveVulnerability(record.id, record.name)}
        >
          移除
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            返回列表
          </Button>
        </Space>
        <Alert
          message="审批单不存在"
          description="请检查审批单编号是否正确，或返回审批单列表重新选择。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="approval-detail">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          返回列表
        </Button>
      </Space>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Collapse
            activeKey={activeKeys}
            onChange={(keys) => setActiveKeys(keys as string[])}
            style={{ marginBottom: 16 }}
          >
            {/* 审批单信息部分 */}
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleOutlined />
                  <span>审批单信息</span>
                </div>
              }
              key="1"
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="审批单号">{approval.id}</Descriptions.Item>
                <Descriptions.Item label="审批标题">{approval.title}</Descriptions.Item>
                <Descriptions.Item label="优先级">{getPriorityTag(approval.priority)}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审批人">{approval.approver}</Descriptions.Item>
                <Descriptions.Item label="所属部门">{approval.department || '未指定'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{approval.createTime}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{approval.updateTime}</Descriptions.Item>
                <Descriptions.Item label="备注说明" span={2}>
                  {approval.comments || '无'}
                </Descriptions.Item>
              </Descriptions>
            </Panel>

            {/* 相关漏洞部分（简化统计信息） */}
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChartOutlined />
                  <span>相关漏洞 ({vulnerabilities.length})</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <Tag color="red">严重: {vulnerabilities.filter(v => v.riskLevel === 'critical').length}</Tag>
                    <Tag color="orange">高危: {vulnerabilities.filter(v => v.riskLevel === 'high').length}</Tag>
                    <Tag color="gold">中危: {vulnerabilities.filter(v => v.riskLevel === 'medium').length}</Tag>
                    <Tag color="green">低危: {vulnerabilities.filter(v => v.riskLevel === 'low').length}</Tag>
                  </div>
                </div>
              }
              key="2"
            >
              <div style={{ marginBottom: '16px' }}>
                {getStatisticsContent()}
              </div>
              <Table
                columns={vulnColumns}
                dataSource={vulnerabilities.slice(
                  (vulnCurrent - 1) * vulnPageSize,
                  vulnCurrent * vulnPageSize
                )}
                rowKey="id"
                pagination={{
                  current: vulnCurrent,
                  pageSize: vulnPageSize,
                  total: vulnerabilities.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  onChange: (page, pageSize) => {
                    setVulnCurrent(page);
                    setVulnPageSize(pageSize || 10);
                  },
                }}
                scroll={{ x: 1000 }}
              />
            </Panel>

            {/* 本次审批部分 - 修改为输入表单 */}
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SendOutlined />
                  <span>提交审批</span>
                </div>
              }
              key="3"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={submitApproval}
                style={{ maxWidth: '600px' }}
              >
                <Form.Item
                  name="result"
                  label="审批结果"
                  rules={[{ required: true, message: '请选择审批结果' }]}
                >
                  <Select
                    placeholder="请选择审批结果"
                    size="large"
                    prefix={<CheckCircleOutlined />}
                  >
                    <Option value="approved">
                      <Tag color="green">通过</Tag>
                    </Option>
                    <Option value="rejected">
                      <Tag color="red">拒绝</Tag>
                    </Option>
                    <Option value="returned">
                      <Tag color="orange">退回修改</Tag>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="assignTo"
                  label="转派给"
                  rules={[{ required: true, message: '请选择转派对象' }]}
                >
                  <Select
                    placeholder="请选择转派对象"
                    size="large"
                    prefix={<UserOutlined />}
                  >
                    <Option value="张三">张三 - 安全工程师</Option>
                    <Option value="李四">李四 - 高级开发工程师</Option>
                    <Option value="王五">王五 - 测试工程师</Option>
                    <Option value="赵六">赵六 - 运维工程师</Option>
                    <Option value="钱七">钱七 - 产品经理</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dueDate"
                  label="截止日期"
                  rules={[{ required: true, message: '请选择截止日期' }]}
                >
                  <DatePicker
                    showTime
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="请选择完成截止日期"
                    prefix={<CalendarOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="comment"
                  label="审批意见"
                  rules={[{ required: true, message: '请填写审批意见' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请详细说明审批意见、处理建议或其他相关信息..."
                    size="large"
                    prefix={<CommentOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Space size="large">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SendOutlined />}
                      loading={submitLoading}
                    >
                      提交审批
                    </Button>
                    <Button
                      size="large"
                      onClick={() => form.resetFields()}
                    >
                      重置表单
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Panel>
          </Collapse>
        </div>

        {/* 右侧：审批流程 - 设置最小宽度 */}
        <div style={{ minWidth: '320px', width: '320px' }}>
          <Card title="审批流程" style={{ position: 'sticky', top: '16px' }}>
            <Timeline
              mode="left"
              items={history.map((item) => ({
                dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                      {item.step}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                      {item.operator}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                      {item.time}
                    </div>
                    <div style={{ color: '#1890ff', fontSize: '12px' }}>
                      {item.operation}
                    </div>
                    {item.comments && (
                      <div style={{ color: '#666', marginTop: '4px', fontSize: '12px' }}>
                        {item.comments}
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetail;