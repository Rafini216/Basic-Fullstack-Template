import React from 'react';

export default function PosterImage({ src, alt, className = '' }) {
  const onError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/poster-placeholder.svg';
  };
  return (
    <img src={src || '/poster-placeholder.svg'} alt={alt} onError={onError} className={className} />
  );
}
