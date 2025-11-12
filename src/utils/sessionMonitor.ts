// Session monitoring utility for debugging intermittent logout issues

interface SessionEvent {
  timestamp: number;
  event: string;
  details: any;
  sessionId?: string;
  userId?: string;
}

class SessionMonitor {
  private events: SessionEvent[] = [];
  private maxEvents = 100; // Keep last 100 events
  private isDebugMode = false;

  constructor() {
    // Enable debug mode in development or when VITE_DEBUG is set
    this.isDebugMode = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
    
    if (this.isDebugMode) {
      console.log('SessionMonitor initialized in debug mode');
    }
  }

  logEvent(event: string, details: any = {}, sessionId?: string, userId?: string) {
    const sessionEvent: SessionEvent = {
      timestamp: Date.now(),
      event,
      details,
      sessionId,
      userId
    };

    this.events.push(sessionEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    if (this.isDebugMode) {
      console.log(`[SessionMonitor] ${event}:`, details);
    }

    // Log critical events even in production
    if (this.isCriticalEvent(event)) {
      console.warn(`[SessionMonitor] CRITICAL: ${event}:`, details);
    }
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      'session_expired',
      'refresh_failed',
      'unexpected_logout',
      'auth_error',
      'profile_fetch_failed',
      'session_validation_failed'
    ];
    return criticalEvents.includes(event);
  }

  getRecentEvents(count = 20): SessionEvent[] {
    return this.events.slice(-count);
  }

  getEventsByType(eventType: string): SessionEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getSessionTimeline(sessionId: string): SessionEvent[] {
    return this.events.filter(event => event.sessionId === sessionId);
  }

  exportLogs(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      events: this.events,
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }

  clearLogs() {
    this.events = [];
    console.log('[SessionMonitor] Logs cleared');
  }

  // Helper method to track session health
  getSessionHealth(): {
    totalEvents: number;
    criticalEvents: number;
    lastActivity: number | null;
    sessionDuration: number | null;
  } {
    const criticalEvents = this.events.filter(event => this.isCriticalEvent(event.event));
    const lastEvent = this.events[this.events.length - 1];
    const firstEvent = this.events[0];

    return {
      totalEvents: this.events.length,
      criticalEvents: criticalEvents.length,
      lastActivity: lastEvent?.timestamp || null,
      sessionDuration: firstEvent && lastEvent ? lastEvent.timestamp - firstEvent.timestamp : null
    };
  }
}

// Create singleton instance
export const sessionMonitor = new SessionMonitor();

// Helper functions for common session events
export const logSessionEvent = {
  sessionStart: (sessionId: string, userId: string) => 
    sessionMonitor.logEvent('session_start', { sessionId, userId }, sessionId, userId),
  
  sessionEnd: (sessionId: string, userId: string, reason: string) => 
    sessionMonitor.logEvent('session_end', { reason }, sessionId, userId),
  
  sessionRefresh: (sessionId: string, userId: string, success: boolean) => 
    sessionMonitor.logEvent('session_refresh', { success }, sessionId, userId),
  
  sessionValidation: (sessionId: string, userId: string, isValid: boolean, details?: any) => 
    sessionMonitor.logEvent('session_validation', { isValid, ...details }, sessionId, userId),
  
  profileFetch: (userId: string, success: boolean, error?: any) => 
    sessionMonitor.logEvent('profile_fetch', { success, error }, undefined, userId),
  
  authError: (error: any, context: string) => 
    sessionMonitor.logEvent('auth_error', { error: error.message || error, context }),
  
  unexpectedLogout: (reason: string, sessionId?: string, userId?: string) => 
    sessionMonitor.logEvent('unexpected_logout', { reason }, sessionId, userId),
  
  networkError: (error: any, operation: string) => 
    sessionMonitor.logEvent('network_error', { error: error.message || error, operation })
};

export default sessionMonitor;