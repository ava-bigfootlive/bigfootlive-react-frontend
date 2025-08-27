import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Users, Settings } from 'lucide-react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    { id: 1, user: 'John Doe', message: 'Hey everyone! Ready for the stream?', time: '10:23 AM', avatar: 'JD' },
    { id: 2, user: 'Sarah Smith', message: 'Super excited! Can\'t wait to see the demo', time: '10:25 AM', avatar: 'SS' },
    { id: 3, user: 'Mike Wilson', message: 'Audio and video looking good!', time: '10:28 AM', avatar: 'MW' },
    { id: 4, user: 'Admin', message: 'Stream starts in 5 minutes!', time: '10:30 AM', avatar: 'A', isAdmin: true },
  ]);

  return (
    <DashboardLayout 
      title="Chat Management" 
      subtitle="Monitor and manage live chat across your streams"
      actions={
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Chat Settings
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  243 participants
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      msg.isAdmin ? 'bg-purple-600' : 'bg-gray-500'
                    }`}>
                      {msg.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={`font-medium ${
                          msg.isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {msg.user}
                          {msg.isAdmin && <span className="text-xs ml-1">(Admin)</span>}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Stats */}
        <div className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg">Chat Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages/minute</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active chatters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">37%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg">Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Moderators
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Blocked Words
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Chat Rules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}