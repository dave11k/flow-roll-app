/**
 * API Service Layer - Future-Proof Backend Interface
 * 
 * This service provides a versioned API interface that can seamlessly
 * switch between local SQLite storage and remote backend calls.
 * 
 * Currently acts as a thin wrapper around the existing storage layer,
 * but provides the foundation for future backend migration.
 */

import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';
import { UserProfile } from '@/types/profile';
import * as Storage from './storage';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  version: 'v1',
  timeout: 10000,
  useLocalStorage: !process.env.EXPO_PUBLIC_API_URL, // Use local storage if no API URL
  enableLogging: __DEV__, // Enable logging in development
};

// Enhanced logging utility with performance tracking
const logRequest = (method: string, endpoint: string, data?: any) => {
  if (API_CONFIG.enableLogging) {
    const timestamp = new Date().toISOString();
    console.log(`[API] ${timestamp} → ${method} ${endpoint}`, data ? { data } : '');
  }
};

const logResponse = (method: string, endpoint: string, success: boolean, data?: any, duration?: number) => {
  if (API_CONFIG.enableLogging) {
    const timestamp = new Date().toISOString();
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`[API] ${timestamp} ← ${method} ${endpoint} ${success ? '✓' : '✗'}${durationText}`, data ? { data } : '');
  }
};

const logError = (method: string, endpoint: string, error: any, context?: string) => {
  if (API_CONFIG.enableLogging) {
    const timestamp = new Date().toISOString();
    console.error(`[API] ${timestamp} ✗ ${method} ${endpoint}${context ? ` (${context})` : ''}`, error);
  }
};

// Request wrapper with timing and error handling
const withTiming = async <T>(
  operation: () => Promise<T>,
  method: string,
  endpoint: string
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logResponse(method, endpoint, true, undefined, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(method, endpoint, error, `${duration}ms`);
    throw error;
  }
};

/**
 * Future-proof API client that currently uses local storage
 * but can be easily switched to remote backend
 */
class ApiClient {
  private version: string = API_CONFIG.version;

  /**
   * Get all techniques
   */
  async getTechniques(): Promise<Technique[]> {
    const endpoint = '/techniques';
    logRequest('GET', endpoint);
    
    return withTiming(
      async () => {
        const result = await Storage.getTechniques();
        logResponse('GET', endpoint, true, { count: result.length });
        return result;
      },
      'GET',
      endpoint
    );
  }

  /**
   * Get recent techniques with optional limit
   */
  async getRecentTechniques(limit: number = 10): Promise<Technique[]> {
    const endpoint = `/techniques/recent?limit=${limit}`;
    logRequest('GET', endpoint);
    
    try {
      const result = await Storage.getRecentTechniques(limit);
      logResponse('GET', endpoint, true, { count: result.length });
      return result;
    } catch (error) {
      logResponse('GET', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Save a technique (create or update)
   */
  async saveTechnique(technique: Technique): Promise<Technique> {
    const endpoint = '/techniques';
    logRequest('POST', endpoint, { id: technique.id, name: technique.name });
    
    return withTiming(
      async () => {
        await Storage.saveTechnique(technique);
        logResponse('POST', endpoint, true, { id: technique.id });
        return technique;
      },
      'POST',
      endpoint
    );
  }

  /**
   * Update a technique (alias for saveTechnique for clarity)
   */
  async updateTechnique(technique: Technique): Promise<Technique> {
    const endpoint = `/techniques/${technique.id}`;
    logRequest('PUT', endpoint, { id: technique.id, name: technique.name });
    
    try {
      await Storage.updateTechnique(technique);
      logResponse('PUT', endpoint, true, { id: technique.id });
      return technique;
    } catch (error) {
      logResponse('PUT', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Delete a technique
   */
  async deleteTechnique(techniqueId: string): Promise<void> {
    const endpoint = `/techniques/${techniqueId}`;
    logRequest('DELETE', endpoint);
    
    try {
      await Storage.deleteTechnique(techniqueId);
      logResponse('DELETE', endpoint, true);
    } catch (error) {
      logResponse('DELETE', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Get techniques for a specific session
   */
  async getTechniquesBySession(sessionId: string): Promise<Technique[]> {
    const endpoint = `/sessions/${sessionId}/techniques`;
    logRequest('GET', endpoint);
    
    try {
      const result = await Storage.getTechniquesBySession(sessionId);
      logResponse('GET', endpoint, true, { count: result.length });
      return result;
    } catch (error) {
      logResponse('GET', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Get all training sessions
   */
  async getSessions(): Promise<TrainingSession[]> {
    const endpoint = '/sessions';
    logRequest('GET', endpoint);
    
    try {
      const result = await Storage.getSessions();
      logResponse('GET', endpoint, true, { count: result.length });
      return result;
    } catch (error) {
      logResponse('GET', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Save a training session (create or update)
   */
  async saveSession(session: TrainingSession): Promise<TrainingSession> {
    const endpoint = '/sessions';
    logRequest('POST', endpoint, { id: session.id, date: session.date });
    
    try {
      await Storage.saveSession(session);
      logResponse('POST', endpoint, true, { id: session.id });
      return session;
    } catch (error) {
      logResponse('POST', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Update a training session (alias for saveSession for clarity)
   */
  async updateSession(session: TrainingSession): Promise<TrainingSession> {
    const endpoint = `/sessions/${session.id}`;
    logRequest('PUT', endpoint, { id: session.id, date: session.date });
    
    try {
      await Storage.saveSession(session);
      logResponse('PUT', endpoint, true, { id: session.id });
      return session;
    } catch (error) {
      logResponse('PUT', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Delete a training session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const endpoint = `/sessions/${sessionId}`;
    logRequest('DELETE', endpoint);
    
    try {
      await Storage.deleteSession(sessionId);
      logResponse('DELETE', endpoint, true);
    } catch (error) {
      logResponse('DELETE', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile | null> {
    const endpoint = '/profile';
    logRequest('GET', endpoint);
    
    try {
      const result = await Storage.getProfile();
      logResponse('GET', endpoint, true, { hasProfile: !!result });
      return result;
    } catch (error) {
      logResponse('GET', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Save user profile
   */
  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const endpoint = '/profile';
    logRequest('POST', endpoint, { name: profile.name });
    
    try {
      await Storage.saveProfile(profile);
      logResponse('POST', endpoint, true);
      return profile;
    } catch (error) {
      logResponse('POST', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(): Promise<void> {
    const endpoint = '/profile';
    logRequest('DELETE', endpoint);
    
    try {
      await Storage.deleteProfile();
      logResponse('DELETE', endpoint, true);
    } catch (error) {
      logResponse('DELETE', endpoint, false, error);
      throw error;
    }
  }

  /**
   * Get current API version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Set API version for future compatibility
   */
  setVersion(version: string): void {
    this.version = version;
    console.log(`[API] Version set to ${version}`);
  }

  /**
   * Check if we're using local storage or remote API
   */
  isLocal(): boolean {
    return API_CONFIG.useLocalStorage;
  }

  /**
   * Get API configuration info
   */
  getInfo(): {
    version: string;
    isLocal: boolean;
    baseUrl: string;
    loggingEnabled: boolean;
  } {
    return {
      version: this.version,
      isLocal: this.isLocal(),
      baseUrl: API_CONFIG.baseUrl,
      loggingEnabled: API_CONFIG.enableLogging,
    };
  }

  /**
   * Check API compatibility with current client
   * Currently always returns compatible for local storage
   */
  async checkCompatibility(): Promise<{
    compatible: boolean;
    minClientVersion: string;
    currentVersion: string;
    upgradeRequired: boolean;
    message?: string;
  }> {
    logRequest('GET', '/compatibility');
    
    try {
      // For now, always return compatible since we're using local storage
      const result = {
        compatible: true,
        minClientVersion: '1.0.0',
        currentVersion: this.version,
        upgradeRequired: false,
        message: 'Local storage mode - always compatible',
      };
      
      logResponse('GET', '/compatibility', true, result);
      return result;
    } catch (error) {
      logResponse('GET', '/compatibility', false, error);
      
      // Default to compatible if we can't check
      return {
        compatible: true,
        minClientVersion: '1.0.0',
        currentVersion: this.version,
        upgradeRequired: false,
        message: 'Compatibility check failed, assuming compatible',
      };
    }
  }

  /**
   * Health check for API status
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    isLocal: boolean;
    version: string;
    timestamp: string;
  }> {
    logRequest('GET', '/health');
    
    try {
      const result = {
        status: 'healthy' as const,
        isLocal: this.isLocal(),
        version: this.version,
        timestamp: new Date().toISOString(),
      };
      
      logResponse('GET', '/health', true, result);
      return result;
    } catch (error) {
      logResponse('GET', '/health', false, error);
      
      return {
        status: 'down' as const,
        isLocal: this.isLocal(),
        version: this.version,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual methods for easy migration from storage imports
export const {
  getTechniques,
  getRecentTechniques,
  saveTechnique,
  updateTechnique,
  deleteTechnique,
  getTechniquesBySession,
  getSessions,
  saveSession,
  updateSession,
  deleteSession,
  getProfile,
  saveProfile,
  deleteProfile,
} = apiClient;

// Export client for advanced usage
export default apiClient;