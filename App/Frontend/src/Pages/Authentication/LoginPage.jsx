import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Lock, LogIn, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
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
      bg: 'from-purple-50 via-pink-50 to-orange-50',
      button: 'from-purple-600 to-pink-600',
      text: 'text-purple-600',
    },
    organizer: {
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      bg: 'from-blue-50 via-indigo-50 to-purple-50',
      button: 'from-blue-600 to-indigo-600',
      text: 'text-blue-600',
    },
    sponsor: {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      bg: 'from-emerald-50 via-teal-50 to-cyan-50',
      button: 'from-emerald-600 to-teal-600',
      text: 'text-emerald-600',
    },
    admin: {
      gradient: 'from-slate-700 via-gray-800 to-zinc-900',
      bg: 'from-slate-50 via-gray-50 to-zinc-50',
      button: 'from-slate-700 to-gray-800',
      text: 'text-slate-700',
    },
  };

  const currentColors = roleColors[selectedRole];

  return (
    <div className={`min-h-screen pt-20 pb-12 bg-gradient-to-br ${currentColors.bg}`}>
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
            <p className="text-gray-600">
              Sign in to access your event management dashboard
            </p>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Choose your role and sign in to continue</CardDescription>
            </CardHeader>

            <CardContent>
              <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <AlertDescription>
                  <p className="font-semibold text-purple-900 mb-2">🎯 Demo Credentials:</p>
                  <ul className="text-sm space-y-1 text-purple-800">
                    <li><strong>Student:</strong> student</li>
                    <li><strong>Organizer:</strong> organizer</li>
                    <li><strong>Sponsor:</strong> sponsor</li>
                    <li><strong>Admin:</strong> admin</li>
                    <li className="text-xs text-purple-600 mt-2">Password: any text (3+ characters)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Tabs value={selectedRole} onValueChange={setSelectedRole} className="mb-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="organizer">Organizer</TabsTrigger>
                  <TabsTrigger value="sponsor">Sponsor</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
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
                  className={`w-full bg-gradient-to-r ${currentColors.button} hover:opacity-90`}
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
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className={`${currentColors.text} hover:underline`}>
                  Sign up
                </Link>
              </div>
              <div className="text-center text-sm">
                <Link to="/change-password" className="text-gray-500 hover:underline">
                  Change Password
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
