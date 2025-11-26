// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting clean seed...');

  // Hapus semua data lama agar konsisten
  await prisma.$transaction([
    prisma.salesItem.deleteMany(),
    prisma.salesTransaction.deleteMany(),
    prisma.purchaseTransaction.deleteMany(),
    prisma.productRecipe.deleteMany(),
    prisma.rawMaterial.deleteMany(),
    prisma.product.deleteMany(),
    prisma.shift.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.user.deleteMany(),
    prisma.employee.deleteMany(),
  ]);

  // === 1️⃣ USERS & EMPLOYEES ===
  console.log('👥 Creating employees & users...');
  const hashedOwnerPassword = await bcrypt.hash('owner123', 10);
  const hashedKaryawanPassword = await bcrypt.hash('karyawan123', 10);

  const employees = await prisma.employee.createManyAndReturn({
    data: [
      { name: 'Siti Nurhaliza', birthDate: new Date('1990-03-20'), address: 'Jl. Kaliurang KM 5', gender: 'P', phone: '082345678901', position: 'Owner', photoUrl: null },
      { name: 'Ahmad Rizki', birthDate: new Date('1998-05-15'), address: 'Jl. Malioboro', gender: 'L', phone: '081234567890', position: 'Kasir', photoUrl: null },
      { name: 'Budi Santoso', birthDate: new Date('1995-01-10'), address: 'Jl. Magelang No.45', gender: 'L', phone: '081222334455', position: 'Barista', photoUrl: null },
      { name: 'Dwi Laras', birthDate: new Date('1999-08-25'), address: 'Jl. Solo KM 10', gender: 'P', phone: '081777889900', position: 'Koki', photoUrl: null },
      { name: 'Lina Aprilia', birthDate: new Date('1997-11-03'), address: 'Jl. Wonosari No.7', gender: 'P', phone: '081667788990', position: 'Staff Gudang', photoUrl: null },
    ],
  });

  const [owner, kasir, barista, koki, gudang] = employees;

  await prisma.user.createMany({
    data: [
      { username: 'owner', password: hashedOwnerPassword, role: 'OWNER', employeeId: owner.id },
      { username: 'karyawan', password: hashedKaryawanPassword, role: 'KARYAWAN', employeeId: kasir.id },
      { username: 'barista', password: hashedKaryawanPassword, role: 'KARYAWAN', employeeId: barista.id },
      { username: 'koki', password: hashedKaryawanPassword, role: 'KARYAWAN', employeeId: koki.id },
      { username: 'gudang', password: hashedKaryawanPassword, role: 'KARYAWAN', employeeId: gudang.id },
    ],
  });

  // === 2️⃣ SHIFTS ===
  const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const makeShift = async (emp, time) => {
    for (const day of days) {
      await prisma.shift.create({
        data: {
          employeeId: emp.id,
          dayOfWeek: day,
          shiftTime: time,
          isActive: true,
        },
      });
    }
  };

  await makeShift(owner, '17:00 - 00:00');
  await makeShift(kasir, '07:00 - 17:00');
  await makeShift(barista, '07:00 - 17:00');
  await makeShift(koki, '08:00 - 16:00');
  await makeShift(gudang, '09:00 - 17:00');

  // === 3️⃣ RAW MATERIALS ===
  console.log('📦 Creating raw materials...');
  const materials = await prisma.rawMaterial.createManyAndReturn({
    data: [
      { name: 'Teh Bubuk', category: 'Bahan Minuman', stock: 20, unit: 'kg' },
      { name: 'Susu Kental Manis', category: 'Bahan Minuman', stock: 20, unit: 'kaleng' },
      { name: 'Susu Bubuk', category: 'Bahan Minuman', stock: 10, unit: 'kg' },
      { name: 'Gula Pasir', category: 'Bahan Umum', stock: 50, unit: 'kg' },
      { name: 'Daun Teh', category: 'Bahan Minuman', stock: 15, unit: 'kg' },
      { name: 'Kopi Bubuk', category: 'Bahan Minuman', stock: 10, unit: 'kg' },
      { name: 'Matcha Powder', category: 'Bahan Minuman', stock: 5, unit: 'kg' },
      { name: 'Coklat Bubuk', category: 'Bahan Minuman', stock: 5, unit: 'kg' },
      { name: 'Beras', category: 'Bahan Makanan', stock: 50, unit: 'kg' },
      { name: 'Mie', category: 'Bahan Makanan', stock: 40, unit: 'bungkus' },
      { name: 'Telur', category: 'Bahan Makanan', stock: 120, unit: 'butir' },
      { name: 'Ayam', category: 'Bahan Makanan', stock: 30, unit: 'kg' },
      { name: 'Tepung Terigu', category: 'Bahan Snack', stock: 25, unit: 'kg' },
      { name: 'Singkong', category: 'Bahan Snack', stock: 20, unit: 'kg' },
      { name: 'Cup Plastik', category: 'Kemasan', stock: 300, unit: 'pcs' },
    ],
  });

  const findMat = (name) => materials.find((m) => m.name === name).id;

  // === 4️⃣ PRODUCTS ===
  console.log('🍹 Creating 15 products...');
  const products = await prisma.product.createManyAndReturn({
    data: [
      { name: 'Teh Tarik Original', price: 15000, stock: 50, category: 'TEH_TARIK', photoUrl: '' },
      { name: 'Thai Tea', price: 16000, stock: 40, category: 'TEH_TARIK', photoUrl: '' },
      { name: 'Thai Green Tea', price: 17000, stock: 30, category: 'TEH_TARIK', photoUrl: '' },
      { name: 'Es Teh Manis', price: 5000, stock: 60, category: 'MINUMAN_LAIN', photoUrl: '' },
      { name: 'Jus Jeruk', price: 12000, stock: 40, category: 'MINUMAN_LAIN', photoUrl: '' },
      { name: 'Kopi Susu', price: 15000, stock: 50, category: 'MINUMAN_LAIN', photoUrl: '' },
      { name: 'Matcha Latte', price: 18000, stock: 30, category: 'MINUMAN_LAIN', photoUrl: '' },
      { name: 'Nasi Goreng Spesial', price: 25000, stock: 25, category: 'MAKANAN', photoUrl: '' },
      { name: 'Mie Goreng', price: 20000, stock: 30, category: 'MAKANAN', photoUrl: '' },
      { name: 'Ayam Geprek', price: 22000, stock: 25, category: 'MAKANAN', photoUrl: '' },
      { name: 'Nasi Ayam Teriyaki', price: 27000, stock: 20, category: 'MAKANAN', photoUrl: '' },
      { name: 'Keripik Singkong', price: 10000, stock: 80, category: 'SNACK', photoUrl: '' },
      { name: 'Kerupuk Udang', price: 8000, stock: 70, category: 'SNACK', photoUrl: '' },
      { name: 'Roti Bakar', price: 12000, stock: 40, category: 'SNACK', photoUrl: '' },
      { name: 'Donat Mini', price: 10000, stock: 50, category: 'SNACK', photoUrl: '' },
    ],
  });

  // === 5️⃣ PRODUCT RECIPES ===
  console.log('🧾 Linking recipes...');
  const allProducts = await prisma.product.findMany();
  const findProd = (name) => allProducts.find((p) => p.name === name).id;

  const recipes = [
    { p: 'Teh Tarik Original', r: 'Teh Bubuk', q: 0.05 },
    { p: 'Teh Tarik Original', r: 'Susu Kental Manis', q: 0.02 },
    { p: 'Thai Tea', r: 'Daun Teh', q: 0.04 },
    { p: 'Thai Green Tea', r: 'Matcha Powder', q: 0.03 },
    { p: 'Kopi Susu', r: 'Kopi Bubuk', q: 0.03 },
    { p: 'Nasi Goreng Spesial', r: 'Beras', q: 0.15 },
    { p: 'Nasi Goreng Spesial', r: 'Telur', q: 1 },
    { p: 'Ayam Geprek', r: 'Ayam', q: 0.2 },
    { p: 'Mie Goreng', r: 'Mie', q: 1 },
    { p: 'Keripik Singkong', r: 'Singkong', q: 0.1 },
    { p: 'Roti Bakar', r: 'Tepung Terigu', q: 0.05 },
    { p: 'Donat Mini', r: 'Tepung Terigu', q: 0.04 },
  ];

  for (const r of recipes) {
    await prisma.productRecipe.create({
      data: {
        productId: findProd(r.p),
        rawMaterialId: findMat(r.r),
        quantityNeeded: r.q,
      },
    });
  }

  // === 6️⃣ SAMPLE TRANSACTIONS ===
  console.log('💰 Creating transactions...');
  const users = await prisma.user.findMany();
  const userIds = users.map((u) => u.id);

  // Sales
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    const prod = products[Math.floor(Math.random() * products.length)];

    const sale = await prisma.salesTransaction.create({
      data: {
        transactionDate: date,
        paymentMethod: ['CASH', 'DEBIT', 'EWALLET'][Math.floor(Math.random() * 3)],
        totalAmount: prod.price * 2,
        createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      },
    });

    await prisma.salesItem.create({
      data: {
        salesTransactionId: sale.id,
        productId: prod.id,
        productName: prod.name,
        quantity: 2,
        price: prod.price,
        subtotal: prod.price * 2,
      },
    });
  }

  // Purchases
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    const mat = materials[Math.floor(Math.random() * materials.length)];

    await prisma.purchaseTransaction.create({
      data: {
        transactionDate: date,
        itemName: mat.name,
        quantity: Math.floor(Math.random() * 10) + 1,
        category: mat.category,
        totalAmount: Math.floor(Math.random() * 200000) + 100000,
        createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
