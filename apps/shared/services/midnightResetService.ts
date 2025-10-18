/**
 * Midnight Reset Service
 * Automatically resets the queue counter at midnight (00:00)
 *
 * This service:
 * 1. Detects when the date changes to a new day
 * 2. Clears the UI state for the new day
 * 3. Triggers a page reload to fetch fresh data
 *
 * Note: The counter itself auto-resets because it's date-based (YYYY-MM-DD)
 * Old patient data remains in Firestore for historical records
 */

type ResetCallback = () => void;

class MidnightResetService {
  private lastCheckedDate: string;
  private checkInterval: NodeJS.Timeout | null = null;
  private callbacks: ResetCallback[] = [];

  constructor() {
    this.lastCheckedDate = this.getTodayDateString();
  }

  /**
   * Get today's date string in YYYY-MM-DD format
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Calculate milliseconds until next midnight
   */
  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  /**
   * Check if the date has changed
   */
  private checkDateChange(): void {
    const currentDate = this.getTodayDateString();

    if (currentDate !== this.lastCheckedDate) {
      if (import.meta.env.DEV) {
        console.log('🌅 NEW DAY DETECTED!');
        console.log(`Previous date: ${this.lastCheckedDate}`);
        console.log(`Current date: ${currentDate}`);
      }

      this.lastCheckedDate = currentDate;
      this.handleMidnightReset();
    }
  }

  /**
   * Handle midnight reset
   */
  private handleMidnightReset(): void {
    // Execute all registered callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('❌ Error executing reset callback:', error);
      }
    });

    // Show notification to user
    this.showResetNotification();

    // Reload the page after a short delay to fetch fresh data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  /**
   * Show notification to user about the reset
   */
  private showResetNotification(): void {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🌅</span>
        <div>
          <div>New Day Started!</div>
          <div style="font-size: 13px; font-weight: 400; opacity: 0.9; margin-top: 4px;">
            Queue reset for ${this.getTodayDateString()}
          </div>
        </div>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 2 seconds (before reload)
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  /**
   * Start the midnight reset checker
   */
  public start(): void {
    if (this.checkInterval) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Midnight reset service already running');
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log('🌙 Starting midnight reset service...');
      console.log(`Current date: ${this.lastCheckedDate}`);

      const msUntilMidnight = this.getMillisecondsUntilMidnight();
      const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60));
      const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`⏰ Next midnight in: ${hours}h ${minutes}m`);
    }

    // Check every minute if the date has changed
    // This is more reliable than trying to calculate exact midnight
    this.checkInterval = setInterval(() => {
      this.checkDateChange();
    }, 60 * 1000); // Check every 60 seconds

    // Also do an immediate check (in case app started after midnight)
    this.checkDateChange();
  }

  /**
   * Stop the midnight reset checker
   */
  public stop(): void {
    if (this.checkInterval) {
      if (import.meta.env.DEV) {
        console.log('🛑 Stopping midnight reset service...');
      }
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Register a callback to be executed when midnight reset happens
   */
  public onReset(callback: ResetCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get the current date being tracked
   */
  public getCurrentDate(): string {
    return this.lastCheckedDate;
  }

  /**
   * Force a manual check (useful for testing)
   */
  public checkNow(): void {
    this.checkDateChange();
  }
}

// Export singleton instance
export const midnightResetService = new MidnightResetService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).midnightReset = midnightResetService;
  if (import.meta.env.DEV) {
    console.log('🔧 Debug: window.midnightReset available');
    console.log('  - window.midnightReset.checkNow() - Force midnight check');
    console.log('  - window.midnightReset.getCurrentDate() - Get current date');
  }
}
