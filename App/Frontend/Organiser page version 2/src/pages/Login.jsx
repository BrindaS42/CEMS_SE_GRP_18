// Login.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { authApi } from '../services/authApi';
import collegeLogoPng from '../assets/college-logo.png';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      dispatch(loginStart());
      
      // For demo purposes, simulate API call
      setTimeout(() => {
        const mockUser = {
          id: '1',
          name: 'John Anderson',
          email: data.email,
          avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGF2YXRhcnxlbnwxfHx8fDE3NTg4NjM2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
          role: 'admin'
        };
        
        dispatch(loginSuccess(mockUser));
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
      
      // Real API call would be:
      // const response = await authApi.login(data);
      // dispatch(loginSuccess(response.user));
      // navigate('/dashboard');
    } catch (error) {
      dispatch(loginFailure(error.message || 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-college-blue/10 to-college-yellow/10 p-4">
      {/* Triangular design elements */}
      <div className="absolute top-20 left-20 w-0 h-0 border-r-[60px] border-r-transparent border-b-[60px] border-b-college-yellow opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-0 h-0 border-l-[80px] border-l-transparent border-t-[80px] border-t-college-red opacity-20"></div>
      <div className="absolute top-1/3 right-1/4 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-college-blue opacity-15"></div>

      <Card className="w-full max-w-md border-college-blue/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={collegeLogoPng} alt="DAU Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl text-college-blue">Admin Login</CardTitle>
          <p className="text-muted-foreground">Welcome to Event Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-college-blue">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="admin@daiict.ac.in"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-college-blue">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-college-blue hover:bg-college-blue/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}