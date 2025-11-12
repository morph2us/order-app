import { useState } from 'react';
import Header from './Header';
import MenuCard from './MenuCard';
import ShoppingCart from './ShoppingCart';
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

  const handleAddToCart = (item) => {
    setCartItems(prev => {
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
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // 주문 데이터 생성
    const orderData = {
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
      orderDate: new Date().toISOString()
    };

    // TODO: 서버로 주문 데이터 전송
    console.log('주문 데이터:', orderData);
    
    // 주문 완료 알림
    alert('주문이 완료되었습니다!');
    
    // 장바구니 초기화
    setCartItems([]);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // TODO: 관리자 화면 구현 시 라우팅 처리
    if (page === 'admin') {
      alert('관리자 화면은 아직 구현되지 않았습니다.');
    }
  };

  return (
    <div className="app">
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
    </div>
  );
}

export default App;
