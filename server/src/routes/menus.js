import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/menus - 메뉴 목록 조회
router.get('/', async (req, res, next) => {
  try {
    // 메뉴 조회
    const menusResult = await pool.query(`
      SELECT id, name, description, price, image_url, stock, created_at, updated_at
      FROM menus
      ORDER BY id
    `);
    
    // 각 메뉴의 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsResult = await pool.query(
          'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
          [menu.id]
        );
        return {
          ...menu,
          options: optionsResult.rows
        };
      })
    );
    
    res.json({ menus });
  } catch (error) {
    next(error);
  }
});

// GET /api/menus/:id - 특정 메뉴 조회
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const menuResult = await pool.query(
      'SELECT id, name, description, price, image_url, stock, created_at, updated_at FROM menus WHERE id = $1',
      [id]
    );
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'MENU_NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    const menu = menuResult.rows[0];
    
    // 옵션 조회
    const optionsResult = await pool.query(
      'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...menu,
      options: optionsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/menus/:id/stock - 재고 수정
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { change } = req.body;
    
    if (typeof change !== 'number') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'change는 숫자여야 합니다.'
        }
      });
    }
    
    // 현재 재고 조회
    const menuResult = await pool.query(
      'SELECT id, name, stock FROM menus WHERE id = $1',
      [id]
    );
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'MENU_NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStock = menuResult.rows[0].stock;
    const newStock = currentStock + change;
    
    if (newStock < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: '재고는 0 미만이 될 수 없습니다.'
        }
      });
    }
    
    // 재고 업데이트
    const updateResult = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock, updated_at',
      [newStock, id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;

