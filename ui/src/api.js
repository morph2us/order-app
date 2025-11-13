const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API 호출 헬퍼 함수
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API 호출 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 메뉴 관련 API
export const menusAPI = {
  // 메뉴 목록 조회
  getAll: async () => {
    const data = await apiCall('/api/menus');
    return data.menus;
  },
  
  // 특정 메뉴 조회
  getById: async (id) => {
    return await apiCall(`/api/menus/${id}`);
  },
  
  // 재고 수정
  updateStock: async (id, change) => {
    return await apiCall(`/api/menus/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ change })
    });
  }
};

// 주문 관련 API
export const ordersAPI = {
  // 주문 생성
  create: async (items) => {
    return await apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },
  
  // 주문 목록 조회
  getAll: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    const data = await apiCall(`/api/orders${query}`);
    return data.orders;
  },
  
  // 특정 주문 조회
  getById: async (id) => {
    return await apiCall(`/api/orders/${id}`);
  },
  
  // 주문 상태 변경
  updateStatus: async (id, status) => {
    return await apiCall(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

