import { useState, useRef, useEffect } from 'react';
import Header from './Header';
import MenuCard from './MenuCard';
import ShoppingCart from './ShoppingCart';
import AdminDashboard from './AdminDashboard';
import InventoryStatus from './InventoryStatus';
import OrderStatus from './OrderStatus';
import Toast from './Toast';
import { menusAPI, ordersAPI } from './api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  
  // 메뉴 데이터 상태
  const [menuData, setMenuData] = useState([]);
  
  // 주문 목록 상태 (전역 관리)
  const [orders, setOrders] = useState([]);
  
  // 재고 상태 (모든 메뉴 관리)
  const [inventory, setInventory] = useState([]);
  
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  
  // 재고 부족 알림 중복 방지
  const stockAlertRef = useRef({});
  
  // Toast 메시지 상태
  const [toast, setToast] = useState(null);
  
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };
  
  const hideToast = () => {
    setToast(null);
  };

  // 메뉴 및 재고 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const menus = await menusAPI.getAll();
        
        // 메뉴 데이터 변환 (imageUrl -> image_url)
        const transformedMenus = menus.map(menu => ({
          id: menu.id,
          name: menu.name,
          price: menu.price,
          description: menu.description || '간단한 설명...',
          imageUrl: menu.image_url || '',
          options: menu.options || []
        }));
        
        setMenuData(transformedMenus);
        
        // 재고 데이터 변환
        const inventoryData = menus.map(menu => ({
          menuId: menu.id,
          menuName: menu.name,
          stock: menu.stock
        }));
        setInventory(inventoryData);
        
        setLoading(false);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        showToast('데이터를 불러오는데 실패했습니다.', 'error');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 주문 목록 로드 (관리자 화면)
  useEffect(() => {
    if (currentPage === 'admin') {
      const loadOrders = async () => {
        try {
          // ordersAPI.getAll()은 이미 orders 배열을 반환함
          const ordersData = await ordersAPI.getAll();
          
          // 데이터 형식 변환 (snake_case -> camelCase)
          const transformedOrders = ordersData.map(order => ({
            id: order.id,
            orderDate: order.order_date,
            totalAmount: order.total_amount,
            status: order.status,
            items: (order.items || []).map(item => ({
              menuId: item.menu_id,
              menuName: item.menu_name,
              quantity: item.quantity,
              price: item.price,
              options: (item.options || []).map(opt => ({
                option_id: opt.option_id,
                option_name: opt.option_name,
                option_price: opt.option_price,
                // 호환성을 위해 optionName도 추가
                optionName: opt.option_name
              }))
            }))
          }));
          
          setOrders(transformedOrders);
        } catch (error) {
          console.error('주문 목록 로드 실패:', error);
          showToast('주문 목록을 불러오는데 실패했습니다.', 'error');
        }
      };
      
      loadOrders();
    }
  }, [currentPage]);

  const handleAddToCart = (item) => {
    // 재고 확인
    const stockItem = inventory.find(inv => inv.menuId === item.menuId);
    if (!stockItem || stockItem.stock === 0) {
      showToast('재고가 없어 주문할 수 없습니다.', 'error');
      return;
    }

    // 현재 장바구니 상태를 기반으로 재고 확인 (함수형 업데이트 사용)
    let shouldShowAlert = false;
    
    setCartItems(prev => {
      // 장바구니에 이미 담긴 같은 메뉴의 총 수량 계산 (옵션과 관계없이)
      const totalQuantityInCart = prev
        .filter(cartItem => cartItem.menuId === item.menuId)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      // 추가하려는 수량(1)을 포함하여 재고를 초과하는지 확인
      if (totalQuantityInCart + 1 > stockItem.stock) {
        // 중복 알림 방지: 같은 메뉴에 대해 짧은 시간 내 중복 알림 방지
        const lastAlertTime = stockAlertRef.current[item.menuId] || 0;
        const now = Date.now();
        
        if (now - lastAlertTime > 500) { // 500ms 내 중복 알림 방지
          shouldShowAlert = true;
          stockAlertRef.current[item.menuId] = now;
        }
        
        return prev; // 상태 변경 없이 반환
      }

      // 같은 메뉴와 옵션 조합이 있는지 확인
      const existingIndex = prev.findIndex(cartItem => {
        // 메뉴 ID가 다르면 다른 아이템
        if (cartItem.menuId !== item.menuId) {
          return false;
        }
        
        // 옵션 배열이 둘 다 비어있으면 같은 아이템
        if (cartItem.selectedOptions.length === 0 && item.selectedOptions.length === 0) {
          return true;
        }
        
        // 옵션 배열 길이가 다르면 다른 아이템
        if (cartItem.selectedOptions.length !== item.selectedOptions.length) {
          return false;
        }
        
        // 옵션 ID 배열을 정렬하여 비교
        const cartOptionIds = cartItem.selectedOptions.map(o => o.id).sort((a, b) => a - b);
        const itemOptionIds = item.selectedOptions.map(o => o.id).sort((a, b) => a - b);
        
        // 모든 옵션 ID가 일치하는지 확인
        return cartOptionIds.length === itemOptionIds.length &&
               cartOptionIds.every((id, index) => id === itemOptionIds[index]);
      });

      if (existingIndex !== -1) {
        // 기존 아이템의 수량을 1만 증가
        const updated = prev.map((cartItem, index) => {
          if (index === existingIndex) {
            return {
              ...cartItem,
              quantity: cartItem.quantity + 1
            };
          }
          return cartItem;
        });
        return updated;
      } else {
        // 새 아이템 추가 (quantity는 항상 1로 시작)
        return [...prev, { ...item, quantity: 1 }];
      }
    });

    // 재고 부족 알림 (상태 업데이트 후 외부에서 호출)
    if (shouldShowAlert) {
      showToast(`재고가 부족합니다. (현재 재고: ${stockItem.stock}개)`, 'warning');
    }
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    
    try {
      // API 요청 형식으로 변환
      const orderItems = cartItems.map(item => ({
        menu_id: item.menuId,
        quantity: item.quantity,
        selected_options: item.selectedOptions.map(opt => opt.id)
      }));
      
      // API 호출
      const order = await ordersAPI.create(orderItems);
      
      // 주문 목록에 추가 (API 응답 형식 변환)
      const transformedOrder = {
        id: order.id,
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        status: order.status,
        items: order.items.map(item => ({
          menuId: item.menu_id,
          menuName: item.menu_name,
          quantity: item.quantity,
          price: item.price,
          options: (item.options || []).map(opt => ({
            option_id: opt.option_id,
            option_name: opt.option_name,
            option_price: opt.option_price,
            // 호환성을 위해 optionName도 추가
            optionName: opt.option_name
          }))
        }))
      };
      
      setOrders(prev => [transformedOrder, ...prev]);
      
      // 재고 정보 갱신
      const menus = await menusAPI.getAll();
      const inventoryData = menus.map(menu => ({
        menuId: menu.id,
        menuName: menu.name,
        stock: menu.stock
      }));
      setInventory(inventoryData);
      
      // 주문 완료 알림
      showToast('주문이 완료되었습니다!', 'success');
      
      // 장바구니 초기화
      setCartItems([]);
    } catch (error) {
      console.error('주문 실패:', error);
      showToast(error.message || '주문 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleUpdateStock = async (menuId, change) => {
    try {
      await menusAPI.updateStock(menuId, change);
      
      // 재고 정보 갱신
      const menus = await menusAPI.getAll();
      const inventoryData = menus.map(menu => ({
        menuId: menu.id,
        menuName: menu.name,
        stock: menu.stock
      }));
      setInventory(inventoryData);
    } catch (error) {
      console.error('재고 업데이트 실패:', error);
      showToast(error.message || '재고 업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      
      // 주문 목록 갱신
      const ordersData = await ordersAPI.getAll();
      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        status: order.status,
        items: order.items.map(item => ({
          menuId: item.menu_id,
          menuName: item.menu_name,
          quantity: item.quantity,
          price: item.price,
          options: (item.options || []).map(opt => ({
            option_id: opt.option_id,
            option_name: opt.option_name,
            option_price: opt.option_price,
            // 호환성을 위해 optionName도 추가
            optionName: opt.option_name
          }))
        }))
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error);
      showToast(error.message || '주문 상태 업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'order' && (
        <main className="main-content">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
          ) : (
            <>
              <div className="menu-section">
                <div className="menu-grid">
                  {menuData.map(menu => (
                    <MenuCard 
                      key={menu.id} 
                      menu={menu} 
                      onAddToCart={handleAddToCart}
                      inventory={inventory}
                    />
                  ))}
                </div>
              </div>
              <ShoppingCart 
                cartItems={cartItems} 
                onOrder={handleOrder}
                onRemoveFromCart={handleRemoveFromCart}
              />
            </>
          )}
        </main>
      )}
      {currentPage === 'admin' && (
        <main className="main-content">
          <AdminDashboard orders={orders} />
          <InventoryStatus 
            inventory={inventory}
            onUpdateStock={handleUpdateStock}
          />
          <OrderStatus 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </main>
      )}
    </div>
  );
}

export default App;
