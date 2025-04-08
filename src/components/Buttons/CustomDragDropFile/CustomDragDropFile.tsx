'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './CustomDragDropFile.module.css';
import Icon from '@/helpers/Icon';
import { useTranslations } from 'next-intl';

interface CustomDragDropFileProps {
  acceptedExtensions: string[];
  file: File | null;
  setFile: (file: File | null) => void;
  onFileUpload?: (file: File) => void;
}

export default function CustomDragDropFile({
  acceptedExtensions,
  onFileUpload,
  file,
  setFile,
}: CustomDragDropFileProps) {
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations('');

  useEffect(() => {
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [file]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setError('');

      const droppedFile = event.dataTransfer.files[0];
      if (!droppedFile) return;

      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
        setError('Недопустимий формат файлу');
        return;
      }

      setFile(droppedFile);
      onFileUpload?.(droppedFile);
    },
    [acceptedExtensions, onFileUpload, setFile]
  );

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
      setError('Недопустимий формат файлу');
      return;
    }

    setFile(selectedFile);
    onFileUpload?.(selectedFile);
  };

  return (
    <div
      className={styles.drop_zone}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={acceptedExtensions.map(ext => `.${ext}`).join(',')}
        onChange={handleFileSelect}
      />
      {!file ? (
        <>
          <div className={styles.icon_wrap}>
            <Icon
              className={styles.icon_upload}
              name="icon-cloud-download"
              width={24}
              height={24}
            />
          </div>
          <p className={styles.upload_text}>
            {t('Upload.modalUpload.uploadText.first')}
            <span>{t('Upload.modalUpload.uploadText.second')}</span>
            <strong>{t('Upload.modalUpload.uploadText.third')}</strong>
          </p>
        </>
      ) : (
        <div className={styles.file_container}>
          <div className={styles.file_info_wrap}>
            <div className={styles.icon_load_wrap}>
              <Icon
                className={styles.icon_load}
                name="icon-file-upload"
                width={40}
                height={40}
              />
              <span className={styles.icon_text}>
                {file.name.split('.').pop()}
              </span>
            </div>
            <div className={styles.file_info_text}>
              <span className={styles.file_name}>{file.name}</span>
              <span className={styles.file_size}>
                {Math.round(file.size / 1024)} KB
              </span>
            </div>
          </div>

          <button onClick={handleRemove} className={styles.remove_button}>
            <Icon
              className={styles.icon_close}
              name="icon-trash-button"
              width={16}
              height={16}
              color="#a9a9c1"
            />
          </button>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
