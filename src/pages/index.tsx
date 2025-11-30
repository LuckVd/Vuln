import React from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { Link } from 'umi';
import {
  SecurityScanOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const HomePage: React.FC = () => {
  // 模拟统计数据
  const stats = {
    totalVulns: 156,
    criticalVulns: 8,
    processingVulns: 23,
    completedApprovals: 89,
    pendingApprovals: 12,
  };

  const quickLinks = [
    {
      title: '漏洞管理',
      description: '查看和管理所有安全漏洞',
      icon: <SecurityScanOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      link: '/vuln',
      color: '#1890ff'
    },
    {
      title: '审批管理',
      description: '管理漏洞修复审批流程',
      icon: <AuditOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      link: '/approval',
      color: '#52c41a'
    }
  ];

  return (
    <div className="home-page">
      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="总漏洞数"
              value={stats.totalVulns}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="严重漏洞"
              value={stats.criticalVulns}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="处理中"
              value={stats.processingVulns}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="已完成审批"
              value={stats.completedApprovals}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速导航 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="快速导航" style={{ height: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {quickLinks.map((item, index) => (
                <Card
                  key={index}
                  size="small"
                  hoverable
                  style={{ borderColor: item.color }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ marginRight: '12px' }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <Link to={item.link}>
                      <Button type="text" icon={<ArrowRightOutlined />} />
                    </Link>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="系统说明" style={{ height: '100%' }}>
            <div>
              <h4>欢迎使用漏洞管理系统</h4>
              <p style={{ lineHeight: 1.8, color: '#666' }}>
                本系统提供完整的漏洞生命周期管理功能，包括漏洞发现、评估、审批、修复和验证等环节。
              </p>

              <h4>主要功能</h4>
              <ul style={{ lineHeight: 1.8, color: '#666', paddingLeft: '20px' }}>
                <li>漏洞信息管理和查询</li>
                <li>漏洞详情查看和跟踪</li>
                <li>审批流程管理</li>
                <li>多维度统计分析</li>
                <li>权限控制和操作日志</li>
              </ul>

              <h4>使用说明</h4>
              <p style={{ lineHeight: 1.8, color: '#666' }}>
                通过左侧导航菜单可以快速访问各个功能模块。点击漏洞编号可以查看详细信息，
                点击状态可以查看相关的审批单信息。
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;