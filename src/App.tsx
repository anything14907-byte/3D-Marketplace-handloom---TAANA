import React, { useState, useEffect } from 'react';
import { Product, CartItem } from './types';
import { fetchProducts } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellPage } from './pages/SellPage';
import { CartPage } from './pages/CartPage';
import { FloatingChatbot } from './components/FloatingChatbot';
import { VirtualDrapeStudio } from './components/VirtualDrapeStudio';
import { Check, X } from 'lucide-react';

const LOCAL_STORAGE_CART_KEY = 'taana_handloom_cart';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart State with LocalStorage Persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart:', e);
    }
  }, [cart]);

  // Load products from Supabase / Local Handlooms
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await fetchProducts();
      setProducts(result.data);
      setIsSupabaseLive(result.isSupabaseLive);
    } catch (err) {
      console.error('Error fetching handloom products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle URL navigation
  const navigate = (route: string, productId?: string) => {
    setCurrentRoute(route);
    if (productId) {
      setSelectedProductId(productId);
      const found = products.find((p) => p.id === productId);
      setActiveProduct(found || null);
    } else if (route !== '/product' && route !== '/try-on') {
      setSelectedProductId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${quantity}x "${product.name}" to your handloom collection!`);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared.');
  };

  // When a user selects a product from the grid
  const handleSelectProduct = (product: Product) => {
    setActiveProduct(product);
    setSelectedProductId(product.id);
    navigate('/product', product.id);
  };

  // When a new product is submitted on the Sell page
  const handleProductCreated = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`"${newProduct.name}" listed successfully on Taana!`);
  };

  const currentTryOnProduct = activeProduct || (products.length > 0 ? products[0] : null);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E7] text-[#1B2A4A] relative selection:bg-[#D89B2C]/30">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        cart={cart}
        isSupabaseLive={isSupabaseLive}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <HomePage
            products={products}
            isLoading={isLoading}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod, e) => {
              e?.stopPropagation();
              handleAddToCart(prod, 1);
            }}
            onRefresh={loadProducts}
            isSupabaseLive={isSupabaseLive}
          />
        )}

        {currentRoute === '/try-on' && currentTryOnProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <VirtualDrapeStudio
              product={currentTryOnProduct}
              allProducts={products}
              onSelectProduct={(p) => setActiveProduct(p)}
              onAddToCart={(p, qty) => handleAddToCart(p, qty)}
            />
          </div>
        )}

        {currentRoute === '/product' && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            onBack={() => navigate('/')}
            onAddToCart={handleAddToCart}
            onOpenChatWithProduct={() => {
              // Floating chatbot handles context
            }}
            onOpenTryOn={(prod) => {
              setActiveProduct(prod);
              navigate('/try-on', prod.id);
            }}
          />
        )}

        {currentRoute === '/sell' && (
          <SellPage
            onProductCreated={handleProductCreated}
            onNavigateHome={() => navigate('/')}
          />
        )}

        {currentRoute === '/cart' && (
          <CartPage
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onNavigateHome={() => navigate('/')}
          />
        )}
      </main>

      {/* Floating Handloom AI Assistant (Taana Sutra) */}
      <FloatingChatbot currentProduct={currentRoute === '/product' ? activeProduct : null} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#1B2A4A] text-[#F6F1E7] px-5 py-3 rounded-full shadow-2xl border-2 border-[#D89B2C] flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <div className="w-5 h-5 rounded-full bg-[#D89B2C] text-[#1B2A4A] flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Craft Heritage Footer */}
      <Footer />
    </div>
  );
}
