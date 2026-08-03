import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/api/client';
import type { AdminContext } from '@/components/AdminLayout';
import type { ReportOverview, ServiceTypeVolume, TellerThroughput } from '@/api/types';

type Range = 'today' | '7d' | '30d';

const RANGE_LABELS: Record<Range, string> = { today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days' };

export default function DashboardPage() {
    const { branch } = useOutletContext<AdminContext>();
    const [range, setRange] = useState<Range>('today');
    const [overview, setOverview] = useState<ReportOverview | null>(null);
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeVolume[]>([]);
    const [tellers, setTellers] = useState<TellerThroughput[]>([]);

    useEffect(() => {
        if (!branch) return;

        api.get<ReportOverview>(`/branches/${branch.id}/reports/overview`, { params: { range } }).then((res) => setOverview(res.data));
        api.get<ServiceTypeVolume[]>(`/branches/${branch.id}/reports/service-types`, { params: { range } }).then((res) => setServiceTypes(res.data));
        api.get<TellerThroughput[]>(`/branches/${branch.id}/reports/tellers`, { params: { range } }).then((res) => setTellers(res.data));
    }, [branch, range]);

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{branch?.name}</h1>
                <p className="text-[#898781]">Branch performance</p>
            </div>

            <RangeFilter range={range} onChange={setRange} />

            <StatTileRow overview={overview} />

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ServiceTypeBarChart data={serviceTypes} />
                <TellerTable data={tellers} />
            </div>
        </div>
    );
}

function RangeFilter({ range, onChange }: { range: Range; onChange: (r: Range) => void }) {
    return (
        <div className="mb-8 flex gap-1 rounded-lg border border-[rgba(255,255,255,0.10)] p-1" style={{ width: 'fit-content' }}>
            {(Object.keys(RANGE_LABELS) as Range[]).map((key) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`rounded-md px-4 py-2 text-sm transition ${
                        range === key ? 'bg-[#2c2c2a] font-semibold text-white' : 'text-[#898781] hover:text-white'
                    }`}
                >
                    {range === key && <span className="mr-1.5">✓</span>}
                    {RANGE_LABELS[key]}
                </button>
            ))}
        </div>
    );
}

function StatTileRow({ overview }: { overview: ReportOverview | null }) {
    const noShowHigh = (overview?.no_show_rate ?? 0) > 10;

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="Tickets issued" value={overview?.issued ?? '—'} />
            <StatTile label="Avg wait time" value={formatDuration(overview?.avg_wait_seconds)} />
            <StatTile label="Avg service time" value={formatDuration(overview?.avg_service_seconds)} />
            <StatTile
                label="No-show rate"
                value={overview ? `${overview.no_show_rate}%` : '—'}
                accent={noShowHigh ? '#fab219' : undefined}
                badge={noShowHigh ? '⚠ high' : undefined}
            />
        </div>
    );
}

function StatTile({ label, value, accent, badge }: { label: string; value: string | number; accent?: string; badge?: string }) {
    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d0d0d] p-5">
            <p className="text-sm text-[#898781]">{label}</p>
            <p className="mt-1 text-3xl font-bold" style={{ color: accent ?? '#ffffff', fontVariantNumeric: 'proportional-nums' }}>
                {value}
            </p>
            {badge && (
                <p className="mt-1 text-xs" style={{ color: accent }}>
                    {badge}
                </p>
            )}
        </div>
    );
}

function ServiceTypeBarChart({ data }: { data: ServiceTypeVolume[] }) {
    const max = Math.max(1, ...data.map((d) => d.ticket_count));
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d0d0d] p-6">
            <h2 className="mb-6 text-sm font-semibold text-[#c3c2b7]">Ticket volume by service type</h2>
            {data.length === 0 ? (
                <p className="text-sm text-[#898781]">No tickets in this range.</p>
            ) : (
                <div className="flex h-48 items-end gap-3 border-b border-[#383835]">
                    {data.map((row) => (
                        <div
                            key={row.service_type}
                            className="group relative flex flex-1 flex-col items-center justify-end gap-2"
                            onMouseEnter={() => setHovered(row.service_type)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {hovered === row.service_type && (
                                <div className="absolute -top-8 rounded-md bg-[#2c2c2a] px-2 py-1 text-xs whitespace-nowrap text-white">
                                    {row.ticket_count} tickets
                                </div>
                            )}
                            <div
                                className="w-full rounded-t-[4px] bg-[#3987e5] transition-opacity group-hover:opacity-80"
                                style={{ height: `${Math.max(4, (row.ticket_count / max) * 100)}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}
            {data.length > 0 && (
                <div className="mt-2 flex gap-3">
                    {data.map((row) => (
                        <div key={row.service_type} className="flex-1 text-center text-xs text-[#898781]">
                            {row.service_type}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TellerTable({ data }: { data: TellerThroughput[] }) {
    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d0d0d] p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#c3c2b7]">Teller throughput</h2>
            {data.length === 0 ? (
                <p className="text-sm text-[#898781]">No completed tickets in this range.</p>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[#383835] text-[#898781]">
                            <th className="pb-2 font-normal">Teller</th>
                            <th className="pb-2 font-normal" style={{ textAlign: 'right' }}>
                                Served
                            </th>
                            <th className="pb-2 font-normal" style={{ textAlign: 'right' }}>
                                Avg time
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.teller} className="border-b border-[#2c2c2a] last:border-0">
                                <td className="py-2.5">{row.teller}</td>
                                <td className="py-2.5" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                    {row.tickets_served}
                                </td>
                                <td className="py-2.5" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                    {formatDuration(row.avg_service_seconds)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
