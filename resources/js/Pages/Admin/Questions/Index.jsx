import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmationDialog from '@/Components/ConfirmationDialog';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

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
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Questions</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage customer questions and inquiries.</p>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search questions..."
                            defaultValue={filters.search || ''}
                            onChange={(e) => search(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition duration-150 ease-in-out"
                        />
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    {questions.data.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
                            {questions.data.map((question) => (
                                <div
                                    key={question.question_id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${question.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {question.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {question.created_at_formatted || 'Recently'}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                                    {question.title}
                                                </h3>

                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {question.content}
                                                </p>

                                                {question.images && question.images.length > 0 && (
                                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                        {question.images.map((image, index) => (
                                                            <div key={image.id || index} className="flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                                <img
                                                                    src={`/storage/${image.image_path}`}
                                                                    alt={`Question attachment ${index + 1}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {question.user?.name || 'Anonymous'}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                            </svg>
                                                            {question.answers_count} answers
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100 min-w-[120px]">
                                                <Link
                                                    href={route('admin.questions.show', question.question_id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="View Question"
                                                >
                                                    <EyeIcon className="w-5 h-5" strokeWidth={1.5} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(question)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Question"
                                                >
                                                    <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                        </div>
                    )}

                    {/* Pagination */}
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
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {questions.links.map((link, index) => {
                                                const isDisabled = !link.url;
                                                const isPrevious = link.label.includes('Previous');
                                                const isNext = link.label.includes('Next');

                                                let classes = 'relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

                                                if (link.active) {
                                                    classes = 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium';
                                                }

                                                if (index === 0) classes += ' rounded-l-md';
                                                if (index === questions.links.length - 1) classes += ' rounded-r-md';

                                                if (isDisabled) {
                                                    classes += ' opacity-50 cursor-not-allowed';
                                                }

                                                return (
                                                    <Link
                                                        key={index}
                                                        href={isDisabled ? undefined : link.url}
                                                        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                                                        className={classes}
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

                <ConfirmationDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={confirmDelete}
                    title="Delete Question"
                    message="Are you sure you want to delete this question? This action cannot be undone."
                />
            </div>
        </>
    );
}

QuestionsIndex.layout = page => <AdminLayout children={page} title="Questions" />;
