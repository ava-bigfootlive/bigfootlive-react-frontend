import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Heart,
  ThumbsUp,
  Smile,
  Star,
  Zap,
  Flame,
  Sparkles,
  PartyPopper,
  Settings,
  ToggleLeft,
  ToggleRight,
  Activity
} from 'lucide-react';

interface ReactionType {
  id: string;
  name: string;
  icon: any;
  emoji: string;
  color: string;
  enabled: boolean;
  count: number;
}

export default function ReactionsPage() {
  const [reactions, setReactions] = useState<ReactionType[]>([
    { id: 'heart', name: 'Heart', icon: Heart, emoji: '❤️', color: 'text-red-500', enabled: true, count: 0 },
    { id: 'like', name: 'Like', icon: ThumbsUp, emoji: '👍', color: 'text-blue-500', enabled: true, count: 0 },
    { id: 'smile', name: 'Smile', icon: Smile, emoji: '😊', color: 'text-yellow-500', enabled: true, count: 0 },
    { id: 'star', name: 'Star', icon: Star, emoji: '⭐', color: 'text-purple-500', enabled: true, count: 0 },
    { id: 'fire', name: 'Fire', icon: Flame, emoji: '🔥', color: 'text-orange-500', enabled: true, count: 0 },
    { id: 'sparkle', name: 'Sparkle', icon: Sparkles, emoji: '✨', color: 'text-pink-500', enabled: false, count: 0 },
    { id: 'party', name: 'Party', icon: PartyPopper, emoji: '🎉', color: 'text-green-500', enabled: false, count: 0 },
    { id: 'zap', name: 'Zap', icon: Zap, emoji: '⚡', color: 'text-indigo-500', enabled: false, count: 0 }
  ]);

  const [showOverlay, setShowOverlay] = useState(false);

  const toggleReaction = (id: string) => {
    setReactions(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return (
    <DashboardLayout title="Reactions">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reactions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure live reactions for your streams
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowOverlay(!showOverlay)}
            >
              {showOverlay ? 'Hide' : 'Show'} Preview
            </Button>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Reactions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Types</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {reactions.filter(r => r.enabled).length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Peak Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0/s</p>
              </div>
              <Zap className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Reaction Types */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Reaction Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reactions.map((reaction) => {
              const Icon = reaction.icon;
              return (
                <div 
                  key={reaction.id}
                  className={`p-4 rounded-lg border ${
                    reaction.enabled 
                      ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950' 
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                        <Icon className={`h-6 w-6 ${reaction.color}`} />
                      </div>
                      <span className="text-2xl">{reaction.emoji}</span>
                    </div>
                    <button
                      onClick={() => toggleReaction(reaction.id)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {reaction.enabled ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {reaction.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {reaction.count} reactions
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Overlay */}
        {showOverlay && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Live Preview
            </h2>
            <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
              <div className="absolute bottom-4 left-4 flex gap-2">
                {reactions.filter(r => r.enabled).map((reaction) => {
                  const Icon = reaction.icon;
                  return (
                    <button
                      key={reaction.id}
                      className="p-2 bg-black/50 backdrop-blur rounded-full hover:bg-black/70 transition-colors"
                    >
                      <Icon className={`h-6 w-6 ${reaction.color}`} />
                    </button>
                  );
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <p className="text-sm">Stream preview area</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Display Settings
          </h2>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show reaction bubbles</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display floating reaction animations on stream
                </p>
              </div>
              <ToggleRight className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show reaction count</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display total reaction count on stream overlay
                </p>
              </div>
              <ToggleRight className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Sound effects</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Play sound when reactions are triggered
                </p>
              </div>
              <ToggleLeft className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}