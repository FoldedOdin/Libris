// Form validation utilities
import { useState, useCallback } from 'react';

export const validationRules = {
  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null; // Allow empty if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, minLength, fieldName = 'Field') => {
    if (!value) return null; // Allow empty if not required
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, maxLength, fieldName = 'Field') => {
    if (!value) return null; // Allow empty if not required
    if (value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
    }
    return null;
  },

  // Username validation
  username: (value) => {
    if (!value) return null;
    if (value.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  // Password confirmation validation
  passwordConfirm: (value, originalPassword) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  // Number validation
  number: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  // Positive number validation
  positiveNumber: (value, fieldName = 'Field') => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  // Price validation
  price: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return 'Price must be a positive number';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return 'Price must have at most 2 decimal places';
    }
    return null;
  },

  // ISBN validation (basic)
  isbn: (value) => {
    if (!value) return null;
    // Remove hyphens and spaces
    const cleanIsbn = value.replace(/[-\s]/g, '');
    if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
      return 'ISBN must be 10 or 13 digits';
    }
    return null;
  },

  // Select validation (for dropdowns)
  select: (value, fieldName = 'Field') => {
    if (!value || value === '') {
      return `Please select a ${fieldName.toLowerCase()}`;
    }
    return null;
  },

  // Custom validation for specific patterns
  pattern: (value, pattern, message) => {
    if (!value) return null;
    if (!pattern.test(value)) {
      return message;
    }
    return null;
  }
};

// Form validation schema builder
export class ValidationSchema {
  constructor() {
    this.rules = {};
  }

  // Add a field with validation rules
  field(fieldName, ...rules) {
    this.rules[fieldName] = rules;
    return this;
  }

  // Validate all fields in the form data
  validate(formData) {
    const errors = {};
    let isValid = true;

    Object.keys(this.rules).forEach(fieldName => {
      const fieldRules = this.rules[fieldName];
      const fieldValue = formData[fieldName];
      
      for (const rule of fieldRules) {
        let error = null;
        
        if (typeof rule === 'function') {
          error = rule(fieldValue);
        } else if (typeof rule === 'object' && rule.validator) {
          error = rule.validator(fieldValue, ...rule.params || []);
        }
        
        if (error) {
          errors[fieldName] = error;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    });

    return { isValid, errors };
  }
}

// Pre-built validation schemas for common forms
export const validationSchemas = {
  // Login form validation
  login: new ValidationSchema()
    .field('username', validationRules.required)
    .field('password', validationRules.required),

  // Registration form validation
  register: new ValidationSchema()
    .field('username', validationRules.required, validationRules.username)
    .field('email', validationRules.required, validationRules.email)
    .field('first_name', (value) => validationRules.required(value, 'First name'))
    .field('last_name', (value) => validationRules.required(value, 'Last name'))
    .field('password', validationRules.required, validationRules.password)
    .field('confirm_password', validationRules.required),

  // Book form validation
  book: new ValidationSchema()
    .field('title', (value) => validationRules.required(value, 'Title'))
    .field('author', (value) => validationRules.required(value, 'Author'))
    .field('category', (value) => validationRules.select(value, 'Category'))
    .field('stock', (value) => validationRules.positiveNumber(value, 'Stock'))
    .field('price', validationRules.price),

  // Donation form validation
  donation: new ValidationSchema()
    .field('title', (value) => validationRules.required(value, 'Title'))
    .field('author', (value) => validationRules.required(value, 'Author'))
    .field('category', (value) => validationRules.select(value, 'Category'))
    .field('condition', (value) => validationRules.select(value, 'Condition')),

  // Sale form validation
  sale: new ValidationSchema()
    .field('book_id', (value) => validationRules.select(value, 'Book'))
    .field('price', validationRules.required, validationRules.price)
    .field('condition', (value) => validationRules.select(value, 'Condition')),

  // User form validation
  user: new ValidationSchema()
    .field('username', validationRules.required, validationRules.username)
    .field('email', validationRules.required, validationRules.email)
    .field('first_name', (value) => validationRules.required(value, 'First name'))
    .field('last_name', (value) => validationRules.required(value, 'Last name'))
};

// Real-time validation hook for React components
export const useFormValidation = (schema, initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field
  const validateField = useCallback((fieldName, value) => {
    const fieldRules = schema.rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        error = rule.validator(value, ...rule.params || []);
      }
      
      if (error) {
        return error;
      }
    }
    return null;
  }, [schema]);

  // Handle field change with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        return {
          ...prev,
          [name]: ''
        };
      }
      return prev;
    });

    // Real-time validation for touched fields
    setTouched(prev => {
      if (prev[name]) {
        const fieldError = validateField(name, value);
        if (fieldError) {
          setErrors(prevErrors => ({
            ...prevErrors,
            [name]: fieldError
          }));
        }
      }
      return prev;
    });
  }, [validateField]);

  // Handle field blur (mark as touched and validate)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError || ''
    }));
  }, [validateField]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const { isValid, errors: formErrors } = schema.validate(formData);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(schema.rules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    return isValid;
  }, [schema, formData]);

  // Reset form
  const resetForm = useCallback((newData = {}) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  }, []);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormData
  };
};

// Helper function to get field error class
export const getFieldErrorClass = (fieldName, errors, baseClass = 'form-input') => {
  return errors[fieldName] ? `${baseClass} error` : baseClass;
};

// Helper function to display field error
export const renderFieldError = (fieldName, errors) => {
  if (errors[fieldName]) {
    return <span className="field-error">{errors[fieldName]}</span>;
  }
  return null;
};