import block from 'bem-cn';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Translation } from 'react-i18next';

import './ErrorBoundary.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
  errorInfo?: ErrorInfo;
}

const cn = block('error-boundary');

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  private handleBack = () => {
    window.history.back();
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { children } = this.props;
    const { error, errorInfo } = this.state;

    if (!error) {
      return children;
    }

    const errorLocation = [error.name, error.message, errorInfo?.componentStack]
      .filter(Boolean)
      .join('\n\n');

    return (
      <Translation>
        {(t) => (
          <div className={cn()}>
            <div className={cn('content')}>
              <h1 className={cn('title')}>{t('errorBoundary.title')}</h1>
              {__IS_DEV__ && <pre className={cn('details')}>{errorLocation}</pre>}
              <div className={cn('actions')}>
                <button className={cn('button')} onClick={this.handleBack} type="button">
                  {t('errorBoundary.goBack')}
                </button>
                <button className={cn('button')} onClick={this.handleReload} type="button">
                  {t('errorBoundary.reload')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Translation>
    );
  }
}

export { ErrorBoundary };
