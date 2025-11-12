import './ShoppingCart.css';

function ShoppingCart({ cartItems, onOrder, onRemoveFromCart }) {
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  };

  const getItemDisplayName = (item) => {
    if (item.selectedOptions.length === 0) {
      return item.menuName;
    }
    const optionsText = item.selectedOptions.map(opt => opt.name).join(', ');
    return `${item.menuName} (${optionsText})`;
  };

  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">장바구니가 비어있습니다.</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <button 
                  className="remove-button"
                  onClick={() => onRemoveFromCart(index)}
                  aria-label="삭제"
                >
                  ×
                </button>
                <span className="item-name">
                  {getItemDisplayName(item)} X {item.quantity}
                </span>
                <span className="item-price">
                  {(item.totalPrice * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))
          )}
        </div>
        <div className="cart-summary">
          <div className="total-amount">
            <span className="total-label">총 금액</span>
            <span className="total-value">{calculateTotal().toLocaleString()}원</span>
          </div>
          <button 
            className="order-button" 
            onClick={onOrder}
            disabled={cartItems.length === 0}
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;

