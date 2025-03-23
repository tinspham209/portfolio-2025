import '@testing-library/jest-dom';

// Add proper type definitions for global
declare global {
  interface Window {
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
  }
}

// Use window instead of global for browser environment
window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 0);
};