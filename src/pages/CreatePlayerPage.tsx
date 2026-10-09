import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerForm } from '../components/players/PlayerForm';
import type { PlayerFormData } from '../components/players/PlayerForm';
import { useCreatePlayer } from '../hooks/usePlayersQuery';
import { useToast } from '../hooks/useToast';

export const CreatePlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreatePlayer();

  const handleCreate = (data: PlayerFormData) => {
    createMutation.mutate(
      {
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
      {
        onSuccess: (newPlayer) => {
          toast.success('Player created successfully', `${newPlayer.username} (${newPlayer.playerId}) has been registered.`);
          navigate('/admin/players');
        },
        onError: (err) => {
          toast.error('Failed to create player', (err as Error).message);
        },
      }
    );
  };

  return (
    <div className="space-y-4.5 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/players')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          ← Back to All Players
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add / Onboard New Player</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Register gaming account, configure starting balance, set KYC status and risk parameters.
        </p>
      </div>

      {/* Form */}
      <PlayerForm
        isEditing={false}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
        onCancel={() => navigate('/admin/players')}
      />
    </div>
  );
};

export default CreatePlayerPage;
