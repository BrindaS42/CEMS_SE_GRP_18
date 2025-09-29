import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { CustomField } from './CustomFormFieldsBuilder';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface CustomFieldsPreviewProps {
  fields: CustomField[];
}

export function CustomFieldsPreview({ fields }: CustomFieldsPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!fields || fields.length === 0) {
    return null;
  }

  const renderField = (field: CustomField) => {
    const { type, label, placeholder, options, required, description } = field;

    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Input 
              type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`} 
              disabled 
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Input 
              type="number"
              placeholder={placeholder || `Enter ${label.toLowerCase()}`} 
              disabled 
            />
          </div>
        );
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Input type="date" disabled />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <Textarea 
              placeholder={placeholder || `Enter ${label.toLowerCase()}`} 
              disabled 
              rows={3} 
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
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
          <div key={field.id} className="space-y-3">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox disabled />
                  <Label className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    disabled 
                    className="w-4 h-4 text-college-blue border-gray-300 focus:ring-college-blue"
                    name={field.id}
                  />
                  <Label className="text-sm">{option}</Label>
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
    <Card className="border-college-blue/20 bg-college-blue/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-college-blue">Registration Form Preview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              How your custom fields will appear to participants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-college-yellow/20 text-college-blue">
              {fields.length} custom field{fields.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showPreview && (
        <CardContent>
          <div className="bg-white border border-college-blue/10 rounded-lg p-6">
            <div className="space-y-6">
              <div className="border-b border-college-blue/10 pb-4">
                <h4 className="font-medium text-college-blue mb-2">Additional Information</h4>
                <p className="text-sm text-muted-foreground">
                  Please provide the following additional details for your registration.
                </p>
              </div>
              
              <div className="space-y-6">
                {fields.map(renderField)}
              </div>
              
              <div className="pt-4 border-t border-college-blue/10">
                <Button disabled className="bg-college-blue hover:bg-college-blue/90">
                  Complete Registration
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}