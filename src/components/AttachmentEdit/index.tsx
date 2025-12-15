import React, { useState, useEffect } from 'react';
import { Button, Upload, Modal, Image, Space, Tag, Tooltip, message } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  PictureOutlined,
  FileTextOutlined,
  FileZipOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { Attachment } from '@/types';
import { useAttachmentContext } from '@/contexts/AttachmentContext';

interface AttachmentEditProps {
  value?: Attachment[];
  onChange?: (attachments: Attachment[]) => void;
  problemId?: number;
  disabled?: boolean;
  placeholder?: string;
}

const AttachmentEdit: React.FC<AttachmentEditProps> = ({
  value = [],
  onChange,
  problemId,
  disabled = false,
  placeholder = '点击上传附件'
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>(value);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const { addAttachment, removeAttachment, getAttachments } = useAttachmentContext();

  // 同步外部value变化
  React.useEffect(() => {
    setAttachments(value);
  }, [value]);

  // 同步附件状态到context
  useEffect(() => {
    if (problemId) {
      const contextAttachments = getAttachments(problemId);
      // 如果context中的附件与props不同，更新props
      if (JSON.stringify(contextAttachments) !== JSON.stringify(value)) {
        onChange?.(contextAttachments);
        setAttachments(contextAttachments);
      }
    }
  }, [problemId, value, getAttachments, onChange]);

  // 文件类型图标映射
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PictureOutlined style={{ color: '#52c41a' }} />;
    }
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FileTextOutlined style={{ color: '#1890ff' }} />;
    }
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
      return <FileZipOutlined style={{ color: '#fa8c16' }} />;
    }
    return <FileOutlined style={{ color: '#8c8c8c' }} />;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 自定义上传处理
  const handleUpload = async (options: any) => {
    const { file, onProgress, onSuccess, onError } = options;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (problemId) {
      formData.append('problemId', problemId.toString());
    }

    try {
      // 创建模拟上传过程
      const reader = new FileReader();
      reader.onload = async (e) => {
        // 模拟上传进度
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 20));
          onProgress({ percent: i }, file);
        }

        // 创建附件对象
        const newAttachment: Attachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fileName: `${Date.now()}_${file.name}`,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type,
          filePath: `/uploads/${Date.now()}_${file.name}`,
          uploadTime: new Date().toISOString(),
          uploadedBy: '当前用户',
          problemId,
          fileUrl: URL.createObjectURL(file),
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };

        const updatedAttachments = [...attachments, newAttachment];
        setAttachments(updatedAttachments);
        onChange?.(updatedAttachments);

        // 同步到context
        if (problemId) {
          addAttachment(problemId, newAttachment);
        }

        onSuccess(newAttachment, file);
        message.success(`${file.name} 上传成功`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传失败:', error);
      onError(error);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除附件
  const handleDelete = (attachmentId: string) => {
    const updatedAttachments = attachments.filter(att => att.id !== attachmentId);
    setAttachments(updatedAttachments);
    onChange?.(updatedAttachments);

    // 同步到context
    if (problemId) {
      removeAttachment(problemId, attachmentId);
    }

    message.success('附件已删除');
  };

  // 预览图片
  const handlePreview = (attachment: Attachment) => {
    if (attachment.previewUrl) {
      setPreviewImage(attachment.previewUrl);
      setPreviewTitle(attachment.originalName);
      setPreviewVisible(true);
    } else if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  // 下载附件
  const handleDownload = (attachment: Attachment) => {
    if (attachment.fileUrl) {
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 上传属性配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: handleUpload,
    showUploadList: false,
    disabled,
    accept: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar'
  };

  if (disabled) {
    // 只读模式 - 显示附件列表
    return (
      <div style={{ padding: '8px 0' }}>
        {attachments.length === 0 ? (
          <span style={{ color: '#999' }}>暂无附件</span>
        ) : (
          <Space size={4} wrap>
            {attachments.map((attachment) => (
              <Tag
                key={attachment.id}
                icon={getFileIcon(attachment.fileType)}
                closable={false}
                style={{
                  marginBottom: 4,
                  cursor: 'pointer',
                  maxWidth: '200px'
                }}
                onClick={() => handlePreview(attachment)}
                title={`${attachment.originalName} (${formatFileSize(attachment.fileSize)})`}
              >
                {attachment.originalName}
              </Tag>
            ))}
          </Space>
        )}
      </div>
    );
  }

  // 编辑模式
  return (
    <div style={{ padding: '8px 0' }}>
      {/* 上传按钮 */}
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          size="small"
          style={{ marginBottom: 8 }}
        >
          {uploading ? '上传中...' : placeholder}
        </Button>
      </Upload>

      {/* 附件列表 */}
      {attachments.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                marginBottom: 4,
                background: '#f5f5f5',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden'
              }}>
                {getFileIcon(attachment.fileType)}
                <span
                  style={{
                    marginLeft: 6,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handlePreview(attachment)}
                  title={attachment.originalName}
                >
                  {attachment.originalName}
                </span>
                <span style={{ color: '#999', marginLeft: 8 }}>
                  ({formatFileSize(attachment.fileSize)})
                </span>
              </div>
              <Space size={2}>
                {attachment.previewUrl && (
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(attachment)}
                    />
                  </Tooltip>
                )}
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(attachment.id)}
                  />
                </Tooltip>
              </Space>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览模态框 */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img
          alt={previewTitle}
          style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default AttachmentEdit;