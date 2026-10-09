import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerForm } from '../components/players/PlayerForm';
import type { PlayerFormData } from '../components/players/PlayerForm';
import { usePlayer, useUpdatePlayer } from '../hooks/usePlayersQuery';
import { useToast } from '../hooks/useToast';

export const EditPlayerPage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: player, isLoading, isError } = usePlayer(playerId);
  const updateMutation = useUpdatePlayer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-slate-400">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading player profile...
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="text-sm font-bold text-slate-900">Player Not Found</div>
        <p className="text-xs text-slate-500">Record for {playerId} could not be located.</p>
        <button
          onClick={() => navigate('/admin/players')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Players
        </button>
      </div>
    );
  }

  const handleUpdate = (data: PlayerFormData) => {
    updateMutation.mutate(
      {
        id: player.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          phone: data.phone,
          region: data.region,
          device: data.device,
          status: data.status,
          kycStatus: data.kycStatus,
          riskTier: data.riskTier,
          balance: data.balance,
          preferences: {
            notifications: data.notifications,
            language: data.language,
          },
        },
      },
      {
        onSuccess: (updated) => {
          toast.success('Player Updated', `Profile updated for ${updated.username}`);
          navigate(`/admin/players/${updated.id}`);
        },
        onError: (err) => {
          toast.error('Update Failed', (err as Error).message);
        },
      }
    );
  };

  return (
    <div className="space-y-4.5 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/admin/players/${player.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          ← Back to {player.username}
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Player Profile</h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
            {player.playerId}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Modify contact information, risk rating tier, KYC documents, or account status.
        </p>
      </div>

      {/* Reused Player Form */}
      <PlayerForm
        initialData={player}
        isEditing={true}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/admin/players/${player.id}`)}
      />
    </div>
  );
};

export default EditPlayerPage;
