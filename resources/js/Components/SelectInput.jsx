import React from 'react';

const SelectInput = ({ 
    value, 
    onChange, 
    options = [], 
    placeholder = "Select an option", 
    className = "",
    disabled = false,
    required = false,
    children,
}) => {
    return (
        <select
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`}
        >
            <option value="">{placeholder}</option>
            {/* If callers provided child <option> elements (older code), render them. Otherwise map options prop. */}
            {children ? (
                children
            ) : (
                options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))
            )}
        </select>
    );
};

export default SelectInput;

