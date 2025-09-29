import { useState } from 'react';
import { useFieldArray, Control } from 'react-hook-form@7.55.0';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Mail, 
  Phone, 
  Calendar, 
  List, 
  CheckSquare, 
  ToggleLeft,
  FileText,
  Hash
} from 'lucide-react';

export interface CustomField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  description?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface CustomFormFieldsBuilderProps {
  control: Control<any>;
  name: string;
}

const fieldTypeOptions = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Number', icon: Phone },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'textarea', label: 'Long Text', icon: FileText },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { value: 'radio', label: 'Radio Buttons', icon: ToggleLeft },
];

export function CustomFormFieldsBuilder({ control, name }: CustomFormFieldsBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name,
  });

  const addField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    };
    append(newField);
    setEditingField(fields.length);
  };

  const duplicateField = (index: number) => {
    const field = fields[index] as CustomField;
    const duplicatedField: CustomField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    append(duplicatedField);
  };

  const updateField = (index: number, updatedField: Partial<CustomField>) => {
    const currentField = fields[index] as CustomField;
    update(index, { ...currentField, ...updatedField });
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex] as CustomField;
    const currentOptions = field.options || [];
    updateField(fieldIndex, {
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = fields[fieldIndex] as CustomField;
    const options = [...(field.options || [])];
    options[optionIndex] = value;
    updateField(fieldIndex, { options });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex] as CustomField;
    const options = (field.options || []).filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderFieldPreview = (field: CustomField) => {
    const { type, label, placeholder, options, required } = field;

    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-1">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <Input placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled />
          </div>
        );
      case 'date':
        return (
          <div className="space-y-1">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <Input type="date" disabled />
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-1">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <Textarea placeholder={placeholder || `Enter ${label.toLowerCase()}`} disabled rows={3} />
          </div>
        );
      case 'select':
        return (
          <div className="space-y-1">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox disabled />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="radio" disabled className="w-4 h-4" />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-college-blue">Custom Registration Fields</h3>
          <p className="text-sm text-muted-foreground">Add custom fields to collect additional information from participants</p>
        </div>
        <Button onClick={addField} size="sm" className="bg-college-blue hover:bg-college-blue/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const customField = field as CustomField;
          const isEditing = editingField === index;
          const fieldTypeOption = fieldTypeOptions.find(opt => opt.value === customField.type);
          const IconComponent = fieldTypeOption?.icon || Type;

          return (
            <Card 
              key={customField.id} 
              className={`border-college-blue/20 transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    <IconComponent className="w-4 h-4 text-college-blue" />
                    <div>
                      <h4 className="font-medium">{customField.label}</h4>
                      <p className="text-sm text-muted-foreground">{fieldTypeOption?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingField(isEditing ? null : index)}
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateField(index)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={customField.type}
                          onValueChange={(value) => updateField(index, { type: value as CustomField['type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Field Label</Label>
                        <Input
                          value={customField.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="Enter field label"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder Text</Label>
                      <Input
                        value={customField.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        placeholder="Enter placeholder text (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={customField.description || ''}
                        onChange={(e) => updateField(index, { description: e.target.value })}
                        placeholder="Add field description or instructions (optional)"
                        rows={2}
                      />
                    </div>

                    {/* Options for select, radio, checkbox */}
                    {(['select', 'radio', 'checkbox'].includes(customField.type)) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(index)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {customField.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index, optionIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={customField.required}
                          onCheckedChange={(checked) => updateField(index, { required: checked })}
                        />
                        <Label>Required field</Label>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preview Mode */
                  <div className="space-y-3">
                    {customField.description && (
                      <p className="text-sm text-muted-foreground">{customField.description}</p>
                    )}
                    <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-college-blue/20">
                      {renderFieldPreview(customField)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {fields.length === 0 && (
          <Card className="border-2 border-dashed border-college-blue/20">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-college-blue/60 mb-4" />
              <h3 className="font-medium text-college-blue mb-2">No Custom Fields Added</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create custom registration fields to collect additional information from participants
              </p>
              <Button onClick={addField} className="bg-college-blue hover:bg-college-blue/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Field
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}