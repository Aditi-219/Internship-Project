import { useState, useEffect } from "react";
import Navbar from "../Components/navBar";
import StaffTable from "../Components/StaffTable";
import AddStaffModal from "../Components/AddStaffModal";
import LeaveRequestModal from "../Components/LeaveRequestModal";
import PendingLeavesModal from "../Components/PendingLeavesModal";
import PayrollSummary from "../Components/PayrollSummary";
import { api } from "../api";
import { FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiUserPlus, FiClock, FiEye, FiEyeOff, FiRepeat, FiPrinter } from 'react-icons/fi';

function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayroll, setShowPayroll] = useState(false);
  const [stats, setStats] = useState({ totalStaff: 0, totalPayroll: 0, pendingLeaves: 0, unpaidStaff: 0 });

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
      setError("Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAction = async (action, ...args) => {
    try {
      await action(...args);
      await fetchStaff();
      return true;
    } catch (err) {
      setError(`Failed to ${action.name}`);
      return false;
    }
  };

  const addStaff = (data) => handleAction(api.addStaff, data);
  const updateStaff = (id, data) => handleAction(api.updateStaff, id, data);
  const deleteStaff = (id) => handleAction(api.deleteStaff, id);
  const requestLeave = (staffId, staffName, leaveType) => handleAction(api.requestLeave, { staffId, staffName, leaveType });
  const approveLeave = (leaveId) => handleAction(api.approveLeave, leaveId);
  const markAsPaid = (staffId) => handleAction(api.markAsPaid, staffId);
  const resetMonth = async () => {
    if (window.confirm("Reset month? This clears all leaves and payment status.")) {
      await handleAction(api.resetMonth);
    }
  };

  const getPendingLeavesForStaff = async (staffId) => {
    const leaves = await api.getLeavesByStaff(staffId);
    return leaves.filter(l => l.status === 'Pending');
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
      <tbody>${staff.map((s, i) => `
        <tr><td>${i+1}</td><td>${s.name}</td><td>${s.department}</td>
        <td>₹${s.dailyWage}</td><td>${s.paidLeavesUsed}/${s.paidLeaveQuota}</td>
        <td>${s.unpaidLeaves}</td>
        <td>₹${(s.dailyWage*30 - s.unpaidLeaves*s.dailyWage).toLocaleString()}</td>
        <td>${s.paymentStatus}</td></tr>
      `).join('')}</tbody></table>
      <div class="footer"><p>Total Staff: ${staff.length} | Total Payroll: ₹${stats.totalPayroll.toLocaleString()}</p></div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="text-center"><div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}></div><p className="text-white mt-3">Loading...</p></div>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <div className="container-fluid px-4 py-4">
        {error && <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError(null)}></button></div>}
        
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
          <button className="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#addStaffModal" style={{ borderRadius: '10px', padding: '10px 20px' }}><FiUserPlus className="me-2" />Add Staff</button>
          <button className="btn btn-info text-white shadow-sm" data-bs-toggle="modal" data-bs-target="#leaveModal" style={{ borderRadius: '10px', padding: '10px 20px' }}><FiCalendar className="me-2" />Request Leave</button>
          <button className="btn btn-secondary shadow-sm" data-bs-toggle="modal" data-bs-target="#pendingLeavesModal" style={{ borderRadius: '10px', padding: '10px 20px' }}><FiClock className="me-2" />Pending ({stats.pendingLeaves})</button>
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
        
        <AddStaffModal addStaff={addStaff} />
        <LeaveRequestModal requestLeave={requestLeave} staff={staff} />
        <PendingLeavesModal approveLeave={approveLeave} />
      </div>
      <style>{`.hover-shadow{transition:all 0.3s ease}.hover-shadow:hover{transform:translateY(-5px);box-shadow:0 10px 20px rgba(0,0,0,0.1)!important}`}</style>
    </div>
  );
}

export default Dashboard;