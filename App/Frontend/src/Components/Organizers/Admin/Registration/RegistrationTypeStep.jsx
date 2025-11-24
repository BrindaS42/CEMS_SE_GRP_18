import PropTypes from 'prop-types';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { User, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function RegistrationTypeStep({ config, updateConfig }) {
  const handleTypeChange = (type) => {
    updateConfig({ registrationType: type });
  };

  const handleMinChange = (value) => {
    if (value > config.teamSizeRange.max) {
      toast.error('Minimum members cannot be greater than maximum');
      return;
    }
    updateConfig({
      teamSizeRange: { ...config.teamSizeRange, min: value },
    });
  };

  const handleMaxChange = (value) => {
    if (value < config.teamSizeRange.min) {
      toast.error('Maximum members cannot be less than minimum');
      return;
    }
    updateConfig({
      teamSizeRange: { ...config.teamSizeRange, max: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Registration Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration Type</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose how participants can register for this event
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={config.registrationType}
            onValueChange={(value) => handleTypeChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select registration type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Individual Registration</span>
                </div>
              </SelectItem>
              <SelectItem value="team">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Team Registration</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Visual Cards */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeChange('individual')}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                config.registrationType === 'individual'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    config.registrationType === 'individual'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Each person registers separately
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeChange('team')}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                config.registrationType === 'team'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    config.registrationType === 'team'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Groups register together
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Team Size Configuration */}
      {config.registrationType === 'team' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Size Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define the minimum and maximum team members allowed
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Members</Label>
                  <Input
                    type="number"
                    value={config.teamSizeRange.min}
                    onChange={(e) => handleMinChange(Number(e.target.value))}
                    min="1"
                    max={config.teamSizeRange.max}
                    placeholder="e.g., 2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum team size required
                  </p>
                </div>

                <div>
                  <Label>Maximum Members</Label>
                  <Input
                    type="number"
                    value={config.teamSizeRange.max}
                    onChange={(e) => handleMaxChange(Number(e.target.value))}
                    min={config.teamSizeRange.min}
                    placeholder="e.g., 5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum team size allowed
                  </p>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="bg-muted rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Team Size Range:</span>
                  <span className="text-primary font-medium">
                    {config.teamSizeRange.min} - {config.teamSizeRange.max} members
                  </span>
                </div>
              </div>

              {/* Validation Messages */}
              {config.teamSizeRange.min === config.teamSizeRange.max && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-warning/10 border border-warning/20 rounded-lg p-3"
                >
                  <p className="text-sm text-warning-foreground">
                    ℹ️ Teams must have exactly {config.teamSizeRange.min} members
                  </p>
                </motion.div>
              )}

              {config.teamSizeRange.min > 10 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-warning/10 border border-warning/20 rounded-lg p-3"
                >
                  <p className="text-sm text-warning-foreground">
                    ⚠️ Large minimum team size may limit participation
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Individual Registration Info */}
      {config.registrationType === 'individual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Individual Registration Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Participants will register individually. Each person will fill out a separate
                    registration form. This is ideal for workshops, seminars, and general attendance
                    events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

RegistrationTypeStep.propTypes = {
  config: PropTypes.shape({
    registrationType: PropTypes.oneOf(['individual', 'team']).isRequired,
    teamSizeRange: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  updateConfig: PropTypes.func.isRequired,
};