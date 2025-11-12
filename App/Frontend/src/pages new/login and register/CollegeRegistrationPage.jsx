import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Phone, User, MapPin, Globe, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { collegeService } from '../services/collegeService';
import { toast } from 'sonner@2.0.3';
import { Link } from 'react-router-dom';

export const CollegeRegistrationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const collegeData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        website: formData.website,
        description: formData.description,
        poc: {
          pocName: formData.pocName,
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

      await collegeService.registerCollege(collegeData);
      setSubmitted(true);
      toast.success('College registration submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to register college');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl border-2">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-emerald-100 p-4">
                    <CheckCircle className="h-16 w-16 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-3xl">Registration Submitted!</CardTitle>
                <CardDescription className="text-center text-lg">
                  Thank you for registering your college
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Alert className="bg-emerald-50 border-emerald-200">
                  <AlertDescription>
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
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90">
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
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-4 font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Register Your College
            </h1>
            <p className="text-gray-600 text-lg">
              Join the CEMS network and empower your college community
            </p>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>College Registration Form</CardTitle>
              <CardDescription>
                Fill in the details below. Your college will be reviewed and approved by our admin team.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* College Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-emerald-600" />
                    College Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name">College Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., National Institute of Technology, Surat"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">College Code *</Label>
                      <Input
                        id="code"
                        name="code"
                        placeholder="e.g., NIT-SRT"
                        value={formData.code}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://www.college.edu"
                          value={formData.website}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of your college..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Point of Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="mr-2 h-5 w-5 text-emerald-600" />
                    Point of Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pocName">POC Name *</Label>
                      <Input
                        id="pocName"
                        name="pocName"
                        placeholder="Full name"
                        value={formData.pocName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="poc@college.edu"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
                    College Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="localAddress">Street Address *</Label>
                      <Input
                        id="localAddress"
                        name="localAddress"
                        placeholder="Street address"
                        value={formData.localAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="123456"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};