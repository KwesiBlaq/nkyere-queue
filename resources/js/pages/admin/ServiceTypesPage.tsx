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
import type { ServiceTypeAdmin } from '@/api/types';

interface FormState {
    id: number | null;
    name: string;
    prefix: string;
    isActive: boolean;
}

const EMPTY_FORM: FormState = { id: null, name: '', prefix: '', isActive: true };

export default function ServiceTypesPage() {
    const { branch } = useOutletContext<AdminContext>();
    const [items, setItems] = useState<ServiceTypeAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function refresh() {
        if (!branch) return;
        setLoading(true);
        api.get<ServiceTypeAdmin[]>(`/branches/${branch.id}/admin/service-types`)
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }

    useEffect(refresh, [branch]);

    function openCreate() {
        setFormError(null);
        setForm({ ...EMPTY_FORM });
    }

    function openEdit(item: ServiceTypeAdmin) {
        setFormError(null);
        setForm({ id: item.id, name: item.name, prefix: item.prefix, isActive: item.is_active });
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form || !branch || saving) return;
        setSaving(true);
        setFormError(null);

        const payload = { name: form.name, prefix: form.prefix.toUpperCase(), is_active: form.isActive ? '1' : '0' };

        try {
            if (form.id) {
                await api.put(`/admin/service-types/${form.id}`, payload);
            } else {
                await api.post(`/branches/${branch.id}/admin/service-types`, payload);
            }
            setForm(null);
            refresh();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? 'Could not save — check the fields and try again.');
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: ServiceTypeAdmin) {
        if (!confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/admin/service-types/${item.id}`);
            refresh();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Could not delete this service type.');
        }
    }

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Service Types</h1>
                    <p className="text-ink-muted">The categories customers pick from at the kiosk.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={openCreate}>
                    Add service type
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-ink-muted">Loading…</p>
            ) : items.length === 0 ? (
                <Card className="text-sm text-ink-muted">No service types yet.</Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-ink-muted">
                                <th className="p-3 font-normal">Prefix</th>
                                <th className="p-3 font-normal">Name</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-surface-hover last:border-0">
                                    <td className="p-3 font-semibold">{item.prefix}</td>
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3">
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>
                                            {item.is_active ? 'Active' : 'Inactive'}
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
                <Modal title={form.id ? 'Edit service type' : 'Add service type'} onClose={() => setForm(null)}>
                    <form onSubmit={submit}>
                        <Field label="Name">
                            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Field>

                        <Field label="Prefix (1–2 letters, used on tickets)">
                            <TextInput
                                required
                                maxLength={2}
                                value={form.prefix}
                                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                                className="w-24 uppercase"
                            />
                        </Field>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            Active (shown at the kiosk)
                        </label>

                        {formError && <p className="mb-4 text-sm text-danger">{formError}</p>}

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
