import { useState } from "react";
import { FiUserPlus, FiBriefcase, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';

function AddStaffModal({ addStaff }) {
  const [form, setForm] = useState({ name: "", department: "", dailyWage: "", paidLeaveQuota: "" });

  const handleSubmit = async () => {
    if (!form.name || !form.department || !form.dailyWage || !form.paidLeaveQuota) return alert("Please fill all fields");
  const success = await addStaff({
    name: form.name,
    department: form.department,
    dailyWage: Number(form.dailyWage),
    paidLeaveQuota: Number(form.paidLeaveQuota)
  });
  
  if (success) {
    setForm({ name: "", department: "", dailyWage: "", paidLeaveQuota: "" });
    const modal = document.getElementById('addStaffModal');
const modalInstance = window.bootstrap.Modal.getInstance(modal);

if (modalInstance) {
  modalInstance.hide();
}

document.body.classList.remove('modal-open');
document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  }
  setForm({ name: "", department: "", dailyWage: "", paidLeaveQuota: "" });
    const modal = document.getElementById('addStaffModal');
const modalInstance = window.bootstrap.Modal.getInstance(modal);

if (modalInstance) {
  modalInstance.hide();
}

document.body.classList.remove('modal-open');
document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  };

  return (
    <div className="modal fade" id="addStaffModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '15px' }}>
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h5 className="modal-title"><FiUserPlus className="me-2" />Add Staff</h5><button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body p-4">
            {[{ icon: FiUser, field: "name", label: "Name", type: "text" },{ icon: FiBriefcase, field: "department", label: "Department", type: "select", options: ["HR","IT","Finance","Marketing","Operations","Sales"] },{ icon: FiDollarSign, field: "dailyWage", label: "Daily Wage (₹)", type: "number" },{ icon: FiCalendar, field: "paidLeaveQuota", label: "Paid Leave Quota", type: "number" }].map(({icon: Icon, field, label, type, options}) => (
              <div key={field} className="mb-3">
                <label className="form-label fw-bold"><Icon className="me-1" />{label}</label>
                {type === 'select' ? 
                  <select className="form-select" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select> :
                  <input type={type} className="form-control" placeholder={`Enter ${label.toLowerCase()}`} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} />
                }
              </div>
            ))}
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><FiUserPlus className="me-1" />Add Staff</button></div>
        </div>
      </div>
    </div>
  );
}
export default AddStaffModal;