import { useState } from 'react';
import { useListProducts } from '@workspace/api-client-react';
import { products as hardcodedProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'framer-motion';

export default function Products() {
  const { data: apiProducts } = useListProducts();
  const [activeCategory, setActiveCategory] = useState('all');

  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : hardcodedProducts;
  
  const filteredProducts = activeCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter(p => p.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
  ];

  return (
    <div className="w-full min-h-[100dvh] pt-[120px] pb-24 bg-white text-black">
      <div className="max-w-[1600px] mx-auto px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15] mb-4">Collection</h1>
            <p className="text-[13px] font-light text-[#666666] max-w-[400px]">
              Discover our latest pieces, crafted with uncompromising attention to detail and designed for the modern wardrobe.
            </p>
          </div>
          
          <div className="flex gap-6 border-b border-[#EAEAEA] pb-4 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition-colors relative ${activeCategory === cat.id ? 'text-black' : 'text-[#999999] hover:text-black'}`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div layoutId="productTabs" className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-black" />
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-32 text-center">
            <h3 className="font-serif text-[28px] italic text-[#999999]">No products found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
