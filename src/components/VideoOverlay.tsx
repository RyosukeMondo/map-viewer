import React, { useRef, useEffect, useState } from 'react';
import styles from './VideoOverlay.module.css';

/**
 * Props interface for VideoOverlay component
 */
export interface VideoOverlayProps {
  /** Path to video file (default: '/black.mp4') */
  videoSrc?: string;
  /** Optional CSS classes */
  className?: string;
}

/**
 * VideoOverlay Component
 * 
 * Renders a looping video overlay over the map that is fully transparent
 * and allows map interactions to pass through. The video plays continuously
 * without user intervention and doesn't interfere with map functionality.
 * 
 * @param props - Component props
 * @returns JSX element for the video overlay
 */
export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  videoSrc = '/black.mp4',
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.warn('VideoOverlay: Failed to load video:', videoSrc);
    };

    const handleCanPlay = () => {
      // Ensure video starts playing
      video.play().catch((error) => {
        console.warn('VideoOverlay: Failed to autoplay video:', error);
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    // Load the video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoSrc]);

  // Don't render anything if there's an error
  if (hasError) {
    return null;
  }

  return (
    <div 
      className={`${styles['video-overlay']} ${className}`}
      data-testid="video-overlay"
    >
      <video
        ref={videoRef}
        className={styles['video-element']}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        data-testid="video-element"
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Fallback for browsers that don't support the video element */}
        Your browser does not support the video tag.
      </video>
      
      {isLoading && (
        <div 
          className={styles['loading-indicator']} 
          data-testid="loading-indicator"
        >
          {/* Loading indicator is also transparent and non-interactive */}
        </div>
      )}
    </div>
  );
};

export default VideoOverlay;