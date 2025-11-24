import PropTypes from 'prop-types';
import { useState } from 'react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Plus, Trash2, GripVertical, Type, Hash, Calendar, Clock, CheckSquare, ListOrdered, Eye } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { toast } from 'sonner';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'time', label: 'Time', icon: Clock },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
  { value: 'options', label: 'Multiple Choice', icon: ListOrdered },
];

export function RegistrationFieldsStep({ config, updateConfig }) {
  const [showPreview, setShowPreview] = useState(false);

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'text',
      title: '',
      description: '',
      required: false,
      options: [],
    };
    updateConfig({ registrationFields: [...config.registrationFields, newField] });
  };

  const handleRemoveField = (id) => {
    updateConfig({
      registrationFields: config.registrationFields.filter((f) => f.id !== id),
    });
  };

  const handleUpdateField = (id, updates) => {
    updateConfig({
      registrationFields: config.registrationFields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    });
  };

  const handleReorder = (newOrder) => {
    updateConfig({ registrationFields: newOrder });
  };

  const handleAddOption = (fieldId) => {
    const field = config.registrationFields.find((f) => f.id === fieldId);
    if (field) {
      const options = field.options || [];
      handleUpdateField(fieldId, { options: [...options, ''] });
    }
  };

  const handleUpdateOption = (fieldId, index, value) => {
    const field = config.registrationFields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[index] = value;
      handleUpdateField(fieldId, { options: newOptions });
    }
  };

  const handleRemoveOption = (fieldId, index) => {
    const field = config.registrationFields.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, i) => i !== index);
      handleUpdateField(fieldId, { options: newOptions });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Registration Form Builder</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom fields to collect information from participants
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Card className="bg-muted/30">
            <CardContent className="p-6 space-y-6">
              <div className="text-center pb-4 border-b">
                <h3 className="text-xl font-medium mb-2">Registration Form Preview</h3>
                <p className="text-sm text-muted-foreground">
                  This is how participants will see the form
                </p>
              </div>

              {config.registrationFields.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No fields added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {config.registrationFields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <span className="block font-medium">
                        {index + 1}. {field.title || 'Untitled Question'}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </span>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      )}

                      {/* Field Preview Based on Type */}
                      {field.type === 'text' && (
                        <Input placeholder="Text answer" disabled />
                      )}
                      {field.type === 'number' && (
                        <Input type="number" placeholder="Numeric answer" disabled />
                      )}
                      {field.type === 'date' && (
                        <Input type="date" disabled />
                      )}
                      {field.type === 'time' && (
                        <Input type="time" disabled />
                      )}
                      {field.type === 'checklist' && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, i) => (
                            <div key={`prev-check-${field.id}-${i}`} className="flex items-center gap-2">
                              <input type="checkbox" disabled className="rounded" />
                              <span className="text-sm">{option || `Option ${i + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === 'options' && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, i) => (
                            <div key={`prev-radio-${field.id}-${i}`} className="flex items-center gap-2">
                              <input type="radio" name={field.id} disabled />
                              <span className="text-sm">{option || `Option ${i + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Edit Mode */
        <div className="space-y-4">
          {/* Fields List */}
          <Reorder.Group
            axis="y"
            values={config.registrationFields}
            onReorder={handleReorder}
            className="space-y-4"
          >
            <AnimatePresence>
              {config.registrationFields.map((field, fieldIndex) => (
                <Reorder.Item key={field.id} value={field}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Card className="border-2 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-4">
                        {/* Header with Drag Handle */}
                        <div className="flex items-start gap-3">
                          <div className="cursor-grab active:cursor-grabbing pt-2">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-4">
                            {/* Field Type and Required Toggle */}
                            <div className="flex items-center gap-3">
                              <Select
                                value={field.type}
                                onValueChange={(value) =>
                                  handleUpdateField(field.id, {
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FIELD_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <type.icon className="w-4 h-4" />
                                        <span>{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <div className="flex items-center gap-2 ml-auto">
                                <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
                                <Switch
                                  id={`required-${field.id}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) =>
                                    handleUpdateField(field.id, { required: checked })
                                  }
                                />
                              </div>
                            </div>

                            {/* Question Title */}
                            <div>
                              <Label>Question</Label>
                              <Input
                                value={field.title}
                                onChange={(e) =>
                                  handleUpdateField(field.id, { title: e.target.value })
                                }
                                placeholder="Enter your question"
                              />
                            </div>

                            {/* Description */}
                            <div>
                              <Label>Description (Optional)</Label>
                              <Textarea
                                value={field.description}
                                onChange={(e) =>
                                  handleUpdateField(field.id, { description: e.target.value })
                                }
                                placeholder="Add context or instructions"
                                rows={2}
                              />
                            </div>

                            {/* Options for Checklist and Multiple Choice */}
                            {(field.type === 'checklist' || field.type === 'options') && (
                              <div className="space-y-2">
                                <span className="text-sm font-medium">Options</span>
                                <AnimatePresence>
                                  {field.options?.map((option, index) => (
                                    <motion.div
                                      key={`edit-option-${field.id}-${index}`}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                                        {field.type === 'checklist' ? '☐' : '○'}
                                      </div>
                                      <Input
                                        value={option}
                                        onChange={(e) =>
                                          handleUpdateOption(field.id, index, e.target.value)
                                        }
                                        placeholder={`Option ${index + 1}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(field.id, index)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddOption(field.id)}
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveField(field.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {/* Add Field Button */}
          <Button
            variant="outline"
            onClick={handleAddField}
            className="w-full gap-2 border-dashed border-2 h-14"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </Button>

          {/* Empty State */}
          {config.registrationFields.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed"
            >
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Fields Added</h3>
              <p className="text-muted-foreground mb-4">
                Start building your registration form by adding questions
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

const registrationFieldShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
});

RegistrationFieldsStep.propTypes = {
  config: PropTypes.shape({
    registrationFields: PropTypes.arrayOf(registrationFieldShape).isRequired,
  }).isRequired,
  updateConfig: PropTypes.func.isRequired,
};