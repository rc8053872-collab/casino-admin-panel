import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Player } from '../../types/player';
import { useSendPlayerNotification } from '../../hooks/usePlayersQuery';
import { useToast } from '../../hooks/useToast';
import { X } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../animations/variants';

const notificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  type: z.enum(['Information', 'Warning', 'Promotion', 'System']),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface SendNotificationModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, player, onClose }) => {
  const toast = useToast();
  const sendMutation = useSendPlayerNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'Information',
    },
  });

  // ESC key listener to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!player) return null;

  const onSubmit = (data: NotificationFormData) => {
    sendMutation.mutate(
      { id: player.id, notification: data },
      {
        onSuccess: () => {
          toast.success('Notification Sent', `Delivered push message to ${player.username}`);
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 z-10 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Direct Notification</h3>
                <p className="text-xs text-slate-500">
                  Recipient: {player.username} ({player.phone})
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close (ESC)"
                  aria-label="Close modal (ESC)"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Message Type
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="Information">Information (Blue)</option>
                  <option value="Warning">Warning / Compliance (Yellow)</option>
                  <option value="Promotion">Promotion / Bonus (Green)</option>
                  <option value="System">System Critical (Red)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. KYC Documents Required"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter message details that will appear as a push notification..."
                  {...register('message')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {sendMutation.isPending ? 'Sending...' : 'Send Push Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendNotificationModal;
