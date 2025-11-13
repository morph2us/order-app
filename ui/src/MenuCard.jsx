import { useState, useRef } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart, inventory }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const isAddingRef = useRef(false);
  
  // 해당 메뉴의 재고 확인
  const stockItem = inventory?.find(item => item.menuId === menu.id);
  const isOutOfStock = stockItem ? stockItem.stock === 0 : false;

  const handleOptionChange = (option) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.id === option.id);
      if (exists) {
        return prev.filter(opt => opt.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const calculatePrice = () => {
    const basePrice = menu.price;
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    return basePrice + optionsPrice;
  };

  const handleAddToCart = () => {
    // 중복 클릭 방지
    if (isAddingRef.current) {
      return;
    }
    
    isAddingRef.current = true;
    
    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      basePrice: menu.price,
      selectedOptions: selectedOptions,
      quantity: 1,
      totalPrice: calculatePrice()
    });
    
    // 짧은 시간 후 다시 클릭 가능하도록
    setTimeout(() => {
      isAddingRef.current = false;
    }, 300);
  };

  const getOptionText = (option) => {
    if (option.price === 0) {
      return `${option.name} (+0원)`;
    }
    return `${option.name} (+${option.price.toLocaleString()}원)`;
  };

  return (
    <div className="menu-card">
      <div className="menu-image">
        {menu.imageUrl ? (
          <img 
            src={menu.imageUrl} 
            alt={menu.name}
            className="coffee-photo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="image-placeholder" style={{ display: menu.imageUrl ? 'none' : 'flex' }}>
          이미지
        </div>
      </div>
      <div className="menu-info">
        <div className="menu-name-wrapper">
          <h3 className="menu-name">{menu.name}</h3>
          {isOutOfStock && <span className="out-of-stock-badge">품절</span>}
        </div>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-label">
              <input
                type="checkbox"
                checked={selectedOptions.some(opt => opt.id === option.id)}
                onChange={() => handleOptionChange(option)}
              />
              <span>{getOptionText(option)}</span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          담기
        </button>
      </div>
    </div>
  );
}

export default MenuCard;

