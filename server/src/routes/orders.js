import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/orders - 주문 생성
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { items } = req.body;
    
    // 요청 데이터 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: '주문 아이템이 필요합니다.'
        }
      });
    }
    
    // 재고 확인 및 총 금액 계산
    let totalAmount = 0;
    const orderItemsData = [];
    
    for (const item of items) {
      const { menu_id, quantity, selected_options } = item;
      
      if (!menu_id || !quantity || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '잘못된 주문 아이템입니다.'
          }
        });
      }
      
      // 메뉴 정보 조회
      const menuResult = await client.query(
        'SELECT id, name, price, stock FROM menus WHERE id = $1',
        [menu_id]
      );
      
      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: {
            code: 'MENU_NOT_FOUND',
            message: `메뉴 ID ${menu_id}를 찾을 수 없습니다.`
          }
        });
      }
      
      const menu = menuResult.rows[0];
      
      // 재고 확인
      if (menu.stock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `${menu.name}의 재고가 부족합니다. (재고: ${menu.stock}개, 주문: ${quantity}개)`
          }
        });
      }
      
      // 옵션 정보 조회 및 가격 계산
      let itemPrice = menu.price;
      const optionsData = [];
      
      if (selected_options && selected_options.length > 0) {
        const optionsResult = await client.query(
          'SELECT id, name, price FROM options WHERE id = ANY($1) AND menu_id = $2',
          [selected_options, menu_id]
        );
        
        optionsData.push(...optionsResult.rows);
        itemPrice += optionsResult.rows.reduce((sum, opt) => sum + opt.price, 0);
      }
      
      const itemTotalPrice = itemPrice * quantity;
      totalAmount += itemTotalPrice;
      
      orderItemsData.push({
        menu_id,
        menu_name: menu.name,
        quantity,
        price: itemPrice,
        options: optionsData
      });
    }
    
    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_date, total_amount, status)
       VALUES (CURRENT_TIMESTAMP, $1, 'received')
       RETURNING id, order_date, total_amount, status`,
      [totalAmount]
    );
    
    const order = orderResult.rows[0];
    
    // 주문 아이템 저장 및 재고 차감
    const savedOrderItems = [];
    
    for (const itemData of orderItemsData) {
      // 주문 아이템 저장
      const orderItemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, menu_id, menu_name, quantity, price`,
        [order.id, itemData.menu_id, itemData.menu_name, itemData.quantity, itemData.price]
      );
      
      const orderItem = orderItemResult.rows[0];
      
      // 옵션 저장
      const savedOptions = [];
      for (const option of itemData.options) {
        const optionResult = await client.query(
          `INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
           VALUES ($1, $2, $3, $4)
           RETURNING option_id, option_name, option_price`,
          [orderItem.id, option.id, option.name, option.price]
        );
        savedOptions.push(optionResult.rows[0]);
      }
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [itemData.quantity, itemData.menu_id]
      );
      
      savedOrderItems.push({
        ...orderItem,
        options: savedOptions
      });
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      id: order.id,
      order_date: order.order_date,
      total_amount: order.total_amount,
      status: order.status,
      items: savedOrderItems
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT id, order_date, total_amount, status, created_at, updated_at
      FROM orders
    `;
    const params = [];
    
    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY order_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const ordersResult = await pool.query(query, params);
    
    // 각 주문의 아이템 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT id, menu_id, menu_name, quantity, price
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );
        
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            const optionsResult = await pool.query(
              `SELECT option_id, option_name, option_price
               FROM order_item_options
               WHERE order_item_id = $1`,
              [item.id]
            );
            
            return {
              menu_id: item.menu_id,
              menu_name: item.menu_name,
              quantity: item.quantity,
              price: item.price,
              options: optionsResult.rows.map(opt => ({
                option_id: opt.option_id,
                option_name: opt.option_name,
                option_price: opt.option_price
              }))
            };
          })
        );
        
        return {
          ...order,
          items
        };
      })
    );
    
    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) FROM orders';
    if (status) {
      countQuery += ' WHERE status = $1';
    }
    const countResult = await pool.query(countQuery, status ? [status] : []);
    
    res.json({
      orders,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - 특정 주문 조회
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(
      'SELECT id, order_date, total_amount, status, created_at, updated_at FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const order = orderResult.rows[0];
    
    // 주문 아이템 조회
    const itemsResult = await pool.query(
      `SELECT id, menu_id, menu_name, quantity, price
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );
    
    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsResult = await pool.query(
          `SELECT option_id, option_name, option_price
           FROM order_item_options
           WHERE order_item_id = $1`,
          [item.id]
        );
        
        return {
          menu_id: item.menu_id,
          menu_name: item.menu_name,
          quantity: item.quantity,
          price: item.price,
          options: optionsResult.rows.map(opt => ({
            option_id: opt.option_id,
            option_name: opt.option_name,
            option_price: opt.option_price
          }))
        };
      })
    );
    
    res.json({
      ...order,
      items
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - 주문 상태 변경
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['received', 'manufacturing', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: `유효하지 않은 상태입니다. 가능한 값: ${validStatuses.join(', ')}`
        }
      });
    }
    
    // 현재 주문 상태 조회
    const orderResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStatus = orderResult.rows[0].status;
    
    // 상태 변경 규칙 검증
    const validTransitions = {
      'received': ['manufacturing'],
      'manufacturing': ['completed']
    };
    
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `'${currentStatus}' 상태에서 '${status}' 상태로 변경할 수 없습니다.`
        }
      });
    }
    
    // 상태 업데이트
    const updateResult = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;

