import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testConnection } from './config/database.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  });
});

// API 라우트 (추후 추가 예정)
// app.use('/api/menus', menusRoutes);
// app.use('/api/orders', ordersRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.'
    }
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('에러 발생:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || '서버 내부 오류가 발생했습니다.'
    }
  });
});

// 서버 시작
const startServer = async () => {
  // 데이터베이스 연결 테스트
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('데이터베이스 연결에 실패했습니다. 서버를 시작할 수 없습니다.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}`);
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n서버를 종료합니다...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n서버를 종료합니다...');
  await pool.end();
  process.exit(0);
});

startServer();

