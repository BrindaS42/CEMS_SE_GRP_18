import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Building2, Mail, Phone, User, MapPin, Globe, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
import { Label } from '../../Components/ui/label';
import { Textarea } from '../../Components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../Components/ui/card';
import { Alert, AlertDescription } from '../../Components/ui/alert';
import { registerCollege, resetCollegeStatus } from '../../Store/college.slice';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const CollegeRegistrationPage = () => {
  const dispatch = useDispatch();
  const { status: isLoading, error } = useSelector((state) => state.college);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // College Info
    name: '',
    code: '',
    website: '',
    description: '',
    // POC Info
    pocName: '',
    contactEmail: '',
    contactNumber: '',
    // Address
    localAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  });

  useEffect(() => {
    // Reset status when component unmounts
    return () => {
      dispatch(resetCollegeStatus());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const collegeData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        website: formData.website,
        description: formData.description,
        poc: {
          name: formData.pocName, // Corrected to match model
          contactEmail: formData.contactEmail,
          contactNumber: formData.contactNumber,
        },
        address: {
          localAddress: formData.localAddress,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        },
      };

      await dispatch(registerCollege(collegeData)).unwrap();
      setSubmitted(true);
      toast.success('College registration submitted successfully!');
    } catch (err) {
      toast.error(err || 'Failed to register college');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl border-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                    <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-center text-3xl dark:text-white">Registration Submitted!</CardTitle>
                <CardDescription className="text-center text-lg dark:text-gray-300">
                  Thank you for registering your college
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                  <AlertDescription className="dark:text-emerald-100">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Your college registration has been submitted for approval</li>
                      <li>Our admin team will review your submission within 2-3 business days</li>
                      <li>You will receive an email at <strong>{formData.contactEmail}</strong> once approved</li>
                      <li>After approval, students and organizers from your college can register on CEMS</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>

              <CardFooter className="flex justify-center">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 dark:from-emerald-500 dark:to-teal-500 text-white">
                    Back to Home
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4 font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Register Your College
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Join the CEMS network and empower your college community
            </p>
          </div>

          <Card className="shadow-2xl border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">College Registration Form</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Fill in the details below. Your college will be reviewed and approved by our admin team.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* College Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    College Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name" className="dark:text-gray-300">College Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., National Institute of Technology, Surat"
                        value={formData.name}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code" className="dark:text-gray-300">College Code *</Label>
                      <Input
                        id="code"
                        name="code"
                        placeholder="e.g., NIT-SRT"
                        value={formData.code}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="dark:text-gray-300">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://www.college.edu"
                          value={formData.website}
                          onChange={handleChange}
                          className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of your college..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="dark:bg-gray-900 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Point of Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Point of Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pocName" className="dark:text-gray-300">POC Name *</Label>
                      <Input
                        id="pocName"
                        name="pocName"
                        placeholder="Full name"
                        value={formData.pocName}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="dark:text-gray-300">Contact Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="poc@college.edu"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="dark:text-gray-300">Contact Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    College Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="localAddress" className="dark:text-gray-300">Street Address *</Label>
                      <Input
                        id="localAddress"
                        name="localAddress"
                        placeholder="Street address"
                        value={formData.localAddress}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="dark:text-gray-300">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="dark:text-gray-300">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="dark:text-gray-300">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="dark:text-gray-300">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="123456"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="dark:bg-gray-900 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-lg py-6 text-white dark:from-emerald-500 dark:to-teal-500"
                  disabled={isLoading === 'loading'}
                >
                  {isLoading === 'loading' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};