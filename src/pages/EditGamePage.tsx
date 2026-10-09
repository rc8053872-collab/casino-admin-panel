import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameForm } from '../components/games/GameForm';
import type { GameFormData } from '../components/games/GameForm';
import { useGame, useUpdateGame } from '../hooks/useGamesQuery';
import { useToast } from '../hooks/useToast';

export const EditGamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: game, isLoading, isError } = useGame(gameId);
  const updateMutation = useUpdateGame();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading game settings...
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="text-sm font-bold text-slate-900">Game Not Found</div>
        <p className="text-xs text-slate-500">Could not locate game record for ID: {gameId}</p>
        <button
          onClick={() => navigate('/admin/games')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Games
        </button>
      </div>
    );
  }

  const handleUpdate = (data: GameFormData) => {
    updateMutation.mutate(
      { id: game.id, data },
      {
        onSuccess: (updated) => {
          toast.success('Configuration Saved', `${updated.name} updated successfully.`);
          navigate(`/admin/games/${updated.id}`);
        },
        onError: (err) => {
          toast.error('Failed to update game', (err as Error).message);
        },
      }
    );
  };

  return (
    <div className="space-y-4.5 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate(`/admin/games/${game.id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            ← Back to {game.name}
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Game Configuration</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
              {game.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify game rules, participant thresholds, rake fee, or system operational controls.
          </p>
        </div>
      </div>

      {/* Reused Form */}
      <GameForm
        initialData={game}
        isEditing={true}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/admin/games/${game.id}`)}
      />
    </div>
  );
};

export default EditGamePage;
