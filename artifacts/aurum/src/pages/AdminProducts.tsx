import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Search, Edit2, Check, X, Eye, EyeOff } from 'lucide-react';

interface Product {
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
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    adminFetch('/api/admin/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditValues({ price: p.price, originalPrice: p.originalPrice, stock: p.stock, badge: p.badge ?? '', description: p.description });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      const payload = { ...editValues, badge: editValues.badge || null };
      const res = await adminFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Product) => {
    const res = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, isActive: !p.isActive } : pr));
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[320px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <p className="text-[12px] text-[#999999]">{filtered.length} products</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
                    {['SKU', 'Product', 'Category', 'Price', 'Stock', 'Badge', 'Status', 'Actions'].map(h => (
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
                        className={`border-b border-[#F5F5F5] transition-colors ${!p.isActive ? 'opacity-50' : 'hover:bg-[#FAFAFA]'}`}
                      >
                        <td className="px-5 py-4 text-[11px] font-mono text-[#999999] whitespace-nowrap">{p.sku}</td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-[13px]">{p.name}</p>
                            <p className="text-[11px] text-[#999999]">{p.brand}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-[#666666]">{p.category}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {editingId === p.id ? (
                            <input
                              type="number"
                              value={editValues.price ?? p.price}
                              onChange={e => setEditValues(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                              className="w-24 border border-black px-2 py-1 text-[13px] outline-none"
                            />
                          ) : (
                            <span className="text-[13px]">${p.price}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {editingId === p.id ? (
                            <input
                              type="number"
                              value={editValues.stock ?? p.stock}
                              onChange={e => setEditValues(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                              className="w-20 border border-black px-2 py-1 text-[13px] outline-none"
                            />
                          ) : (
                            <span className={`text-[13px] ${p.stock < 10 ? 'text-amber-600' : ''}`}>{p.stock}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {editingId === p.id ? (
                            <select
                              value={editValues.badge ?? ''}
                              onChange={e => setEditValues(prev => ({ ...prev, badge: e.target.value }))}
                              className="border border-black px-2 py-1 text-[12px] outline-none bg-white"
                            >
                              <option value="">None</option>
                              <option value="new">New</option>
                              <option value="sale">Sale</option>
                            </select>
                          ) : p.badge ? (
                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white ${p.badge === 'sale' ? 'bg-[#C41E1E]' : 'bg-black'}`}>
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
                            {editingId === p.id ? (
                              <>
                                <button
                                  onClick={() => saveEdit(p.id)}
                                  disabled={saving}
                                  className="w-7 h-7 bg-black text-white flex items-center justify-center hover:bg-[#333333] transition-colors disabled:opacity-50"
                                >
                                  <Check size={13} />
                                </button>
                                <button onClick={cancelEdit} className="w-7 h-7 border border-[#EAEAEA] flex items-center justify-center hover:border-black transition-colors">
                                  <X size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(p)}
                                className="w-7 h-7 border border-[#EAEAEA] flex items-center justify-center hover:border-black transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
