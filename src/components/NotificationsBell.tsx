import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import type { Notification } from '../types';

interface NotificationsBellProps {
  userId: string;
  notifications: Notification[];
  onRefresh: () => void;
}

export const NotificationsBell = React.memo(function NotificationsBell({ userId, notifications, onRefresh }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    onRefresh();
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    onRefresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-cream-dark transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-ink-light" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl border border-border-soft shadow-lg z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
                <h3 className="text-sm font-semibold text-ink">Assessment & Alert Log</h3>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-sage hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-sm text-ink-faint text-center">No active alert logs</p>
              ) : (
                <ul className="divide-y divide-border-soft">
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 ${!n.read ? 'bg-sage-light/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-ink">{n.title}</p>
                          <p className="text-xs text-ink-light mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-ink-faint mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="p-1 text-sage hover:bg-sage-light rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
