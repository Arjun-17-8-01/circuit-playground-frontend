import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
          <h1 className="text-3xl font-bold text-gray-900">Electronics Quiz</h1>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8 bg-white shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Quiz Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                We're working on an exciting quiz section that will test your knowledge of electronics concepts, 
                circuit analysis, and component behavior. Stay tuned for interactive questions and instant feedback!
              </p>
              <Button 
                onClick={() => navigate('/circuits')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white"
              >
                Try Circuit Simulator Instead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;