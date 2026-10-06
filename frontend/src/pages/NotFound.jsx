import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container py-5 text-center my-5">
      <Bus size={64} className="text-muted mb-3" />
      <h1 className="display-4 fw-bold text-dark mb-2">404 - Page Not Found</h1>
      <p className="text-muted max-w-md mx-auto mb-4">
        The route or page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2">
        <Home size={18} /> Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
