#!/bin/bash

# List of files that need DashboardLayout removed
files=(
  "src/pages/DashboardMinimal.tsx"
  "src/pages/AdminDashboard.tsx"
  "src/pages/Help/HelpCenter.tsx"
  "src/pages/Analytics/AnalyticsDashboard.tsx"
  "src/pages/StreamingLiveMinimal.tsx"
  "src/pages/Reactions.tsx"
  "src/pages/Analytics.tsx"
  "src/pages/Chat.tsx"
  "src/pages/Settings/Settings.tsx"
  "src/pages/Users/UserManagement.tsx"
  "src/pages/Streaming/StreamManager.tsx"
  "src/pages/UIComponentTest.tsx"
  "src/pages/AnalyticsSimple.tsx"
  "src/pages/DashboardEnhanced.tsx"
  "src/pages/EmbedGenerator.tsx"
  "src/pages/VODUpload.tsx"
  "src/pages/EventsWithDrawer.tsx"
  "src/pages/streaming/StreamHealthMonitor.tsx"
  "src/pages/streaming/RTMPConfiguration.tsx"
  "src/pages/streaming/HLSAdaptiveBitrate.tsx"
  "src/pages/streaming/WebRTCStreaming.tsx"
  "src/pages/Microsites/MicrositesBuilder.tsx"
  "src/pages/CMS/ContentScheduler.tsx"
  "src/pages/CMS/VODLibrary.tsx"
  "src/pages/CMS/AssetManager.tsx"
  "src/pages/Streaming.tsx"
  "src/pages/SAMLConfiguration.tsx"
  "src/pages/EventManagement.tsx"
  "src/pages/Integrations/IntegrationsHub.tsx"
  "src/pages/Documentation.tsx"
  "src/pages/MediaAssets.tsx"
  "src/pages/UserManagement.tsx"
  "src/pages/interactive/LivePolls.tsx"
  "src/pages/PlaylistManager.tsx"
  "src/pages/Notifications/NotificationCenter.tsx"
  "src/pages/WhiteLabel/WhiteLabelConfig.tsx"
  "src/pages/VideoPlayerTest.tsx"
  "src/pages/PollsQA.tsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  
  # Create a temporary file
  tmpfile=$(mktemp)
  
  # Process the file
  awk '
    BEGIN { in_layout = 0; brace_count = 0; skip_import = 0 }
    
    # Skip DashboardLayout import
    /^import.*DashboardLayout/ { skip_import = 1; next }
    /^import DashboardLayout/ { skip_import = 1; next }
    
    # Detect start of DashboardLayout
    /<DashboardLayout/ {
      in_layout = 1
      brace_count = 0
      # Replace with a simple div
      print "    <div className=\"p-6\">"
      next
    }
    
    # If we are inside DashboardLayout, track braces
    in_layout {
      # Count opening tags
      brace_count += gsub(/<[^\/][^>]*>/, "&")
      # Count closing tags
      brace_count -= gsub(/<\/[^>]*>/, "&")
      
      # Check if this is the closing DashboardLayout tag
      if (/<\/DashboardLayout>/) {
        in_layout = 0
        print "    </div>"
        next
      }
      
      # Otherwise print the line as-is
      print
      next
    }
    
    # Print all other lines
    !skip_import { print }
    skip_import = 0
  ' "$file" > "$tmpfile"
  
  # Move the temp file back
  mv "$tmpfile" "$file"
done

echo "All files processed!"