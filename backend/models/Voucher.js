const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    // Basic Information
    voucherNumber: {
      type: String,
      required: [true, 'Voucher number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    voucherDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required']
    },
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true
    },
    expenseTitle: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true
    },
    expenseCategory: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: {
        values: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Transportation', 'Other'],
        message: '{VALUE} is not a valid expense category'
      }
    },
    expenseDescription: {
      type: String,
      default: '',
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },

    // Employee Information
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required']
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true
    },
    employeeId: {
      type: String,
      default: '',
      trim: true
    },
    employeeSignature: {
      type: String,
      default: null
    },

    // Approval Information
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid voucher status'
      },
      default: 'Draft',
      required: true
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    directorName: {
      type: String,
      default: null
    },
    directorSignature: {
      type: String,
      default: null
    },
    approvalDate: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries, search, and filtering
voucherSchema.index({ employee: 1, status: 1 });
voucherSchema.index({ status: 1, expenseDate: -1 });
voucherSchema.index({ departmentName: 1 });
voucherSchema.index({ expenseCategory: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
