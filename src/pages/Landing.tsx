import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  PlayCircle, 
  Users, 
  BarChart3, 
  Shield, 
  Globe,
  Video,
  MessageSquare,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ 
          backgroundColor: 'hsl(var(--surface) / 0.8)',
          borderColor: 'hsl(var(--border))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Video className="h-8 w-8" style={{ color: 'hsl(var(--brand-primary))' }} />
              <h1 className="text-title font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                BigFootLive
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button>
                  Get Started
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-display mb-6 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-accent))] bg-clip-text text-transparent">
              Professional Live Streaming Platform
            </h2>
            <p className="text-subtitle mb-8 max-w-2xl mx-auto">
              Stream, engage, and grow your audience with BigFootLive's enterprise-grade 
              streaming platform. Built for creators, brands, and organizations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Streaming Now
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-headline mb-4" style={{ color: 'hsl(var(--foreground))' }}>
              Everything You Need to Stream
            </h3>
            <p className="text-subtitle max-w-2xl mx-auto">
              Powerful features designed for professional streaming and audience engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {[
              {
                icon: Video,
                title: "HD Live Streaming",
                description: "Crystal clear video streaming with adaptive bitrate technology"
              },
              {
                icon: Users,
                title: "Multi-Tenant Support", 
                description: "Complete isolation and customization for enterprise organizations"
              },
              {
                icon: MessageSquare,
                title: "Interactive Chat",
                description: "Real-time chat with moderation tools and custom reactions"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Detailed insights into viewership, engagement, and performance"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SSO, SAML authentication, and comprehensive access controls"
              },
              {
                icon: Globe,
                title: "Global CDN",
                description: "Worldwide content delivery for optimal streaming performance"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="card-modern hover:card-elevated transition-all duration-300 group cursor-pointer"
                style={{
                  backgroundColor: 'hsl(var(--surface))',
                  borderColor: 'hsl(var(--border))',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full transition-all duration-200 group-hover:scale-110"
                       style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}>
                    <feature.icon className="h-6 w-6" style={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: 'hsl(var(--foreground))' }}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16 border-y"
        style={{ 
          backgroundColor: 'hsl(var(--surface-elevated))',
          borderColor: 'hsl(var(--border))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Streamers" },
              { number: "1M+", label: "Hours Streamed" },
              { number: "500+", label: "Organizations" },
              { number: "99.9%", label: "Uptime SLA" }
            ].map((stat, index) => (
              <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-3xl lg:text-4xl font-bold mb-2" 
                     style={{ color: 'hsl(var(--brand-primary))' }}>
                  {stat.number}
                </div>
                <div className="text-overline" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card 
            className="card-elevated max-w-4xl mx-auto text-center p-8 lg:p-12"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border))'
            }}
          >
            <div className="mb-6">
              <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'hsl(var(--brand-accent))' }} />
              <h3 className="text-headline mb-4" style={{ color: 'hsl(var(--foreground))' }}>
                Ready to Start Streaming?
              </h3>
              <p className="text-subtitle max-w-2xl mx-auto">
                Join thousands of creators and organizations already using BigFootLive 
                to reach their audiences with professional streaming.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 border-t mt-16"
        style={{ 
          backgroundColor: 'hsl(var(--surface-elevated))',
          borderColor: 'hsl(var(--border))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="h-6 w-6" style={{ color: 'hsl(var(--brand-primary))' }} />
              <span className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                BigFootLive
              </span>
            </div>
            <p className="text-caption mb-4" style={{ color: 'hsl(var(--foreground-secondary))' }}>
              Professional live streaming platform for the modern world.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link to="/privacy" className="hover:underline" style={{ color: 'hsl(var(--foreground-tertiary))' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:underline" style={{ color: 'hsl(var(--foreground-tertiary))' }}>
                Terms of Service
              </Link>
              <Link to="/contact" className="hover:underline" style={{ color: 'hsl(var(--foreground-tertiary))' }}>
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}