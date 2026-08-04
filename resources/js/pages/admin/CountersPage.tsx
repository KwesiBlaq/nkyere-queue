import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/api/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Field, TextInput } from '@/components/ui/Field';
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
                    <p className="text-ink-muted">The physical teller stations customers get called to.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={openCreate}>
                    Add counter
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-ink-muted">Loading…</p>
            ) : items.length === 0 ? (
                <Card className="text-sm text-ink-muted">No counters yet.</Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-ink-muted">
                                <th className="p-3 font-normal">Label</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-surface-hover last:border-0">
                                    <td className="p-3">{item.label}</td>
                                    <td className="p-3">
                                        <Badge variant={item.is_open ? 'success' : 'neutral'}>
                                            {item.is_open ? 'Open' : 'Closed'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <Button variant="ghost" icon={Pencil} iconOnly title="Edit" onClick={() => openEdit(item)} />
                                        <Button variant="danger" icon={Trash2} iconOnly title="Delete" onClick={() => remove(item)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {form && (
                <Modal title={form.id ? 'Edit counter' : 'Add counter'} onClose={() => setForm(null)}>
                    <form onSubmit={submit}>
                        <Field label="Label">
                            <TextInput
                                required
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="Counter 4"
                            />
                        </Field>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isOpen}
                                onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                            />
                            Open (available for teller call-next)
                        </label>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
                                Cancel
                            </Button>
                            <Button variant="primary" disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
