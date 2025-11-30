import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, Lock, Info, Check, X, Eye, EyeOff} from 'lucide-react';
import { Button } from '../../Components/ui/button.jsx';
import { Input } from '../../Components/ui/input.jsx';
import { Label } from '../../Components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../Components/ui/card.jsx';
import { Alert, AlertDescription } from '../../Components/ui/alert.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs.jsx';
import { requestForgotPassword, verifyForgotPassword } from '../../Store/auth.slice.js';
import { SegmentedControl } from '../../Components/ui/segmented-control';

import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotPasswordStatus, error } = useSelector((state) => state.auth);
  const isLoading = forgotPasswordStatus === 'loading';
  
  const [selectedRole, setSelectedRole] = useState('student');
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password Visibility State
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  // Dynamic Password Check
  useEffect(() => {
    const pwd = formData.newPassword;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    });
  }, [formData.newPassword]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await dispatch(requestForgotPassword({
        email: formData.email,
        role: selectedRole
      })).unwrap();
      setStep('verify');
      toast.success('OTP sent to your email');
    } catch (err) {
      // If OTP was already sent, proceed to verification step instead of showing error
      if (err && typeof err === 'string' && err.toLowerCase().includes('already been sent')) {
        setStep('verify');
        toast.info(err); 
      } else {
        toast.error(err || 'Failed to send OTP');
      }
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check all criteria are met
    if (!Object.values(passwordCriteria).every(Boolean)) {
      toast.error('Please ensure password meets all security criteria');
      return;
    }

    try {
      await dispatch(verifyForgotPassword({
        email: formData.email,
        role: selectedRole,
        otp: formData.otp,
        newPassword: formData.newPassword
      })).unwrap();
      
      toast.success('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Failed to reset password');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper component for password rules
  const PasswordRule = ({ satisfied, label }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${satisfied ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
      {satisfied ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 transition-colors duration-300 flex items-center justify-center">
      {/* Hide native password reveal button for Edge/IE */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>
      
      <div className={`w-full px-4 ${step === 'verify' ? 'max-w-6xl' : 'max-w-md'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4 font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'email' 
                ? 'Enter your email to receive a reset code' 
                : 'Enter the OTP and your new password'
              }
            </p>
          </div>

          {step === 'email' ? (
            // --- STEP 1: EMAIL FORM ---
            <Card className="shadow-2xl border-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Reset Password</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Choose your role and enter your email address
                </CardDescription>
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
                  <Alert variant="destructive" className="mb-4 dark:bg-gray-900 dark:border-gray-600">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 dark:from-indigo-500 dark:to-purple-500 text-white border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </div>
                    ) : (
                      'Send Reset Code'
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-2">
                <div className="text-center text-sm">
                  <Link to="/login" className="text-indigo-600 hover:underline flex items-center justify-center dark:text-indigo-400">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ) : (
            // --- STEP 2: VERIFY FORM (Split Layout) ---
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* LEFT SIDE: Info Panel with Password Criteria */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden md:flex flex-col gap-6"
              >
                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-800 shadow-lg">
                  <div className="flex items-center gap-3 mb-3 font-bold text-xl text-indigo-800 dark:text-indigo-200">
                    <Info className="w-6 h-6" />
                    Security First
                  </div>
                  <p className="text-lg leading-relaxed text-indigo-900 dark:text-indigo-100 opacity-90">
                    Please create a strong password to keep your account secure. Use the criteria below as a guide.
                  </p>
                </div>

                <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-800 shadow-lg">
                  <h3 className="font-semibold text-lg mb-4 text-indigo-900 dark:text-indigo-100">Password Requirements</h3>
                  <div className="space-y-3">
                    <PasswordRule satisfied={passwordCriteria.length} label="At least 8 characters" />
                    <PasswordRule satisfied={passwordCriteria.upper} label="One uppercase letter (A-Z)" />
                    <PasswordRule satisfied={passwordCriteria.lower} label="One lowercase letter (a-z)" />
                    <PasswordRule satisfied={passwordCriteria.number} label="One number (0-9)" />
                  </div>
                </div>
              </motion.div>

              {/* RIGHT SIDE: Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-2xl border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Verify & Reset</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Enter the 6-digit code sent to your email
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="dark:text-gray-300">Verification Code</Label>
                        <Input
                          id="otp"
                          name="otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={formData.otp}
                          onChange={handleChange}
                          maxLength={6}
                          pattern="[0-9]{6}"
                          className="dark:bg-gray-900 dark:border-gray-600"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword"className="dark:text-gray-300">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-600"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10 focus:outline-none"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {/* Mobile only helper */}
                        <p className="text-xs text-muted-foreground md:hidden mt-1">
                           8+ chars, upper, lower, number.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword"className="dark:text-gray-300">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-600"
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
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 dark:from-indigo-500 dark:to-purple-500 text-white border-0"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Resetting Password...
                          </div>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                   <CardFooter className="flex flex-col space-y-2">
                    <div className="text-center text-sm">
                      <button 
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline"
                      >
                        Change Email?
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;