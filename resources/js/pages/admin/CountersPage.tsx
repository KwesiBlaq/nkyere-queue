import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/api/client';
import type { AdminContext } from '@/components/AdminLayout';
import type { CounterAdmin } from '@/api/types';

interface FormState {
    id: number | null;
    label: string;
    isOpen: boolean;
}

const EMPTY_FORM: FormState = { id: null, label: '', isOpen: true };

export default function CountersPage() {
    const { branch } = useOutletContext<AdminContext>();
    const [items, setItems] = useState<CounterAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);

    function refresh() {
        if (!branch) return;
        setLoading(true);
        api.get<CounterAdmin[]>(`/branches/${branch.id}/admin/counters`)
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }

    useEffect(refresh, [branch]);

    function openCreate() {
        setForm({ ...EMPTY_FORM });
    }

    function openEdit(item: CounterAdmin) {
        setForm({ id: item.id, label: item.label, isOpen: item.is_open });
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form || !branch || saving) return;
        setSaving(true);

        const payload = { label: form.label, is_open: form.isOpen ? '1' : '0' };

        try {
            if (form.id) {
                await api.put(`/admin/counters/${form.id}`, payload);
            } else {
                await api.post(`/branches/${branch.id}/admin/counters`, payload);
            }
            setForm(null);
            refresh();
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: CounterAdmin) {
        if (!confirm(`Delete "${item.label}"?`)) return;
        await api.delete(`/admin/counters/${item.id}`);
        refresh();
    }

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Counters</h1>
                    <p className="text-[#898781]">The physical teller stations customers get called to.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="rounded-lg bg-[#3987e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256abf]"
                >
                    Add counter
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#898781]">Loading…</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-[#898781]">No counters yet.</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)]">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#383835] bg-[#0d0d0d] text-[#898781]">
                                <th className="p-3 font-normal">Label</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-[#2c2c2a] bg-[#0d0d0d] last:border-0">
                                    <td className="p-3">{item.label}</td>
                                    <td className="p-3">
                                        {item.is_open ? (
                                            <span className="text-[#0ca30c]">Open</span>
                                        ) : (
                                            <span className="text-[#898781]">Closed</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(item)} className="mr-3 text-[#3987e5] hover:underline">
                                            Edit
                                        </button>
                                        <button onClick={() => remove(item)} className="text-[#e66767] hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {form && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
                    <form
                        onSubmit={submit}
                        className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#1a1a19] p-6"
                    >
                        <h2 className="mb-4 text-lg font-semibold">{form.id ? 'Edit counter' : 'Add counter'}</h2>

                        <label className="mb-4 block">
                            <span className="mb-1 block text-xs text-[#898781]">Label</span>
                            <input
                                required
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="Counter 4"
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isOpen}
                                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                            />
                            Open (available for teller call-next)
                        </label>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setForm(null)}
                                className="rounded-lg px-4 py-2 text-sm text-[#898781] hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={saving}
                                className="rounded-lg bg-[#3987e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256abf] disabled:opacity-50"
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
