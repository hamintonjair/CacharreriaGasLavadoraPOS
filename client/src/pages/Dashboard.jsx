import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Flame,
  AlertTriangle,
  CreditCard,
  Calendar,
  RefreshCw,
  Clock,
  Package,
  CheckCircle2,
  Percent
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Filler
);

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Format currency in Colombian Pesos
const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
};

export default function Dashboard() {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  // Core States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Data States
  const [summary, setSummary] = useState(null);
  const [stockData, setStockData] = useState({ products: [], gasTypes: [] });
  const [debtsStats, setDebtsStats] = useState({ totalDebt: 0, pendingSales: 0 });
  const [reminders, setReminders] = useState([]);
  const [machinesData, setMachinesData] = useState({ total: 0, available: 0, rented: 0 });
  const [overdueRentalsCount, setOverdueRentalsCount] = useState(0);

  // Date Filter Range States (defaults to today)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('today');

  // Helpers to calculate preset dates (in YYYY-MM-DD local format)
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set date presets
  const applyPreset = (preset) => {
    const now = new Date();
    setActivePreset(preset);

    if (preset === 'today') {
      const todayStr = getLocalDateString(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const yStr = getLocalDateString(yesterday);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(now.getDate() - 6);
      setStartDate(getLocalDateString(past));
      setEndDate(getLocalDateString(now));
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getLocalDateString(firstDay));
      setEndDate(getLocalDateString(now));
    }
  };

  // Initialize dates on mount
  useEffect(() => {
    applyPreset('today');
  }, []);

  // Fetch all dashboard metrics
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!isAdmin || !token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Query params for sales summary
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      // Execute queries in parallel
      const [
        summaryRes,
        stockRes,
        debtsRes,
        remindersRes,
        machinesRes,
        overdueRentalsRes
      ] = await Promise.allSettled([
        fetch(`${API_URL}/reports/summary?${params}`, { headers }),
        fetch(`${API_URL}/reports/current-stock`, { headers }),
        fetch(`${API_URL}/sales/pending-payments`, { headers }),
        fetch(`${API_URL}/reminders`, { headers }),
        fetch(`${API_URL}/washing-machines?page=1&limit=100`, { headers }),
        fetch(`${API_URL}/rentals/overdue`, { headers })
      ]);

      // 1. Process Sales Summary
      if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
        const data = await summaryRes.value.json();
        setSummary(data);
      }

      // 2. Process Stock & Gas
      if (stockRes.status === 'fulfilled' && stockRes.value.ok) {
        const data = await stockRes.value.json();
        setStockData(data);
      }

      // 3. Process Accounts Receivable Stats
      if (debtsRes.status === 'fulfilled' && debtsRes.value.ok) {
        const data = await debtsRes.value.json();
        const stats = data.stats || {};
        const count = stats.totalSales != null ? stats.totalSales : (Array.isArray(data.data) ? data.data.length : 0);
        setDebtsStats({
          totalDebt: Number(stats.totalDebt) || 0,
          pendingSales: count,
          pendingInstallments: Number(stats.pendingInstallments) || 0,
        });
      }

      // 4. Process Credit Reminders
      if (remindersRes.status === 'fulfilled' && remindersRes.value.ok) {
        const data = await remindersRes.value.json();
        setReminders(Array.isArray(data) ? data : []);
      }

      // 5. Process Washing Machines Stats
      if (machinesRes.status === 'fulfilled' && machinesRes.value.ok) {
        const data = await machinesRes.value.json();
        const machines = data.data || data.machines || (Array.isArray(data) ? data : []);
        const total = machines.reduce((acc, m) => acc + (Number(m.initialQuantity) || 0), 0);
        const available = machines.reduce((acc, m) => acc + (Number(m.availableQuantity) || 0), 0);
        const rented = Math.max(0, total - available);
        setMachinesData({ total, available, rented });
      }

      // 6. Process Overdue Rentals
      if (overdueRentalsRes.status === 'fulfilled' && overdueRentalsRes.value.ok) {
        const data = await overdueRentalsRes.value.json();
        setOverdueRentalsCount(data.count || 0);
      }

    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Error al cargar algunas estadísticas del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, token, startDate, endDate]);

  // Load when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardData();
    }
  }, [startDate, endDate, fetchDashboardData]);

  // ===================== CHARTS CONFIGURATION =====================

  // 1. Gas Cylinders Stock (Filled vs Empty)
  const gasStockChartData = useMemo(() => {
    if (!stockData.gasTypes?.length) return null;
    return {
      labels: stockData.gasTypes.map(g => g.nombre),
      datasets: [
        {
          label: 'Llenos (Disponibles)',
          data: stockData.gasTypes.map(g => Number(g.stock_llenos) || 0),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderRadius: 6,
        },
        {
          label: 'Vacíos (Para Recarga)',
          data: stockData.gasTypes.map(g => Number(g.stock_vacios) || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderRadius: 6,
        }
      ]
    };
  }, [stockData.gasTypes]);

  // 2. Sales by Payment Method
  const paymentMethodChartData = useMemo(() => {
    if (!summary?.paymentMethods || Object.keys(summary.paymentMethods).length === 0) return null;
    const labels = Object.keys(summary.paymentMethods);
    const data = Object.values(summary.paymentMethods);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#3B82F6', // Blue
            '#10B981', // Emerald
            '#F59E0B', // Amber
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#6366F1', // Indigo
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        }
      ]
    };
  }, [summary?.paymentMethods]);

  // 3. Daily Sales Trend
  const dailySalesChartData = useMemo(() => {
    if (!summary?.dailySales || summary.dailySales.length === 0) return null;
    
    // Sort chronologically
    const sorted = [...summary.dailySales].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sorted.map(d => {
        const parts = d.date.split('-');
        return `${parts[2]}/${parts[1]}`;
      }),
      datasets: [
        {
          label: 'Monto Total ($)',
          data: sorted.map(d => d.total || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: '#2563EB',
          borderRadius: 6,
          yAxisID: 'y',
        }
      ]
    };
  }, [summary?.dailySales]);

  // 4. Sales Distribution: Gas vs. Cacharrería General
  const categorySplitChartData = useMemo(() => {
    const gas = Number(summary?.totalVentasGas) || 0;
    const cacharreria = Number(summary?.totalVentasCacharreria) || 0;
    if (gas === 0 && cacharreria === 0) return null;

    return {
      labels: ['Cilindros de Gas', 'Cacharrería / Varios'],
      datasets: [
        {
          data: [gas, cacharreria],
          backgroundColor: ['#0284C7', '#F97316'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }
      ]
    };
  }, [summary?.totalVentasGas, summary?.totalVentasCacharreria]);

  // 5. Sales by Seller / Cashier
  const sellerChartData = useMemo(() => {
    if (!summary?.ventasPorVendedor || Object.keys(summary.ventasPorVendedor).length === 0) return null;
    const entries = Object.entries(summary.ventasPorVendedor);

    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          label: 'Total Vendido',
          data: entries.map(([, val]) => val.total || 0),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderRadius: 6,
        }
      ]
    };
  }, [summary?.ventasPorVendedor]);

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="p-6 border border-red-200 bg-red-50 rounded-2xl text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-800">Acceso Restringido</h2>
          <p className="text-sm text-red-600 mt-1">
            Solo los administradores tienen autorización para consultar el dashboard financiero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* ================= HEADER & DATE SELECTORS ================= */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Panel de Control y Estadísticas
              </h1>
              {refreshing && (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Visión general en tiempo real de ventas, inventario, alquileres y cartera
            </p>
          </div>

          {/* Date Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Quick Presets */}
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activePreset === 'today'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => applyPreset('yesterday')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activePreset === 'yesterday'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => applyPreset('7days')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activePreset === '7days'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                7 Días
              </button>
              <button
                type="button"
                onClick={() => applyPreset('month')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activePreset === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Este Mes
              </button>
            </div>

            {/* Custom Dates Inputs */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset('custom');
                }}
                style={{ colorScheme: 'dark' }}
                className="h-8 px-2 border rounded-lg text-xs bg-[#3B3B3B] text-white dark-date-input"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset('custom');
                }}
                style={{ colorScheme: 'dark' }}
                className="h-8 px-2 border rounded-lg text-xs bg-[#3B3B3B] text-white dark-date-input"
              />
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                title="Actualizar datos"
                className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= PRIMARY KPI METRICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* Total Sales */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ventas del Período
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {summary?.totalSales != null ? formatCOP(summary.totalSales) : '$ 0'}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {summary?.cantidadVentas || 0} transacciones
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Items Sold */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Artículos Vendidos
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {(summary?.totalItems || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ticket promedio: {formatCOP(summary?.averageSale || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Accounts Receivable */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cartera por Cobrar
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-orange-600 mt-1">
                {formatCOP(debtsStats.totalDebt || 0)}
              </h3>
              <p className="text-xs text-orange-700 font-medium mt-0.5">
                {debtsStats.pendingSales || 0} créditos ({debtsStats.pendingInstallments || 0} cuotas pendientes)
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Washing Machines in Use */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lavadoras Alquiladas
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-900 mt-1">
                {machinesData.rented} <span className="text-xs text-gray-400 font-normal">/ {machinesData.total} total</span>
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {machinesData.available} disponibles ahora
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* ================= REVENUE BREAKDOWN & SECONDARY METRICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Gas Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Ventas de Gas</span>
              <Flame className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCOP(summary?.totalVentasGas || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Envases recibidos en devolución: <strong className="text-gray-800">{summary?.totalEnvasesRecibidos || 0}</strong>
            </p>
          </div>

          {/* Cacharrería Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Ventas Cacharrería</span>
              <Package className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCOP(summary?.totalVentasCacharreria || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Clientes únicos atendidos: <strong className="text-gray-800">{summary?.totalCustomers || 0}</strong>
            </p>
          </div>

          {/* Alerts Card */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Alertas Activas</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                {stockData.products?.length || 0} stock bajo
              </div>
              <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                {reminders.length} cuotas por vencer
              </div>
            </div>
            {overdueRentalsCount > 0 && (
              <p className="text-xs text-red-600 font-medium mt-1">
                ⚠️ {overdueRentalsCount} lavadoras con devolución atrasada
              </p>
            )}
          </div>

        </div>

        {/* ================= MAIN STATISTICAL CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Daily Sales Bar Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  📈 Evolución Diaria de Ventas
                </h3>
                <p className="text-xs text-gray-500">Monto total facturado por día en el período seleccionado</p>
              </div>
            </div>
            <div className="h-64 sm:h-72">
              {dailySalesChartData ? (
                <Bar 
                  data={dailySalesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Total: ${formatCOP(context.raw)}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => `$${(val / 1000).toFixed(0)}k`
                        },
                        grid: { color: 'rgba(0,0,0,0.04)' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                  <Calendar className="w-8 h-8 mb-1 text-gray-300" />
                  No hay ventas registradas en el período seleccionado
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Doughnut (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
              💳 Métodos de Pago
            </h3>
            <p className="text-xs text-gray-500 mb-3">Distribución de ingresos por tipo de pago</p>
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
              {paymentMethodChartData ? (
                <div className="w-full h-56">
                  <Doughnut 
                    data={paymentMethodChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` ${context.label}: ${formatCOP(context.raw)}`
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400 text-xs py-8">
                  Sin registros de pagos en el rango
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ================= SECONDARY CHARTS (GAS STOCK & DISTRIBUTION) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Gas Stock Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Inventario de Cilindros de Gas
                </h3>
                <p className="text-xs text-gray-500">Cilindros llenos disponibles vs. cilindros vacíos en bodega</p>
              </div>
            </div>
            <div className="h-64 sm:h-72">
              {gasStockChartData ? (
                <Bar 
                  data={gasStockChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 5 },
                        grid: { color: 'rgba(0,0,0,0.04)' }
                      },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  No hay datos de inventario de gas
                </div>
              )}
            </div>
          </div>

          {/* Category Split (5 cols) */}
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
              ⚖️ Proporción de Facturación
            </h3>
            <p className="text-xs text-gray-500 mb-3">Gas vs. Cacharrería General</p>
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
              {categorySplitChartData ? (
                <div className="w-full h-56">
                  <Pie 
                    data={categorySplitChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                        tooltip: {
                          callbacks: {
                            label: (context) => ` ${context.label}: ${formatCOP(context.raw)}`
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400 text-xs py-8">
                  Sin datos de facturación para comparar
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ================= ALERTS & CRITICAL OPERATIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Low Stock Alerts */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Productos con Stock Bajo o Crítico
              </h3>
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {stockData.products?.length || 0} productos
              </span>
            </div>

            {stockData.products && stockData.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="pb-2 font-semibold">Producto</th>
                      <th className="pb-2 font-semibold text-center">Stock Actual</th>
                      <th className="pb-2 font-semibold text-center">Mínimo</th>
                      <th className="pb-2 font-semibold text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockData.products.slice(0, 6).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900 truncate max-w-[180px]">
                          {item.nombre}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                            {item.stock}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-gray-500">
                          {item.stock_minimo}
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-800">
                          {formatCOP(item.precio_venta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                ¡Inventario al día! No hay productos por debajo del stock mínimo.
              </div>
            )}
          </div>

          {/* Credit Reminders / Next Due Dates */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Próximos Vencimientos de Crédito
              </h3>
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {reminders.length} cuotas
              </span>
            </div>

            {reminders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="pb-2 font-semibold">Cliente</th>
                      <th className="pb-2 font-semibold text-center">Cuota #</th>
                      <th className="pb-2 font-semibold text-center">Vence</th>
                      <th className="pb-2 font-semibold text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reminders.slice(0, 6).map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900 truncate max-w-[160px]">
                          {r.sale?.client?.nombre || 'Cliente sin nombre'}
                        </td>
                        <td className="py-2.5 text-center text-gray-600">
                          #{r.installmentNumber}
                        </td>
                        <td className="py-2.5 text-center font-medium text-amber-700">
                          {r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-CO') : 'N/A'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-gray-900">
                          {formatCOP(r.amountDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                No hay cuotas de crédito por vencer en los próximos días.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
