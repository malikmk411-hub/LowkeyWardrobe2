import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, X, Check, Package } from 'lucide-react';

interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge: string | null;
  stock: number;
  description: string;
  isActive: boolean;
  sku: string;
  sizes: string[];
  colors: string[];
  imageUrl?: string;
}

const SIZE_OPTIONS: Record<string, string[]> = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
  accessories: ['One Size'],
};

const DEFAULT_FORM = {
  name: '',
  brand: '',
  category: 'clothing' as 'clothing' | 'shoes' | 'accessories',
  price: '' as number | '',
  originalPrice: '' as number | '',
  badge: '' as string,
  stock: '' as number | '',
  sizes: [] as string[],
  colors: [] as string[],
  description: '',
  imageUrl: '',
  isActive: true,
};

type FormState = typeof DEFAULT_FORM;

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; product?: AdminProduct }>({ open: false, mode: 'add' });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [newColor, setNewColor] = useState('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => {
    setLoading(true);
    adminFetch('/api/admin/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ ...DEFAULT_FORM });
    setModal({ open: true, mode: 'add' });
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category as 'clothing' | 'shoes' | 'accessories',
      price: p.price,
      originalPrice: p.originalPrice ?? '',
      badge: p.badge ?? '',
      stock: p.stock,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? '',
      isActive: p.isActive,
    });
    setModal({ open: true, mode: 'edit', product: p });
  };

  const closeModal = () => { setModal({ open: false, mode: 'add' }); setSaving(false); };

  const updateForm = (key: keyof FormState, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    if (!form.colors.includes(newColor)) {
      setForm(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    }
  };

  const removeColor = (c: string) =>
    setForm(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }));

  const discountPct = form.originalPrice && form.price
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
    : null;

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand || 'Lowkey Wardrobe',
        category: form.category,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        badge: form.badge || null,
        stock: Number(form.stock) || 0,
        sizes: form.sizes,
        colors: form.colors,
        description: form.description,
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
      };

      if (modal.mode === 'add') {
        const res = await adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          setProducts(prev => [created, ...prev]);
        }
      } else if (modal.product) {
        const res = await adminFetch(`/api/admin/products/${modal.product.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === modal.product!.id ? { ...p, ...updated } : p));
        }
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteId));
      }
    } finally {
      setSaving(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (p: AdminProduct) => {
    const res = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, isActive: !p.isActive } : pr));
    }
  };

  const markSoldOut = async (p: AdminProduct) => {
    const res = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ stock: 0 }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, stock: 0 } : pr));
    }
  };

  const sizeOptions = SIZE_OPTIONS[form.category] || SIZE_OPTIONS.clothing;

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[320px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, SKU, category..."
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[12px] text-[#999999]">{filtered.length} products</p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-black text-white px-5 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
                    {['', 'Product', 'Category', 'Price (PKR)', 'Stock', 'Badge', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map(p => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-b border-[#F5F5F5] transition-colors ${!p.isActive ? 'opacity-40' : 'hover:bg-[#FAFAFA]'}`}
                      >
                        {/* Thumbnail */}
                        <td className="px-3 py-3">
                          <div className="w-10 h-12 bg-[#F0F0F0] shrink-0 overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={14} className="text-[#BDBDBD]" strokeWidth={1} />
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px]">{p.name}</p>
                            <p className="text-[11px] text-[#999999]">{p.brand}</p>
                            <p className="text-[10px] font-mono text-[#BDBDBD] mt-0.5">{p.sku}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-[#666666] capitalize">{p.category}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div>
                            {p.originalPrice && (
                              <span className="text-[11px] text-[#BDBDBD] line-through block">{Number(p.originalPrice).toLocaleString()}</span>
                            )}
                            <span className="text-[13px]">{Number(p.price).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[13px] ${p.stock === 0 ? 'text-[#BDBDBD]' : ''}`}>{p.stock}</span>
                            {p.stock === 0 && <span className="text-[9px] uppercase tracking-[0.1em] text-[#BDBDBD]">Sold Out</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {p.badge ? (
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white bg-black">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-[#BDBDBD] text-[12px]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => toggleActive(p)} className="flex items-center gap-1.5 text-[11px] text-[#999999] hover:text-black transition-colors">
                            {p.isActive ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                            <span>{p.isActive ? 'Live' : 'Hidden'}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              title="Edit product"
                              className="w-7 h-7 border border-[#EAEAEA] flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors"
                            >
                              <Edit2 size={12} />
                            </button>
                            {p.stock > 0 && (
                              <button
                                onClick={() => markSoldOut(p)}
                                title="Mark as sold out"
                                className="w-7 h-7 border border-[#EAEAEA] flex items-center justify-center hover:border-black transition-colors text-[9px] font-medium"
                              >
                                0
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteId(p.id)}
                              title="Delete product"
                              className="w-7 h-7 border border-[#EAEAEA] flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-[13px] text-[#999999]">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[560px] max-w-[95vw] bg-white z-[1001] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAEAEA]">
                <h2 className="font-serif text-[22px] italic font-light">
                  {modal.mode === 'add' ? 'Add Product' : 'Edit Product'}
                </h2>
                <button onClick={closeModal} className="p-1.5 hover:bg-[#F5F5F5] rounded-full">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                {/* Product Info */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Product Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Name <span className="text-black">*</span></label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => updateForm('name', e.target.value)}
                        placeholder="e.g. Oversized Wool Coat"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Brand</label>
                        <input
                          type="text"
                          value={form.brand}
                          onChange={e => updateForm('brand', e.target.value)}
                          placeholder="LKW Essentials"
                          className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Category <span className="text-black">*</span></label>
                        <select
                          value={form.category}
                          onChange={e => {
                            updateForm('category', e.target.value);
                            updateForm('sizes', []);
                          }}
                          className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
                        >
                          <option value="clothing">Clothing</option>
                          <option value="shoes">Shoes</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => updateForm('description', e.target.value)}
                        placeholder="Describe the product..."
                        rows={3}
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Pricing (PKR)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Price <span className="text-black">*</span></label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => updateForm('price', e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="e.g. 24900"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">
                        Original Price
                        {discountPct && discountPct > 0 && (
                          <span className="ml-2 text-black font-medium">(–{discountPct}%)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={form.originalPrice}
                        onChange={e => updateForm('originalPrice', e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="For sale items"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>
                </section>

                {/* Badge & Status */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Badge & Visibility</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Badge</label>
                      <select
                        value={form.badge}
                        onChange={e => updateForm('badge', e.target.value)}
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
                      >
                        <option value="">None</option>
                        <option value="new">New Arrival</option>
                        <option value="sale">Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Visibility</label>
                      <button
                        type="button"
                        onClick={() => updateForm('isActive', !form.isActive)}
                        className={`w-full flex items-center justify-center gap-2 py-3 text-[12px] border transition-colors ${form.isActive ? 'border-black bg-black text-white' : 'border-[#EAEAEA] text-[#999999]'}`}
                      >
                        {form.isActive ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
                        {form.isActive ? 'Live' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Inventory */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Inventory</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={e => updateForm('stock', e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="0"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateForm('stock', 0)}
                      className="px-5 py-3 border border-[#EAEAEA] text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors whitespace-nowrap"
                    >
                      Mark Sold Out
                    </button>
                  </div>
                </section>

                {/* Sizes */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 text-[12px] border transition-colors ${
                          form.sizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-[#EAEAEA] text-black hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Colors */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Colors</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {form.colors.map(c => (
                      <div key={c} className="relative group/color">
                        <div
                          className="w-9 h-9 rounded-full border-2 border-[#EAEAEA] cursor-pointer"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(c)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full hidden group-hover/color:flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={newColor}
                        onChange={e => setNewColor(e.target.value)}
                        className="w-9 h-9 rounded-full border border-[#EAEAEA] cursor-pointer p-0 overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-3 py-1.5 border border-[#EAEAEA] text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </section>

                {/* Image URL */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Product Image</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Image URL</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={e => updateForm('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                    />
                  </div>
                  {form.imageUrl && (
                    <div className="mt-3 w-24 h-28 border border-[#EAEAEA] overflow-hidden bg-[#F5F5F5]">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </section>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#EAEAEA] px-8 py-5 flex gap-3 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-[#EAEAEA] py-3.5 text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price}
                  className="flex-1 bg-black text-white py-3.5 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Check size={14} /> {modal.mode === 'add' ? 'Create Product' : 'Save Changes'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/50 z-[1002]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[1003] p-10 w-[380px] max-w-[95vw] text-center"
            >
              <h3 className="font-serif text-[22px] italic mb-3">Delete Product?</h3>
              <p className="text-[13px] text-[#666666] mb-8 leading-[1.6]">
                This will permanently remove the product from your store. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 border border-[#EAEAEA] py-3 text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 bg-black text-white py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
