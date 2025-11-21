<?php

return [
    // Routes or path patterns to exclude from logging to avoid noise or loops.
    // Supports wildcard patterns.
    'excluded_routes' => [
        'activity-logs*',
        'storage/*',
        '_ignition/*',
    ],

    // Fields to mask when storing request payloads
    'masked_fields' => [
        'password',
        'password_confirmation',
        'card_number',
        'cvv',
        'ssn',
        'token',
        'access_token',
        'refresh_token',
    ],

    // Retention in days - logs older than this will be pruned by scheduled job
    'retention_days' => env('ACTIVITY_LOG_RETENTION_DAYS', 90),

    // Use queue for writes (recommended true for high traffic)
    'queue_write' => env('ACTIVITY_LOG_QUEUE_WRITE', true),

    // If true, record API routes as well (by default we will record web + api)
    'record_api' => env('ACTIVITY_LOG_RECORD_API', true),
];
