import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import { Zap, BookOpen, Trophy, Gamepad2, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'circuits',
    title: 'Circuits',
    description: 'Interactive electronic circuit simulator with resistors, capacitors, and real-time feedback',
    icon: <Zap className="h-8 w-8" />,
    path: '/circuits',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test your knowledge with interactive quizzes on various electronics topics',
    icon: <BookOpen className="h-8 w-8" />,
    path: '/quiz',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'challenges',
    title: 'Challenges',
    description: 'Timed challenges and advanced puzzles to test your circuit-building skills',
    icon: <Trophy className="h-8 w-8" />,
    path: '/challenges',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Fun educational games that make learning electronics engaging and interactive',
    icon: <Gamepad2 className="h-8 w-8" />,
    path: '/games',
    color: 'from-purple-500 to-pink-500'
  }
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Electronics Learning Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master electronics through interactive simulations, engaging quizzes, and hands-on challenges. 
            Learn at your own pace with our comprehensive educational tools.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
            >
              <CardHeader className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {category.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-gray-600 text-base mb-6">
                  {category.description}
                </CardDescription>
                <Button 
                  className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white border-0 group`}
                  onClick={() => window.location.href = category.path}
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-blue-500 mb-4">
                <Zap className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
              <p className="text-gray-600">
                Hands-on simulations and real-time feedback make learning electronics engaging and effective.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-green-500 mb-4">
                <Trophy className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progressive Difficulty</h3>
              <p className="text-gray-600">
                Start with basic concepts and gradually advance to complex circuit designs and analysis.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-purple-500 mb-4">
                <BookOpen className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Content</h3>
              <p className="text-gray-600">
                Learn everything from Ohm's law to advanced circuit analysis with our structured curriculum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;