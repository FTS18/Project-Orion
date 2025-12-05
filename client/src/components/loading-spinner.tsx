import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
};

export const SkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-muted rounded animate-pulse"></div>
      <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
      <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
    </div>
  );
};
