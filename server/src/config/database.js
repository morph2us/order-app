import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Render.com의 Internal Database URL 지원
// DATABASE_URL이 있으면 사용, 없으면 개별 환경 변수 사용
let poolConfig;

if (process.env.DATABASE_URL) {
  // Render.com의 Internal Database URL 형식: postgresql://user:password@host:port/database
  // Render.com의 데이터베이스는 항상 SSL이 필요함
  const isRenderDB = process.env.DATABASE_URL.includes('render.com') || 
                     process.env.DATABASE_URL.includes('dpg-');
  
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Render.com 데이터베이스는 항상 SSL 필요, 프로덕션 환경도 SSL 사용
    ssl: (isRenderDB || process.env.NODE_ENV === 'production') ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // 개별 환경 변수 사용 (로컬 개발 환경 또는 Render.com)
  // Render.com의 경우 SSL이 필요하므로, DB_HOST에 render.com이 포함되어 있으면 SSL 활성화
  const isRenderDB = process.env.DB_HOST && (
    process.env.DB_HOST.includes('render.com') || 
    process.env.DB_HOST.includes('dpg-')
  );
  
  // 프로덕션 환경이거나 Render.com 데이터베이스면 SSL 활성화
  const needsSSL = isRenderDB || process.env.NODE_ENV === 'production';
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: needsSSL ? { rejectUnauthorized: false } : false,
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

