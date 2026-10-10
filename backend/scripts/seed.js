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
      {
        name: 'Rahul Sharma',
        email: 'employee@prachay.com',
        password: 'Password@123',
        role: 'Employee',
        employeeId: 'PSPL-EMP-1042'
      },
      {
        name: 'Ananya Deshmukh',
        email: 'director@prachay.com',
        password: 'Password@123',
        role: 'Director',
        employeeId: 'PSPL-DIR-001'
      },
      {
        name: 'Vikram Patel',
        email: 'accounts@prachay.com',
        password: 'Password@123',
        role: 'Accounts Team',
        employeeId: 'PSPL-ACC-005'
      }
    ];

    const seededUsers = {};

    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email.toLowerCase() });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`[Created User] ${user.name} (${user.role}) - ${user.email}`);
      } else {
        // Update user fields while preserving or resetting password cleanly
        user.name = userData.name;
        user.role = userData.role;
        user.employeeId = userData.employeeId;
        user.password = userData.password; // pre-save will rehash
        await user.save();
        console.log(`[Updated User] ${user.name} (${user.role}) - ${user.email}`);
      }
      seededUsers[userData.role] = user;
    }

    // Initialize or get counter for current year
    const currentYear = new Date().getFullYear();
    const counterId = `voucher_${currentYear}`;
    let counter = await Counter.findById(counterId);
    if (!counter) {
      counter = new Counter({ _id: counterId, seq: 0 });
      await counter.save();
      console.log(`[Counter] Initialized ${counterId}`);
    }

    // Seed initial demonstration vouchers if database has none
    const voucherCount = await Voucher.countDocuments();
    if (voucherCount === 0) {
      console.log('Seeding initial demonstration vouchers...');
      const employee = seededUsers['Employee'];
      const director = seededUsers['Director'];

      const sampleVouchers = [
        {
          voucherNumber: `EXP-${currentYear}-0001`,
          voucherDate: new Date(Date.now() - 7 * 86400000),
          expenseDate: new Date(Date.now() - 8 * 86400000),
          departmentName: 'Investment Banking',
          expenseTitle: 'Client Dinner at Taj Chambers',
          expenseCategory: 'Food',
          expenseDescription: 'Quarterly review dinner with key equity portfolio investors.',
          amount: 6850.00,
          employee: employee._id,
          employeeName: employee.name,
          employeeId: employee.employeeId,
          employeeSignature: '/uploads/sample-employee-sig.png',
          status: 'Approved',
          director: director._id,
          directorName: director.name,
          directorSignature: '/uploads/sample-director-sig.png',
          approvalDate: new Date(Date.now() - 6 * 86400000)
        },
        {
          voucherNumber: `EXP-${currentYear}-0002`,
          voucherDate: new Date(Date.now() - 3 * 86400000),
          expenseDate: new Date(Date.now() - 4 * 86400000),
          departmentName: 'Operations',
          expenseTitle: 'Mumbai to Delhi Flight - Annual Audit',
          expenseCategory: 'Travel',
          expenseDescription: 'Air travel for internal risk assessment and regulatory compliance.',
          amount: 14200.00,
          employee: employee._id,
          employeeName: employee.name,
          employeeId: employee.employeeId,
          employeeSignature: '/uploads/sample-employee-sig.png',
          status: 'Pending Approval'
        },
        {
          voucherNumber: `EXP-${currentYear}-0003`,
          voucherDate: new Date(Date.now() - 2 * 86400000),
          expenseDate: new Date(Date.now() - 2 * 86400000),
          departmentName: 'Research & Equity',
          expenseTitle: 'Annual Bloomberg Terminal Accessories',
          expenseCategory: 'Office Supplies',
          expenseDescription: 'Ergonomic input hardware and specialized dual-monitor cables.',
          amount: 3450.00,
          employee: employee._id,
          employeeName: employee.name,
          employeeId: employee.employeeId,
          employeeSignature: '/uploads/sample-employee-sig.png',
          status: 'Draft'
        },
        {
          voucherNumber: `EXP-${currentYear}-0004`,
          voucherDate: new Date(Date.now() - 5 * 86400000),
          expenseDate: new Date(Date.now() - 6 * 86400000),
          departmentName: 'Operations',
          expenseTitle: 'Executive Airport Taxi Reimbursement',
          expenseCategory: 'Transportation',
          expenseDescription: 'Private cab charges without proper GST receipt attachment.',
          amount: 2800.00,
          employee: employee._id,
          employeeName: employee.name,
          employeeId: employee.employeeId,
          employeeSignature: '/uploads/sample-employee-sig.png',
          status: 'Rejected',
          director: director._id,
          directorName: director.name,
          rejectionReason: 'Original tax invoice/receipt is missing. Please resubmit with compliant GST bill.'
        }
      ];

      await Voucher.insertMany(sampleVouchers);
      await Counter.findByIdAndUpdate(counterId, { seq: 4 });
      console.log('Sample vouchers seeded successfully.');
    } else {
      console.log(`Existing vouchers detected (${voucherCount} found). Preserving data.`);
    }

    console.log('\n--- DEMONSTRATION CREDENTIALS ---');
    console.log('Employee:     employee@prachay.com  / Password@123');
    console.log('Director:     director@prachay.com  / Password@123');
    console.log('Accounts Team: accounts@prachay.com  / Password@123');
    console.log('---------------------------------\n');

    await mongoose.connection.close();
    console.log('Database seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
