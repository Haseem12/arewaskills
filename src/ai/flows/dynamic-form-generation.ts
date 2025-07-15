'use server';

/**
 * @fileOverview AI-powered dynamic form generation for the registration form.
 *
 * - generateFormFields - A function that dynamically generates form fields with labels, input types, and basic validation using AI.
 * - FormField - The interface for a single form field.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormFieldSchema = z.object({
  label: z.string().describe('The label for the input field.'),
  type: z.string().describe('The HTML input type for the field (e.g., text, email, tel).'),
  required: z.boolean().describe('Whether the field is required.'),
  validationRegex: z.string().optional().describe('Optional regex for validating the field.'),
  placeholder: z.string().optional().describe('Optional placeholder text for the input field.'),
});

export type FormField = z.infer<typeof FormFieldSchema>;

const FormConfigSchema = z.object({
  fields: z.array(FormFieldSchema).describe('An array of form field configurations.'),
});

export type FormConfig = z.infer<typeof FormConfigSchema>;

const FormGenerationInputSchema = z.object({
  formDescription: z.string().describe('A description of the form to generate.'),
});

export type FormGenerationInput = z.infer<typeof FormGenerationInputSchema>;

export async function generateFormFields(input: FormGenerationInput): Promise<FormConfig> {
  return dynamicFormGenerationFlow(input);
}

const dynamicFormGenerationPrompt = ai.definePrompt({
  name: 'dynamicFormGenerationPrompt',
  input: {schema: FormGenerationInputSchema},
  output: {schema: FormConfigSchema},
  prompt: `You are an AI form generator.  You will generate a JSON configuration for a form based on the description provided. The form configuration should include an array of fields, each with a label, type, and whether it is required. Generate HTML5 input types. Generate a validationRegex if appropriate, and placeholder to guide the user.

Form Description: {{{formDescription}}}

Output the form configuration as a JSON object. Do not include any explanation, only the JSON. The JSON should match this Typescript interface:

${FormFieldSchema}`,
});

const dynamicFormGenerationFlow = ai.defineFlow(
  {
    name: 'dynamicFormGenerationFlow',
    inputSchema: FormGenerationInputSchema,
    outputSchema: FormConfigSchema,
  },
  async input => {
    const {output} = await dynamicFormGenerationPrompt(input);
    return output!;
  }
);
