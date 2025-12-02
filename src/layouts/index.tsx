import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'umi';
import {
  SecurityScanOutlined,
  AuditOutlined,
  DashboardOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './index.less';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/vuln',
      icon: <SecurityScanOutlined />,
      label: <Link to="/vuln">漏洞管理</Link>,
    },
    {
      key: '/approval',
      icon: <AuditOutlined />,
      label: <Link to="/approval">审批管理</Link>,
    },
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">首页</Link>,
    },
  ];

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/vuln')) {
      return '/vuln';
    }
    if (location.pathname.startsWith('/approval')) {
      return '/approval';
    }
    return '/';
  };

  return (
    <Layout className="basic-layout">
      <Sider
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo">
          <SecurityScanOutlined style={{ fontSize: 24, marginRight: 8 }} /> 漏洞管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            borderRight: 'none',
            backgroundColor: '#001529'
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header className="header">
          <h1>漏洞管理系统</h1>
        </Header>
        <Content className="content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;