import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert, Divider } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { Vulnerability } from '@/types';

const VulnerabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vulnerability, setVulnerability] = useState<Vulnerability | null>(null);
  const [loading, setLoading] = useState(true);

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
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => viewApproval(vulnerability.approvalId!)}
          >
            查看审批单
          </Button>
        )}
      </Space>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="漏洞编号">{vulnerability.id}</Descriptions.Item>
          <Descriptions.Item label="漏洞名称">{vulnerability.name}</Descriptions.Item>
          <Descriptions.Item label="漏洞来源">{vulnerability.source}</Descriptions.Item>
          <Descriptions.Item label="危害等级">{getRiskLevelTag(vulnerability.riskLevel)}</Descriptions.Item>
          <Descriptions.Item label="发现时间">{vulnerability.discoveryTime}</Descriptions.Item>
          <Descriptions.Item label="预期拦截时间">{vulnerability.expectedBlockTime}</Descriptions.Item>
          <Descriptions.Item label="当前状态">{getStatusTag(vulnerability.status)}</Descriptions.Item>
          <Descriptions.Item label="严重程度">{vulnerability.severity || '未定义'}</Descriptions.Item>
          <Descriptions.Item label="影响组件" span={2}>{vulnerability.affectedComponent || '未定义'}</Descriptions.Item>
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
        <p style={{ lineHeight: 1.8, fontSize: 14 }}>
          {vulnerability.description || '暂无详细描述'}
        </p>
      </Card>

      {/* 修复建议 */}
      {vulnerability.recommendation && (
        <Card title="修复建议" style={{ marginBottom: 16 }}>
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
        </Card>
      )}

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
    </div>
  );
};

export default VulnerabilityDetail;