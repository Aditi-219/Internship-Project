import { useState, useEffect } from "react";
import { api } from "../api";
import { FiCheck, FiX } from 'react-icons/fi';

function PendingLeavesModal({ approveLeave }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const data = await api.getPendingLeaves();
      setLeaves(data);
    } catch (error) {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApprove = async (id) => {
    if (window.confirm("Approve this leave?")) {
      await approveLeave(id);
      fetchLeaves();
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this leave?")) {
      await api.rejectLeave(id);
      fetchLeaves();
    }
  };

  return (
    <div className="modal fade" id="pendingLeavesModal" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '15px' }}>
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h5 className="modal-title">Pending Leave Requests</h5><button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body">
            {loading ? <div className="text-center py-4"><div className="spinner-border text-primary"></div></div> :
              leaves.length === 0 ? <div className="alert alert-info">No pending leave requests</div> :
              <div className="list-group">{leaves.map(leave => (
                <div key={leave._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div><h6 className="mb-1">{leave.staffName}</h6><p className="mb-1">Type: <span className={`badge ${leave.leaveType === 'paid' ? 'bg-success' : 'bg-warning'}`}>{leave.leaveType}</span></p><small>{new Date(leave.createdAt).toLocaleString()}</small></div>
                    <div><button className="btn btn-sm btn-success me-2" onClick={() => handleApprove(leave._id)}><FiCheck className="me-1" />Approve</button><button className="btn btn-sm btn-danger" onClick={() => handleReject(leave._id)}><FiX className="me-1" />Reject</button></div>
                  </div>
                </div>
              ))}</div>}
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>
        </div>
      </div>
    </div>
  );
}
export default PendingLeavesModal;