import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChallengesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Electronics Challenges</h1>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8 bg-white shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-20 h-20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Challenges Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Get ready for timed challenges, advanced puzzles, and competitive circuit-building tasks 
                that will test your skills to the limit. Earn rankings and compete with other learners!
              </p>
              <Button 
                onClick={() => navigate('/circuits')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
              >
                Practice in Circuit Simulator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;