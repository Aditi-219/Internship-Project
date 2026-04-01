import { useState, useEffect } from "react";
import { api } from "../api";
import { FiCheck, FiX } from 'react-icons/fi';

function PendingLeavesModal({ approveLeave, isOpen, onClose }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingLeaves();
      setLeaves(data);
    } catch (error) {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (isOpen) {
      fetchLeaves(); 
    }
  }, [isOpen]);

  const handleApprove = async (id) => {
    if (window.confirm("Approve this leave?")) {
      setActionLoading(id);
      await approveLeave(id);
      setActionLoading(null);
      fetchLeaves();
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this leave?")) {
      setActionLoading(id);
      await api.rejectLeave(id);
      setActionLoading(null);
      fetchLeaves();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
      <div className="modal show d-block" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'auto', zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '15px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
              <h5 className="modal-title">Pending Leave Requests</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
              ) : leaves.length === 0 ? (
                <div className="alert alert-info text-center">No pending leave requests</div>
              ) : (
                <div className="list-group">
                  {leaves.map(leave => (
                    <div key={leave._id} className="list-group-item border-0 shadow-sm mb-2 rounded-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1 fw-bold">{leave.staffName}</h6>
                          <p className="mb-1">
                            Type: <span className={`badge ${leave.leaveType === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                              {leave.leaveType === 'paid' ? 'Paid Leave' : 'Unpaid Leave'}
                            </span>
                          </p>
                          <small className="text-muted">
                            Requested: {new Date(leave.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-success me-2 rounded-pill px-3" 
                            onClick={() => handleApprove(leave._id)}
                            disabled={actionLoading === leave._id}
                          >
                            {actionLoading === leave._id ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <FiCheck className="me-1" />
                            )}
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-danger rounded-pill px-3" 
                            onClick={() => handleReject(leave._id)}
                            disabled={actionLoading === leave._id}
                          >
                            {actionLoading === leave._id ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <FiX className="me-1" />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PendingLeavesModal;