import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';

export default function QuestionShow({ question }) {
    if (!question) {
        return (
            <>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 rounded shadow">Question not found.</div>
                </div>
            </>
        );
    }

    return (
        <>
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

                            {question.images && question.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {question.images.map((image, index) => (
                                        <div key={image.id || index} className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                            <a href={`/storage/${image.image_path}`} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={`/storage/${image.image_path}`}
                                                    alt={`Question attachment ${index + 1}`}
                                                    className="object-cover w-full h-full hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{a.user?.name || 'Anonymous'}</p>
                                                <p className="text-sm text-gray-700">{a.content}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Are you sure?',
                                                        text: "You won't be able to revert this!",
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#d33',
                                                        cancelButtonColor: '#3085d6',
                                                        confirmButtonText: 'Yes, delete it!'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            router.delete(route('answers.destroy', a.id));
                                                        }
                                                    });
                                                }}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
        </>
    );
}

QuestionShow.layout = (page) => {
    // We can't easily access the question title here for the title prop of AdminLayout
    // But AdminLayout's title prop is mainly for the header.
    // We can set a generic title or try to use page props if available.
    return <AdminLayout children={page} title="Question Details" />;
};
