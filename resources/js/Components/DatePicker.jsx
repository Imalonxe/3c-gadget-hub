import React from 'react';

// Lightweight DatePicker wrapper that supports the props used across the app:
// - Accepts either `value` or `selected` (string ISO or Date)
// - Accepts `min` or `minDate`, `max` or `maxDate`
// - Supports `showTimeSelect` to use datetime-local input
// - Calls onChange with an ISO string (or null) so the form keeps a serializable value
const DatePicker = ({
    value,
    selected,
    onChange,
    placeholder = 'Select date',
    className = '',
    min,
    max,
    minDate,
    maxDate,
    disabled = false,
    showTimeSelect = false,
}) => {
    const useVal = value ?? selected ?? '';

    const toDate = (v) => {
        if (!v && v !== 0) return null;
        if (v instanceof Date) return v;
        // try to construct Date from string
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

    const toInputValue = (date, withTime) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        if (withTime) {
            // format as local datetime-local value: YYYY-MM-DDTHH:MM
            const Y = d.getFullYear();
            const M = pad(d.getMonth() + 1);
            const D = pad(d.getDate());
            const h = pad(d.getHours());
            const m = pad(d.getMinutes());
            return `${Y}-${M}-${D}T${h}:${m}`;
        }
        // date-only YYYY-MM-DD
        const Y = d.getFullYear();
        const M = pad(d.getMonth() + 1);
        const D = pad(d.getDate());
        return `${Y}-${M}-${D}`;
    };

    const inputValue = toInputValue(toDate(useVal), showTimeSelect);
    const inputMin = toInputValue(toDate(min ?? minDate), showTimeSelect);
    const inputMax = toInputValue(toDate(max ?? maxDate), showTimeSelect);

    const handleChange = (e) => {
        const v = e.target.value;
        if (!v) {
            onChange && onChange(null);
            return;
        }
        if (showTimeSelect) {
            // value is local YYYY-MM-DDTHH:MM -> construct Date in local tz
            const d = new Date(v);
            if (isNaN(d.getTime())) {
                onChange && onChange(null);
                return;
            }
            // send ISO string (UTC) so it's serializable and consistent
            onChange && onChange(d.toISOString());
            return;
        }
        // date-only - v is YYYY-MM-DD
        // create Date at local midnight and send ISO string
        const d = new Date(v + 'T00:00:00');
        if (isNaN(d.getTime())) {
            onChange && onChange(null);
            return;
        }
        onChange && onChange(d.toISOString());
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type={showTimeSelect ? 'datetime-local' : 'date'}
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholder}
                min={inputMin || undefined}
                max={inputMax || undefined}
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
        </div>
    );
};

export default DatePicker;

