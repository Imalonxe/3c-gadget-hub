import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function CouponAnalytics({ coupon }) {
    const usageChartRef = useRef(null);
    const usageByDayRef = useRef(null);

    useEffect(() => {
        // Clean up old charts
        if (usageChartRef.current) {
            usageChartRef.current.destroy();
        }
        if (usageByDayRef.current) {
            usageByDayRef.current.destroy();
        }

        // Create usage overview chart
        const usageCtx = document.getElementById('usageChart');
        if (usageCtx) {
            usageChartRef.current = new Chart(usageCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Used', 'Remaining'],
                    datasets: [{
                        data: [
                            coupon.used_count,
                            coupon.max_uses ? coupon.max_uses - coupon.used_count : 0
                        ],
                        backgroundColor: [
                            'rgb(79, 70, 229)',
                            'rgb(229, 231, 235)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Create usage by day chart
        const usageByDayCtx = document.getElementById('usageByDayChart');
        if (usageByDayCtx && coupon.daily_usage) {
            const dates = Object.keys(coupon.daily_usage);
            const counts = Object.values(coupon.daily_usage);

            usageByDayRef.current = new Chart(usageByDayCtx, {
                type: 'bar',
                data: {
                    labels: dates.map(date => formatDate(date)),
                    datasets: [{
                        label: 'Usage Count',
                        data: counts,
                        backgroundColor: 'rgb(79, 70, 229)',
                        borderColor: 'rgb(79, 70, 229)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }, [coupon]);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Coupon Analytics</h3>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Usage</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {coupon.used_count}
                                {coupon.max_uses && (
                                    <span className="text-sm text-gray-500">
                                        /{coupon.max_uses}
                                    </span>
                                )}
                            </dd>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Total Discount Given
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {formatCurrency(coupon.total_discount_amount)}
                            </dd>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Average Order Value
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                {formatCurrency(coupon.avg_order_value)}
                            </dd>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Usage Overview</h4>
                        <div className="aspect-w-16 aspect-h-9">
                            <canvas id="usageChart"></canvas>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Usage by Day</h4>
                        <div className="aspect-w-16 aspect-h-9">
                            <canvas id="usageByDayChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}