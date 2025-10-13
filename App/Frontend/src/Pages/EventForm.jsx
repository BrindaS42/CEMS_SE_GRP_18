// EventForm.jsx

import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { MapLocationPicker } from "../components/MapLocationPicker";
import { CustomFormFieldsBuilder } from "../components/CustomFormFieldsBuilder";
import { CustomFieldsPreview } from "../components/CustomFieldsPreview";
import { useAutoSave } from "../hooks/useAutoSave";
import { toast } from "sonner";
import { 
  Upload, 
  Plus, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Image as ImageIcon,
  CreditCard,
  Users,
  UserCheck,
  Clock,
  Save,
  RotateCcw,
  AlertCircle
} from "lucide-react";

const categoryOptions = [
  "Technical", "Cultural", "Sports", "Workshop", "Competition", 
  "Seminar", "Exhibition", "Performance", "Conference", "Social"
];

const comboOptions = [
  {
    id: "silver",
    name: "Silver",
    price: "₹299",
    features: ["Basic Registration", "Event Kit", "Certificate"]
  },
  {
    id: "gold", 
    name: "Gold",
    price: "₹499",
    features: ["Premium Registration", "Event Kit", "Certificate", "Lunch", "Networking Session"]
  },
  {
    id: "platinum",
    name: "Platinum", 
    price: "₹799",
    features: ["VIP Registration", "Premium Event Kit", "Certificate", "All Meals", "Networking Session", "Exclusive Workshop"]
  }
];

export default function EventForm() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [posterPreview, setPosterPreview] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  
  const posterInputRef = useRef(null);
  const ruleBookInputRef = useRef(null);
  const qrCodeInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      subEvents: [{ name: "", date: "", time: "" }],
      registrationType: "single",
      comboOption: "silver",
      category: [],
      customFields: []
    }
  });

  // Auto-save functionality
  const {
    saveData,
    restoreData,
    clearSavedData,
    getSaveTimestamp,
    hasSavedData
  } = useAutoSave({
    watch,
    reset,
    key: 'event_form',
    delay: 3000, // Auto-save every 3 seconds
    onSave: (data) => {
      setAutoSaveStatus('saved');
      setLastSaveTime(Date.now());
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onRestore: (data) => {
      setSelectedCategories(data.category || []);
      toast.success('Form data restored from auto-save');
    }
  });

  const { fields: subEventFields, append: appendSubEvent, remove: removeSubEvent } = useFieldArray({
    control,
    name: "subEvents"
  });

  const watchRegistrationType = watch("registrationType");
  const watchCustomFields = watch("customFields");

  // Check for saved data on component mount
  useEffect(() => {
    if (hasSavedData()) {
      setShowRestoreDialog(true);
    }
  }, [hasSavedData]);

  // Auto-save status effect
  useEffect(() => {
    if (autoSaveStatus === 'saving') {
      const timer = setTimeout(() => setAutoSaveStatus('idle'), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  const handleFileUpload = (
    event,
    type
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (type === "gallery") {
      const newPreviews = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result);
          if (newPreviews.length === files.length) {
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (type === "poster") setPosterPreview(result);
        if (type === "qrCode") setQrCodePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(updatedCategories);
    setValue("category", updatedCategories);
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location) => {
    setValue("venue", location.address);
    setValue("venueCoordinates", location.coordinates);
  };

  const handleRestoreData = () => {
    const result = restoreData();
    if (result.restored) {
      setShowRestoreDialog(false);
      setLastSaveTime(result.saveTime);
    }
  };

  const handleDiscardSaved = () => {
    clearSavedData();
    setShowRestoreDialog(false);
  };

  const handleManualSave = () => {
    setAutoSaveStatus('saving');
    saveData();
  };

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Handle form submission - save draft or publish
    setShowPublishDialog(false);
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => {
      console.log("Saving draft:", data);
      // Save as draft logic
    })();
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-white to-slate-50">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-college-yellow opacity-40"></div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-college-blue">Create Event</h1>
            <p className="text-muted-foreground mt-1">Design and configure your event registration</p>
          </div>
          
          {/* Auto-save Status */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm transition-opacity ${
              autoSaveStatus === 'idle' ? 'opacity-50' : 'opacity-100'
            }`}>
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="w-3 h-3 border-2 border-college-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-college-blue">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <Save className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">Saved</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Save failed</span>
                </>
              )}
              {autoSaveStatus === 'idle' && lastSaveTime && (
                <>
                  <Save className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Last saved {new Date(lastSaveTime).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              className="flex items-center gap-2"
            >
              <Save className="w-3 h-3" />
              Save Now
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Details Section */}
        <Card className="border-college-blue/20">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-college-blue opacity-30"></div>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <FileText className="w-5 h-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Poster Upload */}
            <div className="space-y-2">
              <Label>Event Poster</Label>
              <div className="border-2 border-dashed border-college-blue/20 rounded-lg p-6 text-center hover:border-college-blue/40 transition-colors">
                {posterPreview ? (
                  <div className="relative inline-block">
                    <img src={posterPreview} alt="Poster preview" className="max-w-xs max-h-48 rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                      onClick={() => setPosterPreview(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-college-blue/60" />
                    <p className="text-sm text-muted-foreground">Click to upload event poster</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "poster")}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => posterInputRef.current?.click()}
                >
                  {posterPreview ? "Change Poster" : "Upload Poster"}
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Event title is required" })}
                placeholder="Enter event title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Point of Contact */}
            <div className="space-y-4">
              <Label className="text-base">Point of Contact *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pocName" className="text-sm">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="pocName"
                      {...register("pocName", { required: "POC name is required" })}
                      placeholder="Full name"
                      className={`pl-10 ${errors.pocName ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.pocName && (
                    <p className="text-sm text-destructive">{errors.pocName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pocEmail" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="pocEmail"
                      type="email"
                      {...register("pocEmail", { 
                        required: "POC email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address"
                        }
                      })}
                      placeholder="email@domain.com"
                      className={`pl-10 ${errors.pocEmail ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.pocEmail && (
                    <p className="text-sm text-destructive">{errors.pocEmail.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pocPhone" className="text-sm">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="pocPhone"
                      {...register("pocPhone", { required: "POC phone is required" })}
                      placeholder="+91 9876543210"
                      className={`pl-10 ${errors.pocPhone ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.pocPhone && (
                    <p className="text-sm text-destructive">{errors.pocPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Event Description *</Label>
              <Textarea
                id="description"
                {...register("description", { required: "Event description is required" })}
                placeholder="Describe your event, its objectives, and what participants can expect..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <Label className="text-base">Event Timeline *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-sm">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="eventDate"
                      type="date"
                      {...register("eventDate", { required: "Event date is required" })}
                      className={`pl-10 ${errors.eventDate ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.eventDate && (
                    <p className="text-sm text-destructive">{errors.eventDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime" className="text-sm">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="eventTime"
                      type="time"
                      {...register("eventTime", { required: "Event time is required" })}
                      className={`pl-10 ${errors.eventTime ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.eventTime && (
                    <p className="text-sm text-destructive">{errors.eventTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rule Book Upload */}
            <div className="space-y-2">
              <Label>Rule Book (Optional)</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={ruleBookInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => ruleBookInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Rule Book
                </Button>
                <span className="text-xs text-muted-foreground">PDF, DOC up to 10MB</span>
              </div>
            </div>

            {/* Category Tags */}
            <div className="space-y-3">
              <Label>Category Tags</Label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedCategories.includes(category)
                        ? "bg-college-blue text-white hover:bg-college-blue/90"
                        : "hover:bg-college-blue/10"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sub-events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Sub-events</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSubEvent({ name: "", date: "", time: "" })}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Sub-event
                </Button>
              </div>
              {subEventFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-college-yellow/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        {...register(`subEvents.${index}.name`)}
                        placeholder="Sub-event name"
                      />
                      <Input
                        type="date"
                        {...register(`subEvents.${index}.date`)}
                      />
                      <Input
                        type="time"
                        {...register(`subEvents.${index}.time`)}
                      />
                    </div>
                    {subEventFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSubEvent(index)}
                        className="p-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Event Gallery */}
            <div className="space-y-2">
              <Label>Event Gallery</Label>
              <div className="border-2 border-dashed border-college-blue/20 rounded-lg p-4">
                <div className="flex flex-wrap gap-3 mb-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 rounded-full"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "gallery")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Images
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Details Section */}
        <Card className="border-college-yellow/20">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-college-yellow opacity-30"></div>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <UserCheck className="w-5 h-5" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Form Fields Placeholder */}
            <div className="bg-muted/50 border border-college-blue/10 rounded-lg p-4">
              <Label className="text-base">Registration Form Fields</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Custom form fields configuration will be implemented in the next phase. 
                Default fields: Name, Email, Phone, College/Organization will be included automatically.
              </p>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <Label className="text-base">Payment Options</Label>
              
              {/* QR Code Upload */}
              <div className="space-y-2">
                <Label className="text-sm">Payment QR Code</Label>
                <div className="border-2 border-dashed border-college-blue/20 rounded-lg p-4 text-center">
                  {qrCodePreview ? (
                    <div className="relative inline-block">
                      <img src={qrCodePreview} alt="QR Code preview" className="max-w-32 max-h-32 rounded-lg" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        onClick={() => setQrCodePreview(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <CreditCard className="w-6 h-6 mx-auto text-college-blue/60" />
                      <p className="text-sm text-muted-foreground">Upload payment QR code</p>
                    </div>
                  )}
                  <input
                    ref={qrCodeInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "qrCode")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => qrCodeInputRef.current?.click()}
                  >
                    {qrCodePreview ? "Change QR Code" : "Upload QR Code"}
                  </Button>
                </div>
              </div>

              {/* Combo Options */}
              <div className="space-y-3">
                <Label className="text-sm">Registration Packages</Label>
                <RadioGroup
                  value={watch("comboOption")}
                  onValueChange={(value) => setValue("comboOption", value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {comboOptions.map((option) => (
                    <Card key={option.id} className={`cursor-pointer transition-all ${
                      watch("comboOption") === option.id ? "ring-2 ring-college-blue border-college-blue" : ""
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer font-medium">
                            {option.name}
                          </Label>
                          <span className="ml-auto font-semibold text-college-blue">{option.price}</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-college-blue rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Registration Types */}
            <div className="space-y-3">
              <Label className="text-base">Registration Types</Label>
              <RadioGroup
                value={watchRegistrationType}
                onValueChange={(value) => setValue("registrationType", value)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Card className={`cursor-pointer transition-all ${watchRegistrationType === "single" ? "ring-2 ring-college-blue" : ""}`}>
                  <CardContent className="p-4 text-center">
                    <RadioGroupItem value="single" id="single" className="mb-2" />
                    <Label htmlFor="single" className="cursor-pointer">
                      <User className="w-6 h-6 mx-auto mb-2 text-college-blue" />
                      <div className="font-medium">Single</div>
                      <div className="text-xs text-muted-foreground">Individual participation</div>
                    </Label>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${watchRegistrationType === "duo" ? "ring-2 ring-college-blue" : ""}`}>
                  <CardContent className="p-4 text-center">
                    <RadioGroupItem value="duo" id="duo" className="mb-2" />
                    <Label htmlFor="duo" className="cursor-pointer">
                      <Users className="w-6 h-6 mx-auto mb-2 text-college-blue" />
                      <div className="font-medium">Duo</div>
                      <div className="text-xs text-muted-foreground">Team of 2 members</div>
                    </Label>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${watchRegistrationType === "team" ? "ring-2 ring-college-blue" : ""}`}>
                  <CardContent className="p-4 text-center">
                    <RadioGroupItem value="team" id="team" className="mb-2" />
                    <Label htmlFor="team" className="cursor-pointer">
                      <Users className="w-6 h-6 mx-auto mb-2 text-college-blue" />
                      <div className="font-medium">Team</div>
                      <div className="text-xs text-muted-foreground">Multiple members</div>
                    </Label>
                  </CardContent>
                </Card>
              </RadioGroup>
              
              {watchRegistrationType === "team" && (
                <div className="mt-3">
                  <Label htmlFor="teamMemberCount" className="text-sm">Maximum Team Members</Label>
                  <Input
                    id="teamMemberCount"
                    type="number"
                    min="3"
                    max="20"
                    {...register("teamMemberCount")}
                    placeholder="e.g., 5"
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Address/Venue */}
            <div className="space-y-3">
              <Label className="text-base">Event Venue</Label>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                initialAddress={watch("venue")}
                initialCoordinates={watch("venueCoordinates")}
              />
              <input
                type="hidden"
                {...register("venue", { required: "Venue address is required" })}
              />
              {errors.venue && (
                <p className="text-sm text-destructive">{errors.venue.message}</p>
              )}
            </div>

            {/* Additional Registration Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  {...register("registrationDeadline", { required: "Registration deadline is required" })}
                  className={errors.registrationDeadline ? "border-destructive" : ""}
                />
                {errors.registrationDeadline && (
                  <p className="text-sm text-destructive">{errors.registrationDeadline.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  {...register("maxParticipants", { required: "Maximum participants is required" })}
                  placeholder="e.g., 100"
                  className={errors.maxParticipants ? "border-destructive" : ""}
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields Preview */}
        {watchCustomFields && watchCustomFields.length > 0 && (
          <CustomFieldsPreview fields={watchCustomFields} />
        )}

        {/* Custom Registration Fields */}
        <Card className="border-college-blue/20">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-college-blue opacity-30"></div>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <FileText className="w-5 h-5" />
              Custom Registration Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomFormFieldsBuilder
              control={control}
              name="customFields"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="bg-college-blue hover:bg-college-blue/90 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Publish Event
          </Button>
        </div>
      </form>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to publish this event? Once published, the event will be visible to users and they can start registering.
            </p>
            <div className="mt-4 p-4 bg-college-yellow/10 rounded-lg border border-college-yellow/20">
              <p className="text-sm">
                <span className="font-medium text-college-blue">Note:</span> You can still edit event details after publishing, but changes to pricing and registration types may affect existing registrations.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-college-blue hover:bg-college-blue/90"
            >
              {isSubmitting ? "Publishing..." : "Publish Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-save Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-college-blue" />
              Restore Previous Work
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We found unsaved changes from your previous session. Would you like to restore them?
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Last saved:</strong> {getSaveTimestamp() ? new Date(getSaveTimestamp()).toLocaleString() : 'Unknown'}
              </p>
              <p className="text-xs">
                Note: Restoring will replace any current form data with your previously saved work.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDiscardSaved}
            >
              Start Fresh
            </Button>
            <Button
              onClick={handleRestoreData}
              className="bg-college-blue hover:bg-college-blue/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}