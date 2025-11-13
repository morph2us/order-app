import './OrderStatus.css';

function OrderStatus({ orders, onUpdateOrderStatus }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '';
    }
  };

  const getItemDisplayName = (item) => {
    if (item.options && item.options.length > 0) {
      const optionsText = item.options.map(opt => opt.option_name || opt.optionName).join(', ');
      return `${item.menuName} (${optionsText})`;
    }
    return item.menuName;
  };

  const handleStatusChange = (orderId, newStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
  };

  // orders가 배열이 아니거나 undefined인 경우를 대비
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  // 주문 접수 상태인 주문만 표시 (또는 모든 주문을 표시할 수도 있음)
  const displayedOrders = ordersArray.filter(order => order && (order.status === 'received' || order.status === 'manufacturing'));

  return (
    <div className="order-status">
      <h2 className="order-title">주문 현황</h2>
      <div className="order-list">
        {displayedOrders.length === 0 ? (
          <p className="empty-orders">주문이 없습니다.</p>
        ) : (
          displayedOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-date">{formatDate(order.orderDate || order.order_date)}</div>
                <div className="order-amount">{(order.totalAmount || order.total_amount || 0).toLocaleString()}원</div>
              </div>
              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      {getItemDisplayName(item)} x {item.quantity}
                    </div>
                  ))
                ) : (
                  <div className="order-item">주문 아이템이 없습니다.</div>
                )}
              </div>
              <div className="order-actions">
                {order.status === 'received' && (
                  <button 
                    className="status-button status-manufacturing"
                    onClick={() => handleStatusChange(order.id, 'manufacturing')}
                  >
                    제조 시작
                  </button>
                )}
                {order.status === 'manufacturing' && (
                  <button 
                    className="status-button status-completed"
                    onClick={() => handleStatusChange(order.id, 'completed')}
                  >
                    제조 완료
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderStatus;

