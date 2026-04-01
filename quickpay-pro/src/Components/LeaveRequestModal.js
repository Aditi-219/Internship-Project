import { useState } from "react";
import { FiCalendar, FiUser } from 'react-icons/fi';

function LeaveRequestModal({ requestLeave, staff }) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [leaveType, setLeaveType] = useState("paid");

  const handleSubmit = () => {
    if (!selectedStaff) return alert("Select a staff member");
    const staffMember = staff.find(s => s._id === selectedStaff);
    if (staffMember) {
      requestLeave(selectedStaff, staffMember.name, leaveType);
      window.bootstrap.Modal.getInstance(document.getElementById('leaveModal'))?.hide();
      setSelectedStaff("");
    }
  };

  return (
    <div className="modal fade" id="leaveModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '15px' }}>
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h5 className="modal-title"><FiCalendar className="me-2" />Request Leave</h5><button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body p-4">
            <div className="mb-3"><label className="form-label fw-bold"><FiUser className="me-1" />Staff Member</label>
              <select className="form-select" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                <option value="">Select Staff</option>{staff.map(s => <option key={s._id} value={s._id}>{s.name} - {s.department}</option>)}
              </select>
            </div>
            <div className="mb-3"><label className="form-label fw-bold">Leave Type</label>
              <select className="form-select" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                <option value="paid">Paid Leave</option><option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button></div>
        </div>
      </div>
    </div>
  );
}
export default LeaveRequestModal;