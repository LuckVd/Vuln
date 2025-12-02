const { spawn } = require('child_process');
const path = require('path');

// 运行数据库初始化
const initDB = async () => {
  console.log('🚀 开始初始化数据库...');

  return new Promise((resolve, reject) => {
    const initProcess = spawn('ts-node', [
      path.join(__dirname, '../database/initDatabase.ts')
    ], {
      stdio: 'inherit',
      shell: true
    });

    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 数据库初始化完成！');
        resolve();
      } else {
        console.error('❌ 数据库初始化失败，退出码:', code);
        reject(new Error(`Database initialization failed with code ${code}`));
      }
    });

    initProcess.on('error', (error) => {
      console.error('❌ 数据库初始化过程中发生错误:', error);
      reject(error);
    });
  });
};

// 如果直接运行此脚本
if (require.main === module) {
  initDB().catch(console.error);
}

module.exports = { initDB };