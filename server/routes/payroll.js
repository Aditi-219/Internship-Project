const express = require('express');
const router = express.Router();
const Staff = require('../models/staff');

// @desc    Get payroll summary for current month
// @route   GET /api/payroll/summary
router.get('/summary', async (req, res) => {
  try {
    const staffMembers = await Staff.find().sort({ name: 1 });
    
    const payrollSummary = staffMembers.map(staff => {
      const salary = staff.calculateNetSalary();
      return {
        id: staff._id,
        name: staff.name,
        department: staff.department,
        dailyWage: staff.dailyWage,
        baseSalary: salary.baseSalary,
        paidLeaves: staff.paidLeavesUsed,
        unpaidLeaves: staff.unpaidLeaves,
        deduction: salary.deduction,
        netSalary: salary.netSalary,
        paymentStatus: staff.paymentStatus,
        paidLeaveQuota: staff.paidLeaveQuota,
        paidLeavesRemaining: staff.paidLeaveQuota - staff.paidLeavesUsed
      };
    });
    
    const totalPayroll = payrollSummary.reduce((sum, staff) => sum + staff.netSalary, 0);
    const totalUnpaid = payrollSummary.reduce((sum, staff) => sum + (staff.paymentStatus === 'Unpaid' ? staff.netSalary : 0), 0);
    
    res.json({
      summary: payrollSummary,
      totalPayroll,
      totalUnpaid,
      totalStaff: staffMembers.length,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get salary history for a staff member
// @route   GET /api/payroll/history/:staffId
router.get('/history/:staffId', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json({
      name: staff.name,
      department: staff.department,
      dailyWage: staff.dailyWage,
      history: staff.salaryHistory.sort((a, b) => b.date - a.date)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Process all unpaid salaries
// @route   POST /api/payroll/process-all
router.post('/process-all', async (req, res) => {
  try {
    const staffMembers = await Staff.find({ paymentStatus: 'Unpaid' });
    
    const processed = [];
    for (let staff of staffMembers) {
      const salary = staff.calculateNetSalary();
      staff.paymentStatus = 'Processed';
      await staff.save();
      
      processed.push({
        id: staff._id,
        name: staff.name,
        netSalary: salary.netSalary
      });
    }
    
    res.json({
      message: `Processed salaries for ${processed.length} staff members`,
      processed,
      totalAmount: processed.reduce((sum, p) => sum + p.netSalary, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly payroll report
// @route   GET /api/payroll/report/:month/:year
router.get('/report/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    const staffMembers = await Staff.find();
    
    const report = staffMembers.map(staff => {
      const historyEntry = staff.salaryHistory.find(
        h => h.month === month && h.year === parseInt(year)
      );
      
      if (historyEntry) {
        return {
          name: staff.name,
          department: staff.department,
          ...historyEntry
        };
      }
      return null;
    }).filter(entry => entry !== null);
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;