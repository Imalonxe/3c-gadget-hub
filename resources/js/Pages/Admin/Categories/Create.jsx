import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

export default function Create({ parentCategories }) {
    const { data, setData, post, processing, errors } = useForm({
        category_name: '',
        slug: '',
        description: '',
        parent_category_id: '',
        is_parent: false,
        image_url: '',
        is_active: true,
        is_featured: false,
        display_order: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'));
    };

    // Auto-generate slug from category name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData({
            ...data,
            category_name: name,
            slug: data.slug || generateSlug(name),
        });
    };

    return (
        <>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <Link
                            href={route('admin.categories.index')}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            ← Back to Categories
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Category</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category Name */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="category_name" value="Category Name" />
                                    <TextInput
                                        id="category_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.category_name}
                                        onChange={handleNameChange}
                                        required
                                    />
                                    <InputError message={errors.category_name} className="mt-2" />
                                </div>

                                {/* Slug */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="slug" value="Slug" />
                                    <TextInput
                                        id="slug"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.slug} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <TextareaInput
                                        id="description"
                                        className="mt-1 block w-full"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Parent Category - only show when NOT a parent category */}
                                {!data.is_parent && (
                                    <div>
                                        <InputLabel htmlFor="parent_category_id" value="Parent Category" />
                                        <SelectInput
                                            id="parent_category_id"
                                            className="mt-1 block w-full"
                                            value={data.parent_category_id}
                                            onChange={(e) => setData('parent_category_id', e.target.value)}
                                            placeholder="No Parent (Root Category)"
                                        >
                                            {parentCategories.map((category) => (
                                                <option key={category.category_id} value={category.category_id}>
                                                    {category.category_name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.parent_category_id} className="mt-2" />
                                    </div>
                                )}

                                {/* Is Parent Checkbox */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center">
                                        <input
                                            id="is_parent"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            checked={data.is_parent}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setData('is_parent', checked);
                                                if (checked) setData('parent_category_id', '');
                                            }}
                                        />
                                        <label htmlFor="is_parent" className="ml-2 block text-sm text-gray-900">
                                            Mark as Parent Category (cannot contain products)
                                        </label>
                                    </div>
                                    <InputError message={errors.is_parent} className="mt-2" />
                                </div>

                                {/* Display Order */}
                                <div>
                                    <InputLabel htmlFor="display_order" value="Display Order" />
                                    <TextInput
                                        id="display_order"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.display_order}
                                        onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    <InputError message={errors.display_order} className="mt-2" />
                                </div>

                                {/* Image URL */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="image_url" value="Image URL" />
                                    <TextInput
                                        id="image_url"
                                        type="url"
                                        className="mt-1 block w-full"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                    />
                                    <InputError message={errors.image_url} className="mt-2" />
                                </div>

                                {/* Active Status */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center">
                                        <input
                                            id="is_active"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active Category
                                        </label>
                                    </div>
                                    <InputError message={errors.is_active} className="mt-2" />
                                </div>

                                {/* Featured Status */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center">
                                        <input
                                            id="is_featured"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                                            Show on Homepage (Featured Category)
                                        </label>
                                    </div>
                                    <InputError message={errors.is_featured} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <Link
                                    href={route('admin.categories.index')}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-3"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Category'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = page => <AdminLayout children={page} title="Create Category" />;
