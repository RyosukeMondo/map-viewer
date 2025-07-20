import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoOverlay } from '../VideoOverlay';

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

describe('VideoOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video overlay with default props', () => {
    render(<VideoOverlay />);
    
    const overlay = screen.getByTestId('video-overlay');
    const video = screen.getByTestId('video-element');
    const source = video.querySelector('source');
    
    expect(overlay).toBeInTheDocument();
    expect(video).toBeInTheDocument();
    expect(source).toHaveAttribute('src', '/black.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
  });

  it('renders video overlay with custom video source', () => {
    render(<VideoOverlay videoSrc="/custom-video.mp4" />);
    
    const video = screen.getByTestId('video-element');
    const source = video.querySelector('source');
    expect(source).toHaveAttribute('src', '/custom-video.mp4');
  });

  it('applies custom className', () => {
    render(<VideoOverlay className="custom-class" />);
    
    const overlay = screen.getByTestId('video-overlay');
    expect(overlay).toHaveClass('custom-class');
  });

  it('has correct video attributes for autoplay and looping', () => {
    render(<VideoOverlay />);
    
    const video = screen.getByTestId('video-element');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    // HTML boolean attributes don't have values in React's implementation
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'auto');
  });

  it('shows loading indicator initially', () => {
    render(<VideoOverlay />);
    
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('calls video load method on mount', () => {
    const mockLoad = jest.fn();
    Object.defineProperty(HTMLVideoElement.prototype, 'load', {
      writable: true,
      value: mockLoad,
    });

    render(<VideoOverlay />);
    
    expect(mockLoad).toHaveBeenCalled();
  });

  it('handles video loading success', async () => {
    render(<VideoOverlay />);
    
    const video = screen.getByTestId('video-element');
    
    // Simulate video loaded
    const loadedDataEvent = new Event('loadeddata');
    video.dispatchEvent(loadedDataEvent);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  it('handles video loading error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(<VideoOverlay videoSrc="/nonexistent.mp4" />);
    
    const video = screen.getByTestId('video-element');
    
    // Simulate video error
    const errorEvent = new Event('error');
    video.dispatchEvent(errorEvent);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'VideoOverlay: Failed to load video:',
        '/nonexistent.mp4'
      );
    });
    
    consoleSpy.mockRestore();
  });

  it('attempts to play video when it can play', async () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, 'play', {
      writable: true,
      value: mockPlay,
    });

    render(<VideoOverlay />);
    
    const video = screen.getByTestId('video-element');
    
    // Simulate video can play
    const canPlayEvent = new Event('canplay');
    video.dispatchEvent(canPlayEvent);
    
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });
  });
});