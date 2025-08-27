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
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">
                BigFootLive
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex hover-lift">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-gradient hover-lift">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trusted by 500+ organizations worldwide
              </span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-8 leading-none">
              <span className="text-gradient animate-gradient bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600">
                Professional
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Live Streaming
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade streaming infrastructure that scales with your audience. 
              From intimate webinars to massive global events.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link to="/register">
                <Button size="lg" className="btn-gradient hover-lift px-8 py-4 text-lg font-semibold w-full sm:w-auto">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold w-full sm:w-auto hover-lift glass">
                  <Video className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">Sub-second Latency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4">
              Platform Features
            </div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to 
              <span className="text-gradient">stream professionally</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From RTMP ingestion to global CDN delivery, our platform handles the complexity 
              so you can focus on creating amazing content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {[
              {
                icon: Video,
                title: "4K Live Streaming",
                description: "Ultra-high definition streaming with adaptive bitrate technology and sub-second latency",
                gradient: "from-purple-600 to-blue-600",
                highlight: "Up to 4K@60fps"
              },
              {
                icon: Users,
                title: "Multi-Tenant Architecture", 
                description: "Complete organizational isolation with white-label customization and dedicated resources",
                gradient: "from-blue-600 to-teal-600",
                highlight: "Enterprise Ready"
              },
              {
                icon: MessageSquare,
                title: "Interactive Engagement",
                description: "Real-time chat, polls, Q&A, and custom reactions with advanced moderation controls",
                gradient: "from-teal-600 to-green-600",
                highlight: "Real-time"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep insights with viewer demographics, engagement metrics, and predictive analytics",
                gradient: "from-green-600 to-yellow-600",
                highlight: "AI Powered"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 compliant with SSO, SAML, MFA, and end-to-end encryption",
                gradient: "from-yellow-600 to-orange-600",
                highlight: "SOC 2 Type II"
              },
              {
                icon: Globe,
                title: "Global CDN Network",
                description: "200+ edge locations worldwide with intelligent routing for optimal performance",
                gradient: "from-orange-600 to-red-600",
                highlight: "200+ Locations"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="card-premium hover:card-glow transition-all duration-500 group cursor-pointer border-0 shadow-xl hover:shadow-2xl hover:-translate-y-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-2xl blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-110`} />
                    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 shadow-md">
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 glass border-y border-white/20 dark:border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by industry leaders
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of organizations streaming with confidence
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { 
                number: "50K+", 
                label: "Active Streamers", 
                icon: Users,
                growth: "+127% YoY"
              },
              { 
                number: "10M+", 
                label: "Hours Streamed", 
                icon: Video,
                growth: "+89% YoY"
              },
              { 
                number: "500+", 
                label: "Enterprise Clients", 
                icon: Award,
                growth: "+156% YoY"
              },
              { 
                number: "99.99%", 
                label: "Uptime SLA", 
                icon: Shield,
                growth: "Industry Leading"
              }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in group" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="relative p-8 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white dark:hover:bg-black/90 transition-all duration-500 hover:scale-105">
                  <stat.icon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl lg:text-5xl font-bold mb-2 text-gradient">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                    {stat.label}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-semibold">{stat.growth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-5" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl" />
            
            <Card className="card-glow border-0 shadow-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl p-12 lg:p-16 text-center relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-500/20 to-green-500/20 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Limited Time Offer
                  </span>
                </div>
                
                <h2 className="text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-gray-900 dark:text-white">Ready to scale your</span>
                  <br />
                  <span className="text-gradient">streaming empire?</span>
                </h2>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                  Join 50,000+ creators and 500+ enterprises who've chosen BigFootLive 
                  for their mission-critical streaming needs. Start your free trial today.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <Link to="/register">
                    <Button size="lg" className="btn-gradient px-12 py-4 text-lg font-semibold w-full sm:w-auto hover-lift">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" size="lg" className="px-12 py-4 text-lg font-semibold w-full sm:w-auto hover-lift glass">
                      <Users className="mr-2 h-5 w-5" />
                      Contact Sales
                    </Button>
                  </Link>
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free 14-day trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 glass border-t border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-2xl font-bold text-gradient">
                  BigFootLive
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
                The world's most advanced live streaming platform. 
                Trusted by creators, brands, and enterprises globally.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>99.99% SLA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link to="/api" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">API Docs</Link></li>
                <li><Link to="/status" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/security" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Security</Link></li>
                <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 BigFootLive. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">Built with</span>
              <div className="flex items-center gap-1">
                <span className="text-red-500">♥</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">for creators worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}