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
import type { StaffMember } from '@/api/types';

interface FormState {
    id: number | null;
    name: string;
    email: string;
    password: string;
    role: 'teller' | 'branch_admin';
    isActive: boolean;
}

const EMPTY_FORM: FormState = { id: null, name: '', email: '', password: '', role: 'teller', isActive: true };

export default function StaffPage() {
    const { user } = useOutletContext<AdminContext>();
    const [items, setItems] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function refresh() {
        setLoading(true);
        api.get<StaffMember[]>('/admin/staff')
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }

    useEffect(refresh, []);

    function openCreate() {
        setFormError(null);
        setForm({ ...EMPTY_FORM });
    }

    function openEdit(item: StaffMember) {
        setFormError(null);
        setForm({ id: item.id, name: item.name, email: item.email, password: '', role: item.role, isActive: item.is_active });
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form || saving) return;
        setSaving(true);
        setFormError(null);

        const payload: Record<string, string> = {
            name: form.name,
            email: form.email,
            role: form.role,
            is_active: form.isActive ? '1' : '0',
        };
        if (form.password) payload.password = form.password;

        try {
            if (form.id) {
                await api.put(`/admin/staff/${form.id}`, payload);
            } else {
                await api.post('/admin/staff', payload);
            }
            setForm(null);
            refresh();
        } catch (err: any) {
            setFormError(err?.response?.data?.message ?? 'Could not save — check the fields and try again.');
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: StaffMember) {
        if (!confirm(`Delete ${item.name}'s account?`)) return;
        try {
            await api.delete(`/admin/staff/${item.id}`);
            refresh();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Could not delete this account.');
        }
    }

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Staff</h1>
                    <p className="text-ink-muted">Teller and branch admin accounts.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={openCreate}>
                    Add staff
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-ink-muted">Loading…</p>
            ) : (
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-ink-muted">
                                <th className="p-3 font-normal">Name</th>
                                <th className="p-3 font-normal">Email</th>
                                <th className="p-3 font-normal">Role</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-surface-hover last:border-0">
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3 text-ink-muted">{item.email}</td>
                                    <td className="p-3">
                                        <Badge variant={item.role === 'branch_admin' ? 'accent' : 'neutral'}>
                                            {item.role === 'branch_admin' ? 'Branch Admin' : 'Teller'}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <Button variant="ghost" icon={Pencil} iconOnly title="Edit" onClick={() => openEdit(item)} />
                                        {item.id !== user?.id && (
                                            <Button variant="danger" icon={Trash2} iconOnly title="Delete" onClick={() => remove(item)} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {form && (
                <Modal title={form.id ? 'Edit staff' : 'Add staff'} onClose={() => setForm(null)}>
                    <form onSubmit={submit}>
                        <Field label="Name">
                            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Field>

                        <Field label="Email">
                            <TextInput
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </Field>

                        <Field label={form.id ? 'New password (leave blank to keep current)' : 'Password'}>
                            <TextInput
                                required={!form.id}
                                type="password"
                                minLength={8}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </Field>

                        <Field label="Role">
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
                                className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none focus:border-accent"
                            >
                                <option value="teller">Teller</option>
                                <option value="branch_admin">Branch Admin</option>
                            </select>
                        </Field>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            Active (can log in)
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
