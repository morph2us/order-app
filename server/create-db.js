import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const dbName = process.env.DB_NAME || 'order_app';
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // 기본 데이터베이스에 연결
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

console.log(`데이터베이스 '${dbName}' 생성 시도...`);

// 데이터베이스 존재 여부 확인
adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName])
  .then(result => {
    if (result.rows.length > 0) {
      console.log(`✅ 데이터베이스 '${dbName}'가 이미 존재합니다.`);
      adminPool.end();
      process.exit(0);
    } else {
      // 데이터베이스 생성
      return adminPool.query(`CREATE DATABASE ${dbName}`);
    }
  })
  .then(result => {
    if (result) {
      console.log(`✅ 데이터베이스 '${dbName}' 생성 성공!`);
    }
    adminPool.end();
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 데이터베이스 생성 실패:');
    console.error('에러 메시지:', error.message);
    console.error('');
    console.error('해결 방법:');
    console.error('1. PostgreSQL이 실행 중인지 확인하세요.');
    console.error(`2. 수동으로 데이터베이스를 생성하세요: CREATE DATABASE ${dbName};`);
    adminPool.end();
    process.exit(1);
  });

