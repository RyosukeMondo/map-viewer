import React from 'react';
import styles from './TimeoutToggle.module.css';

/**
 * Props interface for TimeoutToggle component
 */
export interface TimeoutToggleProps {
  /** Current timeout prevention state */
  isActive: boolean;
  /** Callback when toggle state changes */
  onToggle: (active: boolean) => void;
  /** Optional CSS classes */
  className?: string;
}

/**
 * TimeoutToggle Component
 * 
 * Provides a toggle button to prevent automatic cycling timeouts in the Google Maps viewer.
 * When active, it prevents all automatic country cycling and displays a visual indicator.
 * 
 * @param props - Component props
 * @returns JSX element for the timeout toggle button
 */
export const TimeoutToggle: React.FC<TimeoutToggleProps> = ({
  isActive,
  onToggle,
  className = ''
}) => {
  const handleToggle = () => {
    console.log('TimeoutToggle: Toggle button clicked, current state:', isActive);
    onToggle(!isActive);
  };

  return (
    <div className={`${styles['timeout-toggle']} ${className}`}>
      <button
        onClick={handleToggle}
        className={`${styles['toggle-button']} ${isActive ? styles.active : styles.inactive}`}
        title={isActive ? 'Disable timeout prevention' : 'Enable timeout prevention'}
        aria-label={isActive ? 'Disable timeout prevention' : 'Enable timeout prevention'}
        data-testid="timeout-toggle-button"
      >
        <span>
          {isActive ? '⏸️' : '⏰'}
        </span>
        <span>
          {isActive ? 'Timeout Prevented' : 'Allow Timeout'}
        </span>
      </button>
      
      {isActive && (
        <div className={styles['active-indicator']} data-testid="active-indicator">
          <span>
            🔒 Auto-cycling disabled
          </span>
        </div>
      )}
    </div>
  );
};



export default TimeoutToggle;