import React, { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import useLoaderStore from '../../hooks/useLoaderStore';
import './SmartLoader.css';

/**
 * A smart loader that differentiates between the initial long download
 * and subsequent fast parses on navigation.
 */
export function SmartLoader() {
  const { active, progress } = useProgress();
  const { isInitialLoadComplete, setInitialLoadComplete } = useLoaderStore();

  useEffect(() => {
    // Once the main loading sequence is done, mark it as complete globally.
    if (progress === 100 && !isInitialLoadComplete) {
      setInitialLoadComplete();
    }
  }, [progress, isInitialLoadComplete, setInitialLoadComplete]);

  // If the initial load is complete, we don't want to show the loader
  // for the brief parsing that happens on navigation. So we render nothing.
  if (isInitialLoadComplete && active) {
    return null;
  }

  // Calculate circular progress offset for the SVG
  const circumference = 2 * Math.PI * 140; // 2 * PI * r
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`smart-loader-container ${!active ? 'finished' : ''}`}>
      <div className="shutter shutter-top"></div>
      <div className="shutter shutter-bottom"></div>

      <div className="loader-content">
        <div className="loader-rings">
          <div className="ring ring-outer"></div>
          <div className="ring ring-inner"></div>
        </div>

        <svg className="progress-svg" viewBox="0 0 300 300">
          <circle
            className="progress-circle-bg"
            cx="150" cy="150" r="140"
          />
          <circle
            className="progress-circle-bar"
            cx="150" cy="150" r="140"
            style={{ strokeDashoffset: offset }}
          />
        </svg>

        <div className="loader-text">
          <h2 className="loader-title">ACSES</h2>
          <span className="loader-percentage">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
