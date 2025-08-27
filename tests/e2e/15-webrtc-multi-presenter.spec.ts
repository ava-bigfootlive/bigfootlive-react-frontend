import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('WebRTC Multi-Presenter Functionality', () => {
  let hostPage: Page;
  let presenterPage: Page;
  let viewerPage: Page;
  let hostContext: BrowserContext;
  let presenterContext: BrowserContext;
  let viewerContext: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    // Create contexts for different users
    hostContext = await browser.newContext();
    presenterContext = await browser.newContext();
    viewerContext = await browser.newContext();
    
    hostPage = await hostContext.newPage();
    presenterPage = await presenterContext.newPage();
    viewerPage = await viewerContext.newPage();
    
    // Login as host
    await hostPage.goto('/login');
    await hostPage.fill('[name="email"]', 'host@bigfootlive.io');
    await hostPage.fill('[name="password"]', 'Host123!');
    await hostPage.click('button[type="submit"]');
    await hostPage.waitForURL('/dashboard');
  });

  test('should initialize WebRTC multi-presenter room', async () => {
    // Host creates event with multi-presenter enabled
    await hostPage.goto('/events');
    await hostPage.click('button:has-text("Create Event")');
    
    await hostPage.fill('[name="title"]', 'WebRTC Multi-Presenter Test');
    await hostPage.selectOption('[name="type"]', 'panel');
    
    // Enable multi-presenter
    await hostPage.click('text=Streaming Configuration');
    await hostPage.check('[name="enableMultiPresenter"]');
    await hostPage.fill('[name="maxPresenters"]', '4');
    
    await hostPage.click('button:has-text("Create Event")');
    
    // Start the event
    await hostPage.click('button:has-text("Start Event")');
    
    // Verify WebRTC room initialization
    await expect(hostPage.locator('text=Presenter Room')).toBeVisible();
    await expect(hostPage.locator('[data-testid="local-video"]')).toBeVisible();
    await expect(hostPage.locator('text=Waiting for presenters...')).toBeVisible();
  });

  test('should allow presenter to join room', async () => {
    // Get room link from host
    const roomLink = await hostPage.locator('[data-testid="presenter-link"]').textContent();
    
    // Presenter joins
    await presenterPage.goto(roomLink!);
    await presenterPage.fill('[name="displayName"]', 'Guest Presenter');
    await presenterPage.click('button:has-text("Join as Presenter")');
    
    // Grant camera/mic permissions (mocked in test)
    await presenterPage.click('button:has-text("Allow Access")');
    
    // Verify presenter connected
    await expect(presenterPage.locator('[data-testid="local-video"]')).toBeVisible();
    await expect(presenterPage.locator('text=Connected as Presenter')).toBeVisible();
    
    // Verify host sees presenter
    await expect(hostPage.locator('text=Guest Presenter')).toBeVisible();
    await expect(hostPage.locator('[data-testid="remote-video-1"]')).toBeVisible();
  });

  test('should handle multiple presenters simultaneously', async () => {
    // Add second presenter
    const presenter2Context = await hostPage.context().browser()?.newContext();
    const presenter2Page = await presenter2Context!.newPage();
    
    const roomLink = await hostPage.locator('[data-testid="presenter-link"]').textContent();
    
    // Second presenter joins
    await presenter2Page.goto(roomLink!);
    await presenter2Page.fill('[name="displayName"]', 'Second Presenter');
    await presenter2Page.click('button:has-text("Join as Presenter")');
    
    // Verify all presenters see each other
    await expect(hostPage.locator('[data-testid="remote-video-2"]')).toBeVisible();
    await expect(presenterPage.locator('text=Second Presenter')).toBeVisible();
    await expect(presenter2Page.locator('text=Guest Presenter')).toBeVisible();
    
    // Verify presenter count
    await expect(hostPage.locator('text=3 presenters active')).toBeVisible();
  });

  test('should manage presenter audio/video controls', async () => {
    // Presenter mutes microphone
    await presenterPage.click('[data-testid="mute-audio"]');
    await expect(presenterPage.locator('[data-testid="audio-muted-icon"]')).toBeVisible();
    
    // Host sees muted status
    await expect(hostPage.locator('[data-testid="presenter-1-muted"]')).toBeVisible();
    
    // Presenter disables video
    await presenterPage.click('[data-testid="disable-video"]');
    await expect(presenterPage.locator('[data-testid="video-disabled-icon"]')).toBeVisible();
    
    // Host sees video disabled
    await expect(hostPage.locator('[data-testid="presenter-1-video-off"]')).toBeVisible();
    
    // Host force-mutes presenter
    await hostPage.click('[data-testid="force-mute-presenter-1"]');
    await expect(presenterPage.locator('text=Host has muted you')).toBeVisible();
  });

  test('should switch between presenter layouts', async () => {
    // Host changes layout
    await hostPage.click('[data-testid="layout-selector"]');
    
    // Test grid layout
    await hostPage.click('text=Grid View');
    await expect(hostPage.locator('.presenter-grid')).toBeVisible();
    
    // Test speaker view
    await hostPage.click('[data-testid="layout-selector"]');
    await hostPage.click('text=Speaker View');
    await expect(hostPage.locator('.speaker-view')).toBeVisible();
    
    // Test presentation mode
    await hostPage.click('[data-testid="layout-selector"]');
    await hostPage.click('text=Presentation Mode');
    await expect(hostPage.locator('.presentation-mode')).toBeVisible();
  });

  test('should handle screen sharing', async () => {
    // Presenter shares screen
    await presenterPage.click('[data-testid="share-screen"]');
    await presenterPage.click('button:has-text("Share Entire Screen")');
    
    // Verify screen share active
    await expect(presenterPage.locator('text=Sharing screen')).toBeVisible();
    await expect(presenterPage.locator('[data-testid="stop-sharing"]')).toBeVisible();
    
    // Host and other viewers see shared screen
    await expect(hostPage.locator('[data-testid="shared-screen"]')).toBeVisible();
    await expect(hostPage.locator('text=Guest Presenter is sharing')).toBeVisible();
    
    // Stop sharing
    await presenterPage.click('[data-testid="stop-sharing"]');
    await expect(presenterPage.locator('text=Sharing screen')).not.toBeVisible();
  });

  test('should create and manage breakout rooms', async () => {
    // Host creates breakout rooms
    await hostPage.click('[data-testid="breakout-rooms"]');
    await hostPage.click('button:has-text("Create Breakout Rooms")');
    
    // Configure rooms
    await hostPage.fill('[name="numberOfRooms"]', '2');
    await hostPage.fill('[name="room1Name"]', 'Technical Discussion');
    await hostPage.fill('[name="room2Name"]', 'Business Strategy');
    
    // Assign presenters
    await hostPage.dragAndDrop('[data-testid="presenter-1"]', '[data-testid="room-1"]');
    await hostPage.dragAndDrop('[data-testid="presenter-2"]', '[data-testid="room-2"]');
    
    // Open rooms
    await hostPage.click('button:has-text("Open Breakout Rooms")');
    
    // Verify presenters receive room invitations
    await expect(presenterPage.locator('text=Join Breakout Room: Technical Discussion')).toBeVisible();
    await presenterPage.click('button:has-text("Join Room")');
    
    // Verify presenter in breakout room
    await expect(presenterPage.locator('text=In Breakout Room')).toBeVisible();
    await expect(presenterPage.locator('[data-testid="room-participants"]')).toBeVisible();
    
    // Host monitors rooms
    await expect(hostPage.locator('text=2 breakout rooms active')).toBeVisible();
    await hostPage.click('[data-testid="monitor-room-1"]');
    await expect(hostPage.locator('text=Technical Discussion')).toBeVisible();
    
    // Close breakout rooms
    await hostPage.click('button:has-text("Close All Rooms")');
    await expect(presenterPage.locator('text=Returning to main room')).toBeVisible();
  });

  test('should handle presenter disconnection and reconnection', async () => {
    // Simulate presenter disconnection
    await presenterContext.close();
    
    // Host sees disconnection
    await expect(hostPage.locator('text=Guest Presenter disconnected')).toBeVisible();
    await expect(hostPage.locator('[data-testid="remote-video-1"]')).not.toBeVisible();
    
    // Presenter reconnects
    presenterContext = await hostPage.context().browser()?.newContext();
    presenterPage = await presenterContext!.newPage();
    
    const roomLink = await hostPage.locator('[data-testid="presenter-link"]').textContent();
    await presenterPage.goto(roomLink!);
    await presenterPage.fill('[name="displayName"]', 'Guest Presenter');
    await presenterPage.click('button:has-text("Rejoin")');
    
    // Verify reconnection
    await expect(hostPage.locator('text=Guest Presenter reconnected')).toBeVisible();
    await expect(hostPage.locator('[data-testid="remote-video-1"]')).toBeVisible();
  });

  test('should record multi-presenter session', async () => {
    // Host starts recording
    await hostPage.click('[data-testid="start-recording"]');
    
    // Verify recording indicator
    await expect(hostPage.locator('text=Recording')).toBeVisible();
    await expect(hostPage.locator('.recording-indicator')).toBeVisible();
    
    // All presenters see recording notification
    await expect(presenterPage.locator('text=Session is being recorded')).toBeVisible();
    
    // Stop recording
    await hostPage.click('[data-testid="stop-recording"]');
    await expect(hostPage.locator('text=Recording saved')).toBeVisible();
    
    // Verify recording appears in event assets
    await hostPage.click('[data-testid="view-recordings"]');
    await expect(hostPage.locator('text=Multi-Presenter Recording')).toBeVisible();
  });

  test('should handle bandwidth adaptation', async () => {
    // Simulate low bandwidth
    await presenterPage.click('[data-testid="settings"]');
    await presenterPage.click('text=Network Simulator');
    await presenterPage.selectOption('[name="bandwidth"]', 'slow-3g');
    
    // Verify quality adaptation
    await expect(presenterPage.locator('text=Video quality reduced')).toBeVisible();
    await expect(hostPage.locator('[data-testid="presenter-1-low-quality"]')).toBeVisible();
    
    // Restore bandwidth
    await presenterPage.selectOption('[name="bandwidth"]', 'no-throttle');
    await expect(presenterPage.locator('text=Video quality restored')).toBeVisible();
  });

  test('should allow host to spotlight presenter', async () => {
    // Host spotlights presenter
    await hostPage.click('[data-testid="presenter-1-menu"]');
    await hostPage.click('text=Spotlight');
    
    // Verify spotlight mode
    await expect(hostPage.locator('[data-testid="spotlight-presenter-1"]')).toBeVisible();
    await expect(hostPage.locator('.spotlight-frame')).toBeVisible();
    
    // Viewers see spotlighted presenter prominently
    await viewerPage.goto('/event/webrtc-multi-presenter-test');
    await expect(viewerPage.locator('.main-presenter')).toBeVisible();
    await expect(viewerPage.locator('text=Guest Presenter')).toBeVisible();
    
    // Remove spotlight
    await hostPage.click('[data-testid="remove-spotlight"]');
    await expect(hostPage.locator('.spotlight-frame')).not.toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup
    await hostContext.close();
    await presenterContext.close();
    await viewerContext.close();
  });
});