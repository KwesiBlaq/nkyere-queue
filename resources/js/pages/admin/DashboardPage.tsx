import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import { api } from '@/api/client';
import Card from '@/components/ui/Card';
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
                <p className="text-ink-muted">Branch performance</p>
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
        <div className="mb-8 flex w-fit gap-1 rounded-lg border border-border-subtle/10 p-1">
            {(Object.keys(RANGE_LABELS) as Range[]).map((key) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`rounded-md px-4 py-2 text-sm transition ${
                        range === key ? 'bg-surface-hover font-semibold text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
                    }`}
                >
                    {range === key && <Check size={14} className="mr-1.5 inline" />}
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
            <StatTile icon={Ticket} label="Tickets issued" value={overview?.issued ?? '—'} />
            <StatTile icon={Clock} label="Avg wait time" value={formatDuration(overview?.avg_wait_seconds)} />
            <StatTile icon={CheckCircle2} label="Avg service time" value={formatDuration(overview?.avg_service_seconds)} />
            <StatTile
                icon={AlertTriangle}
                label="No-show rate"
                value={overview ? `${overview.no_show_rate}%` : '—'}
                tone={noShowHigh ? 'warning' : 'default'}
                badge={noShowHigh ? 'Higher than usual' : undefined}
            />
        </div>
    );
}

function StatTile({
    icon: Icon,
    label,
    value,
    tone = 'default',
    badge,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string | number;
    tone?: 'default' | 'warning';
    badge?: string;
}) {
    const accent = tone === 'warning' ? 'text-warning' : 'text-accent';

    return (
        <Card className="p-5">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-current/15 ${accent}`}>
                <Icon size={18} className={accent} />
            </div>
            <p className="text-sm text-ink-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold" style={{ fontVariantNumeric: 'proportional-nums' }}>
                {value}
            </p>
            {badge && <p className={`mt-1 text-xs ${accent}`}>{badge}</p>}
        </Card>
    );
}

function ServiceTypeBarChart({ data }: { data: ServiceTypeVolume[] }) {
    const max = Math.max(1, ...data.map((d) => d.ticket_count));
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <Card>
            <h2 className="mb-6 text-sm font-semibold text-ink-secondary">Ticket volume by service type</h2>
            {data.length === 0 ? (
                <p className="text-sm text-ink-muted">No tickets in this range.</p>
            ) : (
                <div className="flex h-48 items-end gap-3 border-b border-border">
                    {data.map((row) => (
                        <div
                            key={row.service_type}
                            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                            onMouseEnter={() => setHovered(row.service_type)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {hovered === row.service_type && (
                                <div className="absolute -top-8 rounded-md bg-surface-hover px-2 py-1 text-xs whitespace-nowrap text-ink-primary">
                                    {row.ticket_count} tickets
                                </div>
                            )}
                            <div
                                className="w-full rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-80"
                                style={{ height: `${Math.max(4, (row.ticket_count / max) * 100)}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}
            {data.length > 0 && (
                <div className="mt-2 flex gap-3">
                    {data.map((row) => (
                        <div key={row.service_type} className="flex-1 text-center text-xs text-ink-muted">
                            {row.service_type}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function TellerTable({ data }: { data: TellerThroughput[] }) {
    return (
        <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink-secondary">Teller throughput</h2>
            {data.length === 0 ? (
                <p className="text-sm text-ink-muted">No completed tickets in this range.</p>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border text-ink-muted">
                            <th className="pb-2 font-normal">Teller</th>
                            <th className="pb-2 text-right font-normal">Served</th>
                            <th className="pb-2 text-right font-normal">Avg time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.teller} className="border-b border-surface-hover last:border-0">
                                <td className="py-2.5">{row.teller}</td>
                                <td className="py-2.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {row.tickets_served}
                                </td>
                                <td className="py-2.5 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatDuration(row.avg_service_seconds)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Card>
    );
}

function formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
