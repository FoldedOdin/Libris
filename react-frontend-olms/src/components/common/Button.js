import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  type = 'button',
  icon = null,
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn d-inline-flex align-items-center justify-content-center gap-2 font-weight-semibold transition-all';
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary',
    ghost: 'bg-transparent text-primary hover:bg-primary-50'
  };

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
      {icon && <span className="btn-icon">{icon}</span>}
    </motion.button>
  );
};

export default Button;
