#!/usr/bin/env python3
import os
import re

def fix_file(filepath):
    """Fix a single file by removing DashboardLayout wrapper"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove DashboardLayout import
    content = re.sub(r"import.*?DashboardLayout.*?from.*?['\"].*?['\"];?\n", "", content)
    content = re.sub(r"import DashboardLayout.*?from.*?['\"].*?['\"];?\n", "", content)
    
    # Find and replace DashboardLayout tags
    # Match opening tag with any props
    pattern = r'<DashboardLayout[^>]*>\s*'
    if re.search(pattern, content):
        # Replace opening tag with div
        content = re.sub(pattern, '<div className="p-6">\n', content)
        # Replace closing tag
        content = re.sub(r'</DashboardLayout>', '</div>', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Fixed: {filepath}")

# List of files to fix
files = [
    "src/pages/AdminDashboard.tsx",
    "src/pages/Help/HelpCenter.tsx",
    "src/pages/Analytics/AnalyticsDashboard.tsx",
    "src/pages/StreamingLiveMinimal.tsx",
    "src/pages/Reactions.tsx",
    "src/pages/Analytics.tsx",
    "src/pages/Chat.tsx",
    "src/pages/Settings/Settings.tsx",
    "src/pages/Users/UserManagement.tsx",
    "src/pages/Streaming/StreamManager.tsx",
    "src/pages/UIComponentTest.tsx",
    "src/pages/AnalyticsSimple.tsx",
    "src/pages/DashboardEnhanced.tsx",
    "src/pages/EmbedGenerator.tsx",
    "src/pages/VODUpload.tsx",
    "src/pages/EventsWithDrawer.tsx",
    "src/pages/streaming/StreamHealthMonitor.tsx",
    "src/pages/streaming/RTMPConfiguration.tsx",
    "src/pages/streaming/HLSAdaptiveBitrate.tsx",
    "src/pages/streaming/WebRTCStreaming.tsx",
    "src/pages/Microsites/MicrositesBuilder.tsx",
    "src/pages/CMS/ContentScheduler.tsx",
    "src/pages/CMS/VODLibrary.tsx",
    "src/pages/CMS/AssetManager.tsx",
    "src/pages/Streaming.tsx",
    "src/pages/SAMLConfiguration.tsx",
    "src/pages/EventManagement.tsx",
    "src/pages/Integrations/IntegrationsHub.tsx",
    "src/pages/Documentation.tsx",
    "src/pages/MediaAssets.tsx",
    "src/pages/UserManagement.tsx",
    "src/pages/interactive/LivePolls.tsx",
    "src/pages/PlaylistManager.tsx",
    "src/pages/Notifications/NotificationCenter.tsx",
    "src/pages/WhiteLabel/WhiteLabelConfig.tsx",
    "src/pages/VideoPlayerTest.tsx",
    "src/pages/PollsQA.tsx"
]

for file in files:
    filepath = os.path.join("/home/ava-io/repos/bigfootlive-react-frontend", file)
    if os.path.exists(filepath):
        fix_file(filepath)
    else:
        print(f"File not found: {filepath}")

print("\nAll files processed!")