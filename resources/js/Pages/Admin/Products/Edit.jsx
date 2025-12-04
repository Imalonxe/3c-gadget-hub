import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { ReactSortable } from "react-sortablejs";
import Swal from 'sweetalert2';

export default function Edit({ product, categories }) {
    const { data, setData, processing, errors } = useForm({
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
        deleted_images: [],  // Track which images to delete
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare data payload for FormData conversion
        const payload = {
            _method: 'PUT',  // Laravel method spoofing
            product_name: data.product_name || '',
            slug: data.slug || '',
            description: data.description || '',
            category_id: data.category_id || '',
            brand: data.brand || '',
            model: data.model || '',
            sku: data.sku || '',
            price: data.price || '',
            sale_price: data.sale_price || '',
            stock_quantity: data.stock_quantity || '',
            is_active: data.is_active ? 1 : 0,
            is_featured: data.is_featured ? 1 : 0,
            specifications: data.specifications && Object.keys(data.specifications).length > 0 ? JSON.stringify(data.specifications) : null,
            existing_images: (data.existing_images || []).map((img, index) => ({
                image_id: img.image_id,
                is_primary: img.is_primary || false,
                display_order: index + 1 // Send new order based on array position
            })),
            deleted_images: data.deleted_images || [],  // IDs of images to delete
            images: data.images || [],
        };

        console.log('Submitting via router.post() with _method=PUT:', payload);

        // Use router.post() with forceFormData to properly serialize File arrays
        router.post(
            route('admin.products.update', product.product_id),
            payload,
            {
                forceFormData: true,
                onSuccess: () => {
                    // Toast via Inertia flash (no alert)
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);

                    // Check if it's a 419 CSRF token error
                    if (errors.status && errors.status === 419) {
                        alert('Session expired. Please reload the page and try again.');
                        window.location.reload();
                        return;
                    }

                    const errorMessage = Object.entries(errors).map(([field, msgs]) => {
                        const msg = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                        return `${field}: ${msg}`;
                    }).join('\n');
                    alert(`Failed to update product:\n${errorMessage}`);
                }
            }
        );
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
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file (match server validation)
        const tooLarge = files.filter(f => f.size > MAX_FILE_SIZE);
        if (tooLarge.length > 0) {
            const names = tooLarge.map(f => f.name).join(', ');
            Swal.fire({
                icon: 'error',
                title: 'File too large',
                text: `These files exceed 2MB: ${names}. Please upload smaller images.`
            });
            // Keep only files within size limit
            const allowed = files.filter(f => f.size <= MAX_FILE_SIZE);
            setData('images', allowed);
            return;
        }

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
            // Remove from existing_images and add to deleted_images list
            setData({
                ...data,
                existing_images: data.existing_images.filter(img => img.image_id !== imageId),
                deleted_images: [...(data.deleted_images || []), imageId]  // Track for deletion
            });
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
        <>
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
                                        <p className="text-sm text-gray-500 mb-2">Drag and drop to reorder images. Click on an image to set it as primary.</p>
                                        <ReactSortable
                                            list={data.existing_images}
                                            setList={(newState) => setData('existing_images', newState)}
                                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                                            animation={200}
                                        >
                                            {data.existing_images.map((image) => (
                                                <div
                                                    key={image.image_id}
                                                    className="relative cursor-move"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(image.image_id)}
                                                        className={`w-full transition-all ${image.is_primary ? 'ring-2 ring-indigo-500 rounded-md' : ''
                                                            }`}
                                                    >
                                                        <img
                                                            src={`/storage/${image.image_url}`}
                                                            alt="Product"
                                                            className="w-full h-48 object-cover rounded-md pointer-events-none"
                                                        />
                                                    </button>
                                                    {image.is_primary && (
                                                        <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded pointer-events-none">
                                                            Primary
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteImage(image.image_id);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-20 cursor-pointer"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </ReactSortable>
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
        </>
    );
}

Edit.layout = page => <AdminLayout children={page} title="Edit Product" />;

