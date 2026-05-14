import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History as HistoryIcon, Search, Calendar, ChevronRight, RotateCcw, Trash2, Clock, CheckCircle, Trash } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

export default function History() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'deleted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'sales'),
      orderBy('soldAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleDeleted = async (sale: any) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'sales', sale.id), {
        isDeleted: !sale.isDeleted
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!auth.currentUser || !confirm('Permanently delete this record?')) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'sales', id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSales = sales.filter(s => {
    const isTarget = view === 'all' ? !s.isDeleted : s.isDeleted;
    const matchesSearch = s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return isTarget && matchesSearch;
  });

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales History</h1>
          <p className="text-neutral-500 text-sm font-medium">Reviewing your transactions</p>
        </div>
        <HistoryIcon className="w-6 h-6 text-orange-500" />
      </div>

      <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setView('all')}
          className={cn(
            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
            view === 'all' ? "bg-neutral-900 border border-white/10 text-white shadow-xl" : "text-neutral-500"
          )}
        >
          Active Sales
        </button>
        <button
          onClick={() => setView('deleted')}
          className={cn(
            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all font-mono",
            view === 'deleted' ? "bg-red-950/20 border border-red-500/20 text-red-500 shadow-xl" : "text-neutral-500"
          )}
        >
          Deleted Logs
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name..."
          className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-medium"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-neutral-600">Syncing history...</div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12 text-neutral-700 bg-neutral-950/50 border border-dashed border-white/5 rounded-[2.5rem]">
            No records found for this view.
          </div>
        ) : (
          filteredSales.map((sale, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={sale.id}
              className={cn(
                "bg-neutral-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4 group",
                sale.isDeleted && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 flex items-center justify-center shrink-0 border border-white/5">
                {sale.isDeleted ? <Trash2 className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold truncate text-sm">{sale.productName}</h3>
                  <span className="text-orange-500 font-bold text-sm tracking-tight">{formatCurrency(sale.totalPrice)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sale.soldAt?.toDate() ? format(sale.soldAt.toDate(), 'HH:mm') : '00:00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {sale.soldAt?.toDate() ? format(sale.soldAt.toDate(), 'dd MMM yyyy') : 'Date Unknown'}
                  </span>
                  <span className="text-neutral-600">Qty: {sale.quantity}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {sale.isDeleted ? (
                  <>
                    <button 
                      onClick={() => handleToggleDeleted(sale)}
                      className="p-3 bg-green-950/20 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleHardDelete(sale.id)}
                      className="p-3 bg-red-950/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleToggleDeleted(sale)}
                    className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
