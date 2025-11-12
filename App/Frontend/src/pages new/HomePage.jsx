import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  Calendar,
  Users,
  Trophy,
  Sparkles,
  Rocket,
  Star,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle2,
  PartyPopper,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { eventService } from '../services/eventService';

export const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingEvents();
  }, []);

  const loadTrendingEvents = async () => {
    try {
      const response = await eventService.getTrendingEvents();
      setTrendingEvents(response.data);
    } catch (error) {
      console.error('Failed to load trending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Smart Event Management',
      description: 'Organize and manage college events with ease',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team seamlessly',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Trophy,
      title: 'Track Achievements',
      description: 'Monitor registrations and celebrate success',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay connected with instant notifications',
      color: 'from-green-500 to-teal-500',
    },
  ];

  const stats = [
    { label: 'Active Events', value: '500+', icon: Calendar },
    { label: 'Students', value: '10K+', icon: Users },
    { label: 'Organizers', value: '200+', icon: Sparkles },
    { label: 'Success Rate', value: '98%', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -30, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-2xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="flex justify-center gap-4 mb-6">
              {[Star, Sparkles, Heart, Trophy, PartyPopper].map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon className="w-8 h-8 text-purple-500" />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-black mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  College Events
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Made Easy!
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto"
            >
              The ultimate platform for organizing, discovering, and participating in
              amazing college events. Join thousands of students today! 🎉
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    asChild
                  >
                    <Link to="/events">
                      Explore Events <Rocket className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-2xl border-2 border-purple-600 hover:bg-purple-50"
                    asChild
                  >
                    <Link to="/dashboard">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    asChild
                  >
                    <Link to="/register">
                      Get Started Free <Rocket className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-2xl border-2 border-purple-600 hover:bg-purple-50"
                    asChild
                  >
                    <Link to="/events">
                      Browse Events <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center border-2 hover:border-purple-400 transition-all hover:shadow-lg">
                    <Icon className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                    <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing Features
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to make your events successful ✨
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Card className="p-6 h-full border-2 hover:border-purple-400 transition-all hover:shadow-xl">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps! 🚀
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up as a student, organizer, or sponsor',
                icon: Users,
              },
              {
                step: '02',
                title: 'Discover Events',
                description: 'Browse amazing events happening in your college',
                icon: Calendar,
              },
              {
                step: '03',
                title: 'Join & Enjoy',
                description: 'Register, participate, and make memories!',
                icon: PartyPopper,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="p-8 text-center border-2 hover:border-purple-400 transition-all hover:shadow-xl">
                    <div className="text-6xl font-black text-purple-200 mb-4">{item.step}</div>
                    <Icon className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <CheckCircle2 className="w-8 h-8 mx-auto mt-4 text-green-500" />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 text-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 text-white border-0 shadow-2xl">
              <Sparkles className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-purple-100">
                Join thousands of students and organizers making college events amazing!
              </p>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                asChild
              >
                <Link to={isAuthenticated ? '/events' : '/register'}>
                  {isAuthenticated ? 'Explore Events Now' : 'Sign Up Free Today'} 
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 text-center border-4 border-emerald-600 shadow-2xl bg-white">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Building2 className="w-20 h-20 mx-auto mb-6 text-emerald-600" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Is Your College on CEMS?
              </h2>
              <p className="text-xl mb-8 text-gray-700">
                Register your college now and unlock the power of seamless event management for your entire campus! 
                Join the growing network of institutions transforming their event experience.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Free Registration</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Quick Approval</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Full Support</span>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                asChild
              >
                <Link to="/register-college">
                  <Building2 className="mr-2 w-6 h-6" />
                  Get Your College Registered
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </Button>
              <p className="mt-6 text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-emerald-600 hover:underline font-semibold">Login here</Link>
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
