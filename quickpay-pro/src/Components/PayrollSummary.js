import { useState, useEffect } from "react";
import { api } from "../api";
import { FiTrendingUp, FiUsers, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

function PayrollSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSummary(); }, []);
  const fetchSummary = async () => { try { setSummary(await api.getPayrollSummary()); } catch(e) { console.error(e); } finally { setLoading(false); } };
  const processAll = async () => { if(window.confirm("Process all salaries?")) { await api.processAllSalaries(); fetchSummary(); alert("All salaries processed!"); } };

  if(loading) return <div className="card shadow-sm mt-3"><div className="card-body text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2">Loading...</p></div></div>;
  if(!summary) return null;

  return (
    <div className="card shadow-sm mt-3" style={{ borderRadius: '15px', animation: 'slideDown 0.5s ease' }}>
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold"><FiTrendingUp className="me-2 text-primary" />Payroll Summary - {summary.month} {summary.year}</h5>
        <button className="btn btn-success btn-sm" onClick={processAll}><FiDollarSign className="me-1" />Process All</button>
      </div>
      <div className="card-body">
        <div className="row mb-4">
          {[{ icon: FiUsers, label: "Total Staff", value: summary.totalStaff, color: "primary" },{ icon: FiDollarSign, label: "Total Payroll", value: `₹${summary.totalPayroll.toLocaleString()}`, color: "success" },{ icon: FiAlertCircle, label: "Unpaid Amount", value: `₹${summary.totalUnpaid.toLocaleString()}`, color: "danger" }].map((card,i) => (
            <div key={i} className="col-md-4 mb-3"><div className={`card bg-${card.color} bg-opacity-10 border-0`}><div className="card-body text-center"><card.icon size={30} className={`text-${card.color} mb-2`} /><h6 className="text-muted mb-1">{card.label}</h6><h3 className="mb-0 fw-bold">{card.value}</h3></div></div></div>
          ))}
        </div>
        <div className="table-responsive"><table className="table table-hover"><thead className="table-light"><tr><th>Employee</th><th>Dept</th><th>Base</th><th>Paid</th><th>Unpaid</th><th>Deduction</th><th>Net</th><th>Status</th></tr></thead>
          <tbody>{summary.summary.map(s => (
            <tr key={s.id}><td className="fw-bold">{s.name}</td><td>{s.department}</td><td>₹{s.baseSalary.toLocaleString()}</td><td><span className="badge bg-success">{s.paidLeaves}/{s.paidLeaveQuota}</span></td>
            <td>{s.unpaidLeaves > 0 ? <span className="badge bg-warning">{s.unpaidLeaves}</span> : '0'}</td><td className="text-danger">-₹{s.deduction.toLocaleString()}</td><td className="fw-bold text-success">₹{s.netSalary.toLocaleString()}</td>
            <td><span className={`badge ${s.paymentStatus === 'Unpaid' ? 'bg-danger' : 'bg-success'}`}>{s.paymentStatus}</span></td></tr>
          ))}</tbody></table></div>
      </div>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
export default PayrollSummary;