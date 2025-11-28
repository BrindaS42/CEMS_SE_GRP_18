import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { SegmentedControl } from '../../components/ui/segmented-control'; // Use SegmentedControl
import { requestPasswordReset, verifyOtpAndResetPassword } from '../../store/auth.slice.js';
import { toast } from 'sonner';

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { passwordResetStatus, error, isAuthenticated } = useSelector((state) => state.auth);
  const isLoading = passwordResetStatus === 'loading';
  
  const [selectedRole, setSelectedRole] = useState('student');
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    // For non-authenticated users, require email and role
    if (!isAuthenticated) {
      if (!formData.email) {
        toast.error('Please enter your email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    try {
      const payload = isAuthenticated ? {} : { email: formData.email, role: selectedRole };
      await dispatch(requestPasswordReset(payload)).unwrap();
      setStep('verify');
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err || 'Failed to send OTP');
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const payload = {
        otp: formData.otp,
        newPassword: formData.newPassword,
      };
      
      if (!isAuthenticated) {
        payload.email = formData.email;
        payload.role = selectedRole;
      }
      
      await dispatch(verifyOtpAndResetPassword(payload)).unwrap();
      
      toast.success('Password changed successfully');
      navigate(isAuthenticated ? '/profile' : '/login');
    } catch (err) {
      toast.error(err || 'Failed to change password');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4 font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Change Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 'request' 
                ? (isAuthenticated ? 'Request an OTP to change your password' : 'Enter your details to change password')
                : 'Enter the OTP and your new password'
              }
            </p>
          </div>

          <Card className="shadow-2xl border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">{step === 'request' ? 'Request Password Change' : 'Verify & Change'}</CardTitle>
              <CardDescription className="dark:text-gray-400">
                {step === 'request' 
                  ? (isAuthenticated ? 'We will send an OTP to your registered email' : 'Choose your role and enter your email')
                  : 'Enter the 6-digit code sent to your email'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 dark:bg-gray-900 dark:border-gray-600">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 'request' && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  {!isAuthenticated && (
                    <>
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

                      <div className="space-y-2">
                        <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
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
                    </>
                  )}

                  {isAuthenticated && (
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        An OTP will be sent to your registered email address to verify your identity.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 dark:from-blue-500 dark:to-purple-500 text-white border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </div>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
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
                      className="dark:bg-gray-900 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword"className="dark:text-gray-300">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword"className="dark:text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 dark:from-blue-500 dark:to-purple-500 text-white border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm">
                <Link to="/login" className="text-blue-600 hover:underline flex items-center justify-center dark:text-blue-400">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;