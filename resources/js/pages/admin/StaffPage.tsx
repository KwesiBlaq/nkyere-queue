import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/api/client';
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
                    <p className="text-[#898781]">Teller and branch admin accounts.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="rounded-lg bg-[#3987e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256abf]"
                >
                    Add staff
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#898781]">Loading…</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)]">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#383835] bg-[#0d0d0d] text-[#898781]">
                                <th className="p-3 font-normal">Name</th>
                                <th className="p-3 font-normal">Email</th>
                                <th className="p-3 font-normal">Role</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-[#2c2c2a] bg-[#0d0d0d] last:border-0">
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3 text-[#898781]">{item.email}</td>
                                    <td className="p-3">{item.role === 'branch_admin' ? 'Branch Admin' : 'Teller'}</td>
                                    <td className="p-3">
                                        {item.is_active ? (
                                            <span className="text-[#0ca30c]">Active</span>
                                        ) : (
                                            <span className="text-[#898781]">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(item)} className="mr-3 text-[#3987e5] hover:underline">
                                            Edit
                                        </button>
                                        {item.id !== user?.id && (
                                            <button onClick={() => remove(item)} className="text-[#e66767] hover:underline">
                                                Delete
                                            </button>
                                        )}
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
                        <h2 className="mb-4 text-lg font-semibold">{form.id ? 'Edit staff' : 'Add staff'}</h2>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Name</span>
                            <input
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Email</span>
                            <input
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">
                                {form.id ? 'New password (leave blank to keep current)' : 'Password'}
                            </span>
                            <input
                                required={!form.id}
                                type="password"
                                minLength={8}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Role</span>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            >
                                <option value="teller">Teller</option>
                                <option value="branch_admin">Branch Admin</option>
                            </select>
                        </label>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            Active (can log in)
                        </label>

                        {formError && <p className="mb-4 text-sm text-[#e66767]">{formError}</p>}

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
