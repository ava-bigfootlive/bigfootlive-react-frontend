/**
 * CaptionEditor Component
 * Live caption correction interface for moderators with timing adjustment
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Edit3,
  Save,
  X,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Search,
  Download
} from 'lucide-react';

// Types
interface CaptionSegment {
  id: string;
  session_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  original_text: string;
  corrected_text?: string;
  final_text: string;
  confidence: number;
  language: string;
  speaker_id?: string;
  speaker_name?: string;
  is_corrected: boolean;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

interface CaptionCorrection {
  id: string;
  segment_id: string;
  original_text: string;
  corrected_text: string;
  correction_type: string;
  corrected_by: string;
  corrected_at: string;
  is_approved: boolean;
}

interface CaptionEditorProps {
  sessionId: string;
  className?: string;
  readonly?: boolean;
  onCorrectionSave?: (correction: Partial<CaptionCorrection>) => void;
  onCorrectionApprove?: (correctionId: string) => void;
}

interface EditingSegment extends CaptionSegment {
  editedText: string;
  editedStartTime: number;
  editedEndTime: number;
  hasChanges: boolean;
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({
  sessionId,
  className,
  readonly = false,
  onCorrectionSave,
  onCorrectionApprove
}) => {
  // State
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [corrections, setCorrections] = useState<CaptionCorrection[]>([]);
  const [editingSegment, setEditingSegment] = useState<EditingSegment | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'needs_review' | 'corrected' | 'low_confidence'>('all');
  const [autoSave, setAutoSave] = useState(true);
  const [showTimingEditor, setShowTimingEditor] = useState(false);

  // Refs
  const segmentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // WebSocket connections
  // Use WebSocket only when needed for captions, silent mode
  const { isConnected: isLiveConnected, subscribe } = useWebSocket({ autoConnect: false, silent: true });
  
  // Setup WebSocket subscriptions
  useEffect(() => {
    if (!sessionId) return;
    
    const unsubscribeLive = subscribe('captions', (message: any) => {
      if (message.type === 'captions') {
        setSegments(prev => {
          const newSegments = [...prev];
          message.captions.forEach((caption: CaptionSegment) => {
            const existingIndex = newSegments.findIndex(s => s.id === caption.id);
            if (existingIndex >= 0) {
              newSegments[existingIndex] = caption;
            } else {
              newSegments.push(caption);
            }
          });
          return newSegments.sort((a, b) => a.start_time - b.start_time);
        });
      }
    });
    
    const unsubscribeCorrection = subscribe('correction', (message: any) => {
      if (message.type === 'correction') {
        // Update segment with correction
        setSegments(prev => 
          prev.map(segment => 
            segment.id === message.segment_id 
              ? { ...segment, final_text: message.corrected_text, is_corrected: true }
              : segment
          )
        );
      }
    });
    
    return () => {
      unsubscribeLive();
      unsubscribeCorrection();
    };
  }, [sessionId, subscribe]);

  // Load existing segments and corrections
  useEffect(() => {
    loadSegments();
    loadCorrections();
  }, [sessionId]);

  const loadSegments = async () => {
    try {
      const response = await fetch(`/api/captions/sessions/${sessionId}/segments?limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Failed to load segments:', error);
    }
  };

  const loadCorrections = async () => {
    try {
      const response = await fetch(`/api/captions/sessions/${sessionId}/corrections`);
      if (response.ok) {
        const data = await response.json();
        setCorrections(data);
      }
    } catch (error) {
      console.error('Failed to load corrections:', error);
    }
  };

  // Filtered segments
  const filteredSegments = useMemo(() => {
    let filtered = segments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(segment =>
        segment.final_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'needs_review':
        filtered = filtered.filter(segment => segment.needs_review);
        break;
      case 'corrected':
        filtered = filtered.filter(segment => segment.is_corrected);
        break;
      case 'low_confidence':
        filtered = filtered.filter(segment => segment.confidence < 0.7);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => a.start_time - b.start_time);
  }, [segments, searchTerm, filterBy]);

  // Time formatting
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Start editing a segment
  const startEditing = (segment: CaptionSegment) => {
    if (readonly) return;

    setEditingSegment({
      ...segment,
      editedText: segment.final_text,
      editedStartTime: segment.start_time,
      editedEndTime: segment.end_time,
      hasChanges: false
    });
  };

  // Save correction
  const saveCorrection = async () => {
    if (!editingSegment || readonly) return;

    const hasTextChanged = editingSegment.editedText !== editingSegment.final_text;
    const hasTimingChanged = 
      editingSegment.editedStartTime !== editingSegment.start_time ||
      editingSegment.editedEndTime !== editingSegment.end_time;

    if (!hasTextChanged && !hasTimingChanged) {
      setEditingSegment(null);
      return;
    }

    try {
      const correctionData = {
        corrected_text: editingSegment.editedText,
        corrected_start_time: hasTimingChanged ? editingSegment.editedStartTime : undefined,
        corrected_end_time: hasTimingChanged ? editingSegment.editedEndTime : undefined,
        correction_reason: 'Manual correction'
      };

      const response = await fetch(`/api/captions/segments/${editingSegment.id}/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(correctionData)
      });

      if (response.ok) {
        const correction = await response.json();
        
        // Update local state
        setSegments(prev =>
          prev.map(segment =>
            segment.id === editingSegment.id
              ? {
                  ...segment,
                  final_text: editingSegment.editedText,
                  corrected_text: editingSegment.editedText,
                  start_time: editingSegment.editedStartTime,
                  end_time: editingSegment.editedEndTime,
                  is_corrected: true
                }
              : segment
          )
        );

        setCorrections(prev => [...prev, correction]);
        setEditingSegment(null);

        onCorrectionSave?.(correction);
      } else {
        throw new Error('Failed to save correction');
      }
    } catch (error) {
      console.error('Error saving correction:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSegment(null);
  };

  // Approve correction
  const approveCorrection = async (correctionId: string) => {
    if (readonly) return;

    try {
      const response = await fetch(`/api/captions/corrections/${correctionId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        setCorrections(prev =>
          prev.map(correction =>
            correction.id === correctionId
              ? { ...correction, is_approved: true }
              : correction
          )
        );

        onCorrectionApprove?.(correctionId);
      }
    } catch (error) {
      console.error('Error approving correction:', error);
    }
  };

  // Bulk operations
  const bulkCorrection = async (text: string) => {
    if (selectedSegments.size === 0 || readonly) return;

    try {
      const promises = Array.from(selectedSegments).map(segmentId => {
        const segment = segments.find(s => s.id === segmentId);
        if (!segment) return Promise.resolve();

        return fetch(`/api/captions/segments/${segmentId}/corrections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            corrected_text: text,
            correction_reason: 'Bulk correction'
          })
        });
      });

      await Promise.all(promises);
      setSelectedSegments(new Set());
      loadSegments();
      loadCorrections();
    } catch (error) {
      console.error('Error applying bulk corrections:', error);
    }
  };

  // Export corrections
  const exportCorrections = async () => {
    try {
      const response = await fetch(`/api/captions/sessions/${sessionId}/exports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'json',
          language: 'en-US',
          include_timestamps: true,
          include_speaker_labels: true,
          include_confidence_scores: true
        })
      });

      if (response.ok) {
        const exportData = await response.json();
        // Download would be handled by the export endpoint
        window.open(exportData.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting corrections:', error);
    }
  };

  // Segment component
  const SegmentCard: React.FC<{ segment: CaptionSegment; isSelected: boolean }> = ({ 
    segment, 
    isSelected 
  }) => {
    const isEditing = editingSegment?.id === segment.id;
    const hasCorrections = corrections.some(c => c.segment_id === segment.id);

    return (
      <Card
        ref={el => {
          if (el) {
            segmentRefs.current.set(segment.id, el);
          }
        }}
        className={cn(
          "p-3 mb-2 transition-all duration-200 hover:shadow-md cursor-pointer",
          isSelected && "ring-2 ring-blue-500",
          segment.needs_review && "border-l-4 border-l-yellow-500",
          segment.is_corrected && "border-l-4 border-l-green-500",
          segment.confidence < 0.7 && "border-l-4 border-l-red-500"
        )}
        onClick={() => !isEditing && setSelectedSegments(prev => {
          const newSet = new Set(prev);
          if (newSet.has(segment.id)) {
            newSet.delete(segment.id);
          } else {
            newSet.add(segment.id);
          }
          return newSet;
        })}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
            </Badge>
            {segment.speaker_name && (
              <Badge variant="secondary" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {segment.speaker_name}
              </Badge>
            )}
            <Badge 
              variant={segment.confidence > 0.8 ? 'default' : 'destructive'}
              className="text-xs"
            >
              {Math.round(segment.confidence * 100)}%
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {hasCorrections && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {segment.needs_review && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            {!readonly && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(segment);
                }}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editingSegment.editedText}
              onChange={(e) => 
                setEditingSegment(prev => prev ? {
                  ...prev,
                  editedText: e.target.value,
                  hasChanges: true
                } : null)
              }
              rows={3}
              className="resize-none"
            />

            {showTimingEditor && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingSegment.editedStartTime}
                    onChange={(e) =>
                      setEditingSegment(prev => prev ? {
                        ...prev,
                        editedStartTime: parseFloat(e.target.value) || 0,
                        hasChanges: true
                      } : null)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingSegment.editedEndTime}
                    onChange={(e) =>
                      setEditingSegment(prev => prev ? {
                        ...prev,
                        editedEndTime: parseFloat(e.target.value) || 0,
                        hasChanges: true
                      } : null)
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                onClick={() => setShowTimingEditor(!showTimingEditor)}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timing
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={saveCorrection}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed">{segment.final_text}</p>
            {segment.is_corrected && segment.original_text !== segment.final_text && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <span className="text-gray-500">Original:</span>
                <span className="ml-2 line-through text-gray-400">{segment.original_text}</span>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={cn("caption-editor", className)}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Caption Editor</h2>
            <Badge variant={isLiveConnected ? 'default' : 'destructive'}>
              {isLiveConnected ? 'Live' : 'Disconnected'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={exportCorrections}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            {!readonly && (
              <div className="flex items-center gap-2">
                <label className="text-sm">Auto-save</label>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search captions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Segments</option>
              <option value="needs_review">Needs Review</option>
              <option value="corrected">Corrected</option>
              <option value="low_confidence">Low Confidence</option>
            </select>
          </div>

          {selectedSegments.size > 0 && !readonly && (
            <Alert>
              <AlertDescription>
                {selectedSegments.size} segments selected.
                <Button
                  onClick={() => bulkCorrection('CORRECTED_TEXT')}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Bulk Correct
                </Button>
                <Button
                  onClick={() => setSelectedSegments(new Set())}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Clear Selection
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="segments" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="segments">
                Segments ({filteredSegments.length})
              </TabsTrigger>
              <TabsTrigger value="corrections">
                Corrections ({corrections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="segments" className="h-full">
              <ScrollArea className="h-full p-4">
                {filteredSegments.length > 0 ? (
                  <div>
                    {filteredSegments.map(segment => (
                      <SegmentCard
                        key={segment.id}
                        segment={segment}
                        isSelected={selectedSegments.has(segment.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No segments found matching your criteria.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="corrections" className="h-full">
              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {corrections.map(correction => (
                    <Card key={correction.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">
                          {new Date(correction.corrected_at).toLocaleTimeString()}
                        </Badge>
                        {!correction.is_approved && !readonly && (
                          <Button
                            onClick={() => approveCorrection(correction.id)}
                            variant="outline"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Original:</span>
                          <p className="text-sm line-through text-gray-400">{correction.original_text}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Corrected:</span>
                          <p className="text-sm text-green-600">{correction.corrected_text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Status bar */}
        <div className="p-2 border-t bg-gray-50 text-xs text-gray-600 flex justify-between">
          <span>
            {filteredSegments.length} segments • {corrections.length} corrections
          </span>
          <span>
            Session: {sessionId.slice(0, 8)}...
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaptionEditor;