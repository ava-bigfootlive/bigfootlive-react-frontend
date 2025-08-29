import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle,
  Users,
  Plus,
  ThumbsUp,
  BarChart3,
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  active: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  author: string;
  answered: boolean;
  upvotes: number;
  createdAt: string;
}

export default function PollsQAPage() {
  const [activeTab, setActiveTab] = useState<'polls' | 'qa'>('polls');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  return (
    <DashboardLayout title="Polls & Q&A">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Polls & Q&A
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Engage with your audience through polls and questions
            </p>
          </div>
          <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100">
            <Plus className="mr-2 h-4 w-4" />
            Create {activeTab === 'polls' ? 'Poll' : 'Q&A Session'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg max-w-xs">
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'polls'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="inline h-4 w-4 mr-1" />
            Polls
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'qa'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="inline h-4 w-4 mr-1" />
            Q&A
          </button>
        </div>

        {/* Content */}
        {activeTab === 'polls' ? (
          <div>
            {polls.length > 0 ? (
              <div className="grid gap-4">
                {polls.map((poll) => (
                  <div key={poll.id} className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {poll.question}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {poll.totalVotes} votes • Created {poll.createdAt}
                        </p>
                      </div>
                      {poll.active && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-600 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {option.text}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {poll.totalVotes > 0 
                                  ? Math.round((option.votes / poll.totalVotes) * 100) 
                                  : 0}%
                              </span>
                            </div>
                            {poll.totalVotes > 0 && (
                              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(option.votes / poll.totalVotes) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No polls yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Create your first poll to engage your audience
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Poll
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {questions.length > 0 ? (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <div key={question.id} className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {question.author}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {question.createdAt}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white mb-3">
                          {question.text}
                        </p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                            <ThumbsUp className="h-4 w-4" />
                            {question.upvotes}
                          </button>
                          {question.answered && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Answered
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Answer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No questions yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Start a Q&A session to interact with your audience
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Q&A Session
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}