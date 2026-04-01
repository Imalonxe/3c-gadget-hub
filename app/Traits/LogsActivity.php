<?php

namespace App\Traits;

use App\Jobs\WriteActivityLog;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;

trait LogsActivity
{
    /**
     * Log an activity
     * 
     * @param string $action Action name
     * @param array $meta Additional metadata (will filter out UploadedFile objects)
     * @return void
     */
    protected function logActivity(string $action, array $meta = []): void
    {
        try {
            $user = auth()->user();
            $request = request();

            // Filter out UploadedFile objects from meta to avoid serialization errors
            $meta = $this->filterFilesFromMeta($meta);

            $payload = [
                'user_id' => $user ? $user->id : null,
                'action' => $action,
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'meta' => array_merge([
                    'route' => $request->route() ? $request->route()->getName() : null,
                ], $meta),
            ];

            if (config('activity-logs.queue_write', true)) {
                dispatch(new WriteActivityLog($payload));
            } else {
                ActivityLog::create($payload);
            }
        } catch (\Exception $e) {
            Log::warning('LogsActivity trait failed: ' . $e->getMessage());
        }
    }

    /**
     * Log resource creation
     */
    protected function logResourceCreated(string $resourceType, $resourceId, array $additionalMeta = []): void
    {
        $this->logActivity("create_{$resourceType}", array_merge([
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ], $additionalMeta));
    }

    /**
     * Log resource update
     */
    protected function logResourceUpdated(string $resourceType, $resourceId, array $changes = [], array $additionalMeta = []): void
    {
        $this->logActivity("update_{$resourceType}", array_merge([
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'changes' => $changes,
        ], $additionalMeta));
    }

    /**
     * Log resource deletion
     */
    protected function logResourceDeleted(string $resourceType, $resourceId, array $additionalMeta = []): void
    {
        $this->logActivity("delete_{$resourceType}", array_merge([
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ], $additionalMeta));
    }

    /**
     * Recursively filter UploadedFile objects from metadata
     * Replace them with file metadata to avoid serialization errors
     * 
     * @param array $data
     * @return array
     */
    private function filterFilesFromMeta(array $data): array
    {
        foreach ($data as $key => $value) {
            if ($value instanceof \Illuminate\Http\UploadedFile) {
                // Replace file object with metadata
                $data[$key] = [
                    '_file' => true,
                    'name' => $value->getClientOriginalName(),
                    'size' => $value->getSize(),
                    'mime' => $value->getMimeType(),
                ];
            } elseif (is_array($value)) {
                $data[$key] = $this->filterFilesFromMeta($value);
            }
        }
        return $data;
    }
}
