import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Package, MoreVertical, Edit2, Trash2, IndianRupee, Image as ImageIcon, X, ChevronRight } from 'lucide-react';
import { useProductsData } from '../lib/hooks';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { formatCurrency, cn } from '../lib/utils';

export default function Record() {
  const { products, loading } = useProductsData();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSelling, setIsSelling] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    imageUrl: ''
  });
  const [sellQty, setSellQty] = useState('1');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (selectedProduct) {
        // Edit mode
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'products', selectedProduct.id), {
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          updatedAt: serverTimestamp()
        });
      } else {
        // Add mode
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'products'), {
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          vendorId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setSelectedProduct(null);
      setFormData({ name: '', quantity: '', price: '', imageUrl: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedProduct) return;

    const qty = Number(sellQty);
    if (qty > selectedProduct.quantity) {
      alert("Not enough stock!");
      return;
    }

    try {
      const totalPrice = qty * selectedProduct.price;
      
      // Add Sale
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'sales'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        pricePerUnit: selectedProduct.price,
        totalPrice: totalPrice,
        soldAt: serverTimestamp(),
        vendorId: auth.currentUser.uid,
        isDeleted: false
      });

      // Update Product Qty
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'products', selectedProduct.id), {
        quantity: selectedProduct.quantity - qty,
        updatedAt: serverTimestamp()
      });

      setIsSelling(false);
      setSelectedProduct(null);
      setSellQty('1');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser || !confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'products', id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 space-y-8 relative pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Records</h1>
        <Package className="w-6 h-6 text-orange-500" />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-neutral-600">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-neutral-600 bg-neutral-950 border border-dashed border-white/5 rounded-3xl">
            No products found. Add one!
          </div>
        ) : (
          filteredProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              onClick={() => {
                setSelectedProduct(p);
                setFormData({ name: p.name, quantity: p.quantity, price: p.price, imageUrl: p.imageUrl || '' });
              }}
              className="bg-neutral-900 border border-white/5 p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-neutral-800 transition-colors group"
            >
              <div className="w-16 h-16 bg-neutral-950 rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-neutral-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{p.name}</h3>
                <p className="text-xs text-neutral-500 font-medium">Stock: {p.quantity} units</p>
                <p className="text-orange-500 font-bold text-sm mt-1">{formatCurrency(p.price)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setSelectedProduct(null);
          setFormData({ name: '', quantity: '', price: '', imageUrl: '' });
          setIsAdding(true);
        }}
        className="fixed right-6 bottom-28 w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/40 active:scale-95 transition-transform z-40 lg:right-[calc(50%-200px)] mb-16"
        id="add-product-fab"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Product Detail Modal / Add Form */}
      <AnimatePresence>
        {(isAdding || selectedProduct) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-end p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md mx-auto bg-neutral-900 border-t border-white/10 rounded-t-[2.5rem] p-8 pt-4 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {isAdding ? "Add New Product" : "Product Details"}
                </h2>
                <button onClick={() => { setIsAdding(false); setSelectedProduct(null); setIsSelling(false); }} className="p-2 bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isSelling ? (
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Product Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">In Stock</label>
                      <input
                        required
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Price per unit</label>
                      <input
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Image URL (Optional)</label>
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    {!isAdding && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsSelling(true)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <IndianRupee className="w-5 h-5" />
                          Record Sale
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedProduct.id)}
                          className="w-14 h-14 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
                    >
                      {isAdding ? "Save Product" : "Update Details"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRecordSale} className="space-y-6">
                  <div className="bg-neutral-950 p-6 rounded-3xl border border-white/5 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Selling Product</p>
                    <p className="text-lg font-bold">{selectedProduct.name}</p>
                    <p className="text-orange-500 font-bold">{formatCurrency(selectedProduct.price)} / unit</p>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Quantity Sold</label>
                    <div className="flex items-center justify-center gap-8">
                       <button 
                        type="button"
                        onClick={() => setSellQty(Math.max(1, Number(sellQty) - 1).toString())}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-2xl font-bold"
                       >-</button>
                       <span className="text-4xl font-bold">{sellQty}</span>
                       <button 
                        type="button"
                        onClick={() => setSellQty(Math.min(selectedProduct.quantity, Number(sellQty) + 1).toString())}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-2xl font-bold"
                       >+</button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Total Sales Amount</p>
                    <p className="text-3xl font-bold text-orange-500">{formatCurrency(Number(sellQty) * selectedProduct.price)}</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsSelling(false)}
                      className="flex-1 bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                    >
                      Confirm Sale
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
