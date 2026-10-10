const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Voucher = require('../models/Voucher');
const Counter = require('../models/Counter');

// Ensure uploads directory exists and sample signature files are present
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1x1 transparent sample PNG in base64
const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const sampleEmpSigPath = path.join(uploadDir, 'sample-employee-sig.png');
const sampleDirSigPath = path.join(uploadDir, 'sample-director-sig.png');

if (!fs.existsSync(sampleEmpSigPath)) {
  fs.writeFileSync(sampleEmpSigPath, Buffer.from(samplePngBase64, 'base64'));
}
if (!fs.existsSync(sampleDirSigPath)) {
  fs.writeFileSync(sampleDirSigPath, Buffer.from(samplePngBase64, 'base64'));
}

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expenseVoucherDB';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully for seeding.');

    // Demonstration Users
    const demoUsers = [
      // Primary Employee Accounts
      {
        name: 'Rahul Sharma',
        email: 'rahul@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1001',
        department: 'Finance'
      },
      {
        name: 'Priya Patel',
        email: 'priya@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1002',
        department: 'Human Resources'
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1003',
        department: 'Technology'
      },
      {
        name: 'Neha Desai',
        email: 'neha@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1004',
        department: 'Marketing'
      },
      {
        name: 'Amit Verma',
        email: 'amit@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1005',
        department: 'Operations'
      },

      // Existing Generic Demo Accounts (Preserved)
      {
        name: 'Rahul Sharma',
        email: 'employee@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1042',
        department: 'Investment Banking'
      },
      {
        name: 'Ananya Deshmukh',
        email: 'director@prachay.com',
        password: 'Password@123',
        role: 'Director',
        employeeId: 'PSPL-DIR-001',
        department: 'Executive Management'
      },
      {
        name: 'Vikram Patel',
        email: 'accounts@prachay.com',
        password: 'Password@123',
        role: 'Accounts Team',
        employeeId: 'PSPL-ACC-005',
        department: 'Finance & Accounts'
      }
    ];

    const seededUsers = {};

    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email.toLowerCase() });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`[Created User] ${user.name} (${user.role}) - ${user.email} [${user.employeeId}]`);
      } else {
        // Preserve existing user and existing password - do NOT reset password unnecessarily
        let modified = false;
        if (user.name !== userData.name) {
          user.name = userData.name;
          modified = true;
        }
        if (user.employeeId !== userData.employeeId) {
          user.employeeId = userData.employeeId;
          modified = true;
        }
        if (userData.department && user.department !== userData.department) {
          user.department = userData.department;
          modified = true;
        }
        if (user.role !== userData.role) {
          user.role = userData.role;
          modified = true;
        }

        if (modified) {
          await user.save();
          console.log(`[Updated Info] ${user.name} (${user.role}) - ${user.email}`);
        } else {
          console.log(`[User Preserved] ${user.name} (${user.role}) - ${user.email}`);
        }
      }
      seededUsers[userData.email] = user;
    }

    // Initialize counter if not present
    const currentYear = new Date().getFullYear();
    const counterId = `voucher_${currentYear}`;
    let counter = await Counter.findById(counterId);
    if (!counter) {
      counter = new Counter({ _id: counterId, seq: 120 });
      await counter.save();
      console.log(`[Counter] Initialized ${counterId} with seq 120`);
    } else if (counter.seq < 120) {
      counter.seq = 120;
      await counter.save();
      console.log(`[Counter] Bumped ${counterId} seq to 120`);
    }

    const director = seededUsers['director@prachay.com'];

    // 15 Sample Vouchers Distributed Across the 5 Employees (3 vouchers each)
    const sampleVouchers = [
      // 1. Rahul Sharma (Finance)
      {
        voucherNumber: `EXP-${currentYear}-0101`,
        voucherDate: new Date(Date.now() - 10 * 86400000),
        expenseDate: new Date(Date.now() - 11 * 86400000),
        departmentName: 'Finance',
        expenseTitle: 'Statutory Audit Catering & Client Refreshments',
        expenseCategory: 'Food',
        expenseDescription: 'Working lunch and refreshments during the statutory financial audit with external auditors.',
        amount: 4200.00,
        employee: seededUsers['rahul@prachay.com']._id,
        employeeName: seededUsers['rahul@prachay.com'].name,
        employeeId: seededUsers['rahul@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Approved',
        director: director._id,
        directorName: director.name,
        directorSignature: '/uploads/sample-director-sig.png',
        approvalDate: new Date(Date.now() - 9 * 86400000)
      },
      {
        voucherNumber: `EXP-${currentYear}-0102`,
        voucherDate: new Date(Date.now() - 4 * 86400000),
        expenseDate: new Date(Date.now() - 5 * 86400000),
        departmentName: 'Finance',
        expenseTitle: 'SEBI Compliance Reference Handbooks',
        expenseCategory: 'Office Supplies',
        expenseDescription: 'Latest edition volumes on securities contracts and portfolio disclosure guidelines.',
        amount: 2850.00,
        employee: seededUsers['rahul@prachay.com']._id,
        employeeName: seededUsers['rahul@prachay.com'].name,
        employeeId: seededUsers['rahul@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Pending Approval'
      },
      {
        voucherNumber: `EXP-${currentYear}-0103`,
        voucherDate: new Date(Date.now() - 1 * 86400000),
        expenseDate: new Date(Date.now() - 1 * 86400000),
        departmentName: 'Finance',
        expenseTitle: 'Quarterly Tax Advisor Travel Allowance',
        expenseCategory: 'Travel',
        expenseDescription: 'Local metro and cab travel to attend central tax authority clarification conference.',
        amount: 5600.00,
        employee: seededUsers['rahul@prachay.com']._id,
        employeeName: seededUsers['rahul@prachay.com'].name,
        employeeId: seededUsers['rahul@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Draft'
      },

      // 2. Priya Patel (Human Resources)
      {
        voucherNumber: `EXP-${currentYear}-0104`,
        voucherDate: new Date(Date.now() - 12 * 86400000),
        expenseDate: new Date(Date.now() - 13 * 86400000),
        departmentName: 'Human Resources',
        expenseTitle: 'Campus Recruitment Drive Refreshments',
        expenseCategory: 'Food',
        expenseDescription: 'Meals and refreshments for interviewing panel and candidates at campus hiring drive.',
        amount: 7400.00,
        employee: seededUsers['priya@prachay.com']._id,
        employeeName: seededUsers['priya@prachay.com'].name,
        employeeId: seededUsers['priya@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Approved',
        director: director._id,
        directorName: director.name,
        directorSignature: '/uploads/sample-director-sig.png',
        approvalDate: new Date(Date.now() - 11 * 86400000)
      },
      {
        voucherNumber: `EXP-${currentYear}-0105`,
        voucherDate: new Date(Date.now() - 3 * 86400000),
        expenseDate: new Date(Date.now() - 4 * 86400000),
        departmentName: 'Human Resources',
        expenseTitle: 'National HR Leadership Conclave 2026 Registration',
        expenseCategory: 'Other',
        expenseDescription: 'Annual organizational development and employee wellness delegation pass.',
        amount: 11500.00,
        employee: seededUsers['priya@prachay.com']._id,
        employeeName: seededUsers['priya@prachay.com'].name,
        employeeId: seededUsers['priya@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Pending Approval'
      },
      {
        voucherNumber: `EXP-${currentYear}-0106`,
        voucherDate: new Date(Date.now() - 6 * 86400000),
        expenseDate: new Date(Date.now() - 7 * 86400000),
        departmentName: 'Human Resources',
        expenseTitle: 'Interview Candidates Cab Reimbursement',
        expenseCategory: 'Transportation',
        expenseDescription: 'Outstation interview candidate travel reimbursement without parking tickets.',
        amount: 1950.00,
        employee: seededUsers['priya@prachay.com']._id,
        employeeName: seededUsers['priya@prachay.com'].name,
        employeeId: seededUsers['priya@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Rejected',
        director: director._id,
        directorName: director.name,
        rejectionReason: 'Candidate travel slips must include candidate name and gate pass log. Please attach supporting slips.',
        rejectionDate: new Date(Date.now() - 5 * 86400000)
      },

      // 3. Arjun Mehta (Technology)
      {
        voucherNumber: `EXP-${currentYear}-0107`,
        voucherDate: new Date(Date.now() - 8 * 86400000),
        expenseDate: new Date(Date.now() - 9 * 86400000),
        departmentName: 'Technology',
        expenseTitle: 'Server Room Dual Gigabit Patch Cables',
        expenseCategory: 'Office Supplies',
        expenseDescription: 'Cat6 shielded network cables for server rack re-patching and zero-downtime switch upgrade.',
        amount: 3200.00,
        employee: seededUsers['arjun@prachay.com']._id,
        employeeName: seededUsers['arjun@prachay.com'].name,
        employeeId: seededUsers['arjun@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Approved',
        director: director._id,
        directorName: director.name,
        directorSignature: '/uploads/sample-director-sig.png',
        approvalDate: new Date(Date.now() - 7 * 86400000)
      },
      {
        voucherNumber: `EXP-${currentYear}-0108`,
        voucherDate: new Date(Date.now() - 2 * 86400000),
        expenseDate: new Date(Date.now() - 3 * 86400000),
        departmentName: 'Technology',
        expenseTitle: 'AWS Summit Delhi Travel & Accommodation',
        expenseCategory: 'Travel',
        expenseDescription: 'Return flight tickets and lodging to attend AWS cloud resilience and high-frequency trading summit.',
        amount: 16800.00,
        employee: seededUsers['arjun@prachay.com']._id,
        employeeName: seededUsers['arjun@prachay.com'].name,
        employeeId: seededUsers['arjun@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Pending Approval'
      },
      {
        voucherNumber: `EXP-${currentYear}-0109`,
        voucherDate: new Date(Date.now() - 1 * 86400000),
        expenseDate: new Date(Date.now() - 1 * 86400000),
        departmentName: 'Technology',
        expenseTitle: 'High-Speed Backup SSD for Database Replication',
        expenseCategory: 'Office Supplies',
        expenseDescription: 'External 2TB NVMe backup drive for disaster recovery snapshot verification testing.',
        amount: 8900.00,
        employee: seededUsers['arjun@prachay.com']._id,
        employeeName: seededUsers['arjun@prachay.com'].name,
        employeeId: seededUsers['arjun@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Draft'
      },

      // 4. Neha Desai (Marketing)
      {
        voucherNumber: `EXP-${currentYear}-0110`,
        voucherDate: new Date(Date.now() - 9 * 86400000),
        expenseDate: new Date(Date.now() - 10 * 86400000),
        departmentName: 'Marketing',
        expenseTitle: 'Financial Expo 2026 Banner & Standees',
        expenseCategory: 'Office Supplies',
        expenseDescription: 'High-resolution vinyl roll-up banners and brochure printing for annual retail investor summit.',
        amount: 9500.00,
        employee: seededUsers['neha@prachay.com']._id,
        employeeName: seededUsers['neha@prachay.com'].name,
        employeeId: seededUsers['neha@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Approved',
        director: director._id,
        directorName: director.name,
        directorSignature: '/uploads/sample-director-sig.png',
        approvalDate: new Date(Date.now() - 8 * 86400000)
      },
      {
        voucherNumber: `EXP-${currentYear}-0111`,
        voucherDate: new Date(Date.now() - 3 * 86400000),
        expenseDate: new Date(Date.now() - 4 * 86400000),
        departmentName: 'Marketing',
        expenseTitle: 'Client Pitch Dinner at Grand Hyatt',
        expenseCategory: 'Food',
        expenseDescription: 'Corporate hospitality dinner hosted for potential institutional HNIs and portfolio managers.',
        amount: 12400.00,
        employee: seededUsers['neha@prachay.com']._id,
        employeeName: seededUsers['neha@prachay.com'].name,
        employeeId: seededUsers['neha@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Pending Approval'
      },
      {
        voucherNumber: `EXP-${currentYear}-0112`,
        voucherDate: new Date(Date.now() - 5 * 86400000),
        expenseDate: new Date(Date.now() - 6 * 86400000),
        departmentName: 'Marketing',
        expenseTitle: 'Promotional Social Media Ad Graphics Fee',
        expenseCategory: 'Other',
        expenseDescription: 'Freelance graphic design charges for Diwali investment campaign banners.',
        amount: 6000.00,
        employee: seededUsers['neha@prachay.com']._id,
        employeeName: seededUsers['neha@prachay.com'].name,
        employeeId: seededUsers['neha@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Rejected',
        director: director._id,
        directorName: director.name,
        rejectionReason: 'Vendor invoice is missing GSTIN details. Please submit a valid GST invoice or tax invoice.',
        rejectionDate: new Date(Date.now() - 4 * 86400000)
      },

      // 5. Amit Verma (Operations)
      {
        voucherNumber: `EXP-${currentYear}-0113`,
        voucherDate: new Date(Date.now() - 14 * 86400000),
        expenseDate: new Date(Date.now() - 15 * 86400000),
        departmentName: 'Operations',
        expenseTitle: 'Branch Office Air Conditioner Maintenance',
        expenseCategory: 'Other',
        expenseDescription: 'Seasonal overhaul, gas refill, and air filter maintenance for trading floor HVAC units.',
        amount: 4800.00,
        employee: seededUsers['amit@prachay.com']._id,
        employeeName: seededUsers['amit@prachay.com'].name,
        employeeId: seededUsers['amit@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Approved',
        director: director._id,
        directorName: director.name,
        directorSignature: '/uploads/sample-director-sig.png',
        approvalDate: new Date(Date.now() - 13 * 86400000)
      },
      {
        voucherNumber: `EXP-${currentYear}-0114`,
        voucherDate: new Date(Date.now() - 2 * 86400000),
        expenseDate: new Date(Date.now() - 3 * 86400000),
        departmentName: 'Operations',
        expenseTitle: 'Courier & Overnight Speed Post Dispatch',
        expenseCategory: 'Transportation',
        expenseDescription: 'Confidential client share certificates and physical delivery receipts dispatch.',
        amount: 1450.00,
        employee: seededUsers['amit@prachay.com']._id,
        employeeName: seededUsers['amit@prachay.com'].name,
        employeeId: seededUsers['amit@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Pending Approval'
      },
      {
        voucherNumber: `EXP-${currentYear}-0115`,
        voucherDate: new Date(Date.now() - 1 * 86400000),
        expenseDate: new Date(Date.now() - 1 * 86400000),
        departmentName: 'Operations',
        expenseTitle: 'Emergency Generator Diesel Refill',
        expenseCategory: 'Other',
        expenseDescription: 'Emergency diesel fuel purchase to ensure uninterrupted trading terminal power.',
        amount: 3750.00,
        employee: seededUsers['amit@prachay.com']._id,
        employeeName: seededUsers['amit@prachay.com'].name,
        employeeId: seededUsers['amit@prachay.com'].employeeId,
        employeeSignature: '/uploads/sample-employee-sig.png',
        status: 'Draft'
      }
    ];

    let createdVoucherCount = 0;
    let existingVoucherCount = 0;

    for (const voucherData of sampleVouchers) {
      const existing = await Voucher.findOne({ voucherNumber: voucherData.voucherNumber });
      if (!existing) {
        const newVoucher = new Voucher(voucherData);
        await newVoucher.save();
        createdVoucherCount++;
        console.log(`[Created Voucher] ${newVoucher.voucherNumber} - ${newVoucher.expenseTitle} (${newVoucher.employeeName})`);
      } else {
        existingVoucherCount++;
      }
    }

    console.log(`\nSample Vouchers: ${createdVoucherCount} created, ${existingVoucherCount} already existed (preserved).`);

    const totalVouchersInDb = await Voucher.countDocuments();
    const totalUsersInDb = await User.countDocuments();
    const totalEmployeesInDb = await User.countDocuments({ role: 'Employee' });

    console.log(`\n--- DATABASE STATE SUMMARY ---`);
    console.log(`Total Users:      ${totalUsersInDb} (${totalEmployeesInDb} Employees)`);
    console.log(`Total Vouchers:   ${totalVouchersInDb}`);
    console.log('-------------------------------\n');

    console.log('--- DEMONSTRATION CREDENTIALS ---');
    console.log('Password for all demo accounts: Password@123\n');
    console.log('1. Rahul Sharma (Finance):        rahul@prachay.com    [PSPL-EMP-1001]');
    console.log('2. Priya Patel (Human Resources): priya@prachay.com    [PSPL-EMP-1002]');
    console.log('3. Arjun Mehta (Technology):      arjun@prachay.com    [PSPL-EMP-1003]');
    console.log('4. Neha Desai (Marketing):        neha@prachay.com     [PSPL-EMP-1004]');
    console.log('5. Amit Verma (Operations):       amit@prachay.com     [PSPL-EMP-1005]');
    console.log('6. Director (Approvals):          director@prachay.com [PSPL-DIR-001]');
    console.log('7. Accounts Team (Read-only):     accounts@prachay.com [PSPL-ACC-005]');
    console.log('---------------------------------\n');

    await mongoose.connection.close();
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
