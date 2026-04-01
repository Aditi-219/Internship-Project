const express = require('express');
const router = express.Router();
const Leave = require('../models/leave');
const Staff = require('../models/staff');

// @desc    Request leave
// @route   POST /api/leave/request
router.post('/request', async (req, res) => {
  try {
    const { staffId, staffName, leaveType } = req.body;
    
    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Create leave request
    const leave = new Leave({
      staffId,
      staffName,
      leaveType,
      status: 'Pending'
    });
    
    await leave.save();
    
    // Update staff's pending leaves count
    staff.pendingLeaves += 1;
    await staff.save();
    
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all pending leaves
// @route   GET /api/leave/pending
router.get('/pending', async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ status: 'Pending' })
      .populate('staffId', 'name department')
      .sort({ createdAt: -1 });
    res.json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaves by staff ID
router.get('/staff/:staffId', async (req, res) => {
  try {
    const leaves = await Leave.find({ staffId: req.params.staffId })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve leave
// @route   PATCH /api/leave/:id/approve
router.patch('/:id/approve', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const staff = await Staff.findById(leave.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Process leave approval based on type
    let actualType = leave.leaveType;
    
    if (leave.leaveType === 'paid') {
      if (staff.paidLeavesUsed < staff.paidLeaveQuota) {
        // Within quota, treat as paid leave
        staff.paidLeavesUsed += 1;
        actualType = 'paid';
      } else {
        // Exceeded quota, treat as unpaid leave
        staff.unpaidLeaves += 1;
        actualType = 'unpaid';
      }
    } else {
      // Unpaid leave
      staff.unpaidLeaves += 1;
      actualType = 'unpaid';
    }
    
    // Update staff leave counts
    staff.pendingLeaves = Math.max(0, staff.pendingLeaves - 1);
    await staff.save();
    
    // Update leave record
    leave.status = 'Approved';
    leave.actualType = actualType;
    await leave.save();
    
    const salary = staff.calculateNetSalary();
    
    res.json({ 
      message: 'Leave approved successfully', 
      leave,
      staff: {
        ...staff.toObject(),
        netSalary: salary.netSalary
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reject leave
// @route   PATCH /api/leave/:id/reject
router.patch('/:id/reject', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const staff = await Staff.findById(leave.staffId);
    if (staff) {
      staff.pendingLeaves = Math.max(0, staff.pendingLeaves - 1);
      await staff.save();
    }
    
    leave.status = 'Rejected';
    await leave.save();
    
    res.json({ message: 'Leave rejected successfully', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get leave history for a staff member
// @route   GET /api/leave/staff/:staffId
router.get('/staff/:staffId', async (req, res) => {
  try {
    const leaves = await Leave.find({ staffId: req.params.staffId })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all leaves
// @route   GET /api/leave/all
router.get('/all', async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('staffId', 'name department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;