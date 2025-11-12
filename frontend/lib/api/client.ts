import { toast } from '@/components/ui/use-toast';
import { API_CONFIG } from './config';
import { ApiError } from './types';

/**
 * Custom API client with error handling and toast notifications
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Make an HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.error || errorData.message || 'An error occurred',
          status: response.status,
          statusText: response.statusText,
        };
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (error.name === 'AbortError') {
        const timeoutError: ApiError = {
          message: 'Request timeout',
          status: 408,
          statusText: 'Request Timeout',
        };
        throw timeoutError;
      }

      // Handle network errors
      if (!error.status) {
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          status: 0,
          statusText: 'Network Error',
        };
        throw networkError;
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Handle API errors with toast notifications
   */
  handleError(error: ApiError, customMessage?: string): void {
    console.error('API Error:', error);
    
    toast({
      title: 'Error',
      description: customMessage || error.message,
      variant: 'destructive',
    });
  }
}

export const apiClient = new ApiClient();








