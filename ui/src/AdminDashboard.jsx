import './AdminDashboard.css';

function AdminDashboard({ orders }) {
  // orders가 배열이 아니거나 undefined인 경우를 대비
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  const stats = {
    totalOrders: ordersArray.length,
    receivedOrders: ordersArray.filter(order => order.status === 'received').length,
    manufacturingOrders: ordersArray.filter(order => order.status === 'manufacturing').length,
    completedOrders: ordersArray.filter(order => order.status === 'completed').length
  };

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">관리자 대시보드</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">총 주문</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">주문 접수</div>
          <div className="stat-value">{stats.receivedOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">제조 중</div>
          <div className="stat-value">{stats.manufacturingOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">제조 완료</div>
          <div className="stat-value">{stats.completedOrders}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

