import React from 'react';
import './Loader.css';

export interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  fullScreen?: boolean;
  className?: string;
  whiteBg?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  className = '',
  whiteBg = true
}) => {
  const sizePx =
    typeof size === 'number'
      ? size
      : size === 'xs'
      ? 14
      : size === 'sm'
      ? 20
      : size === 'lg'
      ? 40
      : 28;

  const content = (
    <div
      className={`careiq-loader-wrapper ${whiteBg ? 'bg-white' : ''} ${className}`}
      style={{ '--size': `${sizePx}px` } as React.CSSProperties}
    >
      <div className="careiq-boxes">
        <div className="careiq-box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="careiq-box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="careiq-box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="careiq-box">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-white z-50 p-6">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
