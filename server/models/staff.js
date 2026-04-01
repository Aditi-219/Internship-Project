const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true
  },
  dailyWage: {
    type: Number,
    required: [true, 'Please add daily wage'],
    min: 0
  },
  paidLeaveQuota: {
    type: Number,
    required: [true, 'Please add paid leave quota'],
    default: 5,
    min: 0
  },
  paidLeavesUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  unpaidLeaves: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingLeaves: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Processed'],
    default: 'Unpaid'
  },
  salaryHistory: [{
    month: String,
    year: Number,
    baseSalary: Number,
    paidLeaves: Number,
    unpaidLeaves: Number,
    deduction: Number,
    netSalary: Number,
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate net salary method
staffSchema.methods.calculateNetSalary = function(daysInMonth = 30) {
  const baseSalary = this.dailyWage * daysInMonth;
  const deduction = this.unpaidLeaves * this.dailyWage;
  const netSalary = baseSalary - deduction;
  
  return {
    baseSalary,
    deduction,
    netSalary
  };
};

// Reset monthly stats
staffSchema.methods.resetMonthly = function() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const salary = this.calculateNetSalary();
  
  // Save to history
  this.salaryHistory.push({
    month: currentMonth,
    year: currentYear,
    baseSalary: salary.baseSalary,
    paidLeaves: this.paidLeavesUsed,
    unpaidLeaves: this.unpaidLeaves,
    deduction: salary.deduction,
    netSalary: salary.netSalary,
    status: this.paymentStatus
  });
  
  // Reset values
  this.paidLeavesUsed = 0;
  this.unpaidLeaves = 0;
  this.pendingLeaves = 0;
  this.paymentStatus = 'Unpaid';
  
  return this;
};

module.exports = mongoose.model('Staff', staffSchema);