import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProfileSummary } from '../../services/api/types';

interface ConnectionsModalProps {
  title: string;
  users: ProfileSummary[];
  loading: boolean;
  onClose: () => void;
}

export function ConnectionsModal({ title, users, loading, onClose }: ConnectionsModalProps) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-6 animate-scale-up h-[60vh] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative text-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="absolute -top-1 -right-2 p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-sm text-zinc-500">Vazio</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${user.username}`);
                  }}
                  className="flex items-center gap-4 p-3 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-zinc-400">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {user.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
