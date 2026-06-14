import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const SEED_PRODUCTS = [
  { slug: 'premium-oversized-jacket', name: "Premium Oversized Jacket", brand: "LKW Essentials", price: "24900.00", originalPrice: null, category: "clothing", subcategory: "unisex", badge: "new", colors: ['#1a1a1a', '#888888', '#ffffff'], sizes: ['XS', 'S', 'M', 'L', 'XL'], description: "A meticulously tailored oversized jacket in premium wool blend.", figType: "coat", bgGradient: "linear-gradient(135deg, #f0f0f0, #e0e0e0)", figColorA: "#c0c0c0", figColorB: "#1e1e1e", sku: "LKW-0001", stock: 24, tags: ['jacket', 'outerwear', 'oversized', 'wool', 'luxury'] },
  { slug: 'minimal-white-sneaker', name: "Minimal White Sneaker", brand: "LKW Sport", price: "17900.00", originalPrice: null, category: "shoes", subcategory: "unisex", badge: "new", colors: ['#ffffff', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43', '44'], description: "The perfect minimalist sneaker. Hand-finished Italian leather upper.", figType: "sneaker", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#eeeeee", figColorB: "#d0d0d0", sku: "LKW-0002", stock: 42, tags: ['sneaker', 'white', 'leather', 'minimal', 'sport'] },
  { slug: 'cashmere-blend-hoodie', name: "Cashmere Blend Hoodie", brand: "LKW Essentials", price: "19900.00", originalPrice: null, category: "clothing", subcategory: "unisex", badge: null, colors: ['#888888', '#1a1a1a', '#ffffff'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], description: "Pure luxury in casual form. Crafted from a superfine cashmere blend.", figType: "hoodie", bgGradient: "linear-gradient(135deg, #e8e8e8, #d8d8d8)", figColorA: "#c0c0c0", figColorB: "#a0a0a0", sku: "LKW-0003", stock: 18, tags: ['hoodie', 'cashmere', 'luxury', 'essentials', 'comfort'] },
  { slug: 'slim-leather-wallet', name: "Slim Leather Wallet", brand: "LKW Leather", price: "9900.00", originalPrice: null, category: "accessories", subcategory: "men", badge: "new", colors: ['#1a1a1a', '#444444'], sizes: ['One Size'], description: "Handcrafted from full-grain Italian leather.", figType: "wallet", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#555555", figColorB: "#333333", sku: "LKW-0004", stock: 56, tags: ['wallet', 'leather', 'slim', 'accessories', 'italian'] },
  { slug: 'tailored-wool-trousers', name: "Tailored Wool Trousers", brand: "LKW Studio", price: "27900.00", originalPrice: null, category: "clothing", subcategory: "men", badge: null, colors: ['#1a1a1a', '#4a4a4a', '#888888'], sizes: ['28', '30', '32', '34', '36'], description: "Cut from 120s Italian wool, these trousers define understated elegance.", figType: "pants", bgGradient: "linear-gradient(135deg, #d0d0d0, #b8b8b8)", figColorA: "#5a5a5a", figColorB: "#3a3a3a", sku: "LKW-0005", stock: 12, tags: ['trousers', 'wool', 'tailored', 'formal', 'studio'] },
  { slug: 'premium-leather-boot', name: "Premium Leather Boot", brand: "LKW Footwear", price: "32900.00", originalPrice: null, category: "shoes", subcategory: "men", badge: null, colors: ['#333333', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43'], description: "Goodyear-welted construction meets contemporary design.", figType: "boot", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#3a3a3a", figColorB: "#2a2a2a", sku: "LKW-0006", stock: 9, tags: ['boot', 'leather', 'goodyear', 'premium', 'footwear'] },
  { slug: 'stainless-steel-watch', name: "Stainless Steel Watch", brand: "LKW Time", price: "79900.00", originalPrice: null, category: "accessories", subcategory: "unisex", badge: "new", colors: ['#c0c0c0', '#1a1a1a'], sizes: ['One Size'], description: "Swiss-inspired precision in a 40mm case.", figType: "watch", bgGradient: "linear-gradient(135deg, #e8e8e8, #d8d8d8)", figColorA: "#c8c8c8", figColorB: "#a8a8a8", sku: "LKW-0007", stock: 7, tags: ['watch', 'steel', 'swiss', 'time', 'luxury'] },
  { slug: 'silk-blend-dress-shirt', name: "Silk-Blend Dress Shirt", brand: "LKW Studio", price: "18500.00", originalPrice: "26500.00", category: "clothing", subcategory: "men", badge: "sale", colors: ['#ffffff', '#1a1a1a', '#e8e8e8'], sizes: ['XS', 'S', 'M', 'L', 'XL'], description: "A 70% silk, 30% cotton blend that drapes like nothing else.", figType: "shirt", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#f0f0f0", figColorB: "#d8d8d8", sku: "LKW-0008", stock: 31, tags: ['shirt', 'silk', 'dress', 'formal', 'studio'] },
  { slug: 'messenger-leather-bag', name: "Messenger Leather Bag", brand: "LKW Leather", price: "42900.00", originalPrice: null, category: "accessories", subcategory: "unisex", badge: null, colors: ['#333333', '#1a1a1a', '#888888'], sizes: ['One Size'], description: "Structured full-grain leather with hand-stitched edges.", figType: "bag", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#505050", figColorB: "#383838", sku: "LKW-0009", stock: 14, tags: ['bag', 'messenger', 'leather', 'laptop', 'accessories'] },
  { slug: 'classic-loafer', name: "Classic Loafer", brand: "LKW Footwear", price: "23900.00", originalPrice: "30900.00", category: "shoes", subcategory: "men", badge: "sale", colors: ['#333333', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43', '44'], description: "The definitive penny loafer, updated for the modern wardrobe.", figType: "loafer", bgGradient: "linear-gradient(135deg, #1a1a1a, #0a0a0a)", figColorA: "#3a3a3a", figColorB: "#252525", sku: "LKW-0010", stock: 22, tags: ['loafer', 'penny', 'naples', 'leather', 'footwear'] },
  { slug: 'oversized-t-shirt', name: "Oversized T-Shirt", brand: "LKW Basics", price: "5900.00", originalPrice: null, category: "clothing", subcategory: "unisex", badge: null, colors: ['#ffffff', '#1a1a1a', '#888888'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], description: "250gsm Supima cotton in an oversized boxy cut.", figType: "tshirt", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#e8e8e8", figColorB: "#d0d0d0", sku: "LKW-0011", stock: 88, tags: ['tshirt', 'supima', 'oversized', 'basics', 'cotton'] },
  { slug: 'premium-sunglasses', name: "Premium Sunglasses", brand: "LKW Eyewear", price: "20900.00", originalPrice: null, category: "accessories", subcategory: "unisex", badge: "new", colors: ['#1a1a1a', '#888888'], sizes: ['One Size'], description: "Hand-finished Italian acetate frames with Carl Zeiss lenses.", figType: "sunglasses", bgGradient: "linear-gradient(135deg, #e0e0e0, #d0d0d0)", figColorA: "#d0d0d0", figColorB: "#b8b8b8", sku: "LKW-0012", stock: 19, tags: ['sunglasses', 'zeiss', 'acetate', 'italian', 'eyewear'] },
];

export async function ensureSeeded() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    if (count > 0) return;

    for (const p of SEED_PRODUCTS) {
      await db.insert(productsTable).values({
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory ?? null,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        badge: p.badge ?? null,
        description: p.description,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        tags: p.tags,
        figType: p.figType,
        bgGradient: p.bgGradient,
        figColorA: p.figColorA,
        figColorB: p.figColorB,
        images: [],
        featured: false,
        isActive: true,
      }).onConflictDoNothing();
    }
  } catch {
    // Seed failure is non-fatal; DB may not be ready yet
  }
}
