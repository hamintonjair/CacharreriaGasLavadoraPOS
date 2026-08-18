import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// In-memory data store for fallback when database is offline or not configured
const defaultHash = bcrypt.hashSync('admin123', 10);
const sellerHash = bcrypt.hashSync('vendedor123', 10);

const inMemoryStore = {
  user: [
    { id: 1, nombre: 'Administrador', username: 'admin', password: defaultHash, role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, nombre: 'Vendedor Default', username: 'vendedor', password: sellerHash, role: 'VENDEDOR', createdAt: new Date(), updatedAt: new Date() }
  ],
  company: [
    { id: 1, name: 'Cacharrería Gas POS', tax_id: '123456789-0', address: 'Calle Principal #123', phone: '+593 2 123 4567', email: 'info@cacharreriagas.com', logo_url: null, createdAt: new Date(), updatedAt: new Date() }
  ],
  category: [
    { id: 1, nombre: 'Cacharrería General' },
    { id: 2, nombre: 'Gas' },
    { id: 3, nombre: 'Electrodomésticos' },
    { id: 4, nombre: 'Hogar' },
    { id: 5, nombre: 'Limpieza' }
  ],
  gasType: [
    { id: 1, nombre: 'Cilindro 10lb', stock_llenos: 100, stock_vacios: 20, precio_venta: 45000, precio_envase: 120000 },
    { id: 2, nombre: 'Cilindro 20lb', stock_llenos: 80, stock_vacios: 15, precio_venta: 75000, precio_envase: 180000 },
    { id: 3, nombre: 'Cilindro 40lb', stock_llenos: 50, stock_vacios: 10, precio_venta: 150000, precio_envase: 250000 },
    { id: 4, nombre: 'Balón 5lb', stock_llenos: 30, stock_vacios: 5, precio_venta: 25000, precio_envase: 60000 }
  ],
  product: [
    { id: 1, nombre: 'Detergente 1L', codigo_barras: '770000000001', precio_venta: 8500, costo: 6000, taxRate: 0.19, stock: 30, stock_minimo: 5, categoryId: 1 },
    { id: 2, nombre: 'Jabón en barra', codigo_barras: '770000000002', precio_venta: 2500, costo: 1500, taxRate: 0.19, stock: 100, stock_minimo: 10, categoryId: 1 },
    { id: 3, nombre: 'Escoba Reforzada', codigo_barras: '770000000003', precio_venta: 12000, costo: 8000, taxRate: 0, stock: 20, stock_minimo: 3, categoryId: 1 },
    { id: 4, nombre: 'Trapeador Microfibra', codigo_barras: '770000000004', precio_venta: 14000, costo: 9000, taxRate: 0, stock: 15, stock_minimo: 3, categoryId: 1 },
    { id: 5, nombre: 'Olla de Aluminio 2L', codigo_barras: '770000000005', precio_venta: 25000, costo: 15000, taxRate: 0.19, stock: 10, stock_minimo: 5, categoryId: 1 },
    { id: 6, nombre: 'Sartén Antiadherente 24cm', codigo_barras: '770000000006', precio_venta: 35000, costo: 20000, taxRate: 0.19, stock: 8, stock_minimo: 3, categoryId: 1 }
  ],
  client: [
    { id: 1, nombre: 'Cliente Genérico', identificacion: '222222222222', telefono: '3000000000', direccion: 'Mostrador', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, nombre: 'María González', identificacion: '1020304050', telefono: '3101234567', direccion: 'Calle 10 # 5-20', createdAt: new Date(), updatedAt: new Date() },
    { id: 3, nombre: 'Carlos Rodríguez', identificacion: '9876543210', telefono: '3159876543', direccion: 'Carrera 15 # 8-40', createdAt: new Date(), updatedAt: new Date() }
  ],
  washingMachine: [
    { id: 1, description: 'Lavadora Samsung 8kg', pricePerHour: 5500, initialQuantity: 3, availableQuantity: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, description: 'Lavadora LG 10kg', pricePerHour: 8000, initialQuantity: 2, availableQuantity: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, description: 'Lavadora Whirlpool 7kg', pricePerHour: 4500, initialQuantity: 2, availableQuantity: 2, createdAt: new Date(), updatedAt: new Date() }
  ],
  sale: [],
  saleItem: [],
  payment: [],
  rental: [],
  creditInstallment: []
};

let autoInc = 100;

function matchesCondition(item, key, val) {
  if (val === undefined) return true;
  if (key === 'OR' && Array.isArray(val)) {
    return val.length === 0 || val.some(cond => matchesWhere(item, cond));
  }
  if (key === 'AND' && Array.isArray(val)) {
    return val.every(cond => matchesWhere(item, cond));
  }
  if (key === 'NOT') {
    return !matchesWhere(item, val);
  }
  if (typeof val === 'object' && val !== null) {
    if (val.contains !== undefined) {
      return String(item[key] || '').toLowerCase().includes(String(val.contains).toLowerCase());
    }
    if (val.equals !== undefined) return item[key] === val.equals;
    if (val.gte !== undefined) return item[key] >= val.gte;
    if (val.lte !== undefined) return item[key] <= val.lte;
    if (val.gt !== undefined) return item[key] > val.gt;
    if (val.lt !== undefined) return item[key] < val.lt;
    if (val.in && Array.isArray(val.in)) return val.in.includes(item[key]);
  }
  return item[key] === val;
}

function matchesWhere(item, where) {
  if (!where || Object.keys(where).length === 0) return true;
  return Object.entries(where).every(([k, v]) => matchesCondition(item, k, v));
}

function applyDataUpdate(target, data) {
  const updated = { ...target };
  for (const [k, v] of Object.entries(data || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      if (typeof v.increment === 'number') {
        updated[k] = (Number(target[k]) || 0) + v.increment;
      } else if (typeof v.decrement === 'number') {
        updated[k] = Math.max(0, (Number(target[k]) || 0) - v.decrement);
      } else if (typeof v.set !== 'undefined') {
        updated[k] = v.set;
      } else {
        updated[k] = v;
      }
    } else {
      updated[k] = v;
    }
  }
  return updated;
}

function resolveIncludes(item, includeObj) {
  if (!item || !includeObj) return item;
  const result = { ...item };
  for (const [relKey, relConfig] of Object.entries(includeObj)) {
    if (!relConfig) continue;
    if (relKey === 'washingMachine' && item.washingMachineId) {
      const machine = inMemoryStore.washingMachine.find(m => m.id === item.washingMachineId);
      result.washingMachine = machine ? { ...machine } : null;
    } else if (relKey === 'client' && item.clientId) {
      const client = inMemoryStore.client.find(c => c.id === item.clientId);
      result.client = client ? { ...client } : null;
    } else if (relKey === 'user' && item.userId) {
      const user = inMemoryStore.user.find(u => u.id === item.userId);
      result.user = user ? { ...user } : null;
    } else if (relKey === 'category' && item.categoryId) {
      const cat = inMemoryStore.category.find(c => c.id === item.categoryId);
      result.category = cat ? { ...cat } : null;
    }
  }
  return result;
}

function createMockModel(modelName) {
  if (!inMemoryStore[modelName]) {
    inMemoryStore[modelName] = [];
  }
  const list = inMemoryStore[modelName];

  return {
    findMany: async (args = {}) => {
      let result = [...list];
      if (args.where) {
        result = result.filter(item => matchesWhere(item, args.where));
      }
      if (args.orderBy) {
        const orderKey = Object.keys(args.orderBy)[0];
        const dir = args.orderBy[orderKey] === 'desc' ? -1 : 1;
        result.sort((a, b) => (a[orderKey] > b[orderKey] ? dir : -dir));
      }
      if (args.skip || args.take) {
        const start = args.skip || 0;
        const end = args.take ? start + args.take : undefined;
        result = result.slice(start, end);
      }
      if (args.include) {
        result = result.map(item => resolveIncludes(item, args.include));
      }
      return JSON.parse(JSON.stringify(result));
    },
    findUnique: async (args = {}) => {
      const where = args.where || {};
      const found = list.find(item => matchesWhere(item, where));
      if (!found) return null;
      let res = found;
      if (args.include) {
        res = resolveIncludes(res, args.include);
      }
      return JSON.parse(JSON.stringify(res));
    },
    findFirst: async (args = {}) => {
      const where = args.where || {};
      const found = list.find(item => matchesWhere(item, where));
      if (!found) return null;
      let res = found;
      if (args.include) {
        res = resolveIncludes(res, args.include);
      }
      return JSON.parse(JSON.stringify(res));
    },
    create: async (args = {}) => {
      const newItem = {
        id: ++autoInc,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data
      };
      list.push(newItem);
      let res = newItem;
      if (args.include) {
        res = resolveIncludes(res, args.include);
      }
      return JSON.parse(JSON.stringify(res));
    },
    createMany: async (args = {}) => {
      const created = (args.data || []).map(d => {
        const item = { id: ++autoInc, createdAt: new Date(), updatedAt: new Date(), ...d };
        list.push(item);
        return item;
      });
      return { count: created.length };
    },
    update: async (args = {}) => {
      const where = args.where || {};
      const idx = list.findIndex(item => matchesWhere(item, where));
      if (idx !== -1) {
        list[idx] = { ...applyDataUpdate(list[idx], args.data), updatedAt: new Date() };
        let res = list[idx];
        if (args.include) {
          res = resolveIncludes(res, args.include);
        }
        return JSON.parse(JSON.stringify(res));
      }
      return args.data || {};
    },
    updateMany: async (args = {}) => {
      let count = 0;
      list.forEach((item, idx) => {
        if (matchesWhere(item, args.where || {})) {
          list[idx] = { ...applyDataUpdate(list[idx], args.data), updatedAt: new Date() };
          count++;
        }
      });
      return { count };
    },
    upsert: async (args = {}) => {
      const where = args.where || {};
      const idx = list.findIndex(item => matchesWhere(item, where));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...(args.update || {}), updatedAt: new Date() };
        return JSON.parse(JSON.stringify(list[idx]));
      } else {
        const newItem = { id: ++autoInc, createdAt: new Date(), updatedAt: new Date(), ...(args.create || {}) };
        list.push(newItem);
        return JSON.parse(JSON.stringify(newItem));
      }
    },
    delete: async (args = {}) => {
      const where = args.where || {};
      const idx = list.findIndex(item => matchesWhere(item, where));
      if (idx !== -1) {
        const removed = list.splice(idx, 1)[0];
        return JSON.parse(JSON.stringify(removed));
      }
      return {};
    },
    deleteMany: async (args = {}) => {
      let count = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (matchesWhere(list[i], args.where || {})) {
          list.splice(i, 1);
          count++;
        }
      }
      return { count };
    },
    count: async (args = {}) => {
      if (args.where) {
        return list.filter(item => matchesWhere(item, args.where)).length;
      }
      return list.length;
    },
    aggregate: async (args = {}) => {
      return { _sum: { total: 0, amount: 0 }, _count: list.length };
    }
  };
}

let realPrisma = null;
const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

if (hasDbUrl) {
  try {
    realPrisma = new PrismaClient();
  } catch (err) {
    console.warn('[AI Studio] PrismaClient initialization warning, using in-memory mock fallback');
  }
}

export const prisma = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '$transaction') {
      return async (cbOrArr) => {
        if (Array.isArray(cbOrArr)) return Promise.all(cbOrArr);
        if (typeof cbOrArr === 'function') return cbOrArr(prisma);
        return [];
      };
    }
    if (prop === '$disconnect' || prop === '$connect') {
      return async () => {};
    }
    if (prop === '$queryRaw' || prop === '$executeRaw') {
      return async () => [];
    }

    if (realPrisma && realPrisma[prop]) {
      const realModel = realPrisma[prop];
      // Wrap methods to catch database disconnect errors and fall back gracefully
      return new Proxy(realModel, {
        get: (mTarget, method) => {
          if (typeof mTarget[method] === 'function') {
            return async (...args) => {
              try {
                return await mTarget[method](...args);
              } catch (dbErr) {
                console.warn(`[AI Studio DB Fallback] ${String(prop)}.${String(method)} failed (${dbErr.message}), falling back to in-memory store`);
                const mockModel = createMockModel(String(prop));
                if (typeof mockModel[method] === 'function') {
                  return await mockModel[method](...args);
                }
                return null;
              }
            };
          }
          return mTarget[method];
        }
      });
    }

    return createMockModel(String(prop));
  }
});

export default prisma;
