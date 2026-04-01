import { useState } from "react";
import { FiUserPlus, FiBriefcase, FiDollarSign, FiCalendar, FiUser, FiX } from 'react-icons/fi';

function AddStaffModal({ addStaff, isOpen, onClose }) {
  const [form, setForm] = useState({ name: "", department: "", dailyWage: "", paidLeaveQuota: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.department || !form.dailyWage || !form.paidLeaveQuota) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    await addStaff(form);
    setSubmitting(false);
    
    // Reset form
    setForm({ name: "", department: "", dailyWage: "", paidLeaveQuota: "" });
    
    // Close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
      <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'auto', zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '15px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
              <h5 className="modal-title"><FiUserPlus className="me-2" />Add Staff</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              {[
                { icon: FiUser, field: "name", label: "Name", type: "text", placeholder: "Enter full name" },
                { icon: FiBriefcase, field: "department", label: "Department", type: "select", options: ["HR","IT","Finance","Marketing","Operations","Sales"] },
                { icon: FiDollarSign, field: "dailyWage", label: "Daily Wage (₹)", type: "number", placeholder: "Enter daily wage" },
                { icon: FiCalendar, field: "paidLeaveQuota", label: "Paid Leave Quota", type: "number", placeholder: "Enter leave quota" }
              ].map(({icon: Icon, field, label, type, options, placeholder}) => (
                <div key={field} className="mb-3">
                  <label className="form-label fw-bold"><Icon className="me-1" />{label}</label>
                  {type === 'select' ? 
                    <select className="form-select" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}>
                      <option value="">Select {label}</option>
                      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select> :
                    <input 
                      type={type} 
                      className="form-control" 
                      placeholder={placeholder}
                      value={form[field]} 
                      onChange={e => setForm({...form, [field]: e.target.value})} 
                    />
                  }
                </div>
              ))}
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="button" className="btn btn-primary px-4" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <FiUserPlus className="me-1" />}
                {submitting ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddStaffModal;