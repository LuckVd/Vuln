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
      const vulnResponse = await fetch(`/api/vuln?approvalId=${approvalId}`);
      const vulnResult = await vulnResponse.json();

      if (approvalResult.code === 200) {
        setApproval(approvalResult.data);
      } else {
        setApproval(null);
      }

      if (historyResult.code === 200) {
        setHistory(historyResult.data);
      } else {
        setHistory([]);
      }

      if (vulnResult.code === 200) {
        setVulnerabilities(vulnResult.data);
      } else {
        setVulnerabilities([]);
      }

    } catch (error) {
      console.error('获取审批单详情失败:', error);
      setApproval(null);
      setHistory([]);
      setVulnerabilities([]);
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

  // 状态标签
  const getStatusTag = (status: number) => {
    const statusMap = {
      1: { color: 'blue', text: '已创建' },
      2: { color: 'orange', text: '处置中' },
      3: { color: 'purple', text: '审批中' },
      4: { color: 'green', text: '关闭' }
    };
    const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 漏洞等级标签
  const getRiskLevelTag = (level: number) => {
    const levelMap = {
      1: { color: 'red', text: '严重' },
      2: { color: 'orange', text: '高危' },
      3: { color: 'gold', text: '中危' },
      4: { color: 'green', text: '低危' }
    };
    const { color, text } = levelMap[level] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 结论标签
  const getConclusionTag = (conclusion: number) => {
    const conclusionMap = {
      1: { color: 'green', text: '误报' },
      2: { color: 'blue', text: '不受影响' },
      3: { color: 'cyan', text: '版本升级' },
      4: { color: 'purple', text: '补丁修复' },
      5: { color: 'orange', text: '接受风险' },
      6: { color: 'volcano', text: '无修复方案' }
    };
    const { color, text } = conclusionMap[conclusion] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 生成统计信息（适配数字等级）
  const getStatisticsContent = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
            {vulnerabilities.filter(v => v.severity === '严重').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>严重</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff7a45' }}>
            {vulnerabilities.filter(v => v.severity === '高危').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>高危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffa940' }}>
            {vulnerabilities.filter(v => v.severity === '中危').length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>中危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
            {vulnerabilities.filter(v => v.severity === '低危').length}
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
                <Descriptions.Item label="审批单号">{approval.approvalNumber}</Descriptions.Item>
                <Descriptions.Item label="关联问题数量">{approval.problemList?.length || 0}个</Descriptions.Item>
                <Descriptions.Item label="风险等级">
                  {getRiskLevelTag(approval.vulnerabilityLevel)}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  {getStatusTag(approval.status)}
                </Descriptions.Item>
                <Descriptions.Item label="审批人">{approval.approvalPerson}</Descriptions.Item>
                <Descriptions.Item label="软研专家">{approval.softwarePerson || '未分配'}</Descriptions.Item>
                <Descriptions.Item label="创建人">{approval.createPerson}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{approval.createTime}</Descriptions.Item>
                <Descriptions.Item label="处置结论" span={2}>
                  {getConclusionTag(approval.conclusion)}
                </Descriptions.Item>
                <Descriptions.Item label="处置说明" span={2}>
                  {approval.descriptionDisposal || '无'}
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
                    <Tag color="red">严重: {vulnerabilities.filter(v => v.severity === '严重').length}</Tag>
                    <Tag color="orange">高危: {vulnerabilities.filter(v => v.severity === '高危').length}</Tag>
                    <Tag color="gold">中危: {vulnerabilities.filter(v => v.severity === '中危').length}</Tag>
                    <Tag color="green">低危: {vulnerabilities.filter(v => v.severity === '低危').length}</Tag>
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