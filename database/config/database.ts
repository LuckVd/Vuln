import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'qac',
  database: process.env.DB_NAME || 'qac_db',
  charset: 'utf8mb4',
  timezone: '+08:00',
  // 连接池配置
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 超时配置
  acquireTimeout: 60000,
  timeout: 60000,
  // SSL设置
  ssl: {
    rejectUnauthorized: false
  },
  // 证书验证
  allowPublicKeyRetrieval: true,
  // 支持多语句查询
  multipleStatements: true
};

// 创建数据库连接池
const pool = mysql.createPool(config);

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// 执行查询
export const executeQuery = async (query: string, params?: any[]): Promise<any> => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

// 执行事务
export const executeTransaction = async (queries: Array<{query: string, params?: any[]}>) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const { query, params } of queries) {
      await connection.execute(query, params);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('事务执行失败:', error);
    return { success: false, error };
  } finally {
    connection.release();
  }
};

export default pool;