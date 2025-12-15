import React, { useState, useRef, useEffect } from 'react';
import { Upload, Button, List, message, Modal, Image, Space, Tag, Tooltip, Popconfirm } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  PictureOutlined,
  FileTextOutlined,
  FileZipOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { Attachment } from '@/types';
import { useAttachmentContext } from '@/contexts/AttachmentContext';

const { Dragger } = Upload;

interface AttachmentUploadProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  problemId?: number;
  approvalId?: number;
  disabled?: boolean;
  showSharedAttachments?: boolean;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  attachments = [],
  onAttachmentsChange,
  problemId,
  approvalId,
  disabled = false,
  showSharedAttachments = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const { addAttachment, removeAttachment, getAttachments } = useAttachmentContext();

  // 同步附件状态到context
  useEffect(() => {
    if (problemId) {
      const contextAttachments = getAttachments(problemId);
      // 如果context中的附件与props不同，更新props
      if (JSON.stringify(contextAttachments) !== JSON.stringify(attachments)) {
        onAttachmentsChange?.(contextAttachments);
      }
    }
  }, [problemId, attachments, getAttachments, onAttachmentsChange]);

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
    if (approvalId) {
      formData.append('approvalId', approvalId.toString());
    }

    try {
      // 创建模拟上传过程
      const reader = new FileReader();
      reader.onload = async (e) => {
        // 模拟上传进度
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
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
          approvalId,
          fileUrl: URL.createObjectURL(file),
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };

        const updatedAttachments = [...attachments, newAttachment];
        onAttachmentsChange(updatedAttachments);

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
    onAttachmentsChange(updatedAttachments);

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

  // 过滤出个人附件和共享附件
  const personalAttachments = attachments.filter(att => att.problemId === problemId);
  const sharedAttachments = attachments.filter(att => !att.problemId && att.approvalId === approvalId);

  return (
    <div className="attachment-upload">
      {/* 上传区域 */}
      {!disabled && (
        <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传。支持图片、文档、压缩包等格式。
          </p>
        </Dragger>
      )}

      {/* 个人附件 */}
      {personalAttachments.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>个人附件</span>
            <Tag color="blue">{personalAttachments.length}</Tag>
          </div>
          <List
            size="small"
            dataSource={personalAttachments}
            renderItem={(attachment) => (
              <List.Item
                actions={[
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(attachment)}
                    />
                  </Tooltip>,
                  <Tooltip title="下载">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                    />
                  </Tooltip>,
                  !disabled && (
                    <Popconfirm
                      title="确定删除此附件吗？"
                      onConfirm={() => handleDelete(attachment.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getFileIcon(attachment.fileType)}
                  title={
                    <Space>
                      <span>{attachment.originalName}</span>
                      {attachment.fileType.startsWith('image/') && (
                        <Tag color="green">图片</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space>
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(attachment.uploadTime).toLocaleString()}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* 共享附件 */}
      {showSharedAttachments && sharedAttachments.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>共享附件</span>
            <Tag color="orange">{sharedAttachments.length}</Tag>
            <span style={{ color: '#8c8c8c', fontSize: '12px', marginLeft: 8 }}>
              审批单所有漏洞共享
            </span>
          </div>
          <List
            size="small"
            dataSource={sharedAttachments}
            renderItem={(attachment) => (
              <List.Item
                actions={[
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(attachment)}
                    />
                  </Tooltip>,
                  <Tooltip title="下载">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                    />
                  </Tooltip>,
                  !disabled && (
                    <Popconfirm
                      title="确定删除此共享附件吗？删除后该审批单中的所有漏洞都将失去此附件。"
                      onConfirm={() => handleDelete(attachment.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getFileIcon(attachment.fileType)}
                  title={
                    <Space>
                      <span>{attachment.originalName}</span>
                      <Tag color="orange">共享</Tag>
                      {attachment.fileType.startsWith('image/') && (
                        <Tag color="green">图片</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space>
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(attachment.uploadTime).toLocaleString()}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
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

export default AttachmentUpload;