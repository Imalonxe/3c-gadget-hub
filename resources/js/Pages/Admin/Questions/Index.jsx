import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmationDialog from '@/Components/ConfirmationDialog';

export default function QuestionsIndex({ questions, filters }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    const handleDelete = (question) => {
        setQuestionToDelete(question);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (questionToDelete) {
            router.delete(route('admin.questions.destroy', questionToDelete.question_id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setQuestionToDelete(null);
                },
            });
        }
    };

    const search = (searchTerm) => {
        router.get(route('admin.questions.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <AdminLayout title="Questions">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Questions</h1>
                    </div>

                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex-1 max-w-lg">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                defaultValue={filters.search || ''}
                                onChange={(e) => search(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {questions.data.map((question) => (
                                <li key={question.question_id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                                        {question.title}
                                                    </p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {question.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <p>
                                                            By {question.user?.name} • {question.answers_count} answers
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {question.content}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex space-x-2">
                                                <Link
                                                    href={route('admin.questions.show', question.question_id)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(question)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {questions.data.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No questions found.</p>
                        </div>
                    )}

                    {questions.links && (
                        <div className="mt-6">
                            <nav className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {questions.links.prev && (
                                        <Link
                                            href={questions.links.prev}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {questions.links.next && (
                                        <Link
                                            href={questions.links.next}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">{questions.from}</span>
                                            {' '}to{' '}
                                            <span className="font-medium">{questions.to}</span>
                                            {' '}of{' '}
                                            <span className="font-medium">{questions.total}</span>
                                            {' '}results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                                            {questions.links.map((link, index) => {
                                                const isDisabled = !link.url;
                                                const base = 'relative inline-flex items-center px-3 md:px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150';
                                                const state = link.active
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

                                                return (
                                                    <Link
                                                        key={index}
                                                        href={isDisabled ? undefined : link.url}
                                                        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                                                        className={`${base} ${state} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'} mx-1`}
                                                        aria-disabled={isDisabled}
                                                        aria-current={link.active ? 'page' : undefined}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                show={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
            />
        </AdminLayout>
    );
}







