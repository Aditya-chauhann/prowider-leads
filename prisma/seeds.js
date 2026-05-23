const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/prowider',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const service1 = await prisma.service.upsert({
    where: { name: 'Service 1' },
    update: {},
    create: { name: 'Service 1' },
  })
  const service2 = await prisma.service.upsert({
    where: { name: 'Service 2' },
    update: {},
    create: { name: 'Service 2' },
  })
  const service3 = await prisma.service.upsert({
    where: { name: 'Service 3' },
    update: {},
    create: { name: 'Service 3' },
  })

  console.log('✅ Services created')

  for (let i = 1; i <= 8; i++) {
    await prisma.provider.upsert({
      where: { name: `Provider ${i}` },
      update: {},
      create: {
        name: `Provider ${i}`,
        monthlyQuota: 10,
        leadsReceived: 0,
        allocationIndex: 0,
      },
    })
  }

  console.log('✅ 8 Providers created')

  for (const service of [service1, service2, service3]) {
    await prisma.allocationState.upsert({
      where: { serviceId: service.id },
      update: {},
      create: { serviceId: service.id, nextIndex: 0 },
    })
  }

  console.log('✅ Allocation states created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })