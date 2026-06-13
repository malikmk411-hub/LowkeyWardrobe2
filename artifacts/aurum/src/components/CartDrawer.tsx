import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import { FigureSVG } from './FigureSVG';
import { X, Minus, Plus } from 'lucide-react';
import { Link } from 'wouter';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, total, shipping } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[1001]"
            data-testid="cart-overlay"
          />
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-[1002] flex flex-col shadow-2xl"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAEAEA]">
              <h2 className="font-serif text-2xl italic">Your Bag</h2>
              <button onClick={closeCart} className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="font-serif text-xl italic text-[#999999]">Your bag is empty</p>
                  <button 
                    onClick={closeCart}
                    className="mt-6 border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-[80px] h-[100px] bg-[#F5F5F5] relative overflow-hidden shrink-0">
                        <div className="absolute inset-0" style={{ background: item.bgGradient }} />
                        <FigureSVG 
                          figType={item.figType} 
                          ca={item.figColorA} 
                          cb={item.figColorB} 
                          className="w-full h-full absolute inset-0"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mb-1">{item.brand}</p>
                              <p className="text-[14px]">{item.name}</p>
                            </div>
                            <p className="text-[14px]">${item.price}</p>
                          </div>
                          <p className="text-[12px] text-[#999999] mt-1">Size: {item.size} | Color: {item.colorHex}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-[#EAEAEA]">
                            <button 
                              onClick={() => updateQty(item.productId, item.size, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-[13px]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQty(item.productId, item.size, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.productId, item.size)}
                            className="text-[11px] uppercase tracking-[0.1em] text-[#999999] hover:text-black underline-offset-4 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#EAEAEA] px-8 py-6 bg-[#FAFAFA]">
                <div className="flex justify-between text-[14px] mb-3">
                  <span className="text-[#666666]">Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] mb-4 border-b border-[#EAEAEA] pb-4">
                  <span className="text-[#666666]">Shipping</span>
                  <span>{shipping() === 0 ? 'Free' : `$${shipping().toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[16px] font-medium mb-6">
                  <span>Total</span>
                  <span>${(total() + shipping()).toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/cart" onClick={closeCart}>
                    <div className="w-full bg-black text-white text-center py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors cursor-pointer">
                      Proceed to Checkout
                    </div>
                  </Link>
                  <button 
                    onClick={closeCart}
                    className="w-full border border-black text-black py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
