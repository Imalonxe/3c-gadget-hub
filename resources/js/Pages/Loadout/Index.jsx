import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { HiLightningBolt, HiArrowRight, HiClock } from 'react-icons/hi';

export default function Index({ missions }) {
    return (
        <MainLayout fullWidth={true}>
            <Head title="Synergy Loadout" />

            {/* Hero Section */}
            <div className="relative bg-white dark:bg-gray-900 overflow-hidden mb-12 transition-colors duration-300">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent transition-colors duration-300" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 sm:text-6xl lg:text-7xl tracking-tight mb-6">
                        Build Your Ultimate Setup
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                        Complete missions by equipping the perfect gear. <br className="hidden sm:block" />
                        Unlock <span className="text-indigo-600 dark:text-indigo-400 font-semibold">exclusive discounts</span> and elevate your gaming experience.
                    </p>
                </div>
            </div>

            {/* Missions Grid */}
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {missions.map((mission) => (
                            <div key={mission.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative p-8 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {mission.name}
                                        </h3>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30">
                                            <HiLightningBolt className="mr-1 w-4 h-4" />
                                            {mission.discount_type === 'percent' ? `${mission.discount_value}% OFF` : `฿${Number(mission.discount_value).toLocaleString()} OFF`}
                                        </span>
                                    </div>

                                    {/* Date Display */}
                                    {(mission.start_date || mission.end_date) && (
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700/30 px-3 py-2 rounded-lg w-fit">
                                            <HiClock className="mr-2 w-4 h-4 text-indigo-500" />
                                            <span>
                                                {mission.start_date && !mission.end_date && `Starts: ${new Date(mission.start_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                {!mission.start_date && mission.end_date && `Ends: ${new Date(mission.end_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                {mission.start_date && mission.end_date && (
                                                    <>
                                                        {new Date(mission.start_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - {new Date(mission.end_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </>
                                                )}
                                            </span>
                                            {mission.end_date && new Date(mission.end_date) > new Date() && (new Date(mission.end_date) - new Date()) / (1000 * 60 * 60 * 24) <= 3 && (
                                                <span className="ml-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded animate-pulse">
                                                    Ending Soon!
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow leading-relaxed transition-colors duration-300">
                                        {mission.description}
                                    </p>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-auto transition-colors duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Requirements</span>
                                            <div className="flex -space-x-2">
                                                {mission.slots.map((slot, index) => (
                                                    <div
                                                        key={slot.id}
                                                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors"
                                                        title={slot.category.name}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Link
                                            href={route('loadout.show', mission.id)}
                                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                                        >
                                            Start Mission <HiArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
