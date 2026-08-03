<?php

namespace Modules\Signage\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Modules\QueueEngine\Models\Branch;
use Modules\Signage\Models\PromoContent;

class PromoContentController extends Controller
{
    /**
     * Public — used by the signage display. Active items only.
     */
    public function index(Branch $branch)
    {
        return $branch->promoContent()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PromoContent $promo) => $this->present($promo));
    }

    /**
     * Admin — every item, including inactive, for management.
     */
    public function adminIndex(Branch $branch)
    {
        return $branch->promoContent()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PromoContent $promo) => $this->present($promo));
    }

    public function store(Request $request, Branch $branch)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('promo', 'public');
        }

        $promo = $branch->promoContent()->create($data);

        return $this->present($promo);
    }

    public function update(Request $request, PromoContent $promo)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            if ($promo->image_url) {
                Storage::disk('public')->delete($promo->image_url);
            }
            $data['image_url'] = $request->file('image')->store('promo', 'public');
        }

        $promo->update($data);

        return $this->present($promo);
    }

    public function destroy(PromoContent $promo)
    {
        if ($promo->image_url) {
            Storage::disk('public')->delete($promo->image_url);
        }

        $promo->delete();

        return response()->noContent();
    }

    /**
     * The frontend always sends is_active explicitly as "1"/"0" (never omits
     * it) so a toggle-off is never silently dropped — HTML checkboxes don't
     * submit when unchecked, so this can't rely on the field's mere presence.
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'image' => 'nullable|image|max:4096',
            'display_seconds' => 'nullable|integer|min:2|max:60',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'required|in:0,1',
        ]);

        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }

    private function present(PromoContent $promo): array
    {
        return [
            'id' => $promo->id,
            'title' => $promo->title,
            'body' => $promo->body,
            'image_url' => $promo->image_url ? asset($promo->image_url) : null,
            'display_seconds' => $promo->display_seconds,
            'sort_order' => $promo->sort_order,
            'is_active' => $promo->is_active,
        ];
    }
}
