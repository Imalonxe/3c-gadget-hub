import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import Chart from 'chart.js/auto';
import ExperimentManagerModal from './ExperimentManagerModal';
import SecondaryButton from '@/Components/SecondaryButton';
import { HiCog } from 'react-icons/hi';

export default function Index({ topMissions, dailyStats, abTests, availableMissions }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [showManager, setShowManager] = useState(false);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dailyStats.map(stat => stat.date),
                    datasets: [
                        {
                            label: 'Revenue (฿)',
                            data: dailyStats.map(stat => stat.total_revenue),
                            borderColor: 'rgb(79, 70, 229)', // Indigo-600
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            tension: 0.3,
                            yAxisID: 'y',
                        },
                        {
                            label: 'Completions',
                            data: dailyStats.map(stat => stat.total_completions),
                            borderColor: 'rgb(16, 185, 129)', // Emerald-500
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            yAxisID: 'y1',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Revenue'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false,
                            },
                            title: {
                                display: true,
                                text: 'Completions'
                            }
                        },
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [dailyStats]);

    return (
        <>
            <Head title="Mission Analytics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Mission Analytics</h2>
                        <SecondaryButton onClick={() => setShowManager(true)}>
                            <HiCog className="mr-2" /> Manage Experiments
                        </SecondaryButton>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance (Last 30 Days)</h3>
                        <div className="h-96">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    {/* A/B Experiments Section */}
                    {abTests && abTests.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">A/B Experiments</h3>
                                <div className="space-y-6">
                                    {abTests.map((test) => (
                                        <div key={test.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-md font-semibold text-gray-800">
                                                    Experiment: {test.name} (Control) vs Variants
                                                </h4>
                                                <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                                                    {test.variants.length} Variant(s)
                                                </span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Funnel (View → Buy)</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Financials</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Segments</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Lift</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Confidence</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {/* Control Row */}
                                                        <tr className="bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 align-middle">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-1 bg-gray-400 rounded-full mr-3"></div>
                                                                    <div>
                                                                        <div className="text-base">{test.name}</div>
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                                                            Control ({test.group || 'A'})
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 align-middle">
                                                                <div className="grid grid-cols-[max-content_auto] gap-x-4 gap-y-2 text-sm">
                                                                    <div className="text-gray-500">Views</div>
                                                                    <div className="font-medium text-gray-900">{test.views.toLocaleString()}</div>

                                                                    <div className="text-gray-500">Completed</div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {test.completions.toLocaleString()}
                                                                        <span className="text-xs text-gray-500 ml-1">({test.conversion_rate.toFixed(1)}%)</span>
                                                                    </div>

                                                                    <div className="text-gray-500">Orders</div>
                                                                    <div className="font-medium text-gray-900">
                                                                        {test.orders.toLocaleString()}
                                                                        <span className="text-xs text-gray-500 ml-1">({(test.views > 0 ? (test.orders / test.views * 100) : 0).toFixed(1)}%)</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 align-middle">
                                                                <div className="flex flex-col space-y-2">
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-gray-500">Revenue</span>
                                                                        <span className="font-semibold text-green-600">฿{test.revenue.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-gray-500">AOV</span>
                                                                        <span className="text-gray-700">฿{test.aov.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-gray-500">Discount</span>
                                                                        <span className="text-red-500 text-xs">-฿{test.total_discount.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 align-middle">
                                                                <div className="flex flex-col space-y-1">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-gray-500">New Users:</span>
                                                                        <span className="font-medium text-gray-900">{test.segmentation.new}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-gray-500">Returning:</span>
                                                                        <span className="font-medium text-gray-900">{test.segmentation.returning}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-400 align-middle text-center">
                                                                -
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-400 align-middle text-center">
                                                                -
                                                            </td>
                                                        </tr>

                                                        {/* Variants Rows */}
                                                        {test.variants.map((variant) => (
                                                            <tr key={variant.id} className={`transition-colors ${variant.is_significant && variant.lift > 0 ? 'bg-green-50/50 hover:bg-green-50' : 'hover:bg-gray-50'}`}>
                                                                <td className="px-4 py-4 text-sm font-medium text-gray-900 align-middle">
                                                                    <div className="flex items-center">
                                                                        <div className={`h-8 w-1 rounded-full mr-3 ${variant.group === 'B' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                                                        <div>
                                                                            <div className="text-base">{variant.name}</div>
                                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${variant.group === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                                Var {variant.group}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 align-middle">
                                                                    <div className="grid grid-cols-[max-content_auto] gap-x-4 gap-y-2 text-sm">
                                                                        <div className="text-gray-500">Views</div>
                                                                        <div className="font-medium text-gray-900">{variant.views.toLocaleString()}</div>

                                                                        <div className="text-gray-500">Completed</div>
                                                                        <div className="font-medium text-gray-900">
                                                                            {variant.completions.toLocaleString()}
                                                                            <span className="text-xs text-gray-500 ml-1">({variant.conversion_rate.toFixed(1)}%)</span>
                                                                        </div>

                                                                        <div className="text-gray-500">Orders</div>
                                                                        <div className="font-medium text-gray-900">
                                                                            {variant.orders.toLocaleString()}
                                                                            <span className="text-xs text-gray-500 ml-1">({(variant.views > 0 ? (variant.orders / variant.views * 100) : 0).toFixed(1)}%)</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 align-middle">
                                                                    <div className="flex flex-col space-y-2">
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-500">Revenue</span>
                                                                            <span className="font-semibold text-green-600">฿{variant.revenue.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-500">AOV</span>
                                                                            <span className="text-gray-700">฿{variant.aov.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-500">Discount</span>
                                                                            <span className="text-red-500 text-xs">-฿{variant.total_discount.toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 align-middle">
                                                                    <div className="flex flex-col space-y-1">
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-gray-500">New Users:</span>
                                                                            <span className="font-medium text-gray-900">{variant.segmentation.new}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-gray-500">Returning:</span>
                                                                            <span className="font-medium text-gray-900">{variant.segmentation.returning}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className={`px-4 py-4 text-sm font-bold align-middle text-center ${variant.lift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-lg">{variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(2)}%</span>
                                                                        <span className="text-xs font-normal text-gray-400">Lift</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-sm align-middle text-center">
                                                                    {variant.is_significant ? (
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                                                Significant
                                                                            </span>
                                                                            <span className="text-xs text-gray-400 mt-1">95% Conf.</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                                Not Significant
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Missions Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Missions by Revenue</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {topMissions.map((mission) => {
                                            const views = mission.analytics_sum_views || 0;
                                            const completions = mission.analytics_sum_completions || 0;
                                            const conversionRate = views > 0 ? ((completions / views) * 100).toFixed(1) : 0;

                                            return (
                                                <tr key={mission.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {mission.name}
                                                        {mission.ab_group && (
                                                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mission.ab_group === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                Group {mission.ab_group}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {views.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {completions.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {conversionRate}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                        ฿{(mission.analytics_sum_revenue || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {topMissions.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    No data available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ExperimentManagerModal
                show={showManager}
                onClose={() => setShowManager(false)}
                availableMissions={availableMissions}
            />
        </>
    );
}

Index.layout = page => <AdminLayout children={page} title="Mission Analytics" />;
