/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';

// Pages (will create these next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import History from './pages/History';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-t-2 border-orange-500 rounded-full animate-spin" />
          <span className="font-sans text-neutral-400">Loading Hasta-Kala Shop...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="history" element={<History />} />
          <Route path="record" element={<Record />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
