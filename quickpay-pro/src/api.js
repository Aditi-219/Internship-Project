const API_BASE_URL = 'http://localhost:5000/api';

// Get headers with authentication token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Staff endpoints
  getStaff: async () => {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
  },
  
  addStaff: async (staffData) => {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(staffData)
    });
    if (!response.ok) throw new Error('Failed to add staff');
    return response.json();
  },
  
  updateStaff: async (id, staffData) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(staffData)
    });
    if (!response.ok) throw new Error('Failed to update staff');
    return response.json();
  },
  
  deleteStaff: async (id) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete staff');
    return response.json();
  },
  
  markAsPaid: async (id) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}/mark-paid`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark as paid');
    return response.json();
  },
  
  resetMonth: async () => {
    const response = await fetch(`${API_BASE_URL}/staff/reset-month`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to reset month');
    return response.json();
  },
  
  // Leave endpoints
  requestLeave: async (leaveData) => {
    const response = await fetch(`${API_BASE_URL}/leave/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leaveData)
    });
    if (!response.ok) throw new Error('Failed to request leave');
    return response.json();
  },
  
  approveLeave: async (leaveId) => {
    const response = await fetch(`${API_BASE_URL}/leave/${leaveId}/approve`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to approve leave');
    return response.json();
  },
  
  rejectLeave: async (leaveId) => {
    const response = await fetch(`${API_BASE_URL}/leave/${leaveId}/reject`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to reject leave');
    return response.json();
  },
  
  getPendingLeaves: async () => {
    const response = await fetch(`${API_BASE_URL}/leave/pending`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch pending leaves');
    return response.json();
  },
  
  getLeavesByStaff: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/leave/staff/${staffId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch leaves');
    return response.json();
  },
  
  // Payroll endpoints
  getPayrollSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/payroll/summary`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch payroll summary');
    return response.json();
  },
  
  processAllSalaries: async () => {
    const response = await fetch(`${API_BASE_URL}/payroll/process-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to process salaries');
    return response.json();
  },
  
  getSalaryHistory: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/payroll/history/${staffId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch salary history');
    return response.json();
  }
};