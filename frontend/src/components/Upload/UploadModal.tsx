import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import api from '../../services/api';
import type { UploadFormInputs } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }: UploadModalProps) => {
  const { register, handleSubmit, reset } = useForm<UploadFormInputs>();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // ファイル選択時のプレビュー処理
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // アップロード処理
  const onSubmit: SubmitHandler<UploadFormInputs> = async (data) => {
    // data.file は FileList 型なので安全にアクセス可能
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
      reset();
      setPreviewUrl(null);
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  // register関数の戻り値を変数に格納
  const fileUploadRegister = register('file', { required: true });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>画像をアップロード</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ファイル入力 */}
          <input
            type="file"
            accept="image/*"
            style={{ marginBottom: '10px' }}
            {...fileUploadRegister}
            onChange={(e) => {
              fileUploadRegister.onChange(e);
              onFileChange(e);
            }}
          />

          {/* プレビュー表示 */}
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="preview-image" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
          )}

          {/* ボタンエリア */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              style={{ flex: 1, backgroundColor: '#ccc', color: 'black' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isUploading || !previewUrl}
              style={{ flex: 1 }}
            >
              {isUploading ? '送信中...' : 'アップロード'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};