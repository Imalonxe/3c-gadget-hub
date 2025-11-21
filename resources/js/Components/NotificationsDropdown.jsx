import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { format } from 'date-fns';

export default function NotificationsDropdown({ notifications = [], unreadCount = 0 }) {
    const [localNotifications, setLocalNotifications] = useState(notifications || []);
    const [localUnread, setLocalUnread] = useState(unreadCount || 0);
    const [markingAll, setMarkingAll] = useState(false);

    const handleMarkAllOnOpen = () => {
        if (localUnread <= 0 || markingAll) return;
        setMarkingAll(true);
        Inertia.post(route('notifications.markAllAsRead'), {}, {
            onSuccess: () => {
                // Optimistically mark all as read locally
                const now = new Date().toISOString();
                setLocalNotifications(localNotifications.map(n => ({ ...n, read_at: n.read_at || now })));
                setLocalUnread(0);
            },
            onFinish: () => setMarkingAll(false)
        });
    };

    const handleNotificationClick = (notification) => (e) => {
        e.preventDefault();
        // If already read, just navigate
        if (!notification.read_at) {
            Inertia.post(route('notifications.markAsRead', notification.id), {}, {
                onSuccess: () => {
                    setLocalNotifications(localNotifications.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n));
                    setLocalUnread(Math.max(0, localUnread - 1));
                    if (notification.data?.order_id) {
                        Inertia.visit(route('user.orders.show', notification.data.order_id));
                    } else if (notification.data?.url) {
                        Inertia.visit(notification.data.url);
                    } else {
                        Inertia.visit(route('notifications.index'));
                    }
                }
            });
        } else {
            if (notification.data?.order_id) {
                Inertia.visit(route('user.orders.show', notification.data.order_id));
            } else if (notification.data?.url) {
                Inertia.visit(notification.data.url);
            } else {
                Inertia.visit(route('notifications.index'));
            }
        }
    };

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button onClick={handleMarkAllOnOpen} className="relative flex rounded-full p-1 hover:bg-gray-100 focus:outline-none">
                    <BellIcon className="h-6 w-6" />
                    {localUnread > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {localUnread}
                        </span>
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {localNotifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No notifications
                            </div>
                        ) : (
                            localNotifications.map((notification) => (
                                <Menu.Item key={notification.id}>
                                    {({ active }) => {
                                        const isUnread = !notification.read_at;

                                        return (
                                            <a
                                                href="#"
                                                onClick={handleNotificationClick(notification)}
                                                className={`${active ? 'bg-gray-100' : ''} block px-4 py-3 border-b last:border-b-0 ${isUnread ? 'bg-blue-50' : ''}`}
                                            >
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.data.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(notification.created_at), 'PPp')}
                                                </p>
                                            </a>
                                        );
                                    }}
                                </Menu.Item>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t">
                            <form method="post" action={route('notifications.markAllAsRead')}> 
                                <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''} />
                                <button type="submit" className="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
                            </form>
                        </div>
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}