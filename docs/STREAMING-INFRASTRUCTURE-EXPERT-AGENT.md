# Video Streaming & Container Infrastructure Expert Agent

## Agent Profile

**Name**: Streaming Infrastructure Architect  
**Specialization**: Live Video Streaming, Container Orchestration, Observability & Performance  
**Role**: Design, implement, and optimize containerized live streaming infrastructure with comprehensive monitoring and testing

## Core Competencies

### 1. Video Streaming Technologies
- **FFmpeg Mastery**: Transcoding, filtering, streaming protocols
- **SRS Server**: RTMP/WebRTC/HLS streaming server configuration
- **Protocol Expertise**: RTMP, HLS, DASH, WebRTC, SRT
- **Adaptive Bitrate**: Multi-quality stream generation
- **Low Latency Streaming**: Sub-second latency optimization

### 2. Backend Development
- **FastAPI**: High-performance Python API development
- **Async Programming**: Concurrent request handling
- **WebSocket Management**: Real-time bidirectional communication
- **Background Tasks**: Queue-based processing
- **Database Integration**: PostgreSQL, Redis, TimescaleDB

### 3. Observability Stack
- **Grafana**: Dashboards and visualization
- **Mimir**: Time series metrics at scale
- **Loki**: Log aggregation and querying
- **Tempo**: Distributed tracing
- **Pyroscope**: Continuous profiling
- **OnCall**: Incident management

### 4. Container Orchestration
- **Docker**: Container creation and optimization
- **Docker Compose**: Multi-container applications
- **Kubernetes**: Production orchestration
- **Resource Management**: CPU, memory, GPU allocation
- **Service Mesh**: Inter-service communication

### 5. Performance Testing
- **k6 Load Testing**: Stress, spike, soak testing
- **Performance Metrics**: Latency, throughput, error rates
- **Scalability Testing**: Concurrent viewer limits
- **Chaos Engineering**: Resilience testing

## Technical Architecture

### Live Event Container Architecture

```yaml
# docker-compose.yml for Live Event Container
version: '3.8'

services:
  # SRS Streaming Server
  srs:
    image: ossrs/srs:5
    container_name: event-srs
    ports:
      - "1935:1935"    # RTMP
      - "1985:1985"    # HTTP API
      - "8080:8080"    # HTTP-FLV/HLS
      - "8000:8000/udp" # WebRTC
    volumes:
      - ./conf/srs.conf:/usr/local/srs/conf/srs.conf
      - stream-data:/usr/local/srs/objs
    environment:
      - SRS_LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1985/api/v1/versions"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - streaming-network

  # FFmpeg Transcoder
  transcoder:
    build:
      context: .
      dockerfile: Dockerfile.ffmpeg
    container_name: event-transcoder
    depends_on:
      - srs
    volumes:
      - stream-data:/data
    environment:
      - RTMP_INPUT=rtmp://srs:1935/live
      - HLS_OUTPUT=/data/hls
    command: ["/scripts/transcode.sh"]
    networks:
      - streaming-network

  # FastAPI Backend
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: event-api
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/streaming
      - REDIS_URL=redis://redis:6379
      - SRS_API=http://srs:1985
    depends_on:
      - postgres
      - redis
      - srs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - streaming-network

  # PostgreSQL with TimescaleDB
  postgres:
    image: timescale/timescaledb:latest-pg15
    container_name: event-postgres
    environment:
      - POSTGRES_USER=streaming
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=streaming
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - streaming-network

  # Redis for caching and pub/sub
  redis:
    image: redis:7-alpine
    container_name: event-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - streaming-network

  # Grafana Agent for metrics collection
  grafana-agent:
    image: grafana/agent:latest
    container_name: event-grafana-agent
    volumes:
      - ./conf/agent.yaml:/etc/agent/agent.yaml
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command:
      - -config.file=/etc/agent/agent.yaml
      - -metrics.wal-directory=/tmp/agent/wal
    networks:
      - streaming-network

volumes:
  stream-data:
  postgres-data:
  redis-data:

networks:
  streaming-network:
    driver: bridge
```

### FFmpeg Streaming Pipeline

```python
# ffmpeg_pipeline.py
import asyncio
import subprocess
from typing import Optional, List, Dict
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

class StreamConfig(BaseModel):
    input_url: str
    output_formats: List[str] = ["hls", "dash", "rtmp"]
    video_bitrates: List[str] = ["3000k", "1500k", "750k", "400k"]
    audio_bitrate: str = "128k"
    preset: str = "veryfast"
    gop_size: int = 60
    segment_duration: int = 2

class FFmpegPipeline:
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
    
    async def start_transcoding(self, stream_id: str, config: StreamConfig):
        """Start multi-bitrate transcoding pipeline"""
        
        # Build FFmpeg command for ABR streaming
        cmd = [
            'ffmpeg',
            '-i', config.input_url,
            '-c:v', 'libx264',
            '-preset', config.preset,
            '-g', str(config.gop_size),
            '-sc_threshold', '0',
            '-c:a', 'aac',
            '-ar', '48000',
            '-ac', '2'
        ]
        
        # Add video outputs for each bitrate
        for i, bitrate in enumerate(config.video_bitrates):
            height = self._calculate_height(bitrate)
            cmd.extend([
                '-map', '0:v:0',
                '-map', '0:a:0',
                f'-filter:v:{i}', f'scale=-2:{height}',
                f'-b:v:{i}', bitrate,
                f'-maxrate:v:{i}', f'{int(bitrate[:-1]) * 1.5}k',
                f'-bufsize:v:{i}', f'{int(bitrate[:-1]) * 2}k',
                f'-b:a:{i}', config.audio_bitrate
            ])
        
        # HLS output configuration
        if "hls" in config.output_formats:
            cmd.extend([
                '-f', 'hls',
                '-hls_time', str(config.segment_duration),
                '-hls_list_size', '10',
                '-hls_flags', 'delete_segments+append_list',
                '-hls_segment_type', 'mpegts',
                '-hls_segment_filename', f'/data/hls/{stream_id}_%v/segment_%03d.ts',
                '-master_pl_name', f'{stream_id}_master.m3u8',
                '-var_stream_map', self._build_stream_map(len(config.video_bitrates)),
                f'/data/hls/{stream_id}_%v/playlist.m3u8'
            ])
        
        # Start FFmpeg process
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        self.processes[stream_id] = process
        
        # Monitor process in background
        asyncio.create_task(self._monitor_process(stream_id, process))
        
        return {"stream_id": stream_id, "status": "transcoding_started"}
    
    def _calculate_height(self, bitrate: str) -> int:
        """Calculate video height based on bitrate"""
        bitrate_map = {
            "3000k": 1080,
            "1500k": 720,
            "750k": 480,
            "400k": 360
        }
        return bitrate_map.get(bitrate, 720)
    
    def _build_stream_map(self, num_streams: int) -> str:
        """Build HLS variant stream map"""
        return ' '.join([f'v:{i},a:{i}' for i in range(num_streams)])
    
    async def _monitor_process(self, stream_id: str, process: subprocess.Popen):
        """Monitor FFmpeg process and log output"""
        while process.poll() is None:
            if process.stderr:
                line = process.stderr.readline()
                if line:
                    # Parse FFmpeg output for metrics
                    await self._parse_ffmpeg_metrics(stream_id, line)
            await asyncio.sleep(0.1)
        
        # Process ended
        if process.returncode != 0:
            print(f"FFmpeg process {stream_id} failed with code {process.returncode}")
    
    async def _parse_ffmpeg_metrics(self, stream_id: str, line: str):
        """Parse FFmpeg output for metrics"""
        # Extract frame, fps, bitrate, etc.
        if "frame=" in line:
            metrics = self._extract_metrics(line)
            await self._send_metrics_to_mimir(stream_id, metrics)
    
    def stop_transcoding(self, stream_id: str):
        """Stop transcoding process"""
        if stream_id in self.processes:
            self.processes[stream_id].terminate()
            del self.processes[stream_id]
            return {"stream_id": stream_id, "status": "stopped"}
        return {"error": "Stream not found"}
```

### SRS Configuration

```conf
# srs.conf - SRS Streaming Server Configuration
listen              1935;
max_connections     1000;
daemon              off;
srs_log_tank        console;

http_api {
    enabled         on;
    listen          1985;
    crossdomain     on;
}

http_server {
    enabled         on;
    listen          8080;
    dir             ./objs/nginx/html;
}

stats {
    network         0;
    disk            sda sdb xvda xvdb;
}

vhost __defaultVhost__ {
    # RTMP configuration
    enabled         on;
    gop_cache       on;
    queue_length    10;
    min_latency     on;
    mr {
        enabled     on;
        latency     350;
    }
    
    # HLS output
    hls {
        enabled         on;
        hls_path        ./objs/nginx/html;
        hls_fragment    2;
        hls_window      10;
        hls_on_error    continue;
        hls_storage     disk;
        hls_cleanup     on;
        hls_dispose     30;
        hls_wait_keyframe on;
    }
    
    # HTTP-FLV output
    http_remux {
        enabled     on;
        mount       [vhost]/[app]/[stream].flv;
    }
    
    # DVR recording
    dvr {
        enabled         on;
        dvr_path        ./objs/nginx/html/[app]/[stream]/[timestamp].flv;
        dvr_plan        segment;
        dvr_duration    30;
        dvr_wait_keyframe on;
    }
    
    # Transcode settings
    transcode {
        enabled     on;
        ffmpeg      /usr/local/bin/ffmpeg;
        
        engine 720p {
            enabled         on;
            vfilter {
                v               quiet;
            }
            vcodec          libx264;
            vbitrate        1500;
            vfps            30;
            vwidth          1280;
            vheight         720;
            vthreads        4;
            vprofile        main;
            vpreset         veryfast;
            acodec          aac;
            abitrate        128;
            asample_rate    44100;
            achannels       2;
            output          rtmp://127.0.0.1/live/[stream]_720p;
        }
        
        engine 480p {
            enabled         on;
            vcodec          libx264;
            vbitrate        750;
            vfps            30;
            vwidth          854;
            vheight         480;
            vthreads        2;
            vprofile        main;
            vpreset         veryfast;
            acodec          aac;
            abitrate        96;
            asample_rate    44100;
            achannels       2;
            output          rtmp://127.0.0.1/live/[stream]_480p;
        }
        
        engine 360p {
            enabled         on;
            vcodec          libx264;
            vbitrate        400;
            vfps            30;
            vwidth          640;
            vheight         360;
            vthreads        1;
            vprofile        baseline;
            vpreset         veryfast;
            acodec          aac;
            abitrate        64;
            asample_rate    44100;
            achannels       2;
            output          rtmp://127.0.0.1/live/[stream]_360p;
        }
    }
    
    # Forward to other servers
    forward {
        enabled on;
        destination rtmp://backup-server.example.com/live;
    }
    
    # Security
    security {
        enabled on;
        deny publish all;
        allow publish 127.0.0.1;
        allow publish 192.168.0.0/16;
        allow play all;
    }
}
```

### FastAPI Streaming Backend

```python
# main.py - FastAPI Streaming Application
from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import aiohttp
import asyncpg
import redis.asyncio as redis
from datetime import datetime, timedelta
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Live Event Streaming API", version="1.0.0")

# Database connection pool
db_pool: Optional[asyncpg.Pool] = None
# Redis client
redis_client: Optional[redis.Redis] = None

# Pydantic models
class StreamEvent(BaseModel):
    event_id: str
    title: str
    description: Optional[str]
    scheduled_start: datetime
    scheduled_end: datetime
    stream_key: str
    max_viewers: int = 10000
    bitrates: List[str] = ["3000k", "1500k", "750k", "400k"]
    recording_enabled: bool = True

class StreamMetrics(BaseModel):
    event_id: str
    timestamp: datetime
    viewers: int
    bitrate: float
    fps: float
    dropped_frames: int
    cpu_usage: float
    memory_usage: float
    bandwidth_in: float
    bandwidth_out: float

class ViewerSession(BaseModel):
    session_id: str
    event_id: str
    user_id: Optional[str]
    ip_address: str
    user_agent: str
    quality: str
    buffer_health: float
    latency: float

@app.on_event("startup")
async def startup():
    global db_pool, redis_client
    
    # Initialize database connection pool
    db_pool = await asyncpg.create_pool(
        "postgresql://streaming:password@postgres:5432/streaming",
        min_size=10,
        max_size=20
    )
    
    # Initialize Redis client
    redis_client = redis.from_url(
        "redis://redis:6379",
        encoding="utf-8",
        decode_responses=True
    )
    
    # Create tables if not exist
    async with db_pool.acquire() as conn:
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS stream_events (
                event_id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                scheduled_start TIMESTAMPTZ NOT NULL,
                scheduled_end TIMESTAMPTZ NOT NULL,
                stream_key VARCHAR(100) UNIQUE NOT NULL,
                max_viewers INTEGER DEFAULT 10000,
                bitrates JSONB,
                recording_enabled BOOLEAN DEFAULT TRUE,
                status VARCHAR(20) DEFAULT 'scheduled',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE TABLE IF NOT EXISTS stream_metrics (
                id SERIAL PRIMARY KEY,
                event_id VARCHAR(50) REFERENCES stream_events(event_id),
                timestamp TIMESTAMPTZ NOT NULL,
                viewers INTEGER,
                bitrate FLOAT,
                fps FLOAT,
                dropped_frames INTEGER,
                cpu_usage FLOAT,
                memory_usage FLOAT,
                bandwidth_in FLOAT,
                bandwidth_out FLOAT
            );
            
            CREATE INDEX IF NOT EXISTS idx_metrics_event_time 
            ON stream_metrics(event_id, timestamp DESC);
            
            CREATE TABLE IF NOT EXISTS viewer_sessions (
                session_id VARCHAR(100) PRIMARY KEY,
                event_id VARCHAR(50) REFERENCES stream_events(event_id),
                user_id VARCHAR(50),
                ip_address INET,
                user_agent TEXT,
                quality VARCHAR(20),
                started_at TIMESTAMPTZ DEFAULT NOW(),
                ended_at TIMESTAMPTZ,
                total_watch_time INTERVAL
            );
        ''')

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()

# Health check endpoint
@app.get("/health")
async def health_check():
    checks = {
        "api": "healthy",
        "database": "unknown",
        "redis": "unknown",
        "srs": "unknown"
    }
    
    # Check database
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
            checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    # Check Redis
    try:
        await redis_client.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"
    
    # Check SRS
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://srs:1985/api/v1/versions") as resp:
                if resp.status == 200:
                    checks["srs"] = "healthy"
                else:
                    checks["srs"] = f"unhealthy: status {resp.status}"
    except Exception as e:
        checks["srs"] = f"unhealthy: {str(e)}"
    
    overall_health = all(v == "healthy" for v in checks.values())
    return {
        "status": "healthy" if overall_health else "degraded",
        "checks": checks,
        "timestamp": datetime.utcnow()
    }

# Stream event management
@app.post("/events", response_model=StreamEvent)
async def create_event(event: StreamEvent):
    async with db_pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO stream_events 
            (event_id, title, description, scheduled_start, scheduled_end, 
             stream_key, max_viewers, bitrates, recording_enabled)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ''', event.event_id, event.title, event.description,
            event.scheduled_start, event.scheduled_end, event.stream_key,
            event.max_viewers, json.dumps(event.bitrates), event.recording_enabled)
    
    # Cache event data in Redis
    await redis_client.setex(
        f"event:{event.event_id}",
        3600,
        event.json()
    )
    
    return event

@app.get("/events/{event_id}")
async def get_event(event_id: str):
    # Check cache first
    cached = await redis_client.get(f"event:{event_id}")
    if cached:
        return json.loads(cached)
    
    # Fallback to database
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM stream_events WHERE event_id = $1",
            event_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return dict(row)

@app.post("/events/{event_id}/start")
async def start_streaming(event_id: str, background_tasks: BackgroundTasks):
    # Update event status
    async with db_pool.acquire() as conn:
        event = await conn.fetchrow(
            "UPDATE stream_events SET status = 'live' WHERE event_id = $1 RETURNING *",
            event_id
        )
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
    
    # Start monitoring in background
    background_tasks.add_task(monitor_stream, event_id)
    
    # Notify SRS to start recording if enabled
    if event['recording_enabled']:
        await start_recording(event_id, event['stream_key'])
    
    return {"status": "streaming_started", "event_id": event_id}

@app.post("/events/{event_id}/stop")
async def stop_streaming(event_id: str):
    # Update event status
    async with db_pool.acquire() as conn:
        await conn.execute(
            "UPDATE stream_events SET status = 'ended' WHERE event_id = $1",
            event_id
        )
    
    # Stop recording
    await stop_recording(event_id)
    
    # Archive stream data
    await archive_stream_data(event_id)
    
    return {"status": "streaming_stopped", "event_id": event_id}

# Metrics collection
@app.post("/metrics")
async def collect_metrics(metrics: StreamMetrics):
    # Store in TimescaleDB
    async with db_pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO stream_metrics 
            (event_id, timestamp, viewers, bitrate, fps, dropped_frames,
             cpu_usage, memory_usage, bandwidth_in, bandwidth_out)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ''', metrics.event_id, metrics.timestamp, metrics.viewers,
            metrics.bitrate, metrics.fps, metrics.dropped_frames,
            metrics.cpu_usage, metrics.memory_usage,
            metrics.bandwidth_in, metrics.bandwidth_out)
    
    # Update real-time metrics in Redis
    await redis_client.hset(
        f"metrics:{metrics.event_id}",
        mapping={
            "viewers": metrics.viewers,
            "bitrate": metrics.bitrate,
            "fps": metrics.fps,
            "timestamp": metrics.timestamp.isoformat()
        }
    )
    
    # Check for alerts
    await check_stream_health(metrics)
    
    return {"status": "metrics_received"}

@app.get("/metrics/{event_id}/realtime")
async def get_realtime_metrics(event_id: str):
    metrics = await redis_client.hgetall(f"metrics:{event_id}")
    if not metrics:
        raise HTTPException(status_code=404, detail="No metrics available")
    return metrics

@app.get("/metrics/{event_id}/historical")
async def get_historical_metrics(
    event_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    interval: str = "1m"
):
    if not start_time:
        start_time = datetime.utcnow() - timedelta(hours=1)
    if not end_time:
        end_time = datetime.utcnow()
    
    async with db_pool.acquire() as conn:
        query = '''
            SELECT 
                time_bucket($1, timestamp) AS bucket,
                AVG(viewers) as avg_viewers,
                AVG(bitrate) as avg_bitrate,
                AVG(fps) as avg_fps,
                SUM(dropped_frames) as total_dropped_frames,
                AVG(cpu_usage) as avg_cpu,
                AVG(memory_usage) as avg_memory,
                AVG(bandwidth_in) as avg_bandwidth_in,
                AVG(bandwidth_out) as avg_bandwidth_out
            FROM stream_metrics
            WHERE event_id = $2 
                AND timestamp >= $3 
                AND timestamp <= $4
            GROUP BY bucket
            ORDER BY bucket DESC
        '''
        
        interval_map = {
            "1m": timedelta(minutes=1),
            "5m": timedelta(minutes=5),
            "15m": timedelta(minutes=15),
            "1h": timedelta(hours=1)
        }
        
        rows = await conn.fetch(
            query,
            interval_map.get(interval, timedelta(minutes=1)),
            event_id,
            start_time,
            end_time
        )
        
        return [dict(row) for row in rows]

# WebSocket for real-time updates
@app.websocket("/ws/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    await websocket.accept()
    
    # Subscribe to Redis pub/sub
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"stream:{event_id}")
    
    try:
        while True:
            # Send metrics every second
            metrics = await redis_client.hgetall(f"metrics:{event_id}")
            if metrics:
                await websocket.send_json({
                    "type": "metrics",
                    "data": metrics
                })
            
            # Check for messages
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1)
            if message:
                await websocket.send_json({
                    "type": "event",
                    "data": json.loads(message['data'])
                })
            
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await pubsub.unsubscribe(f"stream:{event_id}")
        await pubsub.close()

# Helper functions
async def monitor_stream(event_id: str):
    """Background task to monitor stream health"""
    while True:
        try:
            # Get stream stats from SRS
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://srs:1985/api/v1/streams") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        # Process stream statistics
                        await process_stream_stats(event_id, data)
            
            # Check if stream is still active
            async with db_pool.acquire() as conn:
                status = await conn.fetchval(
                    "SELECT status FROM stream_events WHERE event_id = $1",
                    event_id
                )
                if status != 'live':
                    break
            
            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Error monitoring stream {event_id}: {e}")
            await asyncio.sleep(5)

async def start_recording(event_id: str, stream_key: str):
    """Start recording the stream"""
    # Implementation would interact with SRS API or FFmpeg
    pass

async def stop_recording(event_id: str):
    """Stop recording the stream"""
    # Implementation would interact with SRS API or FFmpeg
    pass

async def archive_stream_data(event_id: str):
    """Archive stream data to long-term storage"""
    # Implementation would move recordings to S3 and archive metrics
    pass

async def check_stream_health(metrics: StreamMetrics):
    """Check stream health and trigger alerts if needed"""
    alerts = []
    
    if metrics.fps < 25:
        alerts.append({"type": "low_fps", "value": metrics.fps})
    
    if metrics.dropped_frames > 100:
        alerts.append({"type": "dropped_frames", "value": metrics.dropped_frames})
    
    if metrics.cpu_usage > 80:
        alerts.append({"type": "high_cpu", "value": metrics.cpu_usage})
    
    if metrics.memory_usage > 90:
        alerts.append({"type": "high_memory", "value": metrics.memory_usage})
    
    if alerts:
        # Send alerts to monitoring system
        await send_alerts(metrics.event_id, alerts)

async def send_alerts(event_id: str, alerts: List[Dict]):
    """Send alerts to monitoring system"""
    # Publish to Redis for real-time notifications
    await redis_client.publish(
        f"alerts:{event_id}",
        json.dumps({"timestamp": datetime.utcnow().isoformat(), "alerts": alerts})
    )
    
    # Could also integrate with Grafana OnCall here
    pass

async def process_stream_stats(event_id: str, stats: Dict):
    """Process stream statistics from SRS"""
    # Parse SRS stats and convert to metrics
    # This would extract viewer count, bitrate, etc.
    pass
```

### Grafana Observability Stack

```yaml
# grafana-stack.yaml - Complete observability configuration
version: '3.8'

services:
  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=redis-datasource,redis-app
    volumes:
      - grafana-data:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards
      - ./datasources:/etc/grafana/provisioning/datasources
    networks:
      - monitoring

  # Mimir for metrics
  mimir:
    image: grafana/mimir:latest
    container_name: mimir
    command:
      - -config.file=/etc/mimir/config.yaml
    ports:
      - "9009:9009"
    volumes:
      - ./mimir-config.yaml:/etc/mimir/config.yaml
      - mimir-data:/data
    networks:
      - monitoring

  # Loki for logs
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    networks:
      - monitoring

  # Tempo for traces
  tempo:
    image: grafana/tempo:latest
    container_name: tempo
    command: 
      - -config.file=/etc/tempo.yaml
    ports:
      - "3200:3200"   # tempo
      - "4317:4317"   # otlp grpc
      - "4318:4318"   # otlp http
    volumes:
      - ./tempo-config.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    networks:
      - monitoring

  # Pyroscope for profiling
  pyroscope:
    image: grafana/pyroscope:latest
    container_name: pyroscope
    ports:
      - "4040:4040"
    command:
      - "server"
      - "-config.file=/etc/pyroscope.yaml"
    volumes:
      - ./pyroscope-config.yaml:/etc/pyroscope.yaml
      - pyroscope-data:/data
    networks:
      - monitoring

  # Promtail for log collection
  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - /var/log:/var/log:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./promtail-config.yaml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

volumes:
  grafana-data:
  mimir-data:
  loki-data:
  tempo-data:
  pyroscope-data:

networks:
  monitoring:
    driver: bridge
```

### k6 Load Testing Scripts

```javascript
// load-test.js - k6 Load Testing for Streaming Platform
import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const streamLatency = new Trend('stream_latency');
const viewerCount = new Gauge('viewer_count');
const connectionFailures = new Counter('connection_failures');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    
    // Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '5m', target: 0 },
      ],
      tags: { test_type: 'load' },
    },
    
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '5m', target: 400 },
        { duration: '10m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 1000 },
        { duration: '3m', target: 1000 },
        { duration: '10s', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
    
    // Soak test
    soak: {
      executor: 'constant-vus',
      vus: 200,
      duration: '2h',
      tags: { test_type: 'soak' },
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
    stream_latency: ['p(95)<2000', 'p(99)<5000'],
  },
};

const BASE_URL = 'http://localhost:8001';
const WS_URL = 'ws://localhost:8001';
const EVENT_ID = 'test-event-001';

// Setup: Create test event
export function setup() {
  const payload = JSON.stringify({
    event_id: EVENT_ID,
    title: 'Load Test Event',
    description: 'Testing streaming platform under load',
    scheduled_start: new Date().toISOString(),
    scheduled_end: new Date(Date.now() + 3600000).toISOString(),
    stream_key: 'test_stream_key_' + Date.now(),
    max_viewers: 10000,
    bitrates: ['3000k', '1500k', '750k', '400k'],
    recording_enabled: true,
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const res = http.post(`${BASE_URL}/events`, payload, params);
  check(res, {
    'Event created': (r) => r.status === 200 || r.status === 201,
  });
  
  // Start streaming
  http.post(`${BASE_URL}/events/${EVENT_ID}/start`);
  
  return { event_id: EVENT_ID };
}

// Main test scenarios
export default function (data) {
  const scenario = __ENV.SCENARIO || 'load';
  
  // Test API endpoints
  testAPIEndpoints(data.event_id);
  
  // Test WebSocket connections
  testWebSocketConnection(data.event_id);
  
  // Test HLS streaming
  testHLSStreaming(data.event_id);
  
  // Simulate viewer behavior
  simulateViewerBehavior(data.event_id);
  
  sleep(1);
}

function testAPIEndpoints(eventId) {
  // Get event details
  let res = http.get(`${BASE_URL}/events/${eventId}`);
  check(res, {
    'Get event status 200': (r) => r.status === 200,
    'Get event has data': (r) => r.json('event_id') === eventId,
  });
  errorRate.add(res.status !== 200);
  
  // Get real-time metrics
  res = http.get(`${BASE_URL}/metrics/${eventId}/realtime`);
  check(res, {
    'Get metrics status 200': (r) => r.status === 200,
    'Metrics has viewers': (r) => r.json('viewers') !== undefined,
  });
  
  // Post viewer session
  const sessionPayload = JSON.stringify({
    session_id: `session_${__VU}_${__ITER}`,
    event_id: eventId,
    user_id: `user_${__VU}`,
    ip_address: `192.168.1.${__VU % 255}`,
    user_agent: 'k6-load-test',
    quality: ['1080p', '720p', '480p', '360p'][__VU % 4],
    buffer_health: Math.random() * 10,
    latency: Math.random() * 100,
  });
  
  res = http.post(`${BASE_URL}/sessions`, sessionPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'Session created': (r) => r.status === 200 || r.status === 201,
  });
}

function testWebSocketConnection(eventId) {
  const url = `${WS_URL}/ws/${eventId}`;
  
  const res = ws.connect(url, null, function (socket) {
    socket.on('open', () => {
      viewerCount.add(1);
      console.log('WebSocket connected');
    });
    
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'metrics') {
        streamLatency.add(message.data.latency || 0);
      }
    });
    
    socket.on('error', (e) => {
      connectionFailures.add(1);
      errorRate.add(1);
      console.error('WebSocket error:', e);
    });
    
    socket.on('close', () => {
      viewerCount.add(-1);
    });
    
    // Keep connection open for random duration
    socket.setTimeout(() => {
      socket.close();
    }, Math.random() * 30000 + 10000);
  });
  
  check(res, {
    'WebSocket connected': (r) => r && r.status === 101,
  });
}

function testHLSStreaming(eventId) {
  // Request HLS playlist
  const res = http.get(`http://localhost:8080/live/${eventId}.m3u8`);
  check(res, {
    'HLS playlist available': (r) => r.status === 200,
    'HLS playlist valid': (r) => r.body.includes('#EXTM3U'),
  });
  
  if (res.status === 200) {
    // Parse and request segments
    const lines = res.body.split('\n');
    const segments = lines.filter(line => line.endsWith('.ts'));
    
    if (segments.length > 0) {
      // Request a random segment
      const segment = segments[Math.floor(Math.random() * segments.length)];
      const segmentRes = http.get(`http://localhost:8080/live/${segment}`);
      check(segmentRes, {
        'Segment available': (r) => r.status === 200,
        'Segment has content': (r) => r.body.length > 0,
      });
      
      streamLatency.add(segmentRes.timings.duration);
    }
  }
}

function simulateViewerBehavior(eventId) {
  // Simulate different viewer behaviors
  const behaviors = [
    'watch_full',      // Watch entire stream
    'quick_preview',   // Watch for 10-30 seconds
    'channel_surf',    // Jump between streams
    'quality_switch',  // Change quality settings
    'buffer_issues',   // Simulate buffering
  ];
  
  const behavior = behaviors[__VU % behaviors.length];
  
  switch (behavior) {
    case 'watch_full':
      // Stay connected for extended period
      sleep(Math.random() * 60 + 30);
      break;
      
    case 'quick_preview':
      // Quick view and leave
      sleep(Math.random() * 20 + 10);
      break;
      
    case 'channel_surf':
      // Multiple quick connections
      for (let i = 0; i < 3; i++) {
        testAPIEndpoints(eventId);
        sleep(Math.random() * 10 + 5);
      }
      break;
      
    case 'quality_switch':
      // Change quality multiple times
      const qualities = ['1080p', '720p', '480p', '360p'];
      for (let quality of qualities) {
        http.post(`${BASE_URL}/sessions/quality`, 
          JSON.stringify({ 
            session_id: `session_${__VU}`,
            quality: quality 
          }), 
          { headers: { 'Content-Type': 'application/json' }}
        );
        sleep(Math.random() * 15 + 10);
      }
      break;
      
    case 'buffer_issues':
      // Simulate buffering with reconnections
      for (let i = 0; i < 5; i++) {
        testHLSStreaming(eventId);
        sleep(Math.random() * 5 + 2);
      }
      break;
  }
}

// Teardown: Clean up test event
export function teardown(data) {
  // Stop streaming
  http.post(`${BASE_URL}/events/${data.event_id}/stop`);
  
  // Get final metrics
  const res = http.get(`${BASE_URL}/metrics/${data.event_id}/historical`);
  if (res.status === 200) {
    console.log('Final metrics:', res.json());
  }
}
```

### Docker Optimization

```dockerfile
# Dockerfile.ffmpeg - Optimized FFmpeg container
FROM alpine:3.18 AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    cmake \
    git \
    nasm \
    yasm \
    pkgconfig \
    libtool \
    autoconf \
    automake

# Build FFmpeg with necessary codecs
RUN git clone --depth 1 https://github.com/FFmpeg/FFmpeg.git && \
    cd FFmpeg && \
    ./configure \
        --enable-gpl \
        --enable-libx264 \
        --enable-libx265 \
        --enable-libvpx \
        --enable-libopus \
        --enable-libvorbis \
        --enable-libmp3lame \
        --enable-libfreetype \
        --enable-libass \
        --enable-libfdk-aac \
        --enable-nonfree \
        --disable-debug \
        --disable-doc \
        --disable-ffplay \
        --enable-shared \
        --enable-version3 \
        --enable-librtmp \
        --enable-libsrt && \
    make -j$(nproc) && \
    make install

# Production image
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache \
    libstdc++ \
    libgcc \
    libgomp \
    libuuid \
    libva \
    libva-intel-driver \
    intel-media-driver

# Copy FFmpeg binaries
COPY --from=builder /usr/local /usr/local

# Add scripts
COPY scripts/transcode.sh /scripts/
RUN chmod +x /scripts/transcode.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD ffmpeg -version || exit 1

ENTRYPOINT ["/scripts/transcode.sh"]
```

```dockerfile
# Dockerfile.api - FastAPI production container
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production image
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Add non-root user
RUN useradd -m -u 1000 streaming && \
    mkdir -p /app && \
    chown -R streaming:streaming /app

USER streaming
WORKDIR /app

# Copy application code
COPY --chown=streaming:streaming . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Expert Response Patterns

### When Asked About Streaming Architecture
"For your live streaming requirements, I recommend a containerized architecture using:
1. **SRS** for RTMP ingestion and protocol conversion
2. **FFmpeg** for adaptive bitrate transcoding
3. **FastAPI** for REST/WebSocket APIs
4. **Grafana Stack** for comprehensive observability

Here's the complete implementation:
[Provide detailed architecture with code examples]"

### When Asked About Performance Optimization
"To optimize streaming performance:
1. **Video Pipeline**: Use hardware acceleration, optimize GOP size, implement efficient ABR ladders
2. **Caching Strategy**: Redis for hot data, CDN for edge caching
3. **Database**: TimescaleDB for time-series metrics, proper indexing
4. **Container Resources**: Set appropriate CPU/memory limits

Specific optimizations:
[Provide code examples with benchmarks]"

### When Asked About Monitoring
"Comprehensive monitoring requires:
1. **Metrics** (Mimir): Viewer count, bitrate, CPU/memory usage
2. **Logs** (Loki): Application logs, error tracking
3. **Traces** (Tempo): Request flow, latency analysis
4. **Profiling** (Pyroscope): Performance bottlenecks
5. **Alerting** (OnCall): Incident response

Dashboard configuration:
[Provide Grafana dashboard JSON]"

### When Asked About Load Testing
"k6 provides comprehensive load testing:
1. **Test Types**: Smoke, load, stress, spike, soak
2. **Metrics**: Custom streaming metrics, error rates, latency
3. **Scenarios**: Viewer behavior simulation
4. **Thresholds**: Performance criteria

Test implementation:
[Provide k6 test scripts]"

## Best Practices

### Container Orchestration
- Use multi-stage builds for smaller images
- Implement proper health checks
- Set resource limits and requests
- Use non-root users
- Enable graceful shutdown
- Implement proper logging

### Streaming Pipeline
- Optimize encoding presets (veryfast for live)
- Use appropriate GOP sizes (2-4 seconds)
- Implement ABR with sensible bitrate ladder
- Enable low-latency modes
- Use CDN for global distribution
- Implement fallback streams

### Monitoring & Observability
- Use structured logging
- Implement distributed tracing
- Set up proactive alerting
- Create comprehensive dashboards
- Monitor business metrics
- Track user experience metrics

### Security
- Use stream keys for authentication
- Implement IP whitelisting
- Enable HTTPS/WSS everywhere
- Rotate credentials regularly
- Implement rate limiting
- Use security headers

## Production Deployment Checklist

### Pre-deployment
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Monitoring configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan
- [ ] Documentation updated
- [ ] Runbooks created

### Deployment
- [ ] Blue-green deployment
- [ ] Database migrations
- [ ] Configuration management
- [ ] SSL certificates
- [ ] DNS configuration
- [ ] CDN setup
- [ ] Health checks passing

### Post-deployment
- [ ] Smoke tests passing
- [ ] Metrics flowing
- [ ] Logs aggregating
- [ ] Alerts configured
- [ ] Performance baseline
- [ ] User acceptance
- [ ] Documentation published

## Continuous Improvement

### Performance Monitoring
- Track viewer quality of experience
- Monitor stream stability metrics
- Analyze cost per viewer
- Optimize encoding efficiency
- Review CDN performance
- Benchmark against competitors

### Scalability Planning
- Horizontal scaling strategies
- Auto-scaling policies
- Database sharding plans
- CDN expansion
- Multi-region deployment
- Disaster recovery testing

### Technology Updates
- FFmpeg version updates
- SRS feature adoption
- FastAPI framework updates
- Container runtime optimization
- Grafana stack updates
- Security patches

---

This expert agent provides comprehensive knowledge and practical implementation for containerized live streaming infrastructure with enterprise-grade monitoring, testing, and scalability.