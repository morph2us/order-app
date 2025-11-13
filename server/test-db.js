import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

console.log('데이터베이스 연결 테스트 시작...');
console.log('연결 정보:');
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Port: ${process.env.DB_PORT || 5432}`);
console.log(`  Database: ${process.env.DB_NAME || 'order_app'}`);
console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
console.log('');

pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ 데이터베이스 연결 성공!');
    console.log('현재 시간:', result.rows[0].now);
    pool.end();
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 데이터베이스 연결 실패:');
    console.error('에러 메시지:', error.message);
    console.error('');
    console.error('해결 방법:');
    console.error('1. PostgreSQL이 실행 중인지 확인하세요.');
    console.error('2. 데이터베이스가 생성되어 있는지 확인하세요.');
    console.error(`3. .env 파일의 DB_NAME, DB_USER, DB_PASSWORD가 올바른지 확인하세요.`);
    pool.end();
    process.exit(1);
  });

