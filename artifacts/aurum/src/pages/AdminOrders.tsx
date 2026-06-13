import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Search, ShoppingBag } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  country: string;
  items: any[];
  subtotal: string;
  shipping: string;
  total: string;
  status: string;
  created_at: string;
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[320px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order number or email..."
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <p className="text-[12px] text-[#999999]">{filtered.length} orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#EAEAEA] p-16 text-center">
            <ShoppingBag size={32} strokeWidth={1} className="mx-auto mb-4 text-[#EAEAEA]" />
            <p className="font-serif text-[20px] italic text-[#999999]">No orders yet</p>
            <p className="text-[12px] text-[#BDBDBD] mt-2">Customer orders will appear here</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] space-y-0 divide-y divide-[#F5F5F5]">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="px-6 py-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-6">
                      <span className="text-[12px] font-mono text-black">{order.order_number}</span>
                      <span className="text-[13px]">{order.first_name} {order.last_name}</span>
                      <span className="text-[12px] text-[#999999] hidden sm:block">{order.email}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-medium">${parseFloat(order.total).toFixed(2)}</span>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="text-[11px] text-[#999999]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-6 pb-6 bg-[#FAFAFA] border-t border-[#EAEAEA]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-3">Shipping Address</p>
                        <p className="text-[13px] leading-[1.7]">
                          {order.first_name} {order.last_name}<br/>
                          {order.address}<br/>
                          {order.city}, {order.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-3">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {statuses.map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              disabled={updatingId === order.id}
                              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                                order.status === s ? 'bg-black text-white' : 'border border-[#EAEAEA] hover:border-black'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-3">Items</p>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[13px] text-[#666666]">
                              <span>{item.name} · Size {item.size} × {item.qty}</span>
                              <span>${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
