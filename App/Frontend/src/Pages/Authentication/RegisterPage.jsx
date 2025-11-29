import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Building2, KeyRound, Info, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { Button } from '../../Components/ui/button.jsx';
import { Input } from '../../Components/ui/input.jsx';
import { Label } from '../../Components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../Components/ui/card.jsx';
import { Alert, AlertDescription } from '../../Components/ui/alert.jsx';
import { SegmentedControl } from '../../Components/ui/segmented-control';
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

// Descriptions for roles
const roleDescriptions = {
  student: "Join a vibrant community! Register for events, create teams, track your participation, and build your extracurricular portfolio.",
  organizer: "Take charge! Host events, manage registrations, coordinate with teams, and publish real-time updates for your college.",
  sponsor: "Partner with us! Create advertisements, sponsor exciting events, and gain visibility among the student community.",
  admin: "Platform oversight. Manage users, approve colleges, and ensure the smooth operation of the CEMS ecosystem.",
};

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    adminCode: '',
  });

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
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
    dispatch(clearError?.() ?? (() => {}));
    if (selectedRole !== 'student' && selectedRole !== 'organizer') {
      setFormData((prev) => ({ ...prev, college: '' }));
    }
  }, [selectedRole, dispatch]);

  // Dynamic Password Check
  useEffect(() => {
    const pwd = formData.password;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCollegeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      college: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    if (selectedRole === 'admin' && !formData.adminCode) {
      toast.error('Please enter the admin code');
      return;
    }
    
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

    try {
      console.log('Submitting registration for:', {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        adminCode: formData.adminCode,
        role: selectedRole,
      }); // Debug log

      await dispatch(registerUser({
        username: formData.name, 
        email: formData.email,
        password: formData.password,
        college: formData.college,
        adminCode: formData.adminCode,
        role: selectedRole,
      })).unwrap();

      console.log('Registration successful'); // Debug log
      toast.success(`Account created successfully! Welcome as ${selectedRole}`);
      navigate('/');
    } catch (err) {
      const msg = formatError(err) || 'Registration failed';
      toast.error(msg);
    }
  };

  const roleColors = {
    student: {
      gradient: 'from-purple-500 via-pink-500 to-orange-400',
      bg: 'from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900',
      button: 'from-purple-600 to-pink-600',
      text: 'text-purple-600 dark:text-purple-400',
      panelText: 'text-purple-900 dark:text-purple-100',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    organizer: {
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      bg: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900',
      button: 'from-blue-600 to-indigo-600',
      text: 'text-blue-600 dark:text-blue-400',
      panelText: 'text-blue-900 dark:text-blue-100',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    sponsor: {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      bg: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900',
      button: 'from-emerald-600 to-teal-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      panelText: 'text-emerald-900 dark:text-emerald-100',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    admin: {
      gradient: 'from-slate-700 via-gray-800 to-zinc-900 dark:from-slate-100 dark:via-gray-200 dark:to-zinc-300',
      bg: 'from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-zinc-900 dark:to-black',
      button: 'from-slate-700 to-gray-800 dark:from-slate-600 dark:to-gray-700',
      text: 'text-slate-700 dark:text-slate-400',
      panelText: 'text-slate-900 dark:text-slate-100',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  };

  const currentColors = roleColors[selectedRole];

  // Component for a single password rule item
  const PasswordRule = ({ satisfied, label }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${satisfied ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
      {satisfied ? <Check className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className={`min-h-screen pt-20 pb-12 bg-gradient-to-br ${currentColors.bg} transition-colors duration-500 flex items-center justify-center`}>
      {/* Hide native password reveal button for Edge/IE */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

      <div className="max-w-6xl w-full mx-auto px-4">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className={`text-5xl mb-4 font-black bg-gradient-to-r ${currentColors.gradient} bg-clip-text text-transparent`}>
            Join CEMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create your account and start your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT SIDE: Information Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex flex-col gap-6 p-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-800 shadow-lg">
                    <div className={`flex items-center gap-3 mb-3 font-bold text-xl capitalize ${currentColors.panelText}`}>
                        <Info className="w-6 h-6" />
                        About {selectedRole} Role
                    </div>
                    <p className={`text-lg leading-relaxed ${currentColors.panelText} opacity-90`}>
                        {roleDescriptions[selectedRole]}
                    </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Password Acceptance Criteria */}
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-800 shadow-lg mt-4">
                <h3 className={`font-semibold text-lg mb-4 ${currentColors.panelText}`}>Password Requirements</h3>
                <div className="space-y-3">
                    <PasswordRule satisfied={passwordCriteria.length} label="At least 8 characters" />
                    <PasswordRule satisfied={passwordCriteria.upper} label="One uppercase letter (A-Z)" />
                    <PasswordRule satisfied={passwordCriteria.lower} label="One lowercase letter (a-z)" />
                    <PasswordRule satisfied={passwordCriteria.number} label="One number (0-9)" />
                </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-2xl border-2 dark:border-gray-800 dark:bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Choose your role and get started</CardDescription>
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
                    <AlertDescription>{formatError(error)}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">UserName</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 dark:bg-gray-900/50 dark:border-gray-700"
                        required
                      />
                    </div>
                  </div>

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

                  {(selectedRole === 'student' || selectedRole === 'organizer') && (
                    <div className="space-y-2">
                      <Label htmlFor="college">College</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
                        <Select value={formData.college} onValueChange={handleCollegeChange}>
                          <SelectTrigger className="pl-10 dark:bg-gray-900/50 dark:border-gray-700">
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

                  {selectedRole === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode">Admin Code</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="adminCode"
                          name="adminCode"
                          type="password"
                          placeholder="Enter admin code"
                          value={formData.adminCode}
                          onChange={handleChange}
                          className="pl-10 dark:bg-gray-900/50 dark:border-gray-700"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 dark:bg-gray-900/50 dark:border-gray-700"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {/* Mobile-only helper for password */}
                    <p className="text-xs text-muted-foreground md:hidden">
                        Must be 8+ chars, with upper, lower, and number.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 pr-10 dark:bg-gray-900/50 dark:border-gray-700"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full bg-gradient-to-r ${currentColors.button} hover:opacity-90 text-white border-0`}
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
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className={`${currentColors.text} hover:underline font-medium`}>
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;