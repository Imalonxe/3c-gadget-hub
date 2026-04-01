import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/Components/ConfirmationDialog';

export default function LevelBenefitsIndex({ benefits }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [benefitToDelete, setBenefitToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        level: '',
        discount_percentage: '',
        free_shipping: false,
        free_shipping_limit: '',
    });

    const openCreateModal = () => {
        setEditingBenefit(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (benefit) => {
        setEditingBenefit(benefit);
        setData({
            level: benefit.level,
            discount_percentage: benefit.discount_percentage,
            free_shipping: benefit.free_shipping,
            free_shipping_limit: benefit.free_shipping_limit || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBenefit) {
            put(route('admin.level-benefits.update', editingBenefit.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.level-benefits.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (benefit) => {
        setBenefitToDelete(benefit);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (benefitToDelete) {
            router.delete(route('admin.level-benefits.destroy', benefitToDelete.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setBenefitToDelete(null);
                },
            });
        }
    };

    return (
        <>
            <Head title="Level Benefits" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Manage Level Benefits</h2>
                            <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" />
                                Add Benefit
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free Shipping</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {benefits.map((benefit) => (
                                        <tr key={benefit.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Level {benefit.level}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {benefit.discount_percentage > 0 ? `${benefit.discount_percentage}%` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {benefit.free_shipping ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Yes {benefit.free_shipping_limit ? `(${benefit.free_shipping_limit}/mo)` : '(Unlimited)'}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-3">
                                                    <button
                                                        onClick={() => openEditModal(benefit)}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Edit Benefit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(benefit)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Benefit"
                                                    >
                                                        <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {benefits.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                No level benefits configured yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingBenefit ? 'Edit Level Benefit' : 'Add Level Benefit'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <InputLabel htmlFor="level" value="Level" />
                            <TextInput
                                id="level"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                                required
                                min="1"
                            />
                            <InputError message={errors.level} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="discount_percentage" value="Discount Percentage (%)" />
                            <TextInput
                                id="discount_percentage"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.discount_percentage}
                                onChange={(e) => setData('discount_percentage', e.target.value)}
                                required
                                min="0"
                                max="100"
                            />
                            <InputError message={errors.discount_percentage} className="mt-2" />
                        </div>

                        <div className="mb-6 block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="free_shipping"
                                    checked={data.free_shipping}
                                    onChange={(e) => setData('free_shipping', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">Free Shipping</span>
                            </label>
                            <InputError message={errors.free_shipping} className="mt-2" />
                        </div>

                        {data.free_shipping && (
                            <div className="mb-4">
                                <InputLabel htmlFor="free_shipping_limit" value="Monthly Limit (Leave empty for unlimited)" />
                                <TextInput
                                    id="free_shipping_limit"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.free_shipping_limit}
                                    onChange={(e) => setData('free_shipping_limit', e.target.value)}
                                    min="1"
                                    placeholder="Unlimited"
                                />
                                <InputError message={errors.free_shipping_limit} className="mt-2" />
                            </div>
                        )}

                        <div className="flex justify-end gap-4">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {editingBenefit ? 'Update' : 'Create'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Level Benefit"
                message={`Are you sure you want to delete the benefit for Level ${benefitToDelete?.level}?`}
            />
        </>
    );
}

LevelBenefitsIndex.layout = page => <AdminLayout children={page} title="Level Benefits" />;
