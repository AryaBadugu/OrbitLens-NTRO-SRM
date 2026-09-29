import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiImage, FiAlertCircle } from 'react-icons/fi';
import './UploadZone.css';

export default function UploadZone({ onFileSelect, compact = false }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('File dropped:', file.name, file.type, file.size);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/tiff': ['.tif', '.tiff'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`tactical-upload-zone ${compact ? 'compact' : ''} ${isDragActive ? 'drag-active' : ''} ${isDragReject ? 'drag-reject' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="upload-content font-mono">
        <div className="upload-icon-container">
          {isDragReject ? (
            <FiAlertCircle className="upload-icon danger" />
          ) : (
            <FiUploadCloud className="upload-icon cyan" />
          )}
        </div>
        
        <div className="upload-headline">
          {isDragActive
            ? 'DROP TARGET TILE'
            : compact ? 'DROP SATELLITE TILE' : 'DRAG & DROP SATELLITE TILE OR IMAGE'}
        </div>

        <div className="upload-subtext">
          {compact ? 'GeoTIFF (.tif), PNG, JPG' : 'Supports GeoTIFF (.tif, .tiff), PNG, JPEG (Up to 512×512 px)'}
        </div>

        {!compact && (
          <button className="browse-btn" type="button">
            <FiImage /> SELECT LOCAL FILE
          </button>
        )}
      </div>
    </div>
  );
}
