import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Package, IndianRupee, Sparkles, Plus, ChevronRight, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useSalesData, useProductsData, useSuggestions } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';
import { getBusinessSuggestions } from '../lib/gemini';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

export default function Dashboard() {
  const { sales, loading: salesLoading } = useSalesData();
  const { products, loading: productsLoading } = useProductsData();
  const { suggestions } = useSuggestions();
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Stats calculation
  const totalIncome = sales.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  const weeklyIncome = sales
    .filter(s => {
      const date = s.soldAt?.toDate ? s.soldAt.toDate() : new Date(s.soldAt);
      const now = new Date();
      return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);

  // Trending products data
  const productSalesMap: Record<string, number> = {};
  sales.forEach(s => {
    productSalesMap[s.productName] = (productSalesMap[s.productName] || 0) + s.quantity;
  });
  const trendingData = Object.entries(productSalesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Growth Chart Data (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const chartData = last7Days.map(date => {
    const daySales = sales.filter(s => {
      const sDate = s.soldAt?.toDate ? s.soldAt.toDate() : new Date(s.soldAt);
      return sDate.toISOString().split('T')[0] === date;
    });
    return {
      date: date.slice(5),
      income: daySales.reduce((acc, s) => acc + s.totalPrice, 0)
    };
  });

  const handleRefreshSuggestions = async () => {
    if (!auth.currentUser || isGeneratingSuggestions) return;
    setIsGeneratingSuggestions(true);
    const newSuggestions = await getBusinessSuggestions(sales, products);
    
    // Save to Firestore
    for (const s of newSuggestions) {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'suggestions'), {
        ...s,
        createdAt: serverTimestamp(),
        vendorId: auth.currentUser.uid
      });
    }
    setIsGeneratingSuggestions(false);
  };

  if (salesLoading || productsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-neutral-800 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-neutral-800 animate-pulse rounded-3xl" />
          <div className="h-32 bg-neutral-800 animate-pulse rounded-3xl" />
        </div>
        <div className="h-64 bg-neutral-800 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vyaapaar Dashboard</h1>
          <p className="text-neutral-500 text-sm font-medium">Monitoring your craft empire</p>
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Activity className="w-5 h-5 text-neutral-400" />
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-950 border border-white/5 p-5 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-600/10 blur-3xl rounded-full" />
          <IndianRupee className="w-5 h-5 text-orange-500 mb-3" />
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Weekly Income</p>
          <p className="text-xl font-bold mt-1 text-white">{formatCurrency(weeklyIncome)}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-950 border border-white/5 p-5 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/10 blur-3xl rounded-full" />
          <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Monthly Goal</p>
          <p className="text-xl font-bold mt-1 text-white">{formatCurrency(totalIncome)}</p>
        </motion.div>
      </div>

      {/* Main Income Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-900 border border-white/5 p-6 rounded-[2.5rem] h-80"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Income Analytics</h3>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-neutral-400">LAST 7 DAYS</span>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#404040" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
              itemStyle={{ color: '#fb923c' }}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#f97316" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f97316' }} 
              activeDot={{ r: 6, fill: '#f97316' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trending & Suggestions Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            AI Business Insights
          </h2>
          <button 
            onClick={handleRefreshSuggestions}
            disabled={isGeneratingSuggestions}
            className="text-[10px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
          >
            {isGeneratingSuggestions ? 'Consulting Gemini...' : 'Analyze Data'}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {suggestions.length === 0 ? (
              <div className="bg-neutral-950 border border-dashed border-white/10 p-8 rounded-[2rem] text-center">
                <Sparkles className="w-8 h-8 text-neutral-800 mx-auto mb-2" />
                <p className="text-neutral-600 text-xs font-medium">Click "Analyze Data" for AI suggestions</p>
              </div>
            ) : (
              suggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-3xl flex items-start gap-4 border border-white/5",
                    s.type === 'trending' ? "bg-orange-600/5" : 
                    s.type === 'warning' ? "bg-red-600/5" : "bg-blue-600/5"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    s.type === 'trending' ? "bg-orange-500 text-white" : 
                    s.type === 'warning' ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                  )}>
                    {s.type === 'trending' ? <TrendingUp className="w-4 h-4" /> : 
                     s.type === 'warning' ? <Package className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <p className="text-sm font-medium leading-relaxed leading-snug">{s.text}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trending Products Pie */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-white/5 p-6 rounded-[2.5rem] h-72"
      >
        <h3 className="font-bold mb-4">Trending Products</h3>
        <div className="flex h-[80%] items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={trendingData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {trendingData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2 pl-4">
            {trendingData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-neutral-400 truncate">{item.name}</span>
                <span className="text-[10px] font-bold text-white ml-auto">{item.value} sales</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
