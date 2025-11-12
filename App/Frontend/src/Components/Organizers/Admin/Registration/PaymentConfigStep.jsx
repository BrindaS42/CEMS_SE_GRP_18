import PropTypes from 'prop-types';
import { useState } from 'react';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const PRESET_COMBOS = [
  { title: 'Bronze', color: '#CD7F32', description: 'Basic access package' },
  { title: 'Silver', color: '#C0C0C0', description: 'Standard access package' },
  { title: 'Gold', color: '#FFD700', description: 'Premium access package' },
];

const CUSTOM_COLORS = [
  '#2D3E7E', // Navy Blue
  '#FDB913', // Golden Yellow
  '#FF9F1C', // Orange
  '#F24333', // Red
  '#6B8CAE', // Slate Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
];

export function PaymentConfigStep({ config, updateConfig }) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customCombo, setCustomCombo] = useState({
    title: '',
    description: '',
    fees: 0,
    color: CUSTOM_COLORS[0],
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);

  const handleToggleFree = (checked) => {
    updateConfig({ isFree: checked, combos: checked ? [] : config.combos });
  };

  const handleAddPresetCombo = (preset) => {
    const newCombo = {
      id: `combo-${Date.now()}`,
      title: preset.title,
      description: preset.description,
      fees: 0,
      color: preset.color,
    };
    updateConfig({ combos: [...config.combos, newCombo] });
  };

  const handleAddCustomCombo = () => {
    if (!customCombo.title || !customCombo.description || !customCombo.fees) {
      toast.error('Please fill all fields for the custom combo');
      return;
    }

    const newCombo = {
      id: `combo-${Date.now()}`,
      title: customCombo.title,
      description: customCombo.description,
      fees: customCombo.fees,
      color: customCombo.color || CUSTOM_COLORS[0],
    };

    updateConfig({ combos: [...config.combos, newCombo] });
    setIsAddingCustom(false);
    setCustomCombo({ title: '', description: '', fees: 0, color: CUSTOM_COLORS[0] });
  };

  const handleRemoveCombo = (id) => {
    updateConfig({ combos: config.combos.filter((c) => c.id !== id) });
  };

  const handleUpdateCombo = (id, field, value) => {
    updateConfig({
      combos: config.combos.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    });
  };

  const handleQrCodeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      // In real implementation, upload to server and get URL
      const mockUrl = URL.createObjectURL(file);
      updateConfig({ qrCodeUrl: mockUrl });
      toast.success('QR Code uploaded successfully');
    }
  };

  const handleRemoveQrCode = () => {
    setQrCodeFile(null);
    updateConfig({ qrCodeUrl: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Free/Paid Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Event Type</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {config.isFree ? 'This event is free to attend' : 'This is a paid event'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!config.isFree ? 'text-muted-foreground' : ''}`}>
                Free
              </span>
              <Switch checked={!config.isFree} onCheckedChange={(c) => handleToggleFree(!c)} />
              <span className={`text-sm ${config.isFree ? 'text-muted-foreground' : ''}`}>
                Paid
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paid Event Configuration */}
      {!config.isFree && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="space-y-6"
        >
          {/* Combo Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Combo Plans</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create different pricing tiers for your event
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Combos */}
              <div>
                <span className="mb-3 block text-sm font-medium">Quick Add Presets</span>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_COMBOS.map((preset) => (
                    <Button
                      key={preset.title}
                      variant="outline"
                      onClick={() => handleAddPresetCombo(preset)}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      disabled={config.combos.some((c) => c.title === preset.title)}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span>{preset.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Added Combos */}
              <AnimatePresence>
                {config.combos.map((combo) => (
                  <motion.div
                    key={combo.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Card className="border-2" style={{ borderColor: combo.color + '40' }}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full flex-shrink-0"
                              style={{ backgroundColor: combo.color }}
                            />
                            <Input
                              value={combo.title}
                              onChange={(e) =>
                                handleUpdateCombo(combo.id, 'title', e.target.value)
                              }
                              placeholder="Combo Title"
                              className="font-medium"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCombo(combo.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>

                        <Textarea
                          value={combo.description}
                          onChange={(e) =>
                            handleUpdateCombo(combo.id, 'description', e.target.value)
                          }
                          placeholder="Description"
                          rows={2}
                        />

                        <div>
                          <Label>Fees (₹)</Label>
                          <Input
                            type="number"
                            value={combo.fees}
                            onChange={(e) =>
                              handleUpdateCombo(combo.id, 'fees', Number(e.target.value))
                            }
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Custom Combo Form */}
              {isAddingCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-medium">Create Custom Combo</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingCustom(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <Label>Title</Label>
                        <Input
                          value={customCombo.title}
                          onChange={(e) =>
                            setCustomCombo({ ...customCombo, title: e.target.value })
                          }
                          placeholder="e.g., Platinum"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={customCombo.description}
                          onChange={(e) =>
                            setCustomCombo({ ...customCombo, description: e.target.value })
                          }
                          placeholder="Describe this combo package"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Fees (₹)</Label>
                        <Input
                          type="number"
                          value={customCombo.fees}
                          onChange={(e) =>
                            setCustomCombo({ ...customCombo, fees: Number(e.target.value) })
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <span className="text-sm font-medium">Color</span>
                        <div className="grid grid-cols-10 gap-2 mt-2">
                          {CUSTOM_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                                customCombo.color === color ? 'ring-2 ring-primary ring-offset-2' : ''
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setCustomCombo({ ...customCombo, color })}
                            />
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleAddCustomCombo} className="w-full">
                        Add Custom Combo
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Add Custom Button */}
              {!isAddingCustom && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Combo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* QR Code Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment QR Code</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload QR code for UPI/payment gateway
              </p>
            </CardHeader>
            <CardContent>
              {config.qrCodeUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="relative"
                >
                  <img
                    src={config.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain mx-auto border-2 rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveQrCode}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload QR code image
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

const comboOptionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  fees: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
});

PaymentConfigStep.propTypes = {
  config: PropTypes.shape({
    isFree: PropTypes.bool.isRequired,
    combos: PropTypes.arrayOf(comboOptionShape).isRequired,
    qrCodeUrl: PropTypes.string,
  }).isRequired,
  updateConfig: PropTypes.func.isRequired,
};