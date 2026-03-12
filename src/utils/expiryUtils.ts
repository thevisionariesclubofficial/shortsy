/**
 * Utility functions for calculating and formatting rental expiry information
 */

interface ExpiryInfo {
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  displayText: string;
  urgency: 'expired' | 'urgent' | 'warning' | 'safe'; // urgent: < 1 hour, warning: 1-24 hours, safe: > 1 day
}

/**
 * Calculate time remaining until expiry
 * @param expiresAt ISO 8601 datetime string
 * @returns ExpiryInfo object with calculated values and display text
 */
export function calculateExpiry(expiresAt: string): ExpiryInfo {
  const now = new Date();
  const expiry = new Date(expiresAt);
  
  const totalMs = expiry.getTime() - now.getTime();
  
  // Check if already expired
  if (totalMs <= 0) {
    return {
      isExpired: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      displayText: 'Expired',
      urgency: 'expired',
    };
  }
  
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  
  const minutesRemaining = totalMinutes % 60;
  const hoursRemaining = totalHours % 24;
  const daysRemaining = totalDays;
  
  // Determine display text and urgency
  let displayText: string;
  let urgency: 'urgent' | 'warning' | 'safe' = 'safe';
  
  if (totalHours < 1) {
    // Less than 1 hour - show minutes
    displayText = `${minutesRemaining}m left to watch`;
    urgency = 'urgent';
  } else if (totalHours < 24) {
    // Less than 24 hours - show hours
    displayText = `${hoursRemaining}h left to watch`;
    urgency = totalHours < 6 ? 'urgent' : 'warning';
  } else if (totalDays === 1) {
    // Exactly 1 day or less
    displayText = 'Expires today';
    urgency = 'warning';
  } else {
    // More than 1 day
    displayText = `${daysRemaining}d left to watch`;
    urgency = daysRemaining <= 1 ? 'warning' : 'safe';
  }
  
  return {
    isExpired: false,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    displayText,
    urgency,
  };
}

/**
 * Get color for expiry badge based on urgency
 * @param urgency Urgency level
 * @returns Color code string
 */
export function getExpiryColor(urgency: 'expired' | 'urgent' | 'warning' | 'safe'): string {
  switch (urgency) {
    case 'expired':
      return '#8B0000'; // Dark red
    case 'urgent':
      return '#DC143C'; // Crimson red
    case 'warning':
      return '#FF8C00'; // Dark orange
    case 'safe':
      return '#4CAF50'; // Green
  }
}
