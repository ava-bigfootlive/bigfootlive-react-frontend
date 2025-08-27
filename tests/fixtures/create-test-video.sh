#!/bin/bash
# Create a small test video for E2E testing

if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg not installed, creating placeholder file"
    echo "Test video content" > test-video.mp4
else
    # Create a 5-second test video
    ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=30 \
           -f lavfi -i sine=frequency=1000:duration=5 \
           -c:v libx264 -c:a aac -b:v 100k -b:a 64k \
           test-video.mp4 -y 2>/dev/null
    echo "Created test video with FFmpeg"
fi