import { useState, useEffect } from "react";
import Navbar from "../Components/navBar";
import StaffTable from "../Components/StaffTable";
import AddStaffModal from "../Components/AddStaffModal";
import LeaveRequestModal from "../Components/LeaveRequestModal";
import PendingLeavesModal from "../Components/PendingLeavesModal";
import PayrollSummary from "../Components/PayrollSummary";
import { api } from "../api";
import { FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiUserPlus, FiClock, FiEye, FiEyeOff, FiRepeat, FiPrinter, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

function Dashboard({ admin = { fullName: 'Admin' }, onLogout }) {
  // Add these state variables
const [showAddStaffModal, setShowAddStaffModal] = useState(false);
const [showLeaveModal, setShowLeaveModal] = useState(false);
const [showPendingLeavesModal, setShowPendingLeavesModal] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayroll, setShowPayroll] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({ totalStaff: 0, totalPayroll: 0, pendingLeaves: 0, unpaidStaff: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setStaff(data);
      
      const totalPayroll = data.reduce((sum, s) => sum + (s.dailyWage * 30 - (s.unpaidLeaves * s.dailyWage)), 0);
      const pendingLeaves = data.reduce((sum, s) => sum + s.pendingLeaves, 0);
      const unpaidStaff = data.filter(s => s.paymentStatus === 'Unpaid').length;
      
      setStats({ totalStaff: data.length, totalPayroll, pendingLeaves, unpaidStaff });
      setError(null);
    } catch (err) {
      showToast("Failed to fetch staff data", "error");
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay for smooth transition
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const addStaff = async (newStaff) => {
    try {
      await api.addStaff(newStaff);
      await fetchStaff();
      showToast("Staff added successfully!", "success");
      closeModal('addStaffModal');
    } catch (err) {
      showToast("Failed to add staff", "error");
      console.error(err);
    }
  };

  const updateStaff = async (staffId, staffData) => {
    try {
      await api.updateStaff(staffId, staffData);
      await fetchStaff();
      showToast("Staff updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update staff", "error");
      console.error(err);
    }
  };

  const deleteStaff = async (staffId) => {
    if (window.confirm("Delete this staff member?")) {
      try {
        await api.deleteStaff(staffId);
        await fetchStaff();
        showToast("Staff deleted successfully!", "success");
      } catch (err) {
        showToast("Failed to delete staff", "error");
        console.error(err);
      }
    }
  };

  const requestLeave = async (staffId, staffName, leaveType) => {
    try {
      await api.requestLeave({ staffId, staffName, leaveType });
      await fetchStaff();
      showToast("Leave request submitted!", "success");
      closeModal('leaveModal');
    } catch (err) {
      showToast("Failed to request leave", "error");
      console.error(err);
    }
  };

  const approveLeave = async (leaveId) => {
    try {
      await api.approveLeave(leaveId);
      await fetchStaff();
      showToast("Leave approved successfully!", "success");
    } catch (err) {
      showToast("Failed to approve leave", "error");
      console.error(err);
    }
  };

  const markAsPaid = async (staffId) => {
    try {
      await api.markAsPaid(staffId);
      await fetchStaff();
      showToast("Salary marked as paid!", "success");
    } catch (err) {
      showToast("Failed to mark as paid", "error");
      console.error(err);
    }
  };

  const resetMonth = async () => {
    if (window.confirm("Reset month? This clears all leaves and payment status.")) {
      try {
        await api.resetMonth();
        await fetchStaff();
        showToast("Month reset successfully!", "success");
      } catch (err) {
        showToast("Failed to reset month", "error");
        console.error(err);
      }
    }
  };

const closeModal = (modalId) => {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    // Clean up any lingering backdrops
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 200);
  }
};

  const getPendingLeavesForStaff = async (staffId) => {
    try {
      const leaves = await api.getLeavesByStaff(staffId);
      return leaves.filter(l => l.status === 'Pending');
    } catch (err) {
      console.error("Failed to fetch pending leaves:", err);
      return [];
    }
  };

  const printStaffList = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Staff List</title>
      <style>
        body { font-family: Arial; margin: 40px; }
        h1 { color: #667eea; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style></head><body>
      <h1>QuickPay Pro+ - Staff Directory</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>#</th><th>Name</th><th>Dept</th><th>Wage</th><th>Paid</th><th>Unpaid</th><th>Net Salary</th><th>Status</th></tr></thead>
      <tbody>${staff.map((s, i) => `<tr><td>${i+1}</td><td>${s.name}</td><td>${s.department}</td><td>₹${s.dailyWage}</td><td>${s.paidLeavesUsed}/${s.paidLeaveQuota}</td><td>${s.unpaidLeaves}</td><td>₹${(s.dailyWage*30 - s.unpaidLeaves*s.dailyWage).toLocaleString()}</td><td>${s.paymentStatus}</td></tr>`).join('')}</tbody></table>
      <div class="footer"><p>Total Staff: ${staff.length} | Total Payroll: ₹${stats.totalPayroll.toLocaleString()}</p></div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // Simple loading - no popup, just subtle spinner
  if (loading) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <Navbar admin={admin} onLogout={onLogout} />
        <div className="container-fluid px-4 py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
              <p className="text-muted mt-2 small">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar admin={admin} onLogout={onLogout} />
      
      {/* Toast Notification - Auto dismiss */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} shadow-lg border-0 rounded-3 fade show`} style={{ animation: 'slideIn 0.3s ease' }}>
            <div className="d-flex align-items-center">
              {toast.type === 'success' ? <FiCheckCircle size={18} className="me-2" /> : <FiAlertCircle size={18} className="me-2" />}
              {toast.message}
            </div>
          </div>
        </div>
      )}
      
      <div className="container-fluid px-4 py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3 mb-4" role="alert">
            <FiAlertCircle className="me-2" />
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="row mb-4">
          {[
            { label: "Total Staff", value: stats.totalStaff, icon: FiUsers, color: "primary" },
            { label: "Total Payroll", value: `₹${stats.totalPayroll.toLocaleString()}`, icon: FiDollarSign, color: "success" },
            { label: "Pending Leaves", value: stats.pendingLeaves, icon: FiCalendar, color: "warning" },
            { label: "Unpaid Staff", value: stats.unpaidStaff, icon: FiTrendingUp, color: "danger" }
          ].map((card, i) => (
            <div key={i} className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm hover-shadow" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div><h6 className="text-muted mb-1">{card.label}</h6><h2 className="mb-0 fw-bold">{card.value}</h2></div>
                    <div className={`bg-${card.color} bg-opacity-10 p-3 rounded-circle`}><card.icon size={24} className={`text-${card.color}`} /></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="mb-4 d-flex flex-wrap gap-2">
          <button className="btn btn-primary shadow-sm" onClick={() => setShowAddStaffModal(true)} style={{ borderRadius: '10px', padding: '10px 20px' }}>
    <FiUserPlus className="me-2" />Add Staff
  </button>
  <button className="btn btn-info text-white shadow-sm" onClick={() => setShowLeaveModal(true)} style={{ borderRadius: '10px', padding: '10px 20px' }}>
    <FiCalendar className="me-2" />Request Leave
  </button>
  <button className="btn btn-secondary shadow-sm" onClick={() => setShowPendingLeavesModal(true)} style={{ borderRadius: '10px', padding: '10px 20px' }}>
    <FiClock className="me-2" />Pending ({stats.pendingLeaves})
  </button>
          <button className="btn btn-success shadow-sm" onClick={() => setShowPayroll(!showPayroll)} style={{ borderRadius: '10px', padding: '10px 20px' }}>{showPayroll ? <FiEyeOff className="me-2" /> : <FiEye className="me-2" />}{showPayroll ? "Hide" : "View"} Payroll</button>
          <button className="btn btn-danger shadow-sm" onClick={resetMonth} style={{ borderRadius: '10px', padding: '10px 20px' }}><FiRepeat className="me-2" />Reset Month</button>
          <button className="btn btn-dark shadow-sm" onClick={printStaffList} style={{ borderRadius: '10px', padding: '10px 20px' }}><FiPrinter className="me-2" />Print List</button>
        </div>

        {showPayroll && <PayrollSummary />}
        
        <StaffTable
          staff={staff}
          requestLeave={requestLeave}
          approveLeave={approveLeave}
          markAsPaid={markAsPaid}
          updateStaff={updateStaff}
          deleteStaff={deleteStaff}
          getPendingLeavesForStaff={getPendingLeavesForStaff}
        />
        
        <AddStaffModal 
  addStaff={addStaff} 
  isOpen={showAddStaffModal} 
  onClose={() => setShowAddStaffModal(false)} 
/>
<LeaveRequestModal 
  requestLeave={requestLeave} 
  staff={staff} 
  isOpen={showLeaveModal} 
  onClose={() => setShowLeaveModal(false)} 
/>
<PendingLeavesModal 
  approveLeave={approveLeave} 
  isOpen={showPendingLeavesModal} 
  onClose={() => setShowPendingLeavesModal(false)} 
/>
      </div>
      
      <style>{`
        .hover-shadow{transition:all 0.3s ease}
        .hover-shadow:hover{transform:translateY(-5px);box-shadow:0 10px 20px rgba(0,0,0,0.1)!important}
        @keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
}

export default Dashboard;