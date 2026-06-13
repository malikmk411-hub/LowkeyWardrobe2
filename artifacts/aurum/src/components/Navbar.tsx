import { Link } from 'wouter';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { openCart, itemCount } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const { openSearch } = useUIStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'New Arrivals', href: '/products?category=new' },
    { label: 'Clothing', href: '/products?category=clothing' },
    { label: 'Shoes', href: '/products?category=shoes' },
    { label: 'Accessories', href: '/products?category=accessories' },
    { label: 'Sale', href: '/products?category=sale', className: 'text-[#C41E1E]' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 h-[64px] z-[1000] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-[12px] border-b border-[#EAEAEA]' : 'bg-transparent'
      }`}
    >
      <div className="h-full px-8 flex items-center justify-between grid grid-cols-3">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/">
            <div className="font-serif text-[22px] font-medium tracking-[0.18em] cursor-pointer">AURUM</div>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center justify-center gap-9">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              <div className={`text-[11px] tracking-[0.15em] uppercase hover:opacity-70 transition-opacity cursor-pointer relative group ${link.className || ''}`}>
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
          ))}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-6">
          <button onClick={openSearch} className="hover:opacity-60 transition-opacity">
            <Search size={18} strokeWidth={1.5} />
          </button>
          
          <Link href="/products">
            <div className="relative hover:opacity-60 transition-opacity cursor-pointer flex items-center">
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount() > 0 && (
                <span className="ml-1 text-[10px]">{wishlistCount()}</span>
              )}
            </div>
          </Link>
          
          <button onClick={openCart} className="relative hover:opacity-60 transition-opacity">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount() > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full">
                {itemCount()}
              </span>
            )}
          </button>
          
          <button className="hover:opacity-60 transition-opacity">
            <User size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </nav>
  );
}
