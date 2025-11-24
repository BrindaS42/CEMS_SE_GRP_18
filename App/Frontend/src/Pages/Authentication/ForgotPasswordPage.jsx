import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../../Components/ui/button.jsx';
import { Input } from '../../Components/ui/input.jsx';
import { Label } from '../../Components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../Components/ui/card.jsx';
import { Alert, AlertDescription } from '../../Components/ui/alert.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs.jsx';
import { requestForgotPassword, verifyForgotPassword } from '../../Store/auth.slice.js';
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
      toast.error(err || 'Failed to send OTP');
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

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
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

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4 font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {step === 'email' 
                ? 'Enter your email to receive a reset code' 
                : 'Enter the OTP and your new password'
              }
            </p>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>{step === 'email' ? 'Reset Password' : 'Verify & Reset'}</CardTitle>
              <CardDescription>
                {step === 'email' 
                  ? 'Choose your role and enter your email address'
                  : 'Enter the 6-digit code sent to your email'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 'email' && (
                <>
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

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
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
                </>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
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
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
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
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-center text-sm">
                <Link to="/login" className="text-indigo-600 hover:underline flex items-center justify-center">
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

export default ForgotPasswordPage;
