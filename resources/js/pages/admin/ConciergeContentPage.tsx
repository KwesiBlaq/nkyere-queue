import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/api/client';
import type { AdminContext } from '@/components/AdminLayout';
import type { PromoContentAdmin } from '@/api/types';

interface FormState {
    id: number | null;
    title: string;
    body: string;
    displaySeconds: string;
    sortOrder: string;
    isActive: boolean;
    imageFile: File | null;
    imagePreview: string | null;
}

const EMPTY_FORM: FormState = {
    id: null,
    title: '',
    body: '',
    displaySeconds: '8',
    sortOrder: '0',
    isActive: true,
    imageFile: null,
    imagePreview: null,
};

export default function ConciergeContentPage() {
    const { branch } = useOutletContext<AdminContext>();
    const [items, setItems] = useState<PromoContentAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);

    function refresh() {
        if (!branch) return;
        setLoading(true);
        api.get<PromoContentAdmin[]>(`/branches/${branch.id}/admin/promo-content`)
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }

    useEffect(refresh, [branch]);

    function openCreate() {
        setForm({ ...EMPTY_FORM });
    }

    function openEdit(item: PromoContentAdmin) {
        setForm({
            id: item.id,
            title: item.title,
            body: item.body ?? '',
            displaySeconds: String(item.display_seconds),
            sortOrder: String(item.sort_order),
            isActive: item.is_active,
            imageFile: null,
            imagePreview: item.image_url,
        });
    }

    function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setForm((f) => (f ? { ...f, imageFile: file, imagePreview: file ? URL.createObjectURL(file) : f.imagePreview } : f));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form || !branch || saving) return;
        setSaving(true);

        const data = new FormData();
        data.append('title', form.title);
        data.append('body', form.body);
        data.append('display_seconds', form.displaySeconds);
        data.append('sort_order', form.sortOrder);
        data.append('is_active', form.isActive ? '1' : '0');
        if (form.imageFile) data.append('image', form.imageFile);

        try {
            if (form.id) {
                data.append('_method', 'PUT');
                await api.post(`/admin/promo-content/${form.id}`, data);
            } else {
                await api.post(`/branches/${branch.id}/admin/promo-content`, data);
            }
            setForm(null);
            refresh();
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: PromoContentAdmin) {
        if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return;
        await api.delete(`/admin/promo-content/${item.id}`);
        refresh();
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Concierge Content</h1>
                    <p className="text-[#898781]">What plays on the signage screen while customers wait.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="rounded-lg bg-[#3987e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256abf]"
                >
                    Add content
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#898781]">Loading…</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-[#898781]">No concierge content yet — add the first item.</p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)]">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#383835] bg-[#0d0d0d] text-[#898781]">
                                <th className="p-3 font-normal">Preview</th>
                                <th className="p-3 font-normal">Title</th>
                                <th className="p-3 font-normal">Seconds</th>
                                <th className="p-3 font-normal">Order</th>
                                <th className="p-3 font-normal">Status</th>
                                <th className="p-3 font-normal"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-[#2c2c2a] bg-[#0d0d0d] last:border-0">
                                    <td className="p-3">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="h-10 w-16 rounded object-cover" />
                                        ) : (
                                            <div className="h-10 w-16 rounded bg-[#2c2c2a]" />
                                        )}
                                    </td>
                                    <td className="p-3">{item.title}</td>
                                    <td className="p-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {item.display_seconds}s
                                    </td>
                                    <td className="p-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {item.sort_order}
                                    </td>
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
                        className="w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#1a1a19] p-6"
                    >
                        <h2 className="mb-4 text-lg font-semibold">{form.id ? 'Edit content' : 'Add content'}</h2>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Title</span>
                            <input
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Body</span>
                            <textarea
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                            />
                        </label>

                        <label className="mb-3 block">
                            <span className="mb-1 block text-xs text-[#898781]">Image</span>
                            {form.imagePreview && (
                                <img src={form.imagePreview} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="w-full text-sm text-[#898781]"
                            />
                        </label>

                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-xs text-[#898781]">Display seconds</span>
                                <input
                                    type="number"
                                    min={2}
                                    max={60}
                                    value={form.displaySeconds}
                                    onChange={(e) => setForm({ ...form, displaySeconds: e.target.value })}
                                    className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-xs text-[#898781]">Sort order</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.sortOrder}
                                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                    className="w-full rounded-lg border border-[#383835] bg-[#0d0d0d] p-2.5 text-sm"
                                />
                            </label>
                        </div>

                        <label className="mb-6 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            Active (shown on signage)
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
