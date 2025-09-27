import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating admin account with password...')

  const adminEmail = 'admin@prism.ai'
  const adminPassword = 'admin123'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('📝 Admin user already exists, updating password...')

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    // Update existing admin with password
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin password updated successfully!')
  } else {
    console.log('👤 Creating new admin user...')

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    // Create admin user with password
    await prisma.user.create({
      data: {
        id: 'admin_user_001',
        email: adminEmail,
        passwordHash,
        fullName: 'Admin User',
        role: 'ADMIN',
      }
    })

    console.log('✅ Admin user created successfully!')
  }

  console.log('')
  console.log('🔑 Admin Login Credentials:')
  console.log(`   📧 Email: ${adminEmail}`)
  console.log(`   🔒 Password: ${adminPassword}`)
  console.log('')
  console.log('⚠️  IMPORTANT: Please change this password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin account:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })