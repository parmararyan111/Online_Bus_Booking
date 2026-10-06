import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="alert alert-danger rounded-3 shadow-sm d-flex align-items-center justify-content-between p-3 my-3" role="alert">
      <div className="d-flex align-items-center gap-2">
        <AlertCircle size={20} className="flex-shrink-0" />
        <div>{message || 'An unexpected error occurred.'}</div>
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
