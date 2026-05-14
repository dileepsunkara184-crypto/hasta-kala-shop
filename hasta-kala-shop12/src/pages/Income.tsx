import { motion } from 'motion/react';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useSalesData } from '../lib/hooks';
import { formatCurrency, cn } from '../lib/utils';
import { startOfWeek, startOfMonth, isSameWeek, isSameMonth, subMonths, format } from 'date-fns';

export default function Income() {
  const { sales, loading } = useSalesData();

  if (loading) return <div className="p-6 text-neutral-500">Loading metrics...</div>;

  const now = new Date();
  
  const weeklyTotal = sales
    .filter(s => isSameWeek(s.soldAt?.toDate() || new Date(s.soldAt), now))
    .reduce((acc, s) => acc + s.totalPrice, 0);

  const monthlyTotal = sales
    .filter(s => isSameMonth(s.soldAt?.toDate() || new Date(s.soldAt), now))
    .reduce((acc, s) => acc + s.totalPrice, 0);

  const grandTotal = sales.reduce((acc, s) => acc + s.totalPrice, 0);

  // Last 6 months data for the bar chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const monthSales = sales.filter(s => isSameMonth(s.soldAt?.toDate() || new Date(s.soldAt), d));
    return {
      name: format(d, 'MMM'),
      amount: monthSales.reduce((acc, s) => acc + s.totalPrice, 0)
    };
  });

  return (
    <div className="p-6 space-y-8 pb-32">
      <div>
        <h1 className="text-2xl font-bold">Revenue Insights</h1>
        <p className="text-neutral-500 text-sm font-medium">Tracking your business growth</p>
      </div>

      {/* Main Stats */}
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-orange-900/40 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Net Income</p>
          <h2 className="text-4xl font-black tracking-tight">{formatCurrency(grandTotal)}</h2>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-black/20 w-fit px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +12.5% from last month
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2.5rem]">
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Weekly</p>
            <p className="text-xl font-bold">{formatCurrency(weeklyTotal)}</p>
            <div className="mt-2 text-[10px] text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              Good progress
            </div>
          </div>
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2.5rem]">
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly</p>
            <p className="text-xl font-bold">{formatCurrency(monthlyTotal)}</p>
            <div className="mt-2 text-[10px] text-orange-500 font-bold flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              May report
            </div>
          </div>
        </div>
      </div>

      {/* Graphical Report */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-950 border border-white/5 p-6 rounded-[3rem] h-80"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            Profit Analysis
          </h3>
          <span className="text-[10px] text-neutral-500 font-bold tracking-widest">6 MONTH TREND</span>
        </div>
        <ResponsiveContainer width="100%" height="70%">
          <BarChart data={monthlyData}>
            <XAxis dataKey="name" stroke="#404040" fontSize={10} axisLine={false} tickLine={false} dy={10} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
              itemStyle={{ color: '#fb923c' }}
            />
            <Bar 
              dataKey="amount" 
              fill="#f97316" 
              radius={[10, 10, 10, 10]} 
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Breakdown Placeholder */}
      <div className="bg-neutral-900/50 border border-dashed border-white/5 p-8 rounded-[3rem] text-center">
        <p className="text-neutral-500 text-xs font-medium">Export and detailed tax reports coming soon.</p>
      </div>
    </div>
  );
}
