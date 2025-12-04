import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { HiStar, HiTruck, HiLightningBolt } from 'react-icons/hi';

export default function MyBenefits({ auth, currentBenefit, freeShippingUsage, allBenefits, userLevel, userXp, nextLevelThreshold, currentLevelThreshold }) {
    const nextLevel = allBenefits.find(b => b.level > userLevel);

    // Calculate progress based on thresholds
    let progress = 100;
    if (nextLevelThreshold) {
        const totalNeeded = nextLevelThreshold - currentLevelThreshold;
        const currentProgress = userXp - currentLevelThreshold;
        progress = (currentProgress / totalNeeded) * 100;
    }

    return (
        <MainLayout>
            <Head title="My Level Benefits" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-2xl border border-indigo-200 dark:border-indigo-700">
                                {userLevel}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Level {userLevel} Member</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Keep earning XP to unlock more exclusive perks.</p>
                            </div>
                        </div>

                        {/* XP Progress */}
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <span>XP Progress</span>
                                <span>{userXp} / {nextLevelThreshold || 'Max'}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                                {nextLevel ? `Next: Level ${nextLevel.level}` : `Next Level: ${userLevel + 1}`}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Current Benefits Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <HiLightningBolt className="text-indigo-500" />
                                    Active Benefits
                                </h2>

                                {/* Discount Benefit */}
                                <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 last:mb-0">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                            <HiStar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Level Discount</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Automatic discount on all orders</p>
                                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {currentBenefit?.discount_percentage > 0 ? `${currentBenefit.discount_percentage}% OFF` : 'No Discount'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Free Shipping Benefit */}
                                <div className="pt-2">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                            <HiTruck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Free Shipping</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {currentBenefit?.free_shipping ? 'Active' : 'Not Available'}
                                            </p>

                                            {currentBenefit?.free_shipping && (
                                                <div className="mt-3">
                                                    {currentBenefit.free_shipping_limit ? (
                                                        <>
                                                            <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                <span>Monthly Usage</span>
                                                                <span>{freeShippingUsage} / {currentBenefit.free_shipping_limit}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-500 ${freeShippingUsage >= currentBenefit.free_shipping_limit
                                                                        ? 'bg-red-500'
                                                                        : 'bg-green-500'
                                                                        }`}
                                                                    style={{ width: `${Math.min((freeShippingUsage / currentBenefit.free_shipping_limit) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                                Resets on the 1st of every month.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            Unlimited Usage
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Benefits Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Level Progression</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">See what you unlock at higher levels</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Free Shipping</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {allBenefits.map((benefit) => {
                                                const isUnlocked = userLevel >= benefit.level;

                                                return (
                                                    <tr key={benefit.id} className={isUnlocked ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border ${isUnlocked
                                                                    ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700'
                                                                    : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
                                                                    }`}>
                                                                    {benefit.level}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`text-sm font-medium ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                {benefit.discount_percentage > 0 ? `${benefit.discount_percentage}%` : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {benefit.free_shipping ? (
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isUnlocked
                                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                                                    : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600'
                                                                    }`}>
                                                                    Yes {benefit.free_shipping_limit ? `(${benefit.free_shipping_limit}/mo)` : '(Unlimited)'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isUnlocked ? (
                                                                <span className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                                                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Unlocked
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center text-sm text-gray-400 dark:text-gray-500">
                                                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
