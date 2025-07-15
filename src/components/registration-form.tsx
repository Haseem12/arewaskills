'use client';

import type { FormConfig, FormField as FormFieldType } from '@/ai/flows/dynamic-form-generation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  formConfig: FormConfig;
  onRegistrationSuccess?: () => void;
}

// Helper to create a Zod schema from the form configuration
function createZodSchema(fields: FormFieldType[]): z.ZodObject<any> {
  const schemaShape: { [key: string]: z.ZodType<any, any> } = {};

  fields.forEach(field => {
    let zodType: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        zodType = z.string().email({ message: "Invalid email address." });
        break;
      case 'tel':
        zodType = z.string().min(10, { message: "Phone number seems too short." });
        break;
      case 'number':
        zodType = z.coerce.number().min(0, { message: "Value must be positive." });
        break;
      default:
        zodType = z.string();
    }
    
    if (field.required) {
        if(zodType instanceof z.ZodString) {
            zodType = zodType.min(1, { message: `${field.label} is required.` });
        }
    } else {
        zodType = zodType.optional().or(z.literal(''));
    }
    
    if (field.validationRegex && zodType instanceof z.ZodString) {
        try {
            const regex = new RegExp(field.validationRegex);
            zodType = zodType.regex(regex, { message: `Invalid format for ${field.label}.` });
        } catch (e) {
            console.warn(`Invalid regex for ${field.label}: ${field.validationRegex}`);
        }
    }

    const fieldKey = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    schemaShape[fieldKey] = zodType;
  });

  return z.object(schemaShape);
}

function renderField(field: FormFieldType, form: ReturnType<typeof useForm>) {
    const fieldKey = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const ControlComponent = field.type === 'textarea' ? Textarea : Input;

    return (
        <FormField
            key={fieldKey}
            control={form.control}
            name={fieldKey}
            render={({ field: formField }) => (
                <FormItem>
                    <FormLabel>{field.label}{field.required && <span className="text-destructive">*</span>}</FormLabel>
                    <FormControl>
                        <ControlComponent 
                            type={field.type === 'textarea' ? undefined : field.type} 
                            placeholder={field.placeholder || ''} 
                            {...formField} 
                            className="transition-all duration-300 focus:shadow-lg focus:shadow-accent/20"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export function RegistrationForm({ formConfig, onRegistrationSuccess }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const formSchema = useMemo(() => createZodSchema(formConfig.fields), [formConfig.fields]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formConfig.fields.reduce((acc, field) => {
        const fieldKey = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const defaultValue = field.type === 'number' ? undefined : '';
        // @ts-ignore
        acc[fieldKey] = defaultValue;
        return acc;
    }, {})
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      console.log(values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      form.reset();
      
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering. We've received your information.",
        variant: "default",
        duration: 5000,
      });
      
      if(onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formConfig.fields.map(field => renderField(field, form))}
        
        <Button 
          type="submit" 
          className="w-full text-lg py-6 transition-all duration-300 transform hover:scale-105" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Register Now'
          )}
        </Button>
      </form>
    </Form>
  );
}
