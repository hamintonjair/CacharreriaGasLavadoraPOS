import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 El seeder ha sido desactivado. No se insertarán datos por defecto.')
  
  /*
  // --- CÓDIGO COMENTADO PARA EVITAR QUE SE CREEN REGISTROS POR DEFECTO ---

  // 1. Usuarios
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nombre: 'Administrador',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const vendedorPassword = await bcrypt.hash('vendedor123', 10)
  const vendedorUser = await prisma.user.upsert({
    where: { username: 'vendedor' },
    update: {},
    create: {
      nombre: 'Vendedor Demo',
      username: 'vendedor',
      password: vendedorPassword,
      role: 'VENDEDOR',
    },
  })
  console.log('✅ Usuarios creados')

  // 2. Cliente Genérico
  const genericClient = await prisma.client.upsert({
    where: { identificacion: '2222222222' },
    update: {},
    create: {
      nombre: 'Cliente Genérico',
      identificacion: '2222222222',
      telefono: '0000000000',
    },
  })
  console.log('✅ Cliente genérico creado')

  // 3. Categorías
  const catCacharreria = await prisma.category.upsert({
    where: { nombre: 'CACHARRERIA' },
    update: {},
    create: { nombre: 'CACHARRERIA' },
  })
  
  const catElectro = await prisma.category.upsert({
    where: { nombre: 'ELECTRODOMESTICOS' },
    update: {},
    create: { nombre: 'ELECTRODOMESTICOS' },
  })
  console.log('✅ Categorías creadas')

  // 4. Tipos de Gas
  const gas10 = await prisma.gasType.upsert({
    where: { nombre: 'Cilindro 10lb' },
    update: {},
    create: {
      nombre: 'Cilindro 10lb',
      stock_llenos: 20,
      stock_vacios: 5,
      precio_venta: 25000,
      precio_envase: 120000
    },
  })
  
  const gas40 = await prisma.gasType.upsert({
    where: { nombre: 'Cilindro 40lb' },
    update: {},
    create: {
      nombre: 'Cilindro 40lb',
      stock_llenos: 15,
      stock_vacios: 3,
      precio_venta: 85000,
      precio_envase: 150000
    },
  })

  const gas100 = await prisma.gasType.upsert({
    where: { nombre: 'Cilindro 100lb' },
    update: {},
    create: {
      nombre: 'Cilindro 100lb',
      stock_llenos: 5,
      stock_vacios: 1,
      precio_venta: 210000,
      precio_envase: 280000
    },
  })
  console.log('✅ Tipos de Gas creados')

  // 5. Productos de ejemplo
  const prod1 = await prisma.product.upsert({
    where: { codigo_barras: 'PROD-001' },
    update: {},
    create: {
      nombre: 'Escoba multiusos',
      codigo_barras: 'PROD-001',
      precio_venta: 12000,
      costo: 8000,
      stock: 50,
      stock_minimo: 10,
      categoryId: catCacharreria.id
    },
  })
  
  const prod2 = await prisma.product.upsert({
    where: { codigo_barras: 'PROD-002' },
    update: {},
    create: {
      nombre: 'Trapeador de algodón',
      codigo_barras: 'PROD-002',
      precio_venta: 15000,
      costo: 10000,
      stock: 40,
      stock_minimo: 10,
      categoryId: catCacharreria.id
    },
  })

  console.log('✅ Productos creados')
  console.log('🌱 Base de datos poblada exitosamente.')
  */
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeder:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
