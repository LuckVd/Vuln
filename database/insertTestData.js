const { executeQuery } = require('../database/config/database');

async function insertTestData() {
  try {
    console.log('🚀 开始插入测试数据...');

    // 插入漏洞数据
    await executeQuery(`
      INSERT INTO vulnerabilities (id, name, source, risk_level, discovery_time, expected_block_time, status, description, severity, affected_component, recommendation, approval_id, created_by) VALUES
        ('VUL-2024-001', 'SQL注入漏洞', 'IAST', 'critical', '2024-01-15 10:30:00', '2024-01-20 00:00:00', 'approved', '在用户登录模块发现SQL注入漏洞，攻击者可以通过构造恶意SQL语句获取数据库敏感信息', '严重', 'user/login', '立即使用参数化查询替换字符串拼接，对所有用户输入进行严格验证', 'APP-2024-001', 'system'),
        ('VUL-2024-002', 'XSS跨站脚本攻击', 'DAST', 'high', '2024-01-16 14:20:00', '2024-01-22 00:00:00', 'approved', '在评论功能中发现存储型XSS漏洞，攻击者可以注入恶意脚本执行', '高危', 'product/comments', '对用户输入进行HTML编码，使用CSP头部保护', 'APP-2024-001', 'system'),
        ('VUL-2024-003', '敏感信息泄露', 'SCA', 'medium', '2024-01-17 09:15:00', '2024-01-25 00:00:00', 'approved', 'API接口返回包含用户密码哈希等敏感信息', '中危', 'api/user/profile', '移除敏感信息字段，仅返回必要的用户信息', 'APP-2024-002', 'system')
    `);

    // 插入未分配漏洞
    await executeQuery(`
      INSERT INTO vulnerabilities (id, name, source, risk_level, discovery_time, expected_block_time, status, description, severity, affected_component, recommendation, approval_id, created_by) VALUES
        ('VUL-2024-007', '新的SQL注入漏洞', 'IAST', 'critical', '2024-12-02 10:00:00', '2024-12-07 00:00:00', 'unassigned', '新发现的SQL注入漏洞', '严重', 'api/login', '立即修复SQL注入漏洞', NULL, 'system'),
        ('VUL-2024-008', '新的XSS漏洞', 'DAST', 'high', '2024-12-02 11:00:00', '2024-12-07 00:00:00', 'unassigned', '新发现的XSS漏洞', '高危', 'web/comments', '对用户输入进行编码', NULL, 'system')
    `);

    const [vulnCount] = await executeQuery('SELECT COUNT(*) as count FROM vulnerabilities');
    const [unassignedCount] = await executeQuery("SELECT COUNT(*) as count FROM vulnerabilities WHERE approval_id IS NULL");

    console.log('✅ 测试数据插入成功！');
    console.log(`   - 漏洞总数: ${vulnCount.count}`);
    console.log(`   - 未分配漏洞: ${unassignedCount.count}`);

  } catch (error) {
    console.error('❌ 插入失败:', error.message);
  }
}

insertTestData().then(() => {
  console.log('🎉 数据插入完成');
  process.exit(0);
}).catch(error => {
  console.error('💥 插入过程发生异常:', error);
  process.exit(1);
});