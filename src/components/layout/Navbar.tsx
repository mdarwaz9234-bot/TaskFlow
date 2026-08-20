import { FC, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, LogOut, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Navbar: FC = () => {
  const { user, signOut } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the user's profile
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setAvatarUrl(data.avatar_url);
    };

    fetchProfile();
  }, [user]);

  // Open file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Upload avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);

    try {
      const filePath = `${user.id}/avatar.jpg`;

      // Upload / replace avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Save URL to profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update UI immediately
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload profile picture.');
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              TaskFlow
            </h1>

            <span className="text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
              SaaS Edition
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-4">

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Profile Picture */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer"
              title="Change profile picture"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              {/* Upload loading indicator */}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>

            {/* Email */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <span className="max-w-[180px] truncate">
                {user.email}
              </span>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>
        )}
      </div>
    </header>
  );
};