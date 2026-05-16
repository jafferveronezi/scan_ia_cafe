/**
 * Global Error Boundary Component
 * Catches errors in React component tree and displays fallback UI
 */

import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { logger } from '@/lib/_core/logger';
import { AppError } from '@/lib/_core/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorInfo {
  componentStack: string;
}

/**
 * Error Boundary for catching errors in component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary', 'Error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call external error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    logger.info('ErrorBoundary', 'Retrying after error');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isAppError = error instanceof AppError;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        <Text style={styles.title}>Oops! Algo deu errado</Text>

        <Text style={styles.message}>
          {isAppError && error.message
            ? error.message
            : 'Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.'}
        </Text>

        {isDevelopment && (
          <>
            <View style={styles.devSection}>
              <Text style={styles.devTitle}>Developer Info</Text>

              {isAppError && (
                <>
                  <Text style={styles.devLabel}>Type: {error.type}</Text>
                  <Text style={styles.devLabel}>Severity: {error.severity}</Text>
                  {error.statusCode && (
                    <Text style={styles.devLabel}>Status: {error.statusCode}</Text>
                  )}
                </>
              )}

              <Text style={styles.devLabel}>Error: {error.message}</Text>

              {error.stack && (
                <Text style={styles.devStack}>{error.stack.substring(0, 500)}...</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={retry}>
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            logger.info('ErrorBoundary', 'User chose to go back');
            // Implementar navegação back ou para home
          }}
        >
          <Text style={styles.buttonTextSecondary}>Voltar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F2',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A2E1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#5A7A5A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  devSection: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    padding: 12,
    borderRadius: 4,
    marginTop: 20,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  devLabel: {
    fontSize: 12,
    color: '#8B0000',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  devStack: {
    fontSize: 10,
    color: '#8B0000',
    marginTop: 8,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8DCC8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

export default ErrorBoundary;
