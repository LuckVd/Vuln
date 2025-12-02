import { testConnection, executeQuery } from './config/database';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 自动检测并安装mysql2
const checkDependencies = async () => {
  try {
    await import('mysql2/promise');
    console.log('✅ mysql2 已安装');
  } catch (error) {
    console.log('📦 正在安装 mysql2...');
    try {
      await execAsync('npm install mysql2');
      console.log('✅ mysql2 安装成功');
    } catch (installError) {
      console.error('❌ mysql2 安装失败:', installError);
      throw installError;
    }
  }
};

// 创建数据库和表
const createDatabaseAndTables = async () => {
  try {
    // 读取初始化SQL文件
    const sqlPath = path.join(__dirname, 'migrations', 'init.sql');
    const initSql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🏗 正在创建数据库和表...');

    // 执行初始化SQL（每个语句单独执行）
    const statements = initSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await executeQuery(statement);
          console.log('✅ 执行成功:', statement.substring(0, 50) + '...');
        } catch (error) {
          // 忽略表已存在的错误
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
            console.warn('⚠️ SQL 执行警告:', error.message);
          }
        }
      }
    }

    console.log('✅ 数据库和表创建完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

// 验证数据库连接
const verifyDatabase = async () => {
  console.log('🔍 正在验证数据库连接...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('❌ 数据库连接失败，请检查配置');
    process.exit(1);
  }

  console.log('✅ 数据库连接验证成功');
};

// 检查初始数据
const checkInitialData = async () => {
  try {
    console.log('📊 正在检查初始数据...');

    // 检查漏洞数据
    const [vulnCount] = await executeQuery('SELECT COUNT(*) as count FROM vulnerabilities');
    console.log(`📝 漏洞数量: ${vulnCount.count}`);

    // 检查审批单数据
    const [approvalCount] = await executeQuery('SELECT COUNT(*) as count FROM approvals');
    console.log(`📋 审批单数量: ${approvalCount.count}`);

    // 检查审批历史数据
    const [historyCount] = await executeQuery('SELECT COUNT(*) as count FROM approval_history');
    console.log(`📚 历史记录数量: ${historyCount.count}`);

    if (vulnCount.count === 0 || approvalCount.count === 0) {
      console.log('⚠️ 数据库为空，初始数据可能未正确插入');
    } else {
      console.log('✅ 初始数据检查完成');
    }
  } catch (error) {
    console.error('❌ 检查初始数据失败:', error);
  }
};

// 主初始化函数
export const initializeDatabase = async () => {
  console.log('🚀 开始初始化数据库...');

  try {
    // 1. 检查依赖
    await checkDependencies();

    // 2. 验证数据库连接
    await verifyDatabase();

    // 3. 创建数据库和表
    await createDatabaseAndTables();

    // 4. 检查初始数据
    await checkInitialData();

    console.log('🎉 数据库初始化完成！');
    console.log('\n📋 数据库配置信息:');
    console.log('   - 主机: localhost');
    console.log('   - 端口: 3306');
    console.log('   - 用户: root');
    console.log('   - 数据库: vulnerability_management');
    console.log('\n💡 现在可以启动应用并使用真实数据库了！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase();
}