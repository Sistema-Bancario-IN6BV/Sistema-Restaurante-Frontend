import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import { Typography, Card, CardBody, Spinner } from '@material-tailwind/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const DashboardHome = () => {
  const { user } = useAuthStore();
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] flex-col gap-4">
        <Spinner className="h-10 w-10 text-[var(--color-gold-amber)]" />
        <Typography className="text-[var(--color-text-muted)] animate-pulse">
          Preparando tu resumen operativo...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Typography color="red" variant="h5">{error}</Typography>
      </div>
    );
  }

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'PLATFORM_ADMIN':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="animate-slide-up delay-100">
                <DashboardCard title="Usuarios Registrados" value={stats?.totalUsers || "0"} icon="M17 20h5M19 18v4M12 2a5 5 0 110 10 5 5 0 010-10zm-7 18v-1a7 7 0 0114 0v1H5z" />
              </div>
              <div className="animate-slide-up delay-150">
                <DashboardCard title="Restaurantes Activos" value={stats?.totalRestaurants || "0"} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v2H9V7zm0 4h1v2H9v-2zm0 4h1v2H9v-2zm-3-8h1v2H6V7zm0 4h1v2H6v-2zm0 4h1v2H6v-2zm12-8h-1v2h1V7zm0 4h-1v2h1v-2zm0 4h-1v2h1v-2z" />
              </div>
              <div className="animate-slide-up delay-200">
                <DashboardCard title="Ingresos Generales" value={`Q${stats?.totalRevenue?.toFixed(2) || "0.00"}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="min-w-0 rounded-3xl animate-slide-up delay-300 shadow-xl border border-[var(--color-base-parchment)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-base-crema)] col-span-1 lg:col-span-2 group hover:shadow-2xl transition-all duration-500">
                    <CardBody>
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-base-parchment)] pb-4">
                          <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold tracking-tight">Evolución de Ingresos</Typography>
                          <span className="px-3 py-1 bg-[var(--color-gold-mist)] text-[var(--color-gold-amber)] text-xs font-bold rounded-full">Últimos 7 días</span>
                        </div>
                        <ChartViewport className="pt-2" minHeight={320}>
                                <BarChart data={stats?.revenueData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-base-parchment)" />
                                    <XAxis dataKey="name" tick={{fill: "var(--color-text-muted)", fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{fill: "var(--color-text-muted)", fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `Q${value}`} dx={-10} />
                                    <Tooltip 
                                      cursor={{fill: "rgba(240, 196, 168, 0.15)"}} 
                                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-base-parchment)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--color-bg-page)' }} 
                                      itemStyle={{ color: 'var(--color-text-dark)', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                                      {stats?.revenueData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === stats.revenueData.length - 1 ? 'url(#goldGradient)' : 'var(--color-copper-peach)'} />
                                      ))}
                                    </Bar>
                                    <defs>
                                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-gold-signature)" />
                                        <stop offset="100%" stopColor="var(--color-gold-amber)" />
                                      </linearGradient>
                                    </defs>
                                </BarChart>
                            </ChartViewport>
                    </CardBody>
                </Card>

                <Card className="animate-slide-up delay-400 shadow-xl border border-[var(--color-base-parchment)] bg-[var(--color-bg-card)] overflow-hidden">
                    <CardBody className="p-0">
                        <div className="p-6 border-b border-[var(--color-base-parchment)] relative overflow-hidden bg-gradient-to-r from-[var(--color-base-crema)] to-transparent">
                          <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold relative z-10">Nuevos Restaurantes</Typography>
                          <Typography variant="small" className="text-[var(--color-text-muted)] font-medium">Recientes en la plataforma</Typography>
                        </div>
                        <div className="flex flex-col p-4 gap-3">
                            {stats?.recentRestaurants?.length > 0 ? stats.recentRestaurants.map((rest, idx) => (
                                <div key={rest.id} className="group/item flex justify-between items-center p-4 rounded-xl bg-white border border-[var(--color-base-parchment)] hover:border-[var(--color-gold-light)] hover:shadow-md hover:scale-[1.02] hover:-translate-x-1 cursor-default transition-all duration-300">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-copper-peach)] to-[var(--color-copper-terracotta)] flex items-center justify-center text-white font-bold shadow-inner">
                                          {rest.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-bold text-[var(--color-text-dark)] group-hover/item:text-[var(--color-copper-mahogany)] transition-colors">{rest.name}</Typography>
                                            <Typography variant="small" className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px]">{rest.email}</Typography>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-bold shadow-sm ${rest.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {rest.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            )) : (
                                <Typography variant="small" className="text-[var(--color-text-muted)] italic text-center py-8">Sin datos disponibles</Typography>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
          </div>
        );
      case 'RESTAURANT_ADMIN':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="animate-slide-up delay-100">
                <DashboardCard title="Órdenes Hoy" value={stats?.todayOrders || "0"} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </div>
              <div className="animate-slide-up delay-150">
                <DashboardCard title="Mesas Ocupadas" value={stats?.occupiedTables || "0"} icon="M17 20h5M19 18v4M12 2a5 5 0 110 10 5 5 0 010-10zm-7 18v-1a7 7 0 0114 0v1H5z" />
              </div>
              <div className="animate-slide-up delay-200">
                <DashboardCard title="Ingresos del Día" value={`Q${stats?.todayRevenue?.toFixed(2) || "0.00"}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </div>
              <div className="animate-slide-up delay-300">
                <DashboardCard title="Alertas Inventario" value={stats?.lowStockAlerts || "0"} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="min-w-0 animate-slide-up delay-400 shadow-xl border border-[var(--color-base-parchment)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-base-crema)] col-span-1 lg:col-span-2 group hover:shadow-2xl transition-all duration-500">
                    <CardBody>
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-base-parchment)] pb-4">
                            <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold tracking-tight">Órdenes por Día</Typography>
                            <span className="px-3 py-1 bg-[var(--color-gold-mist)] text-[var(--color-gold-amber)] text-xs font-bold rounded-full">Tráfico Semanal</span>
                        </div>
                        <ChartViewport className="pt-2" minHeight={320}>
                                <BarChart data={stats?.ordersData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-base-parchment)" />
                                    <XAxis dataKey="day" tick={{fill: "var(--color-text-muted)", fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{fill: "var(--color-text-muted)", fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip 
                                        cursor={{fill: "rgba(181, 84, 26, 0.1)"}} 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-base-parchment)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--color-bg-page)' }} 
                                        itemStyle={{ color: 'var(--color-text-dark)', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="orders" radius={[6, 6, 0, 0]} barSize={45}>
                                      {stats?.ordersData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === stats.ordersData.length - 1 ? 'url(#copperGradient)' : 'var(--color-copper-peach)'} />
                                      ))}
                                    </Bar>
                                    <defs>
                                      <linearGradient id="copperGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-copper-terracotta)" />
                                        <stop offset="100%" stopColor="var(--color-copper-base)" />
                                      </linearGradient>
                                    </defs>
                                </BarChart>
                            </ChartViewport>
                    </CardBody>
                </Card>

                <div className="space-y-6">
                    <Card className="animate-slide-up delay-500 shadow-xl border border-[var(--color-base-parchment)] bg-[var(--color-bg-card)] overflow-hidden">
                        <CardBody className="p-0">
                            <div className="p-5 border-b border-[var(--color-base-parchment)] bg-gradient-to-r from-[var(--color-base-crema)] to-transparent">
                                <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold">Platos Más Vendidos</Typography>
                            </div>
                            <div className="flex flex-col p-3 gap-2">
                                {stats?.topDishes?.length > 0 ? stats.topDishes.map((dish, i) => (
                                    <div key={dish.name} className="group/dish flex justify-between items-center p-3 rounded-lg overflow-hidden relative bg-white border border-transparent hover:border-[var(--color-gold-light)] hover:shadow-md transition-all duration-300 hover:-translate-x-1 cursor-default">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-gold-signature)] to-[var(--color-gold-amber)] opacity-70 group-hover/dish:opacity-100"></div>
                                        <div className="pl-3 flex items-center gap-3">
                                            <Typography variant="small" className="font-extrabold text-[var(--color-gold-amber)] text-sm">{i+1}.</Typography>
                                            <Typography variant="small" className="font-bold text-[var(--color-text-dark)] group-hover/dish:text-[var(--color-copper-mahogany)] transition-colors">{dish.name}</Typography>
                                        </div>
                                        <Typography variant="small" className="font-bold text-[var(--color-copper-base)] bg-[var(--color-base-crema)] px-2 py-1 rounded-md text-xs shadow-sm">{dish.sold} und</Typography>
                                    </div>
                                )) : (
                                    <Typography variant="small" className="text-[var(--color-text-muted)] italic text-center py-6">No hay ventas registradas</Typography>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="animate-slide-up delay-500 shadow-xl border border-[var(--color-base-parchment)] bg-[var(--color-bg-card)] overflow-hidden">
                        <CardBody className="p-0">
                            <div className="p-5 border-b border-[var(--color-base-parchment)] bg-gradient-to-r from-[var(--color-base-crema)] to-transparent">
                                <Typography variant="h5" className="text-[var(--color-text-dark)] font-bold">Últimas Órdenes</Typography>
                            </div>
                            <div className="flex flex-col p-3 gap-2">
                                {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
                                    <div key={order.id} className="group/order flex flex-col p-4 rounded-xl bg-white border border-[var(--color-base-parchment)] hover:border-[var(--color-copper-peach)] hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse"></span>
                                              <Typography variant="small" className="font-extrabold text-[var(--color-text-dark)]">#{order.id.slice(-6).toUpperCase()}</Typography>
                                            </div>
                                            <Typography variant="small" className="text-[var(--color-text-dark)] font-bold">Q{order.total?.toFixed(2)}</Typography>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[var(--color-base-crema)]">
                                            <Typography variant="small" className="text-xs text-[var(--color-text-muted)] font-medium bg-[var(--color-base-crema)] px-2 py-1 rounded-md">{new Date(order.date).toLocaleDateString()}</Typography>
                                            <span className="text-[10px] uppercase font-bold text-[var(--color-copper-mahogany)] bg-[var(--color-copper-peach)]/30 px-3 py-1 rounded-full shadow-sm">{order.status}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <Typography variant="small" className="text-[var(--color-text-muted)] italic text-center py-6">No hay órdenes recientes</Typography>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center p-8">
            <Typography variant="h5" color="blue-gray">
              Bienvenido a tu panel general, {user?.name || 'Usuario'}.
            </Typography>
          </div>
        );
    }
  };

  return (
    <div className="p-6 h-full bg-[var(--color-bg-page)] text-[var(--color-text-body)]">
      <div className="mb-8">
        <Typography variant="h3" className="mb-2 text-3xl font-extrabold text-[var(--color-gold-amber)] font-serif tracking-tight">
          Panel de Control
        </Typography>
        <Typography className="font-medium text-lg text-[var(--color-text-mid)]">
          Bienvenido de vuelta, {user?.name || user?.username || 'Usuario'} | <span className="font-semibold">{user?.role === 'PLATFORM_ADMIN' ? 'Administrador de Plataforma' : 'Administrador de Restaurante'}</span>
        </Typography>
      </div>
      {renderDashboardByRole()}
    </div>
  );
};

const DashboardCard = ({ title, value, icon }) => (
  <Card className="rounded-3xl shadow-lg border border-[var(--color-base-parchment)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-base-crema)] relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--color-gold-mist)] to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
    <CardBody className="p-6 relative z-10 flex items-center justify-between">
      <div>
        <Typography variant="small" className="text-[var(--color-text-muted)] font-bold tracking-wider uppercase mb-1">{title}</Typography>
        <Typography variant="h3" className="text-[var(--color-text-dark)] font-extrabold group-hover:text-[var(--color-gold-amber)] transition-colors duration-300">{value}</Typography>
      </div>
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-[var(--color-gold-signature)] to-[var(--color-gold-amber)] text-white shadow-lg group-hover:shadow-[var(--color-gold-amber)]/30 group-hover:scale-110 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
    </CardBody>
  </Card>
);

const ChartViewport = ({ children, className = "", minHeight = 320 }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    const updateWidth = () => {
      const measuredWidth = node.getBoundingClientRect().width;
      setWidth(Math.max(0, Math.floor(measuredWidth)));
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`min-w-0 ${className}`} style={{ minHeight }}>
      {width > 0 ? React.cloneElement(children, { width, height: minHeight }) : null}
    </div>
  );
};
