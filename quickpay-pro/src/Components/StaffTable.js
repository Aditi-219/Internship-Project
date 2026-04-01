import { useState } from "react";
import { FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiCalendar, FiUser, FiCheck } from 'react-icons/fi';

function StaffTable({ staff, requestLeave, approveLeave, markAsPaid, updateStaff, deleteStaff, getPendingLeavesForStaff, actionLoading }) {  const DAYS = 30;
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffPendingLeaves, setStaffPendingLeaves] = useState([]);

  const calcSalary = (s) => ({ base: s.dailyWage * DAYS, net: (s.dailyWage * DAYS) - (s.unpaidLeaves * s.dailyWage) });
  const getStatusBadge = (status) => <span className={`badge px-3 py-2 rounded-pill ${status === 'Processed' ? 'bg-success' : 'bg-danger'}`}>{status === 'Processed' ? '✓ Processed' : '⏳ Unpaid'}</span>;

  const handleEdit = (s) => { setEditingStaff(s); setEditForm({ name: s.name, department: s.department, dailyWage: s.dailyWage, paidLeaveQuota: s.paidLeaveQuota }); };
  const handleUpdate = async () => { await updateStaff(editingStaff._id, editForm); setEditingStaff(null); document.getElementById('editStaffModal')?.click(); };
  const handleDelete = (id, name) => { if(window.confirm(`Delete ${name}?`)) deleteStaff(id); };
  
  const handleApproveClick = async (staff) => {
    setSelectedStaff(staff);
    setStaffPendingLeaves(await getPendingLeavesForStaff(staff._id));
    setShowApproveModal(true);
  };
  const handleApproveLeave = async (leaveId) => { 
    await approveLeave(leaveId); 
    setShowApproveModal(false);  
  };
  return (
    <>
      <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px' }}>
        <div className="card-header bg-white border-0 py-3"><h5 className="mb-0 fw-bold"><FiUser className="me-2" />Staff Members <span className="badge bg-primary rounded-pill ms-2">{staff.length}</span></h5></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ background: '#f8f9fa' }}><tr>{['Name','Dept','Wage','Paid','Unpaid','Pending','Net Salary','Status','Actions'].map(h => <th key={h} className="py-3">{h}</th>)}</tr></thead>
              <tbody>
                {staff.map(s => {
                  const salary = calcSalary(s);
                  return (
                    <tr key={s._id}>
                      <td><div className="d-flex align-items-center"><div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2"><FiUser size={18} className="text-primary" /></div><div><div className="fw-bold">{s.name}</div><small className="text-muted">ID: {s._id?.slice(-6)}</small></div></div></td>
                      <td>{s.department}</td><td>₹{s.dailyWage}</td>
                      <td><div><span className="fw-bold">{s.paidLeavesUsed}</span><span className="text-muted">/{s.paidLeaveQuota}</span></div><div className="progress mt-1" style={{ height: '4px' }}><div className="progress-bar bg-success" style={{ width: `${(s.paidLeavesUsed/s.paidLeaveQuota)*100}%` }}></div></div></td>
                      <td><span className="badge bg-warning rounded-pill">{s.unpaidLeaves}</span></td>
                      <td>{s.pendingLeaves > 0 ? <span className="badge bg-info rounded-pill"><FiClock className="me-1" />{s.pendingLeaves}</span> : '0'}</td>
                      <td><div className="fw-bold text-success">₹{salary.net.toLocaleString()}</div><small className="text-muted">Base: ₹{salary.base.toLocaleString()}</small></td>
                      <td>{getStatusBadge(s.paymentStatus)}</td>
                      <td>
                        <div className="btn-group-vertical btn-group-sm">
                          <button onClick={() => { let type = prompt("Leave type (paid/unpaid):"); if(type && ['paid','unpaid'].includes(type)) requestLeave(s._id, s.name, type); }} className="btn btn-outline-primary mb-1"><FiCalendar size={14} className="me-1" />Request</button>
                          {s.pendingLeaves > 0 && <button onClick={() => handleApproveClick(s)} className="btn btn-outline-success mb-1"><FiCheck size={14} className="me-1" />Approve ({s.pendingLeaves})</button>}
                          <button onClick={() => handleEdit(s)} className="btn btn-outline-info mb-1" data-bs-toggle="modal" data-bs-target="#editStaffModal"><FiEdit2 size={14} className="me-1" />Edit</button>
                          <button onClick={() => handleDelete(s._id, s.name)} className="btn btn-outline-danger mb-1"><FiTrash2 size={14} className="me-1" />Delete</button>
                          <button onClick={() => markAsPaid(s._id)} className="btn btn-outline-success" disabled={s.paymentStatus === "Processed"}><FiCheckCircle size={14} className="me-1" />Mark Paid</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedStaff && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <h5 className="modal-title"><FiCheck className="me-2" />Approve Leave - {selectedStaff.name}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowApproveModal(false)}></button>
              </div>
              <div className="modal-body">
                {staffPendingLeaves.length === 0 ? <div className="alert alert-info">No pending leaves</div> :
                  <div className="list-group">{staffPendingLeaves.map(leave => (
                    <div key={leave._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div><h6 className="mb-1">Leave Request</h6><p className="mb-1">Type: <span className={`badge ${leave.leaveType === 'paid' ? 'bg-success' : 'bg-warning'}`}>{leave.leaveType}</span></p><small>Requested: {new Date(leave.createdAt).toLocaleString()}</small></div>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveLeave(leave._id)}><FiCheck className="me-1" />Approve</button>
                      </div>
                    </div>
                  ))}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <div className="modal fade" id="editStaffModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '15px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h5 className="modal-title">Edit Staff</h5><button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              {['name','department','dailyWage','paidLeaveQuota'].map(field => (
                <div key={field} className="mb-3">
                  <label className="form-label fw-bold text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input type={field.includes('Wage') || field.includes('Quota') ? "number" : "text"} className="form-control" value={editForm[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})} />
                </div>
              ))}
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Update</button></div>
          </div>
        </div>
      </div>
    </>
  );
}
export default StaffTable;