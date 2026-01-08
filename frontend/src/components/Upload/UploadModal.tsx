import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import api from '../../lib/axios';
import type { UploadFormInputs } from '../../types';
import styles from './UploadModal.module.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

// ------------------------------------------------------------------
// UploadModal：画像ファイルを選択し、プレビュー表示とアップロードを行う
// ------------------------------------------------------------------

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }: UploadModalProps) => {

  // --- Hooks & States ---
  const { register, handleSubmit, reset } = useForm<UploadFormInputs>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // モーダルが閉じていれば何も描画しない
  if (!isOpen) return null;

  // --- Handlers ---
  // ファイル選択時のプレビュー処理
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 閉じる処理（Stateのリセットを含む）
  const handleClose = () => {
    reset();
    setPreviewUrl(null);
    onClose();
  };

  // アップロード送信処理
  const onSubmit: SubmitHandler<UploadFormInputs> = async (data) => {
    const file = data.file[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('アップロード完了！');
      handleClose();
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // react-hook-form の登録（onChangeをカスタマイズするため変数化）
  const fileUploadRegister = register('file', { required: true });

  // --- Render ---
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>画像をアップロード</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ファイル入力 */}
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            {...fileUploadRegister}
            onChange={(e) => {
              fileUploadRegister.onChange(e);
              onFileChange(e);
            }}
          />

          {/* プレビュー */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className={styles.previewImage}
            />
          )}

          {/* ボタン */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className={styles.cancelButton}
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={isUploading || !previewUrl}
              className={styles.submitButton}
            >
              {isUploading ? '送信中...' : 'アップロード'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};