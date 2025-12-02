const { testConnection, executeQuery } = require('./config/database');

// 简化的数据库初始化（无需复杂的依赖管理）
const initSimpleDatabase = async () => {
  console.log('🚀 开始简化数据库初始化...');

  try {
    // 1. 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('⚠️  数据库连接失败，将使用Mock数据');
      console.log('💡 请确保：');
      console.log('   - MySQL服务正在运行');
      console.log('   - 数据库配置正确：localhost:3306, root/qac');
      console.log('   - 数据库已创建：vulnerability_management');
      return false;
    }

    // 2. 读取并执行初始化SQL
    const fs = require('fs');
    const path = require('path');

    const sqlPath = path.join(__dirname, 'migrations', 'init.sql');
    console.log('📂 SQL文件路径:', sqlPath);

    if (!fs.existsSync(sqlPath)) {
      console.error('❌ SQL文件不存在:', sqlPath);
      return false;
    }

    const initSql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📝 SQL文件内容长度:', initSql.length, '字符');

    // 分割SQL语句 - 使用更简单的方法
    const allStatements = initSql.split(';');
    console.log(`🔍 分割结果：总共 ${allStatements.length} 个片段`);

    // 显示前几个片段用于调试
    allStatements.slice(0, 5).forEach((stmt: string, i: number) => {
      console.log(`片段 ${i + 1}: "${stmt.substring(0, 60)}..."`);
    });

    const statements = allStatements
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => {
        return stmt.length > 0 &&
               (stmt.toLowerCase().includes('create table') ||
                stmt.toLowerCase().includes('insert into') ||
                stmt.toLowerCase().includes('create index') ||
                stmt.toLowerCase().includes('alter table'));
      });

    console.log(`📝 过滤后执行 ${statements.length} 条SQL语句...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await executeQuery(statement);
          console.log(`✅ 执行成功 (${i + 1}/${statements.length}):`, statement.substring(0, 80) + '...');
        } catch (error: any) {
          if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
            console.log(`⚠️  跳过 (${i + 1}/${statements.length}): 表已存在或数据重复`);
          } else {
            console.error(`❌ SQL执行错误 (${i + 1}/${statements.length}):`, error.message);
            console.error('   语句预览:', statement.substring(0, 120) + '...');
          }
        }
      }
    }

    // 3. 验证数据
    const [vulnCount] = await executeQuery('SELECT COUNT(*) as count FROM vulnerabilities');
    const [approvalCount] = await executeQuery('SELECT COUNT(*) as count FROM approvals');
    const [historyCount] = await executeQuery('SELECT COUNT(*) as count FROM approval_history');

    console.log('\n📊 数据库验证结果：');
    console.log(`   - 漏洞数量: ${vulnCount.count}`);
    console.log(`   - 审批单数量: ${approvalCount.count}`);
    console.log(`   - 历史记录数量: ${historyCount.count}`);

    if (vulnCount.count > 0 && approvalCount.count > 0 && historyCount.count > 0) {
      console.log('\n🎉 数据库初始化成功！');
      console.log('✅ 现在可以启动应用并使用真实数据库了');
      return true;
    } else {
      console.log('\n⚠️  数据库为空，初始化可能未成功');
      return false;
    }

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    console.log('\n📋 故障排除建议：');
    console.log('   1. 检查MySQL服务是否运行');
    console.log('   2. 验证用户名密码：root/qac');
    console.log('   3. 确认数据库权限');
    return false;
  }
};

module.exports = { initSimpleDatabase };

// 如果直接运行此脚本
if (require.main === module) {
  initSimpleDatabase()
    .then(success => {
      if (success) {
        console.log('\n🚀 准备启动应用...');
        process.exit(0);
      } else {
        console.log('\n❌ 初始化失败，请检查错误信息');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('初始化过程发生异常:', error);
      process.exit(1);
    });
}