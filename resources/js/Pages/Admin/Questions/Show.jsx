import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function QuestionShow({ question }) {
    if (!question) {
        return (
            <AdminLayout title="Question">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 rounded shadow">Question not found.</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Question">
            <Head title={`Question: ${question.title}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
                            <p className="text-sm text-gray-500 mb-4">By {question.user?.name || 'Unknown'}</p>
                            <div className="prose max-w-none">
                                <p>{question.content}</p>
                            </div>
                        </div>
                        <div className="ml-4 text-right">
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium">{question.status}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">Answers</h2>
                        {question.answers && question.answers.length > 0 ? (
                            <ul className="space-y-4">
                                {question.answers.map((a) => (
                                    <li key={a.id} className="p-4 border rounded">
                                        <p className="font-medium">{a.user?.name || 'Anonymous'}</p>
                                        <p className="text-sm text-gray-700">{a.content}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No answers yet.</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Link href={route('admin.questions.index')} className="px-4 py-2 bg-gray-100 rounded">Back</Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
