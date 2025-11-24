import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Building2 } from 'lucide-react';
import { Button } from '../../Components/ui/button.jsx';
import { Input } from '../../Components/ui/input.jsx';
import { Label } from '../../Components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../Components/ui/card.jsx';
import { Alert, AlertDescription } from '../../Components/ui/alert.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../Components/ui/select.jsx';
import { registerUser, clearError } from '../../Store/auth.slice.js'; 
import { fetchAllApprovedColleges } from '../../Store/college.slice.js';
import { toast } from 'sonner';

// Helper to safely format many possible error shapes
const formatError = (err) => {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || String(err);
  if (typeof err === 'object') {
    if (err.register) return String(err.register);
    if (err.message) return String(err.message);
    if (err.error) return String(err.error);
    if (Array.isArray(err)) return err.join(', ');
    if (err.errors && typeof err.errors === 'object') {
      const msgs = [];
      Object.values(err.errors).forEach((v) => {
        if (Array.isArray(v)) msgs.push(...v.map(String));
        else msgs.push(String(v));
      });
      if (msgs.length) return msgs.join(', ');
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
};

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Defensive selector: avoid destructuring from undefined
  const authSlice = useSelector((state) => (state && state.auth) ? state.auth : {});
  const { status, error, isAuthenticated } = authSlice;
  const { list: colleges, status: collegeStatus } = useSelector((state) => state.college || { list: [], status: 'idle' });
  const isLoading = status === 'loading';

  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(fetchAllApprovedColleges());
  }, [dispatch]);

  useEffect(() => {
    // clear any previous errors when role changes
    dispatch(clearError?.() ?? (() => {}));
    // Clear college if not required for the role
    if (selectedRole !== 'student' && selectedRole !== 'organizer') {
      setFormData((prev) => ({ ...prev, college: '' }));
    }
  }, [selectedRole, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCollegeChange = (value) => {
    console.log('Selected college value:', value); // Debug log
    setFormData((prev) => ({
      ...prev,
      college: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if ((selectedRole === 'student' || selectedRole === 'organizer') && !formData.college) {
      toast.error('Please select your college');
      return;
    }
    
    console.log('Form data before submission:', formData); // Debug log
    
    if (!validateEmail(formData.email)) {
      console.log('Invalid email:', formData.email); // Debug log
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      console.log('Passwords do not match:', formData.password, formData.confirmPassword); // Debug log
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      console.log('Password too short:', formData.password); // Debug log
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (!validatePassword(formData.password)) {
      console.log('Password complexity not met:', formData.password); // Debug log
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    try {
      console.log('Submitting registration for:', {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        role: selectedRole,
      }); // Debug log

      await dispatch(registerUser({
        username: formData.name, 
        email: formData.email,
        password: formData.password,
        college: formData.college,
        role: selectedRole,
      })).unwrap();

      console.log('Registration successful'); // Debug log
      toast.success(`Account created successfully! Welcome as ${selectedRole}`);
      navigate('/');
    } catch (err) {
      const msg = formatError(err) || 'Registration failed';
      toast.error(msg);
      console.error('Registration error:', err);
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
              Join CEMS
            </h1>
            <p className="text-gray-600">
              Create your account and start managing events
            </p>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Choose your role and get started</CardDescription>
            </CardHeader>

            <CardContent>
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
                  <AlertDescription>{formatError(error)}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">UserName</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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

                {(selectedRole === 'student' || selectedRole === 'organizer') && (
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                      <Select value={formData.college} onValueChange={handleCollegeChange}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={collegeStatus === 'loading' ? "Loading colleges..." : "Select your college"} />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges.map((college) => (
                            <SelectItem key={college._id} value={college._id}>
                              {college.name} ({college.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full bg-gradient-to-r ${currentColors.button} hover:opacity-90`}
                  disabled={isLoading || collegeStatus === 'loading'}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Create Account as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className={`${currentColors.text} hover:underline`}>
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
