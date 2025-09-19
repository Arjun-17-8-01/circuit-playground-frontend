import { useState } from 'react';
import { CircuitSimulator } from '@/components/CircuitSimulator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Zap, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlayerStats {
  totalScore: number;
  levelsCompleted: number;
  totalLevels: number;
  badges: string[];
  currentStreak: number;
  bestTime: number;
}

const CircuitsPage = () => {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalScore: 0,
    levelsCompleted: 0,
    totalLevels: 15,
    badges: [],
    currentStreak: 0,
    bestTime: 0
  });

  const handleLevelComplete = (level: number, timeSpent: number, attempts: number) => {
    const basePoints = 100;
    const timeBonus = Math.max(0, 60 - timeSpent) * 2; // Bonus for completing under 60 seconds
    const attemptPenalty = Math.max(0, (attempts - 1) * 10); // Penalty for multiple attempts
    const levelPoints = basePoints + timeBonus - attemptPenalty;

    setPlayerStats(prev => ({
      ...prev,
      totalScore: prev.totalScore + levelPoints,
      levelsCompleted: Math.max(prev.levelsCompleted, level),
      currentStreak: prev.currentStreak + 1,
      bestTime: prev.bestTime === 0 ? timeSpent : Math.min(prev.bestTime, timeSpent)
    }));

    // Award badges based on achievements
    const newBadges = [...playerStats.badges];
    if (level === 1 && !newBadges.includes('First Step')) {
      newBadges.push('First Step');
    }
    if (level === 5 && !newBadges.includes('Circuit Novice')) {
      newBadges.push('Circuit Novice');
    }
    if (level === 10 && !newBadges.includes('Circuit Expert')) {
      newBadges.push('Circuit Expert');
    }
    if (level === 15 && !newBadges.includes('Circuit Master')) {
      newBadges.push('Circuit Master');
    }
    if (timeSpent < 30 && !newBadges.includes('Speed Demon')) {
      newBadges.push('Speed Demon');
    }
    if (attempts === 1 && !newBadges.includes('Perfect Score')) {
      newBadges.push('Perfect Score');
    }

    if (newBadges.length > playerStats.badges.length) {
      setPlayerStats(prev => ({ ...prev, badges: newBadges }));
    }
  };

  const progressPercentage = (playerStats.levelsCompleted / playerStats.totalLevels) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Circuit Simulator</h1>
            </div>
            
            {/* Stats Panel */}
            <div className="flex items-center space-x-4">
              <Card className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">Score</div>
                    <div className="text-lg font-bold">{playerStats.totalScore}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">Progress</div>
                    <div className="text-lg font-bold">{playerStats.levelsCompleted}/{playerStats.totalLevels}</div>
                  </div>
                </div>
              </Card>

              {playerStats.bestTime > 0 && (
                <Card className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">Best Time</div>
                      <div className="text-lg font-bold">{playerStats.bestTime}s</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Badges */}
          {playerStats.badges.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Achievements</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {playerStats.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Circuit Simulator */}
      <div className="container mx-auto px-4 py-6">
        <CircuitSimulator onLevelComplete={handleLevelComplete} />
      </div>
    </div>
  );
};

export default CircuitsPage;