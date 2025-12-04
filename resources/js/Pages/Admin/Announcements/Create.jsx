import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useEffect, useState } from 'react';

export default function Create({ auth, announcement }) {
    const { csrf_token } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        title: announcement?.title || '',
        content: announcement?.content || '',
        start_date: announcement?.start_date ? announcement.start_date.split('T')[0] : '',
        end_date: announcement?.end_date ? announcement.end_date.split('T')[0] : '',
        is_active: announcement?.is_active ?? true,
        image: null,
        remove_image: false,
        _method: announcement ? 'PUT' : 'POST',
        _token: csrf_token,
    });

    const submit = (e) => {
        e.preventDefault();
        const routeName = announcement
            ? route('admin.announcements.update', announcement.id)
            : route('admin.announcements.store');

        post(routeName);
    };

    const [imagePreview, setImagePreview] = useState(announcement?.image_path || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        setData('remove_image', false); // Reset remove flag if new image is selected

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setData('image', null);
        setData('remove_image', true);

        // Clear file input value
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    return (
        <>
            <Head title={announcement ? 'Edit Announcement' : 'Create Announcement'} />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <Link
                            href={route('admin.announcements.index')}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            ← Back to Announcements
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
                        </h2>

                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        isFocused
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                {/* Image */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="image" value="Image" />
                                    <input
                                        type="file"
                                        id="image"
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <InputError message={errors.image} className="mt-2" />

                                    {imagePreview && (
                                        <div className="mt-4 relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="h-48 object-contain rounded border" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                                title="Remove Image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="content" value="Content / Description" />
                                    <textarea
                                        id="content"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows="4"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.content} className="mt-2" />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <InputLabel htmlFor="start_date" value="Start Date" />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
                                </div>

                                {/* End Date */}
                                <div>
                                    <InputLabel htmlFor="end_date" value="End Date" />
                                    <TextInput
                                        id="end_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_date} className="mt-2" />
                                </div>

                                {/* Active Status */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Active</span>
                                    </label>
                                    <InputError message={errors.is_active} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route('admin.announcements.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {announcement ? 'Update Announcement' : 'Create Announcement'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = page => <AdminLayout children={page} title={page.props.announcement ? 'Edit Announcement' : 'Create Announcement'} />;
