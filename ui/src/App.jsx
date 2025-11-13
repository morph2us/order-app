import { useState, useRef } from 'react';
import Header from './Header';
import MenuCard from './MenuCard';
import ShoppingCart from './ShoppingCart';
import AdminDashboard from './AdminDashboard';
import InventoryStatus from './InventoryStatus';
import OrderStatus from './OrderStatus';
import Toast from './Toast';
import './App.css';

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '간단한 설명...',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '간단한 설명...',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '간단한 설명...',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '간단한 설명...',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '에스프레소',
    price: 3500,
    description: '간단한 설명...',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  
  // 주문 목록 상태 (전역 관리)
  const [orders, setOrders] = useState([]);
  
  // 재고 상태 (모든 메뉴 관리)
  const [inventory, setInventory] = useState([
    { menuId: 1, menuName: '아메리카노(ICE)', stock: 10 },
    { menuId: 2, menuName: '아메리카노(HOT)', stock: 10 },
    { menuId: 3, menuName: '카페라떼', stock: 10 },
    { menuId: 4, menuName: '카푸치노', stock: 10 },
    { menuId: 5, menuName: '에스프레소', stock: 10 }
  ]);
  
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

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // 주문 전 재고 재확인
    const stockIssues = [];
    cartItems.forEach(cartItem => {
      const stockItem = inventory.find(inv => inv.menuId === cartItem.menuId);
      if (!stockItem) {
        stockIssues.push(`${cartItem.menuName}: 재고 정보를 찾을 수 없습니다.`);
        return;
      }
      
      // 장바구니에 담긴 같은 메뉴의 총 수량 계산
      const totalQuantityInCart = cartItems
        .filter(item => item.menuId === cartItem.menuId)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (totalQuantityInCart > stockItem.stock) {
        stockIssues.push(`${cartItem.menuName}: 재고 부족 (주문: ${totalQuantityInCart}개, 재고: ${stockItem.stock}개)`);
      }
    });
    
    // 재고 문제가 있으면 주문 중단
    if (stockIssues.length > 0) {
      showToast(`주문할 수 없습니다:\n${stockIssues.join('\n')}`, 'error');
      return;
    }
    
    // 고유한 주문 ID 생성 (Date.now() + 랜덤 문자열)
    const generateOrderId = () => {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    };
    
    // 주문 데이터 생성
    const orderData = {
      id: generateOrderId(),
      items: cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        options: item.selectedOptions.map(opt => ({
          optionId: opt.id,
          optionName: opt.name
        })),
        quantity: item.quantity,
        price: item.totalPrice
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
      orderDate: new Date().toISOString(),
      status: 'received' // 주문 접수 상태로 시작
    };

    // 주문 목록에 추가
    setOrders(prev => [orderData, ...prev]);
    
    // 주문한 아이템들의 재고 차감
    setInventory(prev => {
      return prev.map(invItem => {
        // 장바구니에서 해당 메뉴의 총 주문 수량 계산 (옵션과 관계없이)
        const totalOrderedQuantity = cartItems
          .filter(cartItem => cartItem.menuId === invItem.menuId)
          .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        
        if (totalOrderedQuantity > 0) {
          const newStock = Math.max(0, invItem.stock - totalOrderedQuantity);
          return { ...invItem, stock: newStock };
        }
        return invItem;
      });
    });
    
    // 주문 완료 알림
    showToast('주문이 완료되었습니다!', 'success');
    
    // 장바구니 초기화
    setCartItems([]);
  };

  const handleUpdateStock = (menuId, change) => {
    setInventory(prev => 
      prev.map(item => {
        if (item.menuId === menuId) {
          const newStock = Math.max(0, item.stock + change);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
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
