<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Counter;

class CounterController extends Controller
{
    /**
     * Public — used by the teller console. Open counters only.
     */
    public function index(Branch $branch)
    {
        return $branch->counters()->where('is_open', true)->orderBy('label')->get(['id', 'label']);
    }

    /**
     * Admin — every counter, including closed, for management.
     */
    public function adminIndex(Branch $branch)
    {
        return $branch->counters()->orderBy('label')->get();
    }

    public function store(Request $request, Branch $branch)
    {
        $data = $this->validated($request);

        return $branch->counters()->create($data);
    }

    public function update(Request $request, Counter $counter)
    {
        $counter->update($this->validated($request));

        return $counter;
    }

    public function destroy(Counter $counter)
    {
        $counter->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'label' => 'required|string|max:255',
            'is_open' => 'required|in:0,1',
        ]);

        $data['is_open'] = $request->boolean('is_open');

        return $data;
    }
}
