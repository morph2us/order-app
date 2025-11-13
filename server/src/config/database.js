import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Render.com의 Internal Database URL 지원
// DATABASE_URL이 있으면 사용, 없으면 개별 환경 변수 사용
let poolConfig;

if (process.env.DATABASE_URL) {
  // Render.com의 Internal Database URL 형식: postgresql://user:password@host:port/database
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // 개별 환경 변수 사용 (로컬 개발 환경)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// PostgreSQL 연결 풀 생성
const pool = new Pool(poolConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err);
});

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 테스트 성공:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 테스트 실패:', error);
    return false;
  }
};

export default pool;

