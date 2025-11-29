import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { loginUser, clearError } from '../../store/auth.slice.js';
import { toast } from 'sonner';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authSlice = useSelector((state) => state?.auth ?? {});
  const { status, error, isAuthenticated } = authSlice;
  const isLoading = status === 'loading';
  
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [selectedRole, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 3) {
      toast.error('Password must be at least 3 characters long');
      return;
    }

    try {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      })).unwrap();
      
      toast.success(`Welcome back! Logged in as ${selectedRole}`);
      navigate('/');
    } catch (err) {
      toast.error(err?.message ?? err ?? 'Login failed');
    }
  };

  const roleColors = {
    student: {
      gradient: 'from-purple-500 via-pink-500 to-orange-400',
      bg: 'from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900',
      button: 'from-purple-600 to-pink-600',
      text: 'text-purple-600 dark:text-purple-400',
    },
    organizer: {
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      bg: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900',
      button: 'from-blue-600 to-indigo-600',
      text: 'text-blue-600 dark:text-blue-400',
    },
    sponsor: {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      bg: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900',
      button: 'from-emerald-600 to-teal-600',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    admin: {
      gradient: 'from-slate-700 via-gray-800 to-zinc-900 dark:from-slate-100 dark:via-gray-200 dark:to-zinc-300',
      bg: 'from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-zinc-900 dark:to-black',
      button: 'from-slate-700 to-gray-800 dark:from-slate-600 dark:to-gray-700',
      text: 'text-slate-700 dark:text-slate-400',
    },
  };

  const currentColors = roleColors[selectedRole];

  return (
    <div className={`min-h-screen pt-20 pb-12 bg-gradient-to-br ${currentColors.bg} transition-colors duration-500`}>
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className={`text-5xl mb-4 font-black bg-gradient-to-r ${currentColors.gradient} bg-clip-text text-transparent`}>
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your event management dashboard
            </p>
          </div>

          <Card className="shadow-2xl border-2 dark:border-gray-800 dark:bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Choose your role and sign in to continue</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <SegmentedControl
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'organizer', label: 'Organizer' },
                    { value: 'sponsor', label: 'Sponsor' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  value={selectedRole}
                  onChange={setSelectedRole}
                  variant={selectedRole}
                  isFullWidth={true} 
                />
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 dark:bg-gray-900/50 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 dark:bg-gray-900/50 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className={`text-sm ${currentColors.text} hover:underline`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r ${currentColors.button} hover:opacity-90 text-white border-0`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className={`${currentColors.text} hover:underline font-medium`}>
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
export { LoginPage };