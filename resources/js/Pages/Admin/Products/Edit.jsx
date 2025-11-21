import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Edit({ product, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        product_name: product.product_name || '',
        slug: product.slug || '',
        description: product.description || '',
        category_id: product.category_id || '',
        brand: product.brand || '',
        model: product.model || '',
        sku: product.sku || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        stock_quantity: product.stock_quantity || '',
        specifications: product.specifications || {},
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        images: [],
        existing_images: product.images || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert existing_images to proper format
        const existingImagesData = data.existing_images.map(img => ({
            image_id: img.image_id,
            is_primary: img.is_primary || false
        }));
        
        // Create FormData
        const formData = new FormData();
        
        // Add _method for Laravel to recognize this as PUT
        formData.append('_method', 'PUT');
        
        // Add all fields except arrays
        Object.keys(data).forEach(key => {
            if (key !== 'images' && key !== 'existing_images' && key !== 'specifications') {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            }
        });
        
        // Handle specifications as JSON
        if (data.specifications) {
            formData.append('specifications', JSON.stringify(data.specifications));
        }
        
        // Handle existing_images as JSON
        if (existingImagesData.length > 0) {
            formData.append('existing_images', JSON.stringify(existingImagesData));
        }
        
        // Handle image files
        data.images.forEach(file => {
            formData.append('images[]', file);
        });
        
        // Submit using useForm's put so Inertia validation errors populate `errors`
        put(route('admin.products.update', product.product_id), formData, {
            forceFormData: true,
            onSuccess: () => {
                alert('Product updated successfully!');
            },
            onError: (errors) => {
                // `errors` will also be available via the `errors` object from useForm
                console.log('Validation errors:', errors);
                alert('Failed to update product. Please check the form for errors.');
            }
        });
    };

    // Auto-generate slug from name
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
            product_name: name,
            slug: data.slug || generateSlug(name),
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', files);
    };

    const handleDeleteImage = async (imageId) => {
        const result = await Swal.fire({
            title: 'Delete image?',
            text: 'Are you sure you want to delete this image? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            // This would need to be implemented in the backend
            // For now, we'll just remove it from the local state
            setData('existing_images', data.existing_images.filter(img => img.image_id !== imageId));
        }
    };

    const handleSetPrimary = (imageId) => {
        // Update all images to set is_primary to false, then set the selected one to true
        const updatedImages = data.existing_images.map(img => ({
            ...img,
            is_primary: img.image_id === imageId
        }));
        setData('existing_images', updatedImages);
    };

    return (
        <AdminLayout title="Edit Product">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <Link
                            href={route('admin.products.index')}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            ← Back to Products
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="product_name" value="Product Name" />
                                    <TextInput
                                        id="product_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.product_name}
                                        onChange={handleNameChange}
                                        required
                                    />
                                    <InputError message={errors.product_name} className="mt-2" />
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

                                {/* Category */}
                                <div>
                                    <InputLabel htmlFor="category_id" value="Category" />
                                    <select
                                        id="category_id"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                    >
                                        <option value="">Select a category</option>
                                        {categories && categories
                                            .filter((category) => !category.is_parent)
                                            .map((category) => (
                                                <option key={category.category_id} value={category.category_id}>
                                                    {category.category_name}
                                                </option>
                                            ))}
                                    </select>
                                    <InputError message={errors.category_id} className="mt-2" />
                                </div>

                                {/* Brand */}
                                <div>
                                    <InputLabel htmlFor="brand" value="Brand" />
                                    <TextInput
                                        id="brand"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                    />
                                    <InputError message={errors.brand} className="mt-2" />
                                </div>

                                {/* Model */}
                                <div>
                                    <InputLabel htmlFor="model" value="Model" />
                                    <TextInput
                                        id="model"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                    />
                                    <InputError message={errors.model} className="mt-2" />
                                </div>

                                {/* SKU */}
                                <div>
                                    <InputLabel htmlFor="sku" value="SKU" />
                                    <TextInput
                                        id="sku"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                    />
                                    <InputError message={errors.sku} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <TextareaInput
                                        id="description"
                                        className="mt-1 block w-full"
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Price */}
                                <div>
                                    <InputLabel htmlFor="price" value="Price" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.price} className="mt-2" />
                                </div>

                                {/* Sale Price */}
                                <div>
                                    <InputLabel htmlFor="sale_price" value="Sale Price" />
                                    <TextInput
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', e.target.value)}
                                    />
                                    <InputError message={errors.sale_price} className="mt-2" />
                                </div>

                                {/* Stock Quantity */}
                                <div>
                                    <InputLabel htmlFor="stock_quantity" value="Stock Quantity" />
                                    <TextInput
                                        id="stock_quantity"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.stock_quantity} className="mt-2" />
                                </div>

                                {/* Active Status */}
                                <div>
                                    <InputLabel htmlFor="is_active" value="Status" />
                                    <select
                                        id="is_active"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        value={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.value === 'true')}
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                    <InputError message={errors.is_active} className="mt-2" />
                                </div>

                                {/* Existing Images */}
                                {data.existing_images && data.existing_images.length > 0 && (
                                    <div className="md:col-span-2">
                                        <InputLabel value="Existing Images" />
                                        <p className="text-sm text-gray-500 mb-2">Click on an image to set it as primary (it will be shown first)</p>
                                        <div className="grid grid-cols-4 gap-4 mt-2">
                                            {data.existing_images.map((image) => (
                                                <div key={image.image_id} className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(image.image_id)}
                                                        className={`w-full transition-all ${
                                                            image.is_primary ? 'ring-2 ring-indigo-500 rounded-md' : ''
                                                        }`}
                                                    >
                                                        <img
                                                            src={`/storage/${image.image_url}`}
                                                            alt="Product"
                                                            className="w-full h-24 object-cover rounded-md"
                                                        />
                                                    </button>
                                                    {image.is_primary && (
                                                        <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                            Primary
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(image.image_id)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Images */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="images" value="Add More Images" />
                                    <input
                                        id="images"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        onChange={handleImageChange}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Upload additional images. The first image will be used as the primary image.
                                    </p>
                                    <InputError message={errors.images} className="mt-2" />
                                </div>

                                {/* Featured */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Featured Product</span>
                                    </label>
                                    <InputError message={errors.is_featured} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route('admin.products.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Product'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

