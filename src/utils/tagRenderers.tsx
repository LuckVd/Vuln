import React from 'react';
import { Tag } from 'antd';
import { ENUMS } from '@/types';

// 风险等级标签渲染器
export const renderVulnerabilityLevelTag = (level: number) => {
  const levelConfig = {
    1: { color: 'red', text: ENUMS.VULNERABILITY_LEVEL[level] }, // 严重
    2: { color: 'orange', text: ENUMS.VULNERABILITY_LEVEL[level] }, // 高危
    3: { color: 'gold', text: ENUMS.VULNERABILITY_LEVEL[level] }, // 中危
    4: { color: 'green', text: ENUMS.VULNERABILITY_LEVEL[level] }, // 低危
  };

  const config = levelConfig[level] || { color: 'default', text: '未知' };
  return <Tag color={config.color}>{config.text}</Tag>;
};

// 状态标签渲染器
export const renderStatusTag = (status: number) => {
  const statusConfig = {
    1: { color: 'blue', text: ENUMS.STATUS[status] }, // 已创建
    2: { color: 'orange', text: ENUMS.STATUS[status] }, // 处置中
    3: { color: 'purple', text: ENUMS.STATUS[status] }, // 审批中
    4: { color: 'green', text: ENUMS.STATUS[status] }, // 关闭
  };

  const config = statusConfig[status] || { color: 'default', text: '未知' };
  return <Tag color={config.color}>{config.text}</Tag>;
};

// 结论标签渲染器
export const renderConclusionTag = (conclusion?: number) => {
  if (!conclusion) return null;

  const conclusionConfig = {
    1: { color: 'green', text: ENUMS.CONCLUSION[conclusion] }, // 误报
    2: { color: 'blue', text: ENUMS.CONCLUSION[conclusion] }, // 不受影响
    3: { color: 'cyan', text: ENUMS.CONCLUSION[conclusion] }, // 版本升级修复
    4: { color: 'purple', text: ENUMS.CONCLUSION[conclusion] }, // 补丁修复
    5: { color: 'orange', text: ENUMS.CONCLUSION[conclusion] }, // 有修复方案接受风险
    6: { color: 'volcano', text: ENUMS.CONCLUSION[conclusion] }, // 无修复方案接受风险
  };

  const config = conclusionConfig[conclusion] || { color: 'default', text: '未知' };
  return <Tag color={config.color}>{config.text}</Tag>;
};