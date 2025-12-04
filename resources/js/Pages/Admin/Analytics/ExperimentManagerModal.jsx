import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { HiLink, HiTrash, HiX } from 'react-icons/hi';

import Swal from 'sweetalert2';

export default function ExperimentManagerModal({ show, onClose, availableMissions }) {
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedVariants, setSelectedVariants] = useState([]);

    const { data, setData, post, delete: destroy, processing, reset } = useForm({
        parent_id: '',
        variant_ids: [],
    });

    // Filter missions by group
    const groupAMissions = availableMissions.filter(m => m.ab_group === 'A');
    const groupBMissions = availableMissions.filter(m => m.ab_group === 'B');

    // Filter variants that are already linked to the selected parent
    const linkedVariants = availableMissions.filter(m => m.parent_mission_id === parseInt(selectedParent));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.analytics.experiments.store'), {
            onSuccess: () => {
                reset();
                setSelectedParent('');
                setSelectedVariants([]);
                Swal.fire({
                    icon: 'success',
                    title: 'Linked!',
                    text: 'Variants have been successfully linked to the control mission.',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
        });
    };

    const handleUnlink = (missionId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to unlink this variant?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, unlink it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.analytics.experiments.destroy', missionId), {
                    onSuccess: () => {
                        Swal.fire(
                            'Unlinked!',
                            'The variant has been unlinked.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    // Update form data when selection changes
    React.useEffect(() => {
        setData('parent_id', selectedParent);
    }, [selectedParent]);

    React.useEffect(() => {
        setData('variant_ids', selectedVariants);
    }, [selectedVariants]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Experiment Manager
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Link <strong>Group B (Variants)</strong> to <strong>Group A (Control)</strong> to create an A/B experiment.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                1. Select Control Mission (Group A)
                            </label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                            >
                                <option value="">Select a Control Mission...</option>
                                {groupAMissions.map((mission) => (
                                    <option key={mission.id} value={mission.id}>
                                        {mission.name} (ID: {mission.id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedParent && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        2. Select Variants to Link (Group B)
                                    </label>
                                    <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                                        {groupBMissions.filter(m => !m.parent_mission_id || m.parent_mission_id === parseInt(selectedParent)).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic p-2">No available Group B missions.</p>
                                        ) : (
                                            groupBMissions
                                                .filter(m => !m.parent_mission_id || m.parent_mission_id === parseInt(selectedParent)) // Show unlinked or already linked to this parent
                                                .map((mission) => {
                                                    const isLinked = mission.parent_mission_id === parseInt(selectedParent);
                                                    return (
                                                        <div key={mission.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                            <div className="flex items-center">
                                                                {!isLinked && (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                                                                        checked={selectedVariants.includes(mission.id.toString())}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedVariants([...selectedVariants, mission.id.toString()]);
                                                                            } else {
                                                                                setSelectedVariants(selectedVariants.filter(id => id !== mission.id.toString()));
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                                <span className={`text-sm ${isLinked ? 'text-gray-400' : 'text-gray-700'}`}>
                                                                    {mission.name} (ID: {mission.id})
                                                                    {isLinked && <span className="ml-2 text-xs text-green-600 font-semibold">(Linked)</span>}
                                                                </span>
                                                            </div>
                                                            {isLinked && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUnlink(mission.id)}
                                                                    className="text-red-600 hover:text-red-800 text-xs flex items-center"
                                                                >
                                                                    <HiTrash className="mr-1" /> Unlink
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Only unlinked Group B missions are shown. Already linked variants can be unlinked here.
                                    </p>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <PrimaryButton disabled={processing || selectedVariants.length === 0}>
                                        <HiLink className="mr-2" /> Link Selected Variants
                                    </PrimaryButton>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                <div className="mt-6 flex justify-end border-t pt-4">
                    <SecondaryButton onClick={onClose}>
                        Close
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
