import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import { api } from '@/api/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Field, TextInput } from '@/components/ui/Field';
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
                    <p className="text-ink-muted">What plays on the signage screen while customers wait.</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={openCreate}>
                    Add content
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-ink-muted">Loading…</p>
            ) : items.length === 0 ? (
                <Card className="text-sm text-ink-muted">No concierge content yet — add the first item.</Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-ink-muted">
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
                                <tr key={item.id} className="border-b border-surface-hover last:border-0">
                                    <td className="p-3">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="h-10 w-16 rounded object-cover" />
                                        ) : (
                                            <div className="flex h-10 w-16 items-center justify-center rounded bg-surface-hover">
                                                <ImageOff size={14} className="text-ink-muted" />
                                            </div>
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
                <Modal title={form.id ? 'Edit content' : 'Add content'} onClose={() => setForm(null)}>
                    <form onSubmit={submit}>
                        <Field label="Title">
                            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </Field>

                        <Field label="Body">
                            <textarea
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none focus:border-accent"
                            />
                        </Field>

                        <Field label="Image">
                            {form.imagePreview && (
                                <img src={form.imagePreview} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
                            )}
                            <input type="file" accept="image/*" onChange={onImageChange} className="w-full text-sm text-ink-muted" />
                        </Field>

                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <Field label="Display seconds">
                                <TextInput
                                    type="number"
                                    min={2}
                                    max={60}
                                    value={form.displaySeconds}
                                    onChange={(e) => setForm({ ...form, displaySeconds: e.target.value })}
                                />
                            </Field>
                            <Field label="Sort order">
                                <TextInput
                                    type="number"
                                    min={0}
                                    value={form.sortOrder}
                                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                />
                            </Field>
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
