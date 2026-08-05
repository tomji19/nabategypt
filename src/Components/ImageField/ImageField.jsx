import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { uploadProductImage } from '../../supabase/storage';
import styles from './ImageField.module.css';

/**
 * Drag-and-drop / file picker + optional URL paste for product (or CMS) images.
 */
export default function ImageField({
  label = 'Image',
  value = '',
  onChange,
  folder = 'catalog',
  hint = 'Drop an image, browse, or paste a URL',
}) {
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const urlValue = typeof value === 'string' ? value : '';

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyFile = useCallback(
    async (file) => {
      if (!file || inFlightRef.current) return;
      inFlightRef.current = true;
      setError(null);
      setUploading(true);
      try {
        const publicUrl = await uploadProductImage(file, { folder });
        if (!mountedRef.current) return;
        onChange?.(publicUrl);
        toast.success('Image uploaded');
      } catch (err) {
        if (!mountedRef.current) return;
        const message = err?.message || 'Upload failed';
        setError(message);
        toast.error(message);
      } finally {
        inFlightRef.current = false;
        if (mountedRef.current) setUploading(false);
      }
    },
    [folder, onChange]
  );

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  return (
    <div className={styles.wrap}>
      {label && <span className={styles.label}>{label}</span>}

      <div
        className={`${styles.drop} ${dragging ? styles.dropActive : ''} ${
          uploading ? styles.dropBusy : ''
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {uploading && (
          <div className={styles.uploadingOverlay} role="status" aria-live="polite">
            Uploading…
          </div>
        )}

        {urlValue ? (
          <div className={styles.previewRow}>
            <img src={urlValue} alt="" className={styles.preview} />
            <div className={styles.previewMeta}>
              <p className={styles.previewTitle}>Image ready</p>
              <p className={styles.hint}>{hint}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.linkBtn}
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className={styles.linkBtnDanger}
                  disabled={uploading}
                  onClick={() => {
                    setError(null);
                    onChange?.('');
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <i className="fa-solid fa-cloud-arrow-up" aria-hidden />
            <p className={styles.previewTitle}>
              {uploading ? 'Uploading…' : 'Drag & drop an image'}
            </p>
            <p className={styles.hint}>{hint}</p>
            <button
              type="button"
              className={styles.browse}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.fileInput}
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) applyFile(file);
          }}
        />
      </div>

      <label className={styles.urlLabel}>
        <span>Or image URL</span>
        <input
          className={`input-box ${styles.urlInput}`}
          type="url"
          value={urlValue}
          placeholder="https://…"
          disabled={uploading}
          onChange={(e) => {
            setError(null);
            onChange?.(e.target.value);
          }}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
