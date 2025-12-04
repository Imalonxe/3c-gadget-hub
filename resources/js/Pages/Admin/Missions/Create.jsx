import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { HiPlus, HiTrash } from 'react-icons/hi';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        discount_type: 'percent',
        discount_value: '',
        status: true,
        start_date: '',
        end_date: '',
        ab_group: 'none',
        slots: [{ category_id: '' }, { category_id: '' }, { category_id: '' }], // Default 3 slots
    });

    const addSlot = () => {
        setData('slots', [...data.slots, { category_id: '' }]);
    };

    const removeSlot = (index) => {
        const newSlots = data.slots.filter((_, i) => i !== index);
        setData('slots', newSlots);
    };

    const updateSlot = (index, value) => {
        const newSlots = [...data.slots];
        newSlots[index].category_id = value;
        setData('slots', newSlots);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.missions.store'));
    };

    return (
        <>
            <Head title="Create Mission" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Mission</h2>

                            <form onSubmit={submit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Mission Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="status" value="Status" />
                                        <select
                                            id="status"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value === 'true')}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="description" value="Description" />
                                        <textarea
                                            id="description"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        ></textarea>
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="start_date" value="Start Date (Optional)" />
                                        <TextInput
                                            id="start_date"
                                            type="datetime-local"
                                            className="mt-1 block w-full"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="end_date" value="End Date (Optional)" />
                                        <TextInput
                                            id="end_date"
                                            type="datetime-local"
                                            className="mt-1 block w-full"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="discount_type" value="Discount Type" />
                                        <select
                                            id="discount_type"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.discount_type}
                                            onChange={(e) => setData('discount_type', e.target.value)}
                                        >
                                            <option value="percent">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (฿)</option>
                                        </select>
                                        <InputError message={errors.discount_type} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="discount_value" value="Discount Value" />
                                        <TextInput
                                            id="discount_value"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.discount_value}
                                            onChange={(e) => setData('discount_value', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.discount_value} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="ab_group" value="A/B Testing Group" />
                                        <select
                                            id="ab_group"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.ab_group}
                                            onChange={(e) => setData('ab_group', e.target.value)}
                                        >
                                            <option value="none">None (Show to All)</option>
                                            <option value="A">Group A</option>
                                            <option value="B">Group B</option>
                                        </select>
                                        <InputError message={errors.ab_group} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Mission Slots</h3>
                                        <button
                                            type="button"
                                            onClick={addSlot}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center"
                                        >
                                            <HiPlus className="mr-1" /> Add Slot
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {data.slots.map((slot, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <span className="text-gray-500 font-bold w-8">#{index + 1}</span>
                                                <div className="flex-1">
                                                    <select
                                                        className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                        value={slot.category_id}
                                                        onChange={(e) => updateSlot(index, e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((category) => (
                                                            <option key={category.category_id} value={category.category_id}>
                                                                {category.category_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {data.slots.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlot(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <HiTrash className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.slots && <div className="text-red-600 text-sm mt-2">{errors.slots}</div>}
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <Link
                                        href={route('admin.missions.index')}
                                        className="mr-4 text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Create Mission
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = page => <AdminLayout children={page} title="Create Mission" />;
