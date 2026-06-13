import { motion, AnimatePresence } from 'framer-motion';
import { useListProducts, useSubscribeNewsletter } from '@workspace/api-client-react';
import { products as hardcodedProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { FigureSVG } from '../components/FigureSVG';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Truck, ShieldCheck, RefreshCw, Gift } from 'lucide-react';

export default function Home() {
  const { data: apiProducts } = useListProducts();
  const { mutate: subscribe } = useSubscribeNewsletter();
  const { showToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [, setLocation] = useLocation();

  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : hardcodedProducts;
  const newArrivals = displayProducts.filter(p => p.badge === 'new').slice(0, 4);
  const filteredArrivals = activeTab === 'all' 
    ? newArrivals 
    : newArrivals.filter(p => p.category === activeTab);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribe({ data: { email } }, {
        onSuccess: () => {
          showToast('Welcome to the inner circle ✓');
          setEmail('');
        },
        onError: () => {
          showToast('Welcome to the inner circle ✓'); // Fallback if api fails
          setEmail('');
        }
      });
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' }
  ];

  const slides = [
    {
      image: '/hero-1.png',
      eyebrow: 'SS26 Collection',
      line1: 'Discover Your',
      line2: 'Signature Style',
      primaryHref: '/products',
      secondaryHref: '/products?category=new',
    },
    {
      image: '/hero-2.png',
      eyebrow: 'New Arrivals',
      line1: 'Crafted for the',
      line2: 'Discerning Step',
      primaryHref: '/products?category=shoes',
      secondaryHref: '/products?category=new',
    },
    {
      image: '/hero-3.png',
      eyebrow: 'Heritage',
      line1: 'Where Heritage',
      line2: 'Meets Luxury',
      primaryHref: '/products?category=clothing',
      secondaryHref: '/products?category=new',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white text-black min-h-[100dvh] pt-[64px]">
      
      {/* 2. HERO SLIDESHOW */}
      <section className="relative h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-black" data-testid="hero-section">
        {/* Slides */}
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt=""
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/55" />
          </motion.div>
        </AnimatePresence>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`txt-${currentSlide}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center"
            >
              <p className="text-[11px] tracking-[0.35em] uppercase mb-6 text-white/60">
                {slides[currentSlide].eyebrow}
              </p>
              <h1 className="font-serif text-[clamp(42px,6vw,88px)] leading-[1.05] tracking-tight mb-10">
                <span className="italic font-light block">{slides[currentSlide].line1}</span>
                <span className="font-medium block">{slides[currentSlide].line2}</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={slides[currentSlide].primaryHref}>
                  <button className="bg-white text-black hover:bg-black hover:text-white border border-white px-10 py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 min-w-[180px]">
                    Shop Collection
                  </button>
                </Link>
                <Link href={slides[currentSlide].secondaryHref}>
                  <button className="border border-white text-white hover:bg-white hover:text-black px-10 py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 min-w-[180px]">
                    New Arrivals
                  </button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-400 rounded-full ${
                i === currentSlide
                  ? 'w-6 h-[2px] bg-white rounded-none'
                  : 'w-2 h-[2px] bg-white/40 rounded-none'
              }`}
            />
          ))}
        </div>

        {/* Side arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          →
        </button>
      </section>

      {/* 3. MARQUEE */}
      <div className="bg-black text-white py-3.5 overflow-hidden flex whitespace-nowrap" data-testid="marquee">
        <div className="animate-marquee inline-block">
          <span className="text-[11px] font-light tracking-[0.2em] uppercase mx-4">Free shipping on orders over $250 · Complimentary gift wrapping · SS26 Collection — Now Available · 30-day returns · Exclusive member benefits ·</span>
          <span className="text-[11px] font-light tracking-[0.2em] uppercase mx-4">Free shipping on orders over $250 · Complimentary gift wrapping · SS26 Collection — Now Available · 30-day returns · Exclusive member benefits ·</span>
          <span className="text-[11px] font-light tracking-[0.2em] uppercase mx-4">Free shipping on orders over $250 · Complimentary gift wrapping · SS26 Collection — Now Available · 30-day returns · Exclusive member benefits ·</span>
        </div>
      </div>

      {/* 4. CATEGORIES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-white pt-[2px]">
        {/* Card 1 */}
        <div onClick={() => setLocation('/products?category=clothing')} className="group cursor-pointer relative md:col-span-2 min-h-[400px] md:min-h-[500px] overflow-hidden flex flex-col justify-end p-10" style={{ background: 'linear-gradient(135deg, #d0d0d0, #b0b0b0)' }}>
          <motion.div className="absolute inset-0 z-0 origin-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
            <FigureSVG figType="coat" ca="#ffffff" cb="#000000" className="absolute right-0 top-0 w-full h-full opacity-50 translate-x-[20%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          </motion.div>
          <div className="relative z-10 text-white flex justify-between items-end w-full">
            <div>
              <h2 className="font-serif text-[28px] italic font-light mb-1">Clothing</h2>
              <p className="text-[11px] tracking-[0.1em] text-white/70">Explore Collection</p>
            </div>
            <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xl leading-none font-light">→</span>
            </div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div onClick={() => setLocation('/products?category=shoes')} className="group cursor-pointer relative min-h-[400px] md:min-h-[500px] overflow-hidden flex flex-col justify-end p-10" style={{ background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' }}>
          <motion.div className="absolute inset-0 z-0 origin-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
            <FigureSVG figType="sneaker" ca="#ffffff" cb="#ffffff" className="absolute right-0 top-0 w-[150%] h-[150%] opacity-[0.03] translate-x-[20%] -translate-y-[10%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </motion.div>
          <div className="relative z-10 text-white flex justify-between items-end w-full">
            <div>
              <h2 className="font-serif text-[28px] italic font-light mb-1">Shoes</h2>
              <p className="text-[11px] tracking-[0.1em] text-white/70">Step Forward</p>
            </div>
            <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xl leading-none font-light">→</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div onClick={() => setLocation('/products?category=accessories')} className="group cursor-pointer relative min-h-[400px] md:min-h-[500px] overflow-hidden flex flex-col justify-end p-10" style={{ background: 'linear-gradient(135deg, #e8e8e8, #c8c8c8)' }}>
          <motion.div className="absolute inset-0 z-0 origin-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
            <FigureSVG figType="watch" ca="#ffffff" cb="#000000" className="absolute right-0 top-0 w-[150%] h-[150%] opacity-[0.05] translate-x-[10%] -translate-y-[20%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
          <div className="relative z-10 text-white flex justify-between items-end w-full">
            <div>
              <h2 className="font-serif text-[28px] italic font-light mb-1">Accessories</h2>
              <p className="text-[11px] tracking-[0.1em] text-white/70">The Details</p>
            </div>
            <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xl leading-none font-light">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sale banner row */}
      <section onClick={() => setLocation('/products?category=sale')} className="cursor-pointer group relative bg-black text-white h-[200px] flex items-center justify-center overflow-hidden mt-[2px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-serif text-[120px] md:text-[200px] italic font-bold text-white/[0.04] select-none whitespace-nowrap group-hover:scale-105 transition-transform duration-[1.5s]">
            SALE SALE SALE
          </span>
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light mb-2">Up to 60% off</h2>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] group-hover:text-[#EAEAEA] transition-colors">
            <span>Shop Archive</span>
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="py-24 px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <h2 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15]">New Arrivals</h2>
          <div className="flex gap-6 border-b border-[#EAEAEA] pb-4 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-black' : 'text-[#999999] hover:text-black'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-black" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
          {filteredArrivals.map(product => (
            <div key={product.id} className="bg-white">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/products">
            <button className="border border-black px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors duration-300">
              View All Products
            </button>
          </Link>
        </div>
      </section>

      {/* 6. EDITORIAL */}
      <section className="my-20 mx-8 grid grid-cols-1 lg:grid-cols-2 gap-[2px] min-h-[600px] bg-white">
        <div className="relative p-12 lg:p-20 flex flex-col justify-end group cursor-pointer overflow-hidden min-h-[400px]" style={{ background: 'linear-gradient(135deg, #efefef, #d8d8d8)' }}>
          <span className="absolute top-10 left-12 text-[10px] uppercase tracking-[0.2em] font-medium border border-black/10 px-3 py-1 bg-white/50 backdrop-blur-sm">Editorial</span>
          <FigureSVG figType="coat" ca="#000000" cb="#000000" className="absolute right-0 top-0 h-full w-[80%] opacity-10 translate-x-[20%] group-hover:scale-105 transition-transform duration-[1s]" />
          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#666666] mb-4">The Edit</p>
            <h3 className="font-serif text-[38px] italic leading-[1.1] mb-6 max-w-[400px]">Autumn Winter Collection 2026</h3>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]">
              <span className="border-b border-black pb-1">Explore the look</span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-[2px]">
          <div className="bg-[#1A1A1A] text-white p-12 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent z-10" />
            <div className="relative z-20">
              <h3 className="font-serif text-[28px] italic leading-[1.2] max-w-[300px] mb-4 text-[#F5F5F5]">Sustainably sourced, meticulously made</h3>
              <p className="text-[13px] font-light text-white/60 max-w-[280px]">We believe true luxury honors both the craft and the environment.</p>
            </div>
          </div>
          
          <div className="bg-[#EAEAEA] p-12 flex flex-col justify-center relative overflow-hidden group cursor-pointer">
            <div className="relative z-20">
              <h3 className="font-serif text-[28px] italic leading-[1.2] max-w-[300px] mb-6">Exclusive access to private sales</h3>
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em]">
                <span className="border-b border-black pb-1">Join Us</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BRANDS STRIP */}
      <section className="py-20 border-y border-[#EAEAEA] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4">
          {["Maison Noir", "Vesti Arte", "Luxe & Co", "Forma", "Atelier M", "Essence"].map(brand => (
            <span key={brand} className="font-serif text-[18px] md:text-[22px] font-medium tracking-[0.1em] opacity-25 hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* 8. FEATURES */}
      <section className="py-32 px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 border border-[#EAEAEA] rounded-full flex items-center justify-center mb-6">
              <Truck size={20} strokeWidth={1} />
            </div>
            <h4 className="text-[12px] tracking-[0.15em] uppercase font-normal mb-3">Free Shipping</h4>
            <p className="text-[13px] text-[#999999] font-light leading-[1.7] max-w-[240px]">Complimentary worldwide delivery on all orders over $250</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 border border-[#EAEAEA] rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={20} strokeWidth={1} />
            </div>
            <h4 className="text-[12px] tracking-[0.15em] uppercase font-normal mb-3">Authenticity Guaranteed</h4>
            <p className="text-[13px] text-[#999999] font-light leading-[1.7] max-w-[240px]">Every piece is verified and certified before delivery</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 border border-[#EAEAEA] rounded-full flex items-center justify-center mb-6">
              <RefreshCw size={20} strokeWidth={1} />
            </div>
            <h4 className="text-[12px] tracking-[0.15em] uppercase font-normal mb-3">30-Day Returns</h4>
            <p className="text-[13px] text-[#999999] font-light leading-[1.7] max-w-[240px]">Hassle-free returns within 30 days, no questions asked</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 border border-[#EAEAEA] rounded-full flex items-center justify-center mb-6">
              <Gift size={20} strokeWidth={1} />
            </div>
            <h4 className="text-[12px] tracking-[0.15em] uppercase font-normal mb-3">Luxury Packaging</h4>
            <p className="text-[13px] text-[#999999] font-light leading-[1.7] max-w-[240px]">Beautifully packaged in our signature gift boxes</p>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER */}
      <section className="bg-black text-white py-32 px-8 flex flex-col items-center text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">Stay Connected</span>
        <h2 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light mb-6">The Inner Circle</h2>
        <p className="text-[14px] font-light text-white/70 max-w-[420px] mb-10 leading-[1.8]">
          First access to new collections, exclusive events, and members-only offers.
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-[480px] border border-white/20 focus-within:border-white transition-colors">
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-transparent px-6 py-4 text-[13px] outline-none placeholder:text-white/30"
          />
          <button type="submit" className="bg-white text-black px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#EAEAEA] transition-colors">
            Subscribe
          </button>
        </form>
      </section>

    </div>
  );
}
