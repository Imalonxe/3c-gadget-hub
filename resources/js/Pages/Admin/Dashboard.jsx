import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function AdminDashboard({ stats, analytics, activeAnnouncement }) {
    const revenueChartRef = useRef(null);
    const categoryChartRef = useRef(null);

    useEffect(() => {
        if (!analytics) return;

        let revChart = null;
        let catChart = null;

        try {
            const labels = (analytics.revenue_timeline || []).map(r => r.date);
            const revData = (analytics.revenue_timeline || []).map(r => Number(r.total));

            if (revenueChartRef.current) {
                revChart = new Chart(revenueChartRef.current, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Revenue',
                            data: revData,
                            borderColor: '#4f46e5', // Indigo-600
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
                                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                                return gradient;
                            },
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1f2937',
                                titleColor: '#f3f4f6',
                                bodyColor: '#f3f4f6',
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: false,
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { borderDash: [2, 4], color: '#e5e7eb' },
                                ticks: { callback: (value) => '฿' + value.toLocaleString() }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                });
            }

            const catLabels = (analytics.category_sales || []).map(c => c.category_name);
            const catData = (analytics.category_sales || []).map(c => Number(c.sales));

            if (categoryChartRef.current) {
                catChart = new Chart(categoryChartRef.current, {
                    type: 'doughnut',
                    data: {
                        labels: catLabels,
                        datasets: [{
                            data: catData,
                            backgroundColor: [
                                '#4f46e5', '#06b6d4', '#f97316', '#ef4444', '#8b5cf6',
                                '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#6366f1'
                            ],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } }
                        },
                        cutout: '70%',
                    }
                });
            }
        } catch (e) {
            console.error('Chart init error', e);
        }

        return () => {
            if (revChart) revChart.destroy();
            if (catChart) catChart.destroy();
        };
    }, [analytics]);

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Products</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_products || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Orders</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_orders || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
                        <div className="text-sm font-medium text-gray-500">Total Users</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_users || 0}</div>
                    </div>
                </div>

                {/* Active Announcement Widget */}
                {activeAnnouncement && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-indigo-500">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Active Announcement</h2>
                                <p className="text-sm text-gray-600 mt-1">{activeAnnouncement.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ends: {new Date(activeAnnouncement.end_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <a
                                    href={route('admin.announcements.edit', activeAnnouncement.id)}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                >
                                    Edit
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics / Charts */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
                        <a href={route('admin.dashboard.report')} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-center">Generate Report</a>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="text-sm text-gray-500">Total Revenue</div>
                            <div className="text-3xl font-semibold text-gray-900 mb-4">{analytics?.total_revenue ? analytics.total_revenue.toLocaleString() : '0'}</div>
                            <div className="h-64 sm:h-80">
                                <canvas ref={revenueChartRef} />
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-500">Category Sales</div>
                            <div className="mt-2 h-64 sm:h-80 lg:h-[260px]">
                                <canvas ref={categoryChartRef} />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Low Stock Alerts */}
                {(analytics?.low_stock_products || []).length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Low Stock Alerts
                            </h2>
                            <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                                {analytics.low_stock_products.length} items need attention
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="text-sm text-gray-500 border-b">
                                        <th className="py-2">Product</th>
                                        <th className="py-2">Stock</th>
                                        <th className="py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.low_stock_products.map((p) => (
                                        <tr key={p.product_id} className="border-b last:border-0 hover:bg-red-50/30 transition-colors">
                                            <td className="py-3 text-sm font-medium text-gray-900">{p.product_name}</td>
                                            <td className="py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock_quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {p.stock_quantity} left
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm">
                                                <a href={route('admin.products.edit', p.product_id)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs uppercase tracking-wide">
                                                    Restock
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500">
                                    <th className="py-2">#</th>
                                    <th className="py-2">Product</th>
                                    <th className="py-2">Qty Sold</th>
                                    <th className="py-2">Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(analytics?.top_products || []).map((p, idx) => (
                                    <tr key={p.product_id} className="border-t">
                                        <td className="py-3 text-sm text-gray-700">{idx + 1}</td>
                                        <td className="py-3 text-sm text-gray-700">{p.product_name}</td>
                                        <td className="py-3 text-sm text-gray-700">{p.qty}</td>
                                        <td className="py-3 text-sm text-gray-700">{Number(p.sales).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* charts are initialized via React useEffect */}
            </div>
        </>
    );
}

AdminDashboard.layout = page => <AdminLayout children={page} title="Admin Dashboard" />;

