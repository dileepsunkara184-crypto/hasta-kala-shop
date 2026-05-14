import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Camera, LogOut, Shield, ChevronRight, Settings, Bell, HelpCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { formatCurrency, cn } from '../lib/utils';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', profileImageUrl: '' });

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setFormData({ name: docSnap.data().name, profileImageUrl: docSnap.data().profileImageUrl || '' });
      } else {
        // Init profile if doesn't exist
        const initial = { name: auth.currentUser?.displayName || 'Artisan', email: auth.currentUser?.email, updatedAt: serverTimestamp() };
        await setDoc(docRef, initial);
        setProfile(initial);
        setFormData({ name: initial.name, profileImageUrl: '' });
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="text-center space-y-4 pt-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-neutral-900 rounded-full border-4 border-orange-600/20 flex items-center justify-center overflow-hidden mx-auto shadow-2xl relative group">
            {profile?.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-neutral-700" />
            )}
            <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center border-4 border-neutral-900">
            <Settings className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">{profile?.name || 'Loading...'}</h2>
          <p className="text-neutral-500 font-medium text-sm">{profile?.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-bold text-sm">Edit Personal Details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:translate-x-1 transition-transform" />
          </button>

          {isEditing && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              onSubmit={handleUpdate} 
              className="p-6 border-t border-white/5 space-y-4 pt-2"
            >
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Profile Photo URL</label>
                <input
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </motion.form>
          )}

          <div className="border-t border-white/5">
            <MenuItem icon={Bell} label="Notifications" />
            <MenuItem icon={Shield} label="Privacy & Security" borderRoot={false} />
            <MenuItem icon={HelpCircle} label="Help & Support" borderRoot={false} />
          </div>
        </div>

        <button 
          onClick={() => auth.signOut()}
          className="w-full p-6 bg-red-600/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-4 text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Logout Account
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, borderRoot = true }: any) {
  return (
    <button className={cn(
      "w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group",
      borderRoot && "border-b border-white/5"
    )}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-neutral-950 rounded-xl flex items-center justify-center border border-white/5">
          <Icon className="w-5 h-5 text-neutral-400" />
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
