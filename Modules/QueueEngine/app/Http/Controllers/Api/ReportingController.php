<?php

namespace Modules\QueueEngine\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Ticket;

class ReportingController extends Controller
{
    public function overview(Request $request, Branch $branch)
    {
        [$from, $to] = $this->dateRangeFor($request->query('range', 'today'));

        $tickets = Ticket::where('branch_id', $branch->id)->whereBetween('created_at', [$from, $to])->get();

        $issued = $tickets->count();
        $completed = $tickets->where('status', 'done')->count();
        $noShow = $tickets->where('status', 'no_show')->count();

        $waitSeconds = $tickets->whereNotNull('called_at')
            ->map(fn (Ticket $t) => $t->created_at->diffInSeconds($t->called_at));

        $serviceSeconds = $tickets->where('status', 'done')
            ->whereNotNull('served_at')->whereNotNull('completed_at')
            ->map(fn (Ticket $t) => $t->served_at->diffInSeconds($t->completed_at));

        return response()->json([
            'issued' => $issued,
            'completed' => $completed,
            'no_show' => $noShow,
            'no_show_rate' => $issued > 0 ? round($noShow / $issued * 100, 1) : 0.0,
            'avg_wait_seconds' => $waitSeconds->isNotEmpty() ? (int) round($waitSeconds->avg()) : null,
            'avg_service_seconds' => $serviceSeconds->isNotEmpty() ? (int) round($serviceSeconds->avg()) : null,
        ]);
    }

    public function serviceTypeVolume(Request $request, Branch $branch)
    {
        [$from, $to] = $this->dateRangeFor($request->query('range', 'today'));

        $rows = Ticket::where('tickets.branch_id', $branch->id)
            ->whereBetween('tickets.created_at', [$from, $to])
            ->join('service_types', 'service_types.id', '=', 'tickets.service_type_id')
            ->selectRaw('service_types.name as service_type, count(*) as ticket_count')
            ->groupBy('service_types.name')
            ->orderByDesc('ticket_count')
            ->get();

        return response()->json($rows);
    }

    public function tellerThroughput(Request $request, Branch $branch)
    {
        [$from, $to] = $this->dateRangeFor($request->query('range', 'today'));

        $tickets = Ticket::with('servedBy')
            ->where('branch_id', $branch->id)
            ->whereBetween('created_at', [$from, $to])
            ->where('status', 'done')
            ->whereNotNull('served_by')
            ->get();

        $rows = $tickets->groupBy('served_by')
            ->map(function ($group) {
                $serviceSeconds = $group->whereNotNull('served_at')->whereNotNull('completed_at')
                    ->map(fn (Ticket $t) => $t->served_at->diffInSeconds($t->completed_at));

                return [
                    'teller' => $group->first()->servedBy?->name,
                    'tickets_served' => $group->count(),
                    'avg_service_seconds' => $serviceSeconds->isNotEmpty() ? (int) round($serviceSeconds->avg()) : null,
                ];
            })
            ->sortByDesc('tickets_served')
            ->values();

        return response()->json($rows);
    }

    /** @return array{0: Carbon, 1: Carbon} */
    private function dateRangeFor(string $range): array
    {
        return match ($range) {
            '7d' => [now()->subDays(6)->startOfDay(), now()->endOfDay()],
            '30d' => [now()->subDays(29)->startOfDay(), now()->endOfDay()],
            default => [now()->startOfDay(), now()->endOfDay()],
        };
    }
}
