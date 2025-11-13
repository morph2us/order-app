import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스키마 파일 읽기 및 실행
const initDatabase = async () => {
  try {
    console.log('데이터베이스 스키마 초기화 시작...');
    
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    await pool.query(schemaSQL);
    console.log('✅ 데이터베이스 스키마 생성 완료');
    
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 스키마 생성 실패:', error);
    throw error;
  }
};

// 초기 데이터 삽입
const insertInitialData = async () => {
  try {
    console.log('초기 데이터 삽입 시작...');
    
    // 메뉴 데이터 삽입
    const menusResult = await pool.query(`
      INSERT INTO menus (name, description, price, image_url, stock)
      VALUES
        ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop', 10),
        ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', 10),
        ('카페라떼', '부드러운 카페라떼', 5000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', 10),
        ('카푸치노', '거품이 풍부한 카푸치노', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', 10),
        ('에스프레소', '진한 에스프레소', 3500, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop', 10)
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);
    
    console.log('✅ 메뉴 데이터 삽입 완료');
    
    // 메뉴 ID 조회
    const menuIds = {};
    const menuRows = await pool.query('SELECT id, name FROM menus');
    menuRows.rows.forEach(row => {
      menuIds[row.name] = row.id;
    });
    
    // 옵션 데이터 삽입 (모든 메뉴에 동일한 옵션)
    for (const [menuName, menuId] of Object.entries(menuIds)) {
      await pool.query(`
        INSERT INTO options (name, price, menu_id)
        VALUES
          ('샷 추가', 500, $1),
          ('시럽 추가', 0, $1)
        ON CONFLICT DO NOTHING;
      `, [menuId]);
    }
    
    console.log('✅ 옵션 데이터 삽입 완료');
    console.log('✅ 초기 데이터 삽입 완료');
    
    return true;
  } catch (error) {
    console.error('❌ 초기 데이터 삽입 실패:', error);
    throw error;
  }
};

// 전체 초기화 실행
const initialize = async () => {
  try {
    await initDatabase();
    await insertInitialData();
    console.log('✅ 데이터베이스 초기화 완료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    process.exit(1);
  }
};

initialize();

