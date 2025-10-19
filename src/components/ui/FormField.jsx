import React, { forwardRef } from 'react';

const FormField = forwardRef(function FormField({ label, children, className = '' }, ref) {
  return (
    <label ref={ref} className={`block ${className}`}>
      {label && <div className="mb-1">{label}</div>}
      {children}
    </label>
  );
});

export default FormField;
