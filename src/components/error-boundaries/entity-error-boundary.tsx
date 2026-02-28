"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";

interface EntityErrorBoundaryProps {
  children: ReactNode;
  entityName: string;
  fallback?: ReactNode;
}

interface EntityErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class EntityErrorBoundary extends Component<
  EntityErrorBoundaryProps,
  EntityErrorBoundaryState
> {
  constructor(props: EntityErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EntityErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Error in ${this.props.entityName} component:`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">
              Error loading {this.props.entityName}
            </h3>
          </div>
          <p className="text-neutral-600 text-center max-w-md">
            Something went wrong while loading{" "}
            {this.props.entityName.toLowerCase()} data. Please try again or
            contact support if the problem persists.
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useEntityErrorHandler(entityName: string) {
  const handleError = (error: Error) => {
    console.error(`Error in ${entityName}:`, error);
    // You can add additional error reporting here
  };

  return { handleError };
}
