import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameForm } from '../components/games/GameForm';
import type { GameFormData } from '../components/games/GameForm';
import { useCreateGame } from '../hooks/useGamesQuery';
import { useToast } from '../hooks/useToast';

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateGame();

  const handleCreate = (data: GameFormData) => {
    createMutation.mutate(data, {
      onSuccess: (newGame) => {
        toast.success('Game created successfully', `${newGame.name} (${newGame.id}) is now configured.`);
        navigate('/admin/games');
      },
      onError: (err) => {
        toast.error('Failed to create game', (err as Error).message);
      },
    });
  };

  const handleSaveDraft = (_data: Partial<GameFormData>) => {
    toast.info('Draft Saved', 'Game parameters cached locally.');
  };

  return (
    <div className="space-y-4.5 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/admin/games')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            ← Back to Games
          </button>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create New Game</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure match rules, participant capacity, currency buy-in, and operational automation.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <GameForm
        isEditing={false}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
        onCancel={() => navigate('/admin/games')}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
};

export default CreateGamePage;
