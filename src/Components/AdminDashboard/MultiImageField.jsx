import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { uploadProductImages } from '../../supabase/storage';
import styles from '../ImageField/ImageField.module.css';

/**
 * Pick / drop multiple images at once for the product gallery.
 */
export default function MultiImageField({
  label = 'Extra photos',
  values = [],
  onChange,
  folder = 'catalog',
  hint = 'Select several images at once',
}) {
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const urls = Array.isArray(values)
    ? values.map((v) => String(v || '').trim()).filter(Boolean)
    : [];

  const applyFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter((f) =>
        /^image\//.test(f.type)
      );
      if (!files.length || uploading) return;
      setUploading(true);
      try {
        const { urls: added, errors } = await uploadProductImages(files, {
          folder,
        });
        if (!mountedRef.current) return;
        if (added.length) {
          onChange?.([...urls, ...added]);
          toast.success(
            added.length === 1
              ? '1 image added'
              : `${added.length} images added`
          );
        }
        if (errors?.length) {
          toast.warn(`${errors.length} image(s) failed to upload`);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        toast.error(err?.message || 'Upload failed');
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [folder, onChange, uploading, urls]
  );

  return (
    <div className={styles.wrap}>
      {label ? <span className={styles.label}>{label}</span> : null}

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
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          applyFiles(e.dataTransfer.files);
        }}
      >
        {uploading && (
          <div className={styles.uploadingOverlay} role="status">
            Uploading…
          </div>
        )}
        <div className={styles.empty}>
          <i className="fa-solid fa-images" aria-hidden />
          <p className={styles.previewTitle}>
            {uploading ? 'Uploading…' : 'Drop several photos here'}
          </p>
          <p className={styles.hint}>{hint}</p>
          <button
            type="button"
            className={styles.browse}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Choose images
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className={styles.fileInput}
          disabled={uploading}
          onChange={(e) => {
            applyFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {urls.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="relative aspect-square overflow-hidden border border-nabat-border bg-nabat-mist">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 bg-white/95 px-1.5 py-0.5 font-nav text-[10px] text-red-600"
                onClick={() =>
                  onChange?.(urls.filter((_, i) => i !== index))
                }
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
