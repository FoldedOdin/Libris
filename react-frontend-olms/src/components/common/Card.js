import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverable = false, onClick, ...props }) => {
  const baseClasses = 'card bg-card border border-light rounded-xl overflow-hidden';
  
  const hoverAnimation = hoverable ? {
    whileHover: { y: -6, scale: 1.01 },
    transition: { type: "spring", stiffness: 300 }
  } : {};

  return (
    <motion.div 
      className={`${baseClasses} ${hoverable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
