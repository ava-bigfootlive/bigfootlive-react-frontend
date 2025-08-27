/**
 * Media Service - Handles all media upload, processing, and playback operations
 */

import apiClient from './api';

export interface PresignedUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  object_key: string;
  expires_at: string;
}

export interface UploadCompleteResponse {
  status: string;
  media_id: string;
  job_id: string;
  object_key: string;
  message: string;
}

export interface ProcessingStatus {
  jobId: string;
  mediaId: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  hlsUrl?: string;
  thumbnails?: string[];
  captions?: Record<string, any>;
  audio?: Record<string, any>;
  outputs?: any[];
  error?: string;
  message?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  thumbnail_url?: string;
  processing_status: string;
  file_size: number;
  duration?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  hls_url?: string;
}

export interface UserMediaResponse {
  items: MediaItem[];
  total: number;
  skip: number;
  limit: number;
}

class MediaService {
  /**
   * Get presigned URL for S3 upload
   */
  async getPresignedUrl(filename: string, contentType: string = 'video/mp4'): Promise<PresignedUrlResponse> {
    return apiClient.request('/api/v1/media/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        content_type: contentType
      })
    });
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  async uploadToS3(
    file: File,
    presignedData: PresignedUrlResponse,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const formData = new FormData();
    
    // Add all fields from presigned response
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // File must be added last
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', presignedData.upload_url);
      xhr.send(formData);
    });
  }

  /**
   * Complete upload and trigger transcoding
   */
  async completeUpload(
    objectKey: string,
    title?: string,
    description?: string,
    streamId?: string
  ): Promise<UploadCompleteResponse> {
    return apiClient.request('/api/v1/media/upload/complete', {
      method: 'POST',
      body: JSON.stringify({
        object_key: objectKey,
        title,
        description,
        stream_id: streamId
      })
    });
  }

  /**
   * Get processing status for a job
   */
  async getProcessingStatus(jobId: string): Promise<ProcessingStatus> {
    return apiClient.request(`/api/v1/media/processing/status/${jobId}`);
  }

  /**
   * Poll for processing completion
   */
  async pollProcessingStatus(
    jobId: string,
    onProgress?: (status: ProcessingStatus) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<ProcessingStatus> {
    let attempts = 0;
    
    const poll = async (): Promise<ProcessingStatus> => {
      attempts++;
      
      const status = await this.getProcessingStatus(jobId);
      
      if (onProgress) {
        onProgress(status);
      }
      
      if (status.status === 'completed' || status.status === 'SUCCEEDED') {
        return status;
      }
      
      if (status.status === 'failed' || status.status === 'FAILED') {
        throw new Error(status.error || 'Processing failed');
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Processing timeout');
      }
      
      // Wait and poll again
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      return poll();
    };
    
    return poll();
  }

  /**
   * Get media details
   */
  async getMedia(mediaId: string): Promise<MediaItem> {
    return apiClient.request(`/api/v1/media/media/${mediaId}`);
  }

  /**
   * Get user's media
   */
  async getUserMedia(skip: number = 0, limit: number = 20): Promise<UserMediaResponse> {
    return apiClient.request(`/api/v1/media/user/media?skip=${skip}&limit=${limit}`);
  }

  /**
   * Build HLS URL for playback
   */
  buildHlsUrl(mediaId: string, tenantId?: string): string {
    // Use CloudFront CDN for HLS delivery
    const cdnUrl = 'https://d39hsmqppuzm82.cloudfront.net';
    const tenant = tenantId || 'default';
    return `${cdnUrl}/media/${tenant}/${mediaId}/master.m3u8`;
  }

  /**
   * Build thumbnail URL
   */
  buildThumbnailUrl(mediaId: string, tenantId?: string, index: number = 0): string {
    const cdnUrl = 'https://d39hsmqppuzm82.cloudfront.net';
    const tenant = tenantId || 'default';
    return `${cdnUrl}/media/${tenant}/${mediaId}/thumbnails/thumb_${String(index).padStart(3, '0')}.jpg`;
  }

  /**
   * Upload complete workflow
   */
  async uploadVideo(
    file: File,
    options: {
      title?: string;
      description?: string;
      onUploadProgress?: (progress: number) => void;
      onProcessingProgress?: (status: ProcessingStatus) => void;
    } = {}
  ): Promise<MediaItem> {
    // Step 1: Get presigned URL
    const presignedData = await this.getPresignedUrl(file.name, file.type || 'video/mp4');
    
    // Step 2: Upload to S3
    await this.uploadToS3(file, presignedData, options.onUploadProgress);
    
    // Step 3: Complete upload and start processing
    const uploadResponse = await this.completeUpload(
      presignedData.object_key,
      options.title || file.name,
      options.description
    );
    
    // Step 4: Poll for processing completion
    const processingStatus = await this.pollProcessingStatus(
      uploadResponse.job_id,
      options.onProcessingProgress
    );
    
    // Step 5: Get final media details
    return this.getMedia(uploadResponse.media_id);
  }
}

export default new MediaService();