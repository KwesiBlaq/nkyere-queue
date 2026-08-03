<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\ServiceType;

class ServiceTypeController extends Controller
{
    /**
     * Public — used by the kiosk. Active types only.
     */
    public function index(Branch $branch)
    {
        return $branch->serviceTypes()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'prefix']);
    }

    /**
     * Admin — every type, including inactive, for management.
     */
    public function adminIndex(Branch $branch)
    {
        return $branch->serviceTypes()->orderBy('name')->get();
    }

    public function store(Request $request, Branch $branch)
    {
        $data = $this->validated($request, $branch);

        return $branch->serviceTypes()->create($data);
    }

    public function update(Request $request, ServiceType $serviceType)
    {
        $serviceType->update($this->validated($request, $serviceType->branch, $serviceType));

        return $serviceType;
    }

    public function destroy(ServiceType $serviceType)
    {
        if ($serviceType->tickets()->exists()) {
            return response()->json([
                'message' => 'This service type has ticket history and can\'t be deleted — deactivate it instead.',
            ], 422);
        }

        $serviceType->delete();

        return response()->noContent();
    }

    private function validated(Request $request, Branch $branch, ?ServiceType $ignoring = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'prefix' => [
                'required', 'string', 'max:2',
                function ($attribute, $value, $fail) use ($branch, $ignoring) {
                    $exists = $branch->serviceTypes()
                        ->where('prefix', $value)
                        ->when($ignoring, fn ($q) => $q->whereKeyNot($ignoring->id))
                        ->exists();

                    if ($exists) {
                        $fail('This prefix is already used by another service type.');
                    }
                },
            ],
            'is_active' => 'required|in:0,1',
        ]);

        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }
}
