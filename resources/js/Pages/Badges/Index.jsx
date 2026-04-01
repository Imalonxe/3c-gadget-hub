import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion } from 'framer-motion';
import { LuPackage, LuStar, LuGem, LuTrophy, LuLock } from 'react-icons/lu';

const iconMap = {
    'LuPackage': LuPackage,
    'LuStar': LuStar,
    'LuGem': LuGem,
    'LuTrophy': LuTrophy,
};

export default function Index({ auth, badges, earnedBadgeIds, userXp, userLevel }) {
    return (
        <MainLayout>
            <Head title="My Badges" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-8 p-6 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Badges & Progress</h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Track your achievements and level up!</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Lvl {userLevel}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{userXp} XP Earned</div>
                            </div>
                        </div>

                        {/* Progress Bar (Visual only for now, assuming next level is current level * 100 XP or similar formula) */}
                        {/* Since formula is L = floor(sqrt(XP/100)) + 1, next level L+1 requires (L)^2 * 100 XP */}
                        {/* Current Level L. XP for L is 100*(L-1)^2. XP for L+1 is 100*L^2. */}
                        {(() => {
                            const currentLevelBaseXp = 100 * Math.pow(userLevel - 1, 2);
                            const nextLevelXp = 100 * Math.pow(userLevel, 2);
                            const progress = Math.min(100, Math.max(0, ((userXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100));

                            return (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>Current Level</span>
                                        <span>Next Level ({nextLevelXp} XP)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Badges Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {badges.map((badge) => {
                            const isEarned = earnedBadgeIds.includes(badge.id);
                            const Icon = iconMap[badge.icon] || LuTrophy;

                            return (
                                <motion.div
                                    key={badge.id}
                                    whileHover={{ scale: 1.03 }}
                                    className={`relative bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-6 border-2 transition-all duration-300 ${isEarned
                                            ? 'border-indigo-500 dark:border-indigo-400'
                                            : 'border-transparent opacity-75 grayscale'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`p-4 rounded-full mb-4 ${isEarned
                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            }`}>
                                            <Icon className="w-10 h-10" />
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{badge.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{badge.description}</p>

                                        {isEarned ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Earned
                                            </span>
                                        ) : (
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                <LuLock className="w-3 h-3 mr-1" />
                                                <span>Locked</span>
                                            </div>
                                        )}

                                        {badge.xp_reward > 0 && (
                                            <div className="mt-2 text-xs font-semibold text-amber-500">
                                                +{badge.xp_reward} XP
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
