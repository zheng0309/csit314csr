import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Stack, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  FormControlLabel, Switch, RadioGroup, Radio, Divider, Alert,
  Stepper, Step, StepLabel, Card, CardContent, IconButton
} from '@mui/material';
import {
  LocationOn, Schedule, Warning, Category, Description,
  ArrowBack, ArrowForward, Save, AddPhotoAlternate
} from '@mui/icons-material';

// =============================================
// Enhanced Help Request Form Component
// =============================================
export default function CreateHelpRequestForm({ onSave, onCancel, duplicateData = null }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    title: duplicateData?.title || '',
    description: duplicateData?.description || '',
    category: duplicateData?.category || '',
    
    // Details
    urgency: duplicateData?.urgency || 'normal',
    location: duplicateData?.location || '',
    preferredDate: duplicateData?.preferredDate || '',
    preferredTime: duplicateData?.preferredTime || '',
    
    // Specific Requirements
    specialRequirements: duplicateData?.specialRequirements || '',
    recurring: duplicateData?.recurring || false,
    recurrencePattern: duplicateData?.recurrencePattern || '',
    
    // Contact & Accessibility
    contactMethod: duplicateData?.contactMethod || 'any',
    specificContact: duplicateData?.specificContact || '',
    accessibilityNeeds: duplicateData?.accessibilityNeeds || '',
    
    // Privacy
    shareContactInfo: duplicateData?.shareContactInfo ?? true,
    anonymousRequest: duplicateData?.anonymousRequest ?? false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Categories based on common help requests
  const categories = [
    { value: 'shopping', label: '🛒 Shopping Assistance', description: 'Help with grocery shopping or errands' },
    { value: 'transportation', label: '🚗 Transportation', description: 'Rides to appointments or places' },
    { value: 'companionship', label: '👥 Companionship', description: 'Social visits and companionship' },
    { value: 'household', label: '🏠 Household Tasks', description: 'Light housework, cleaning, organizing' },
    { value: 'technology', label: '💻 Technology Help', description: 'Computer, phone, or internet assistance' },
    { value: 'personal_care', label: '🧴 Personal Care', description: 'Basic personal care assistance' },
    { value: 'meals', label: '🍽️ Meal Preparation', description: 'Help with cooking or meal delivery' },
    { value: 'pets', label: '🐾 Pet Care', description: 'Pet walking or care assistance' },
    { value: 'yardwork', label: '🌳 Yard Work', description: 'Light gardening or yard maintenance' },
    { value: 'other', label: '❓ Other', description: 'Other types of assistance needed' }
  ];

  const steps = [
    'Basic Information',
    'Request Details', 
    'Specific Needs',
    'Review & Submit'
  ];

  // Validation rules
  const validateField = (name, value) => {
    const rules = {
      title: value => !value.trim() ? 'Title is required' : value.length < 5 ? 'Title should be at least 5 characters' : null,
      description: value => !value.trim() ? 'Description is required' : value.length < 10 ? 'Please provide more details' : null,
      category: value => !value ? 'Please select a category' : null,
      location: value => !value.trim() ? 'Location is required' : null,
      preferredDate: value => !value ? 'Preferred date is required' : null,
      preferredTime: value => !value ? 'Preferred time is required' : null
    };
    
    return rules[name] ? rules[name](value) : null;
  };

  const validateStep = (step) => {
    const stepValidations = {
      0: ['title', 'description', 'category'],
      1: ['location', 'preferredDate', 'preferredTime'],
      2: [] // No required fields in step 2
    };

    const stepErrors = {};
    stepValidations[step]?.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) stepErrors[field] = error;
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if field was previously touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    // Validate all steps
    const allErrors = {};
    ['title', 'description', 'category', 'location', 'preferredDate', 'preferredTime'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) allErrors[field] = error;
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setActiveStep(0); // Go back to first step with errors
      return;
    }

    // Submit the form
    onSave(formData);
  };

  // Form steps components
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              Tell us what help you need
            </Typography>
            
            <TextField
              label="Request Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              error={!!errors.title}
              helperText={errors.title || "Brief summary of the help you need"}
              required
              fullWidth
            />

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={() => handleBlur('category')}
              >
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box>
                      <Typography variant="body1">{cat.label}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {cat.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>

            <TextField
              label="Detailed Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={!!errors.description}
              helperText={errors.description || "Please describe exactly what help you need"}
              multiline
              rows={4}
              required
              fullWidth
            />

            {duplicateData && (
              <Alert severity="info">
                Duplicating previous request: "{duplicateData.title}"
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              When and where do you need help?
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  onBlur={() => handleBlur('location')}
                  error={!!errors.location}
                  helperText={errors.location || "Address or area where help is needed"}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, opacity: 0.7 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    value={formData.urgency}
                    label="Urgency Level"
                    onChange={(e) => handleChange('urgency', e.target.value)}
                  >
                    <MenuItem value="low">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <span>Low - Whenever available</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="normal">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        <span>Normal - Within a few days</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="urgent">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                        <span>Urgent - As soon as possible</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Preferred Date"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleChange('preferredDate', e.target.value)}
                  onBlur={() => handleBlur('preferredDate')}
                  error={!!errors.preferredDate}
                  helperText={errors.preferredDate}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Preferred Time"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleChange('preferredTime', e.target.value)}
                  onBlur={() => handleBlur('preferredTime')}
                  error={!!errors.preferredTime}
                  helperText={errors.preferredTime}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.recurring}
                  onChange={(e) => handleChange('recurring', e.target.checked)}
                />
              }
              label="This is a recurring need"
            />

            {formData.recurring && (
              <FormControl fullWidth>
                <InputLabel>Recurrence Pattern</InputLabel>
                <Select
                  value={formData.recurrencePattern}
                  label="Recurrence Pattern"
                  onChange={(e) => handleChange('recurrencePattern', e.target.value)}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Every 2 weeks</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="custom">Custom schedule</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              Any specific requirements?
            </Typography>

            <TextField
              label="Special Requirements or Instructions"
              value={formData.specialRequirements}
              onChange={(e) => handleChange('specialRequirements', e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Any specific skills needed, preferences, accessibility requirements, or special instructions..."
            />

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Preferred Contact Method
              </Typography>
              <RadioGroup
                value={formData.contactMethod}
                onChange={(e) => handleChange('contactMethod', e.target.value)}
              >
                <FormControlLabel value="any" control={<Radio />} label="Any method is fine" />
                <FormControlLabel value="phone" control={<Radio />} label="Phone call only" />
                <FormControlLabel value="text" control={<Radio />} label="Text message only" />
                <FormControlLabel value="email" control={<Radio />} label="Email only" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Specific Contact Information (if different from profile)"
              value={formData.specificContact}
              onChange={(e) => handleChange('specificContact', e.target.value)}
              fullWidth
              placeholder="Alternative phone number or email..."
            />

            <TextField
              label="Accessibility Needs"
              value={formData.accessibilityNeeds}
              onChange={(e) => handleChange('accessibilityNeeds', e.target.value)}
              multiline
              rows={2}
              fullWidth
              placeholder="Mobility considerations, communication preferences, etc."
            />

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.shareContactInfo}
                    onChange={(e) => handleChange('shareContactInfo', e.target.checked)}
                  />
                }
                label="Share my contact information with volunteers"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.anonymousRequest}
                    onChange={(e) => handleChange('anonymousRequest', e.target.checked)}
                  />
                }
                label="Make this request anonymous (hide my name)"
              />
            </Stack>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              Review your request
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Request Title
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formData.title}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip 
                      label={categories.find(c => c.value === formData.category)?.label || formData.category}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {formData.description}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {formData.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Urgency
                      </Typography>
                      <Chip 
                        label={formData.urgency}
                        size="small"
                        color={
                          formData.urgency === 'urgent' ? 'error' :
                          formData.urgency === 'normal' ? 'warning' : 'success'
                        }
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Preferred Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {formData.preferredDate} at {formData.preferredTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recurring
                      </Typography>
                      <Typography variant="body1">
                        {formData.recurring ? `Yes (${formData.recurrencePattern})` : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {formData.specialRequirements && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Special Requirements
                      </Typography>
                      <Typography variant="body1">
                        {formData.specialRequirements}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Privacy Settings
                    </Typography>
                    <Typography variant="body1">
                      {formData.shareContactInfo ? 'Contact info shared' : 'Contact info private'} • 
                      {formData.anonymousRequest ? ' Anonymous' : ' Name visible'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Alert severity="info">
              Once submitted, your request will be visible to volunteers who can help. 
              You'll be notified when someone accepts your request.
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        {duplicateData ? 'Duplicate Help Request' : 'Create New Help Request'}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          onClick={activeStep === 0 ? onCancel : handleBack}
          startIcon={<ArrowBack />}
          disabled={activeStep === 0}
        >
          Back
        </Button>

        <Stack direction="row" spacing={1}>
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<Save />}
            >
              Submit Request
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}