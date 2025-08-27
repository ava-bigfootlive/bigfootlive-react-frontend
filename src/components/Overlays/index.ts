/**
 * BigFootLive Overlay System Components
 * 
 * A comprehensive overlay system for live streaming with support for:
 * - Lower thirds (speaker identification)
 * - Chyrons (news tickers)
 * - Full screen graphics
 * - Corner bugs and logos
 * - Countdown timers
 * - Data display overlays
 */

export { OverlayDesigner } from './OverlayDesigner';
export { OverlayControl } from './OverlayControl';
export { OverlayTemplateLibrary } from './OverlayTemplateLibrary';

// Export overlay-related hooks
export { useOverlayWebSocket } from '../../hooks/useOverlayWebSocket';

// Export overlay types for TypeScript support
export type {
  OverlayTemplate,
  OverlayContent,
  OverlayQueueItem,
  OverlayPreset
} from './OverlayControl';  // These types are defined in OverlayControl

/**
 * Usage Examples:
 * 
 * 1. Overlay Designer (for creating templates):
 * ```tsx
 * import { OverlayDesigner } from '@/components/Overlays';
 * 
 * <OverlayDesigner 
 *   onSave={handleTemplateSave}
 *   onPreview={handlePreview}
 * />
 * ```
 * 
 * 2. Live Overlay Control (for operators):
 * ```tsx
 * import { OverlayControl } from '@/components/Overlays';
 * 
 * <OverlayControl 
 *   eventId="event_123"
 *   onTemplateCreate={handleTemplateCreate}
 * />
 * ```
 * 
 * 3. Template Library (for browsing templates):
 * ```tsx
 * import { OverlayTemplateLibrary } from '@/components/Overlays';
 * 
 * <OverlayTemplateLibrary
 *   onSelectTemplate={handleTemplateSelect}
 *   onEditTemplate={handleTemplateEdit}
 * />
 * ```
 * 
 * 4. WebSocket Integration (for real-time updates):
 * ```tsx
 * import { useOverlayWebSocket } from '@/components/Overlays';
 * 
 * const { isConnected, triggerOverlay } = useOverlayWebSocket({
 *   eventId: "event_123",
 *   onQueueUpdate: handleQueueUpdate,
 *   onStatusChange: handleStatusChange
 * });
 * ```
 */