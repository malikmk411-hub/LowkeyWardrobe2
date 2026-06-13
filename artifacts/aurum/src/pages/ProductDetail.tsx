import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct } from '@workspace/api-client-react';
import { products as hardcodedProducts, Product } from '../data/products';
import { FigureSVG } from '../components/FigureSVG';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const slug = params?.slug;

  const { data: apiProduct, isLoading } = useGetProduct(slug || '', { query: { enabled: !!slug } });
  
  const product: Product | undefined = apiProduct || hardcodedProducts.find(p => p.slug === slug);

  const [activeSize, setActiveSize] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    if (product) {
      setActiveSize('');
      setActiveColor(product.colors[0]);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (isLoading && !product) {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex flex-col items-center justify-center bg-white text-black">
        <h1 className="font-serif text-[42px] italic mb-6">Product not found</h1>
        <Link href="/products">
          <button className="border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
            Back to Collection
          </button>
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    if (!activeSize) {
      showToast("Please select a size");
      return;
    }
    addItem(product, activeSize, activeColor);
  };

  const handleWishlist = () => {
    toggle(product.id);
    showToast(isWishlisted ? `Removed from wishlist` : `Added to wishlist`);
  };

  return (
    <div className="w-full min-h-[100dvh] pt-[64px] bg-white text-black">
      
      {/* Breadcrumb */}
      <div className="px-8 py-6 max-w-[1600px] mx-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#999999]">
        <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
        <ChevronRight size={10} />
        <Link href={`/products?category=${product.category}`}>
          <span className="hover:text-black transition-colors cursor-pointer">{product.category}</span>
        </Link>
        <ChevronRight size={10} />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
        
        {/* Left: Visuals */}
        <div className="p-8 md:p-12 lg:p-20 flex flex-col items-center justify-center bg-[#FAFAFA] relative">
          <div className="absolute inset-0" style={{ background: product.bgGradient, opacity: 0.5 }} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[500px] aspect-[3/4] relative z-10"
          >
            <FigureSVG 
              figType={product.figType} 
              ca={product.figColorA} 
              cb={product.figColorB} 
              className="w-full h-full"
            />
          </motion.div>
          
          {product.badge && (
            <div className="absolute top-12 left-12 z-20">
              <span className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white ${product.badge === 'sale' ? 'bg-[#C41E1E]' : 'bg-black'}`}>
                {product.badge === 'new' ? 'New Arrival' : 'Sale'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="p-8 md:p-12 lg:p-24 flex flex-col justify-center max-w-[600px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mb-4">{product.brand}</p>
            <h1 className="font-serif text-[clamp(32px,3.5vw,48px)] leading-[1.1] font-light italic mb-6">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-10">
              {product.originalPrice && (
                <span className="text-[18px] text-[#999999] line-through">${product.originalPrice}</span>
              )}
              <span className={`text-[20px] font-medium ${product.badge === 'sale' ? 'text-[#C41E1E]' : 'text-black'}`}>
                ${product.price}
              </span>
            </div>

            <p className="text-[14px] font-light leading-[1.8] text-[#333333] mb-12">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.2em] mb-4">Color</p>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      activeColor === color ? 'border-black' : 'border-transparent hover:border-[#EAEAEA]'
                    }`}
                  >
                    <span 
                      className="w-6 h-6 rounded-full border border-[#EAEAEA]"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[11px] uppercase tracking-[0.2em]">Size</p>
                <button className="text-[10px] text-[#999999] underline underline-offset-4 hover:text-black">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`py-3 text-[12px] border transition-colors ${
                      activeSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-[#EAEAEA] text-black hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-10">
              <button 
                onClick={handleAdd}
                className="flex-1 bg-black text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors"
              >
                Add to Bag
              </button>
              <button 
                onClick={handleWishlist}
                className={`w-14 flex items-center justify-center border transition-colors ${
                  isWishlisted ? 'border-black bg-black text-white' : 'border-[#EAEAEA] hover:border-black'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4 border-t border-[#EAEAEA] pt-8 text-[12px] font-light text-[#666666]">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>Free complimentary shipping on orders over $250</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>Free returns within 30 days</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>SKU: {product.sku}</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
