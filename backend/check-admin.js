const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    include: { profile: true }
  });
  
  console.log('ADMIN USERS COUNT:', admins.length);
  admins.forEach(a => {
    console.log('  - ID:', a.id, '| Email:', a.email, '| Role:', a.role, '| Profile name:', a.profile?.name || '(no profile)');
  });
  
  if (admins.length === 0) {
    console.log('\nNO ADMIN FOUND - Creating default admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@katsumboo.com',
        password: hashedPassword,
        role: 'ADMIN',
        profile: {
          create: { name: 'Admin Katsumboo' }
        }
      },
      include: { profile: true }
    });
    console.log('ADMIN CREATED - Email:', admin.email, '| Role:', admin.role, '| Name:', admin.profile?.name);
  } else {
    const admin = admins[0];
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('Password "admin123" valid for admin:', isValid);
    
    if (!isValid) {
      console.log('Resetting admin password to admin123...');
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash }
      });
      console.log('Password reset done!');
    }
  }
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
