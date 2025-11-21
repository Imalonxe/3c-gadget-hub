import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function AdminDashboard({ stats, analytics }) {
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
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59,130,246,0.08)',
                            fill: true,
                            tension: 0.2,
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            const catLabels = (analytics.category_sales || []).map(c => c.category_name);
            const catData = (analytics.category_sales || []).map(c => Number(c.sales));

            if (categoryChartRef.current) {
                catChart = new Chart(categoryChartRef.current, {
                    type: 'pie',
                    data: {
                        labels: catLabels,
                        datasets: [{
                            data: catData,
                            backgroundColor: [
                                '#3b82f6', '#06b6d4', '#f97316', '#ef4444', '#a78bfa',
                                '#34d399', '#f59e0b', '#ef9a9a', '#60a5fa', '#f0abfc'
                            ]
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
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
        <AdminLayout title="Admin Dashboard">
            <Head title="Admin Dashboard" />
            
            <div className="px-4 py-6 sm:px-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Products</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_products || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Orders</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_orders || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-500">Total Users</div>
                        <div className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total_users || 0}</div>
                    </div>
                </div>

                {/* Analytics / Charts */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
                        <a href={route('admin.dashboard.report')} className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Generate Report</a>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="text-sm text-gray-500">Total Revenue</div>
                            <div className="text-3xl font-semibold text-gray-900 mb-4">{analytics?.total_revenue ? analytics.total_revenue.toLocaleString() : '0'}</div>
                            <div style={{height: '300px'}}>
                                <canvas ref={revenueChartRef} />
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-500">Category Sales</div>
                            <div className="mt-2" style={{height: '260px'}}>
                                <canvas ref={categoryChartRef} />
                            </div>
                        </div>
                    </div>
                </div>

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
        </AdminLayout>
    );
}

