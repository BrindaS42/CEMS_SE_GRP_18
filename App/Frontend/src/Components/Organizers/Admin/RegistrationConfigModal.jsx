import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PaymentConfigStep } from './Registration/PaymentConfigStep';
import { RegistrationTypeStep } from './Registration/RegistrationTypeStep';
import { RegistrationFieldsStep } from './Registration/RegistrationFieldsStep';
import { updateEventConfig } from '@/Store/event.slice';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Payment', description: 'Configure fees & combos' },
  { id: 2, title: 'Registration Type', description: 'Individual or Team' },
  { id: 3, title: 'Form Builder', description: 'Customize registration form' },
];

export function RegistrationConfigModal({ isOpen, onClose, event }) {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  
  // Form state
  const [config, setConfig] = useState({
    isFree: true,
    combos: [],
    registrationType: 'Individual',
    teamSizeRange: { min: 2, max: 5 },
    registrationFields: [],
  });

  useEffect(() => {
    if (isOpen && event?.config) {
      setConfig({
        isFree: event.config.isFree ?? true,
        combos: event.config.combos || [],
        qrCodeUrl: event.config.qrCodeUrl || '',
        registrationType: event.config.registrationType || 'Individual',
        teamSizeRange: event.config.teamSizeRange || { min: 2, max: 5 },
        registrationFields: event.config.registrationFields || [],
      });
    }
  }, [isOpen, event]);


  const handleNext = () => {
    if (currentStep < 3) {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    // Validate form
    if (!config.isFree && config.combos.length === 0) {
      toast.error('Please add at least one payment combo for a paid event.');
      setCurrentStep(1);
      return;
    }

    if (config.registrationFields.length === 0) {
      toast.error('Please add at least one field to the registration form.');
      setCurrentStep(3);
      return;
    }

    dispatch(updateEventConfig({ eventId: event._id, config }));
    toast.success('Registration configuration saved successfully!');
    onClose();
  };

  const updateConfig = (updates) => {
    setConfig({ ...config, ...updates });
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Registration - {event.title}</DialogTitle>
          <DialogDescription>
            Set up payment, registration type, and form fields for your event
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-6 border-b">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                {/* Step Circle */}
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    currentStep > step.id
                      ? 'bg-success text-white'
                      : currentStep === step.id
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  initial={false}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </motion.div>

                {/* Step Info */}
                <div className="hidden md:block">
                  <div className={`transition-colors duration-300 ${
                    currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-border">
                  <motion.div
                    className="h-full bg-success"
                    initial={{ width: '0%' }}
                    animate={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto smooth-scroll px-6 py-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            >
              {currentStep === 1 && (
                <PaymentConfigStep config={config} updateConfig={updateConfig} />
              )}
              {currentStep === 2 && (
                <RegistrationTypeStep config={config} updateConfig={updateConfig} />
              )}
              {currentStep === 3 && (
                <RegistrationFieldsStep config={config} updateConfig={updateConfig} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>

          <Button onClick={handleNext} className="gap-2">
            {currentStep === 3 ? (
              <>
                <Check className="w-4 h-4" />
                Save Configuration
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

RegistrationConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};