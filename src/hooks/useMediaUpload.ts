/**
 * useMediaUpload - Hook for handling media uploads with progress tracking
 */

import { useState, useCallback } from 'react';
import mediaService, { MediaItem, ProcessingStatus } from '@/services/mediaService';
import { toast } from '@/components/ui/use-toast';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  mediaId?: string;
  jobId?: string;
  hlsUrl?: string;
}

export function useMediaUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateFileStatus = useCallback((
    fileId: string, 
    updates: Partial<UploadFile>
  ) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  }, []);

  const uploadSingleFile = useCallback(async (uploadFile: UploadFile) => {
    try {
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 });

      // Get presigned URL
      const presignedData = await mediaService.getPresignedUrl(
        uploadFile.file.name,
        uploadFile.file.type || 'video/mp4'
      );

      // Upload to S3
      await mediaService.uploadToS3(
        uploadFile.file,
        presignedData,
        (progress) => {
          updateFileStatus(uploadFile.id, { progress: progress * 0.5 }); // 0-50% for upload
        }
      );

      updateFileStatus(uploadFile.id, { 
        status: 'processing', 
        progress: 50 
      });

      // Complete upload and start processing
      const uploadResponse = await mediaService.completeUpload(
        presignedData.object_key,
        uploadFile.file.name
      );

      updateFileStatus(uploadFile.id, { 
        jobId: uploadResponse.job_id,
        mediaId: uploadResponse.media_id
      });

      // Poll for processing status
      const finalStatus = await mediaService.pollProcessingStatus(
        uploadResponse.job_id,
        (status: ProcessingStatus) => {
          const processProgress = 50 + (status.progress * 0.5); // 50-100% for processing
          updateFileStatus(uploadFile.id, { 
            progress: processProgress,
            status: 'processing'
          });
        }
      );

      // Build HLS URL
      const hlsUrl = mediaService.buildHlsUrl(uploadResponse.media_id);

      updateFileStatus(uploadFile.id, { 
        status: 'completed',
        progress: 100,
        hlsUrl
      });

      toast({
        title: 'Upload Complete',
        description: `${uploadFile.file.name} has been processed successfully`,
      });

      return { success: true, mediaId: uploadResponse.media_id, hlsUrl };

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      
      updateFileStatus(uploadFile.id, { 
        status: 'error',
        error: errorMessage
      });

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  }, [updateFileStatus]);

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);

    const newFiles: UploadFile[] = files.map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'queued' as const
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially (could be parallel with limits)
    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile);
    }

    setIsUploading(false);
  }, [uploadSingleFile]);

  const removeFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  }, []);

  const retryFailed = useCallback(async () => {
    const failedFiles = uploadFiles.filter(f => f.status === 'error');
    
    for (const file of failedFiles) {
      await uploadSingleFile(file);
    }
  }, [uploadFiles, uploadSingleFile]);

  return {
    uploadFiles,
    isUploading,
    uploadFilesToQueue: uploadMultipleFiles,
    removeFile,
    clearCompleted,
    retryFailed
  };
}