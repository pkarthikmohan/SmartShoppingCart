import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  Gift, 
  Timer, 
  Coins,
  Medal,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';

interface InteractiveFeaturesProps {
  cartValue: number;
  itemCount: number;
  timeInStore: number;
  sectionsVisited: string[];
  onAchievementUnlock?: (achievement: string) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  timeLeft: number;
  active: boolean;
}

export default function InteractiveFeatures({ 
  cartValue, 
  itemCount, 
  timeInStore, 
  sectionsVisited,
  onAchievementUnlock 
}: InteractiveFeaturesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_scan',
      title: 'First Scan',
      description: 'Scan your first product',
      icon: <Zap className="h-5 w-5" />,
      unlocked: false,
      progress: 0,
      target: 1,
      reward: '5% off next item'
    },
    {
      id: 'cart_builder',
      title: 'Cart Builder',
      description: 'Add 5 items to your cart',
      icon: <Target className="h-5 w-5" />,
      unlocked: false,
      progress: 0,
      target: 5,
      reward: 'Free delivery'
    },
    {
      id: 'explorer',
      title: 'Store Explorer',
      description: 'Visit all store sections',
      icon: <Medal className="h-5 w-5" />,
      unlocked: false,
      progress: 0,
      target: 6,
      reward: '₹50 voucher'
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Spend over ₹1000',
      icon: <Trophy className="h-5 w-5" />,
      unlocked: false,
      progress: 0,
      target: 1000,
      reward: 'Premium membership'
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'speed_shopper',
      title: 'Speed Shopper',
      description: 'Complete shopping in under 15 minutes',
      target: 15,
      current: 0,
      reward: '10% instant discount',
      timeLeft: 900, // 15 minutes in seconds
      active: true
    },
    {
      id: 'healthy_choice',
      title: 'Healthy Choice',
      description: 'Add 3 fruits or vegetables',
      target: 3,
      current: 0,
      reward: 'Wellness points +100',
      timeLeft: 1800,
      active: true
    }
  ]);

  const [loyaltyPoints, setLoyaltyPoints] = useState(125);
  const [streak, setStreak] = useState(3);
  const [level, setLevel] = useState(2);

  // Update achievements based on user actions
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      let newProgress = achievement.progress;
      
      switch (achievement.id) {
        case 'first_scan':
          newProgress = Math.min(itemCount, achievement.target);
          break;
        case 'cart_builder':
          newProgress = Math.min(itemCount, achievement.target);
          break;
        case 'explorer':
          newProgress = Math.min(sectionsVisited.length, achievement.target);
          break;
        case 'big_spender':
          newProgress = Math.min(cartValue, achievement.target);
          break;
      }

      const wasUnlocked = achievement.unlocked;
      const isUnlocked = newProgress >= achievement.target;
      
      if (isUnlocked && !wasUnlocked) {
        onAchievementUnlock?.(achievement.title);
        setLoyaltyPoints(prev => prev + 50);
      }

      return {
        ...achievement,
        progress: newProgress,
        unlocked: isUnlocked
      };
    }));
  }, [cartValue, itemCount, sectionsVisited, onAchievementUnlock]);

  // Update challenges
  useEffect(() => {
    setChallenges(prev => prev.map(challenge => {
      let newCurrent = challenge.current;
      
      switch (challenge.id) {
        case 'speed_shopper':
          newCurrent = timeInStore;
          break;
        case 'healthy_choice':
          // This would need to check actual product categories
          newCurrent = Math.min(itemCount, challenge.target);
          break;
      }

      return {
        ...challenge,
        current: newCurrent
      };
    }));
  }, [timeInStore, itemCount]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRankBadge = () => {
    if (level >= 5) return { text: 'Elite', color: 'bg-purple-500' };
    if (level >= 3) return { text: 'Gold', color: 'bg-yellow-500' };
    if (level >= 2) return { text: 'Silver', color: 'bg-gray-400' };
    return { text: 'Bronze', color: 'bg-orange-500' };
  };

  const rank = getRankBadge();

  return (
    <div className="space-y-6">
      {/* Gamification Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-100 to-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${rank.color} text-white`}>
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Level {level} Shopper</h3>
              <Badge className={`${rank.color} text-white`}>{rank.text} Member</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-lg font-bold text-gray-900">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span>{loyaltyPoints} points</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Sparkles className="h-4 w-4" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{itemCount}</div>
            <div className="text-sm text-gray-600">Items Scanned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">₹{cartValue}</div>
            <div className="text-sm text-gray-600">Cart Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{sectionsVisited.length}/6</div>
            <div className="text-sm text-gray-600">Sections Visited</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Your Achievements
          </h4>
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`p-4 ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {achievement.unlocked ? <CheckCircle className="h-5 w-5" /> : achievement.icon}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{achievement.title}</h5>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-blue-600 font-medium">Reward: {achievement.reward}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {achievement.progress}/{achievement.target}
                    </div>
                    <Progress 
                      value={getProgressPercentage(achievement.progress, achievement.target)} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-orange-500" />
            Daily Challenges
          </h4>
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{challenge.title}</h5>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                    <p className="text-xs text-orange-600 font-medium">Reward: {challenge.reward}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Timer className="h-4 w-4 mr-1" />
                      {Math.floor(challenge.timeLeft / 60)}m left
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.current}/{challenge.target}</span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(challenge.current, challenge.target)} 
                    className="h-2"
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Store Leaderboard
          </h4>
          <Card className="p-4">
            <div className="space-y-3">
              {[
                { rank: 1, name: 'You', score: loyaltyPoints, badge: '🏆' },
                { rank: 2, name: 'Priya S.', score: 1850, badge: '🥈' },
                { rank: 3, name: 'Rahul M.', score: 1720, badge: '🥉' },
                { rank: 4, name: 'Anita K.', score: 1650, badge: '' },
                { rank: 5, name: 'Vikram R.', score: 1580, badge: '' }
              ].map((player) => (
                <div key={player.rank} className={`flex items-center justify-between p-2 rounded ${player.name === 'You' ? 'bg-blue-100' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{player.badge || `#${player.rank}`}</span>
                    <span className={`font-medium ${player.name === 'You' ? 'text-blue-700' : 'text-gray-900'}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{player.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}