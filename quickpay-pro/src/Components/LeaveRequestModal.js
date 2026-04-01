import { useState } from "react";
import { FiCalendar, FiUser } from 'react-icons/fi';

function LeaveRequestModal({ requestLeave, staff, isOpen, onClose }) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [leaveType, setLeaveType] = useState("paid");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStaff) {
      alert("Please select a staff member");
      return;
    }
    
    const staffMember = staff.find(s => s._id === selectedStaff);
    if (staffMember) {
      setSubmitting(true);
      await requestLeave(selectedStaff, staffMember.name, leaveType);
      setSubmitting(false);
      
      // Reset form
      setSelectedStaff("");
      setLeaveType("paid");
      
      // Close modal
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
      <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'auto', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '15px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
              <h5 className="modal-title"><FiCalendar className="me-2" />Request Leave</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-bold"><FiUser className="me-1" />Staff Member</label>
                <select 
                  className="form-select" 
                  value={selectedStaff} 
                  onChange={e => setSelectedStaff(e.target.value)}
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(s => (
                    <option key={s._id} value={s._id}>{s.name} - {s.department}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Leave Type</label>
                <select 
                  className="form-select" 
                  value={leaveType} 
                  onChange={e => setLeaveType(e.target.value)}
                >
                  <option value="paid">Paid Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="button" className="btn btn-primary px-4" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <FiCalendar className="me-1" />}
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaveRequestModal;