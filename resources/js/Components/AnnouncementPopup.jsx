import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementPopup({ announcement }) {
    const [show, setShow] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        if (!announcement) return;

        const storageKey = `announcement_${announcement.id}_hidden_v2`;
        const hiddenUntil = localStorage.getItem(storageKey);

        if (hiddenUntil) {
            console.log(`[Announcement] Found hiddenUntil: ${hiddenUntil}`);
        }

        if (!hiddenUntil || new Date() > new Date(hiddenUntil)) {
            console.log('[Announcement] Showing popup');
            setShow(true);
        } else {
            console.log('[Announcement] Popup suppressed by localStorage');
        }
    }, [announcement]);

    const handleClose = () => {
        if (dontShowAgain && announcement) {
            const storageKey = `announcement_${announcement.id}_hidden_v2`;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            localStorage.setItem(storageKey, tomorrow.toISOString());
        }
        setShow(false);
    };

    if (!announcement) return null;

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 sm:px-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden z-10 p-2"
                    >


                        <div className="flex flex-col bg-white overflow-hidden">
                            {/* Image Area */}
                            {announcement.image_path && (
                                <div className="relative w-full bg-gray-50 overflow-hidden">
                                    <img
                                        src={announcement.image_path}
                                        alt={announcement.title}
                                        className="w-full h-auto"
                                    />
                                </div>
                            )}

                            {/* Content Area */}
                            <div className="px-4 py-5">
                                {announcement.title && (
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                        {announcement.title}
                                    </h3>
                                )}

                                {announcement.content && (
                                    <div className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line text-center">
                                        {announcement.content}
                                    </div>
                                )}

                                {/* Footer Action Area */}
                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="dont-show"
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                            checked={dontShowAgain}
                                            onChange={(e) => setDontShowAgain(e.target.checked)}
                                        />
                                        <label htmlFor="dont-show" className="text-sm text-gray-500 cursor-pointer select-none hover:text-gray-700">
                                            ไม่แสดงอีก 1 วัน
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-1.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg shadow-lg transform transition hover:-translate-y-0.5 flex items-center"
                                    >
                                        ปิด <span className="ml-1 text-xs">✕</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
