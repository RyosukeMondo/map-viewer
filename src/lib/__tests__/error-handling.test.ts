import {
  createMapError,
  isOffline,
  createOfflineError,
  ErrorHandler
} from '../error-handling';
import { MapError } from '../../components/MapError';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('Error Handling Library', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  describe('createMapError', () => {
    describe('API Key Errors', () => {
      it('creates API key missing error from context', () => {
        const error = new Error('API key is missing');
        const mapError = createMapError(error, 'api_key');

        expect(mapError).toEqual({
          type: 'api_key_missing',
          message: 'Google Maps API key is not configured',
          details: 'API key is missing',
          retryable: false
        });
      });

      it('creates API key invalid error from context', () => {
        const error = new Error('Invalid API key provided');
        const mapError = createMapError(error, 'api_key');

        expect(mapError).toEqual({
          type: 'api_key_invalid',
          message: 'Google Maps API key is invalid or has insufficient permissions',
          details: 'Invalid API key provided',
          retryable: false
        });
      });

      it('detects API key errors from message content', () => {
        const error = new Error('The provided API key is invalid');
        const mapError = createMapError(error);

        expect(mapError.type).toBe('api_key_invalid');
        expect(mapError.retryable).toBe(false);
      });

      it('detects API key missing from message content', () => {
        const error = new Error('API key missing from request');
        const mapError = createMapError(error);

        expect(mapError.type).toBe('api_key_missing');
        expect(mapError.retryable).toBe(false);
      });

      it('detects various API key error patterns', () => {
        const apiKeyErrors = [
          'api key not found',
          'api_key validation failed',
          'invalid key provided',
          'unauthorized access',
          'forbidden request',
          'quota exceeded',
          'billing not enabled'
        ];

        apiKeyErrors.forEach(errorMessage => {
          const error = new Error(errorMessage);
          const mapError = createMapError(error);

          expect(['api_key_missing', 'api_key_invalid']).toContain(mapError.type);
          expect(mapError.retryable).toBe(false);
        });
      });
    });

    describe('Network Errors', () => {
      it('creates network error from context', () => {
        const error = new Error('Connection failed');
        const mapError = createMapError(error, 'network');

        expect(mapError).toEqual({
          type: 'network_error',
          message: 'Unable to connect to Google Maps services',
          details: 'Connection failed',
          retryable: true
        });
      });

      it('detects network errors from message content', () => {
        const networkErrors = [
          'network error occurred',
          'connection timeout',
          'offline mode detected',
          'fetch failed',
          'CORS error',
          'net::ERR_NETWORK_CHANGED',
          'failed to fetch resource',
          'load failed due to network'
        ];

        networkErrors.forEach(errorMessage => {
          const error = new Error(errorMessage);
          const mapError = createMapError(error);

          expect(mapError.type).toBe('network_error');
          expect(mapError.retryable).toBe(true);
        });
      });
    });

    describe('API Load Errors', () => {
      it('creates API load error from context', () => {
        const error = new Error('Script loading failed');
        const mapError = createMapError(error, 'api_load');

        expect(mapError).toEqual({
          type: 'api_load_failed',
          message: 'Failed to load Google Maps API',
          details: 'Script loading failed',
          retryable: true
        });
      });

      it('detects API load errors from message content', () => {
        const loadErrors = [
          'script error occurred',
          'loading timeout',
          'script loading failed',
          'resource not found'
        ];

        loadErrors.forEach(errorMessage => {
          const error = new Error(errorMessage);
          const mapError = createMapError(error);

          expect(mapError.type).toBe('api_load_failed');
          expect(mapError.retryable).toBe(true);
        });

        // 'failed to load resource' is detected as network error
        const networkError = new Error('failed to load resource');
        const networkMapError = createMapError(networkError);
        expect(networkMapError.type).toBe('network_error');
        expect(networkMapError.retryable).toBe(true);
      });
    });

    describe('Map Initialization Errors', () => {
      it('creates map init error from context', () => {
        const error = new Error('Map initialization failed');
        const mapError = createMapError(error, 'map_init');

        expect(mapError).toEqual({
          type: 'map_init_failed',
          message: 'Failed to initialize the map',
          details: 'Map initialization failed',
          retryable: true
        });
      });

      it('defaults to map init error when no context matches', () => {
        const error = new Error('Some random error');
        const mapError = createMapError(error, 'map_init');

        expect(mapError.type).toBe('map_init_failed');
        expect(mapError.retryable).toBe(true);
      });
    });

    describe('Unknown Errors', () => {
      it('creates map init error for unrecognized patterns (default context)', () => {
        const error = new Error('Completely unknown error');
        const mapError = createMapError(error);

        expect(mapError).toEqual({
          type: 'map_init_failed',
          message: 'Failed to initialize the map',
          details: 'Completely unknown error',
          retryable: true
        });
      });

      it('handles non-Error objects', () => {
        const mapError = createMapError('String error message');

        expect(mapError.type).toBe('map_init_failed');
        expect(mapError.details).toBe('String error message');
      });

      it('handles null and undefined errors', () => {
        const nullError = createMapError(null);
        const undefinedError = createMapError(undefined);

        expect(nullError.type).toBe('map_init_failed');
        expect(nullError.details).toBe('null');

        expect(undefinedError.type).toBe('map_init_failed');
        expect(undefinedError.details).toBe('undefined');
      });
    });
  });

  describe('isOffline', () => {
    it('returns false when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOffline()).toBe(false);
    });

    it('returns true when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOffline()).toBe(true);
    });

    it('handles missing navigator gracefully', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      delete global.navigator;

      expect(isOffline()).toBe(false);

      global.navigator = originalNavigator;
    });
  });

  describe('createOfflineError', () => {
    it('creates proper offline error object', () => {
      const offlineError = createOfflineError();

      expect(offlineError).toEqual({
        type: 'network_error',
        message: 'You appear to be offline',
        details: 'Internet connection is required to load Google Maps. Please check your connection and try again.',
        retryable: true
      });
    });
  });

  describe('ErrorHandler', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
      errorHandler = new ErrorHandler();
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('executeWithRetry', () => {
      it('executes function successfully on first try', async () => {
        const mockFn = jest.fn().mockResolvedValue('success');

        const result = await errorHandler.executeWithRetry(mockFn);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(errorHandler.getRetryCount()).toBe(0);
      });

      it('retries on retryable errors', async () => {
        const mockFn = jest.fn()
          .mockRejectedValueOnce(new Error('network timeout'))
          .mockResolvedValue('success');

        const executePromise = errorHandler.executeWithRetry(mockFn, 'network');

        // Fast-forward timers to trigger retry
        await jest.advanceTimersByTimeAsync(1000);

        const result = await executePromise;

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('does not retry non-retryable errors', async () => {
        const mockFn = jest.fn().mockRejectedValue(new Error('API key missing'));

        await expect(errorHandler.executeWithRetry(mockFn, 'api_key')).rejects.toMatchObject({
          type: 'api_key_missing',
          retryable: false
        });

        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('stops retrying after max attempts', async () => {
        const errorHandler = new ErrorHandler(2, 100); // 2 max retries, 100ms delay
        const mockFn = jest.fn().mockRejectedValue(new Error('persistent network error'));

        const executePromise = errorHandler.executeWithRetry(mockFn, 'network');

        // Fast-forward through all retry attempts
        await jest.advanceTimersByTimeAsync(300); // Enough time for all retries

        await expect(executePromise).rejects.toMatchObject({
          type: 'network_error',
          retryable: true
        });

        expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });

      it('uses exponential backoff for retry delays', async () => {
        const errorHandler = new ErrorHandler(3, 100);
        const mockFn = jest.fn()
          .mockRejectedValueOnce(new Error('network error 1'))
          .mockRejectedValueOnce(new Error('network error 2'))
          .mockResolvedValue('success');

        const executePromise = errorHandler.executeWithRetry(mockFn, 'network');

        // Fast-forward through all retry delays
        await jest.advanceTimersByTimeAsync(400); // 100 + 200 + buffer

        const result = await executePromise;

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
      });

      it('handles offline scenarios for network errors', async () => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });

        const mockFn = jest.fn().mockRejectedValue(new Error('network connection failed'));

        await expect(errorHandler.executeWithRetry(mockFn, 'network')).rejects.toMatchObject({
          type: 'network_error',
          message: 'You appear to be offline'
        });

        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('resets retry count on success', async () => {
        const mockFn = jest.fn()
          .mockRejectedValueOnce(new Error('temporary error'))
          .mockResolvedValue('success');

        const executePromise = errorHandler.executeWithRetry(mockFn);
        await jest.advanceTimersByTimeAsync(1000);

        await executePromise;

        expect(errorHandler.getRetryCount()).toBe(0);
      });
    });

    describe('reset', () => {
      it('resets retry counter', async () => {
        const mockFn = jest.fn().mockRejectedValue(new Error('network error'));

        try {
          const executePromise = errorHandler.executeWithRetry(mockFn, 'network');
          await jest.advanceTimersByTimeAsync(1000);
          await executePromise;
        } catch (error) {
          // Expected to fail
        }

        expect(errorHandler.getRetryCount()).toBeGreaterThan(0);

        errorHandler.reset();

        expect(errorHandler.getRetryCount()).toBe(0);
      });
    });

    describe('getRetryCount', () => {
      it('returns current retry count', async () => {
        const mockFn = jest.fn().mockRejectedValue(new Error('network error'));

        expect(errorHandler.getRetryCount()).toBe(0);

        try {
          const executePromise = errorHandler.executeWithRetry(mockFn, 'network');
          await jest.advanceTimersByTimeAsync(1000);
          await executePromise;
        } catch (error) {
          // Expected to fail
        }

        expect(errorHandler.getRetryCount()).toBeGreaterThan(0);
      });
    });

    describe('Custom Configuration', () => {
      it('respects custom max retries', async () => {
        const customHandler = new ErrorHandler(1, 100); // Only 1 retry
        const mockFn = jest.fn().mockRejectedValue(new Error('persistent error'));

        const executePromise = customHandler.executeWithRetry(mockFn);
        await jest.advanceTimersByTimeAsync(200);

        await expect(executePromise).rejects.toMatchObject({
          type: 'map_init_failed'
        });

        expect(mockFn).toHaveBeenCalledTimes(2); // Initial + 1 retry
      });

      it('respects custom retry delay', async () => {
        const customHandler = new ErrorHandler(2, 500); // 500ms delay
        const mockFn = jest.fn()
          .mockRejectedValueOnce(new Error('error 1'))
          .mockResolvedValue('success');

        const executePromise = customHandler.executeWithRetry(mockFn);

        // Fast-forward through the retry delay
        await jest.advanceTimersByTimeAsync(500);

        const result = await executePromise;

        expect(result).toBe('success');
      });
    });
  });

  describe('Integration Tests (Requirements 3.2, 3.3)', () => {
    it('handles complete error flow for API key validation', () => {
      const apiKeyError = new Error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
      const mapError = createMapError(apiKeyError, 'api_key');

      expect(mapError.type).toBe('api_key_missing');
      expect(mapError.message).toBe('Google Maps API key is not configured');
      expect(mapError.retryable).toBe(false);
    });

    it('handles complete error flow for network issues', () => {
      const networkError = new Error('Failed to fetch Google Maps API');
      const mapError = createMapError(networkError, 'network');

      expect(mapError.type).toBe('network_error');
      expect(mapError.message).toBe('Unable to connect to Google Maps services');
      expect(mapError.retryable).toBe(true);
    });

    it('provides appropriate error handling for offline scenarios', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const offlineError = createOfflineError();
      expect(offlineError.type).toBe('network_error');
      expect(offlineError.message).toBe('You appear to be offline');
      expect(offlineError.retryable).toBe(true);

      expect(isOffline()).toBe(true);
    });
  });
});