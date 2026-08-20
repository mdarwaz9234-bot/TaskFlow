import { FC, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, LogOut, User, Edit3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NameModal } from '../profile/NameModal';

export const Navbar: FC = () => {
  const { user, signOut } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isFirstTimeModal, setIsFirstTimeModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the user's profile (avatar + display name)
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setDisplayName(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Check OAuth / Google metadata fallbacks
      const oauthName = user.user_metadata?.full_name || user.user_metadata?.name || null;
      const oauthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      if (data) {
        const resolvedAvatar = data.avatar_url || oauthAvatar;
        const resolvedName = data.display_name || oauthName;

        setAvatarUrl(resolvedAvatar);
        setDisplayName(resolvedName);

        // If user logged in and has NO display_name yet, prompt them!
        if (!resolvedName) {
          setIsFirstTimeModal(true);
          setIsNameModalOpen(true);
        } else if (!data.display_name && oauthName) {
          // Auto-save OAuth name to profiles
          await supabase.from('profiles').upsert(
            { id: user.id, display_name: oauthName, avatar_url: resolvedAvatar },
            { onConflict: 'id' }
          );
        }
      } else {
        // No profile record found at all yet
        if (oauthName || oauthAvatar) {
          setAvatarUrl(oauthAvatar);
          setDisplayName(oauthName);
          await supabase.from('profiles').upsert(
            { id: user.id, display_name: oauthName, avatar_url: oauthAvatar },
            { onConflict: 'id' }
          );
        } else {
          setIsFirstTimeModal(true);
          setIsNameModalOpen(true);
        }
      }
    };

    fetchProfile();
  }, [user]);

  // Open file picker for avatar
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

      // Save URL to profile using upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            avatar_url: publicUrl,
          },
          { onConflict: 'id' }
        );

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

  // Save / Update Display Name
  const handleSaveName = async (name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          display_name: name,
        },
        { onConflict: 'id' }
      );

    if (error) {
      throw error;
    }

    setDisplayName(name);
  };

  return (
    <>
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
                Workspace
              </span>
            </div>
          </div>

          {/* User Info & Actions */}
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* User Profile Pill (Avatar + Name) */}
              <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 rounded-full pl-1.5 pr-3 py-1">
                
                {/* Profile Picture */}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer shrink-0"
                  title="Click to change profile picture"
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
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>

                {/* Display Name / Email Button */}
                <button
                  onClick={() => {
                    setIsFirstTimeModal(false);
                    setIsNameModalOpen(true);
                  }}
                  className="group flex items-center gap-1.5 text-left cursor-pointer transition-colors"
                  title="Click to edit display name"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors max-w-[130px] sm:max-w-[180px] truncate leading-tight">
                      {displayName ? `👋 ${displayName}` : user.email}
                    </span>
                    {displayName && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[180px] leading-tight">
                        {user.email}
                      </span>
                    )}
                  </div>
                  <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>

              </div>

              {/* Sign Out */}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

            </div>
          )}
        </div>
      </header>

      {/* Name Modal */}
      <NameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentName={displayName}
        onSaveName={handleSaveName}
        isFirstTime={isFirstTimeModal}
      />
    </>
  );
};