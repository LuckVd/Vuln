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
import { ApprovalDocument, ApprovalRecord as ApprovalHistory, ProblemDocument } from '@/types';

const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [approval, setApproval] = useState<ApprovalDocument | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [problems, setProblems] = useState<ProblemDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // 管理三个部分的折叠状态
  const [activeKeys, setActiveKeys] = useState<string[]>(['1', '2', '3']);
  // 分页状态
  const [problemCurrent, setProblemCurrent] = useState(1);
  const [problemPageSize, setProblemPageSize] = useState(10);
  // 审批表单状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取审批单历史记录
  const fetchApprovalHistory = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/approval/${approvalId}/history`);
      const result = await response.json();
      if (result.code === 200) {
        setApprovalHistory(result.data);
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

      // 获取相关审批单的问题列表，然后获取详细的问题信息
      const approval = approvalResult.data;
      let problemsList: ProblemDocument[] = [];

      if (approval && approval.problemList && approval.problemList.length > 0) {
        // 根据问题编号获取问题的详细信息
        const problemPromises = approval.problemList.map(async (problemNumber: string) => {
          try {
            const response = await fetch(`/api/problem/number/${problemNumber}`);
            const result = await response.json();
            return result.code === 200 ? result.data : null;
          } catch (error) {
            console.error(`获取问题 ${problemNumber} 详情失败:`, error);
            return null;
          }
        });

        const problemResults = await Promise.all(problemPromises);
        problemsList = problemResults.filter(problem => problem !== null);
      }

      if (approvalResult.code === 200) {
        setApproval(approvalResult.data);
      } else {
        setApproval(null);
      }

      if (historyResult.code === 200) {
        setApprovalHistory(historyResult.data);
      } else {
        setApprovalHistory([]);
      }

      setProblems(problemsList);

    } catch (error) {
      console.error('获取审批单详情失败:', error);
      setApproval(null);
      setApprovalHistory([]);
      setProblems([]);
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

  // 查看问题详情
  const viewProblem = (problemId: string) => {
    // 如果是问题编号格式，需要找到对应的数字ID
    if (problemId.startsWith('PROB-')) {
      const problem = problems.find(p => p.problemNumber === problemId);
      if (problem) {
        history.push(`/vuln/${problem.id}`);
        return;
      }
    }
    // 如果是数字ID，直接跳转
    history.push(`/vuln/${problemId}`);
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
            {problems.filter(p => p.vulnerabilityLevel === 1).length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>严重</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff7a45' }}>
            {problems.filter(p => p.vulnerabilityLevel === 2).length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>高危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffa940' }}>
            {problems.filter(p => p.vulnerabilityLevel === 3).length}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>中危</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
            {problems.filter(p => p.vulnerabilityLevel === 4).length}
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

  // 移除问题
  const removeProblem = async (problemNumber: string) => {
    try {
      const response = await fetch(`/api/approval/${id}/remove-problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemNumber: problemNumber,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        message.success('问题移除成功');

        // 检查审批单是否被自动关闭
        if (result.data.approvalClosed) {
          message.info('该审批单的所有问题已处理完毕，审批单已自动关闭');
        }

        // 立即从本地状态中移除该问题，提供即时UI反馈
        setProblems(prev => prev.filter(p => p.problemNumber !== problemNumber));

        // 同时重新从数据库获取最新数据以确保数据同步
        setTimeout(() => {
          fetchApprovalDetail(id!);
        }, 100); // 缩短延迟，确保数据库更新完成
      } else {
        message.error(result.message || '问题移除失败');
      }
    } catch (error) {
      console.error('移除问题失败:', error);
      message.error('网络错误，请重试');
    }
  };

  // 确认移除问题
  const confirmRemoveProblem = (problemNumber: string, problemDescription: string) => {
    Modal.confirm({
      title: '确认移除问题',
      content: `确定要将问题 ${problemNumber} 从此审批单中移除吗？\n\n${problemDescription}`,
      okText: '确认移除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => removeProblem(problemNumber),
    });
  };

  const problemColumns: ColumnsType<ProblemDocument> = [
    {
      title: '问题编号',
      dataIndex: 'problemNumber',
      key: 'problemNumber',
      width: 150,
      render: (text: string) => (
        <Button
          type="link"
          size="small"
          onClick={() => viewProblem(text)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '漏洞编号',
      dataIndex: 'vulnerabilityNum',
      key: 'vulnerabilityNum',
      width: 180,
    },
    {
      title: '扫描项',
      dataIndex: 'scanItem',
      key: 'scanItem',
      width: 120,
    },
    {
      title: '危害等级',
      dataIndex: 'vulnerabilityLevel',
      key: 'vulnerabilityLevel',
      width: 100,
      render: (level: number) => getRiskLevelTag(level),
    },
    {
      title: '简要描述',
      dataIndex: 'descriptionRief',
      key: 'descriptionRief',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (text: string, record: ProblemDocument) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => confirmRemoveProblem(record.problemNumber, record.descriptionRief)}
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

            {/* 相关问题部分（简化统计信息） */}
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChartOutlined />
                  <span>相关问题 ({problems.length})</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <Tag color="red">严重: {problems.filter(p => p.vulnerabilityLevel === 1).length}</Tag>
                    <Tag color="orange">高危: {problems.filter(p => p.vulnerabilityLevel === 2).length}</Tag>
                    <Tag color="gold">中危: {problems.filter(p => p.vulnerabilityLevel === 3).length}</Tag>
                    <Tag color="green">低危: {problems.filter(p => p.vulnerabilityLevel === 4).length}</Tag>
                  </div>
                </div>
              }
              key="2"
            >
              <div style={{ marginBottom: '16px' }}>
                {getStatisticsContent()}
              </div>
              <Table
                columns={problemColumns}
                dataSource={problems.slice(
                  (problemCurrent - 1) * problemPageSize,
                  problemCurrent * problemPageSize
                )}
                rowKey="problemNumber"
                pagination={{
                  current: problemCurrent,
                  pageSize: problemPageSize,
                  total: problems.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  onChange: (page, pageSize) => {
                    setProblemCurrent(page);
                    setProblemPageSize(pageSize || 10);
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
              items={approvalHistory.map((item) => ({
                dot: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                      {item.approvalNode}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                      审批人：{item.approvalPerson}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                      {item.approvalTime}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      marginBottom: '4px',
                      color: item.approvalResult === '通过' ? '#52c41a' :
                             item.approvalResult === '驳回' ? '#ff4d4f' : '#fa8c16'
                    }}>
                      审批结果：{item.approvalResult}
                    </div>
                    {item.approvalComments && (
                      <div style={{ color: '#666', marginTop: '4px', fontSize: '12px' }}>
                        审批意见：{item.approvalComments}
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