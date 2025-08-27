import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Video, Code, HelpCircle, ExternalLink, FileText, MessageCircle, Zap } from 'lucide-react';

export default function DocumentationPage() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of BigFootLive platform',
      icon: Book,
      links: [
        { title: 'Quick Start Guide', url: '#' },
        { title: 'Platform Overview', url: '#' },
        { title: 'Account Setup', url: '#' },
      ]
    },
    {
      title: 'Streaming Guide',
      description: 'Everything about live streaming',
      icon: Video,
      links: [
        { title: 'OBS Configuration', url: '#' },
        { title: 'Stream Settings', url: '#' },
        { title: 'Best Practices', url: '#' },
      ]
    },
    {
      title: 'API Reference',
      description: 'Integrate with our platform',
      icon: Code,
      links: [
        { title: 'REST API', url: '#' },
        { title: 'WebSocket Events', url: '#' },
        { title: 'Authentication', url: '#' },
      ]
    },
    {
      title: 'Support',
      description: 'Get help when you need it',
      icon: HelpCircle,
      links: [
        { title: 'FAQ', url: '#' },
        { title: 'Contact Support', url: '#' },
        { title: 'Community Forum', url: '#' },
      ]
    },
  ];

  const quickLinks = [
    { title: 'Stream Quality Guidelines', icon: Zap, color: 'text-yellow-500' },
    { title: 'Troubleshooting Guide', icon: FileText, color: 'text-red-500' },
    { title: 'Feature Updates', icon: MessageCircle, color: 'text-blue-500' },
  ];

  return (
    <DashboardLayout 
      title="Documentation" 
      subtitle="Learn how to use BigFootLive platform effectively"
    >
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-6">
              <link.icon className={`h-8 w-8 ${link.color} mr-4`} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{link.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View documentation</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant="ghost"
                      className="w-full justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => console.log(`Navigate to ${link.url}`)}
                    >
                      <span className="text-gray-700 dark:text-gray-300">{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Need More Help?</h2>
          <p className="text-white/90 mb-6">
            Our support team is here to assist you with any questions or issues
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              <Book className="h-4 w-4 mr-2" />
              Browse All Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}