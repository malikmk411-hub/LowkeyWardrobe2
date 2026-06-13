import { useState, useEffect } from 'react';
import { useListProducts } from '@workspace/api-client-react';
import { products as hardcodedProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function Products() {
  const { data: apiProducts } = useListProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read category from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : hardcodedProducts;

  let filtered = displayProducts.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'sale') return p.badge === 'sale';
    if (activeCategory === 'new') return p.badge === 'new';
    return p.category === activeCategory;
  });

  // Price filter
  filtered = filtered.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'newest': return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
      default: return 0;
    }
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'sale', label: 'Sale' },
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'New Arrivals' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Alphabetical' },
  ];

  return (
    <div className="w-full min-h-[100dvh] pt-[100px] pb-24 bg-white text-black">
      <div className="max-w-[1600px] mx-auto px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15] mb-3">Collection</h1>
          <p className="text-[13px] font-light text-[#666666]">
            {sorted.length} {sorted.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>

        {/* Category tabs + Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="flex gap-6 border-b border-[#EAEAEA] pb-0 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const url = new URL(window.location.href);
                  if (cat.id === 'all') url.searchParams.delete('category');
                  else url.searchParams.set('category', cat.id);
                  window.history.replaceState({}, '', url.toString());
                }}
                className={`text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition-colors relative pb-4 ${
                  activeCategory === cat.id ? 'text-black' : 'text-[#999999] hover:text-black'
                } ${cat.id === 'sale' ? 'text-black' : ''}`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div layoutId="productTabs" className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-black" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Price filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 border px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${filtersOpen ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 border border-[#EAEAEA] px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors"
              >
                <span>{sortOptions.find(s => s.value === sortBy)?.label}</span>
                <ChevronDown size={13} strokeWidth={1.5} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#EAEAEA] min-w-[180px] z-30 shadow-lg">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[12px] hover:bg-[#F5F5F5] transition-colors ${sortBy === opt.value ? 'font-medium' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-[#FAFAFA] border border-[#EAEAEA] p-6"
          >
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] mb-4">
                  Price Range: PKR {priceRange[0].toLocaleString()} – PKR {priceRange[1].toLocaleString()}
                </p>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-black"
                />
                <div className="flex justify-between text-[11px] text-[#999999] mt-1">
                  <span>PKR 0</span>
                  <span>PKR 100,000+</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-4">Quick Reset</p>
                <button
                  onClick={() => { setPriceRange([0, 100000]); setActiveCategory('all'); setSortBy('featured'); }}
                  className="border border-[#EAEAEA] px-4 py-2 text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="py-32 text-center">
            <h3 className="font-serif text-[28px] italic text-[#999999]">No products found</h3>
            <button onClick={() => { setActiveCategory('all'); setPriceRange([0, 2000]); }} className="mt-6 border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
            {sorted.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="bg-white"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close sort */}
      {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
    </div>
  );
}
