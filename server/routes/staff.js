const express = require('express');
const router = express.Router();
const Staff = require('../models/staff');
const { protect } = require('../middleware/auth');
router.use(protect);
// @desc    Get all staff members
// @route   GET /api/staff
router.use(protect);
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    // Calculate net salary for each staff member
    const staffWithSalary = staff.map(s => {
      const salary = s.calculateNetSalary();
      return {
        ...s.toObject(),
        netSalary: salary.netSalary,
        baseSalary: salary.baseSalary,
        deduction: salary.deduction
      };
    });
    
    res.json(staffWithSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single staff member
// @route   GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    const salary = staff.calculateNetSalary();
    res.json({
      ...staff.toObject(),
      netSalary: salary.netSalary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new staff member
// @route   POST /api/staff
router.post('/', async (req, res) => {
  try {
    const staff = new Staff({
      name: req.body.name,
      department: req.body.department,
      dailyWage: req.body.dailyWage,
      paidLeaveQuota: req.body.paidLeaveQuota
    });
    
    const newStaff = await staff.save();
    const salary = newStaff.calculateNetSalary();
    
    res.status(201).json({
      ...newStaff.toObject(),
      netSalary: salary.netSalary
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    const salary = staff.calculateNetSalary();
    res.json({
      ...staff.toObject(),
      netSalary: salary.netSalary
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark salary as paid
// @route   PATCH /api/staff/:id/mark-paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    staff.paymentStatus = 'Processed';
    await staff.save();
    
    res.json({ message: 'Salary marked as paid', staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset month for all staff
// @route   POST /api/staff/reset-month
router.post('/reset-month', async (req, res) => {
  try {
    const staffMembers = await Staff.find();
    
    for (let staff of staffMembers) {
      staff.resetMonthly();
      await staff.save();
    }
    
    res.json({ 
      message: 'Month reset successfully for all staff members',
      count: staffMembers.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;