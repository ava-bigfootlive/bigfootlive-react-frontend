import { test } from '@playwright/test';

test('Check actual content on pages', async ({ page }) => {
  // Check login page
  await page.goto('https://bigfootlive.io/auth/login');
  await page.waitForTimeout(2000);
  console.log('\n=== LOGIN PAGE ===');
  const loginContent = await page.locator('body').innerText();
  console.log(loginContent.substring(0, 500));
  
  // Check register page
  await page.goto('https://bigfootlive.io/auth/register');
  await page.waitForTimeout(2000);
  console.log('\n=== REGISTER PAGE ===');
  const registerContent = await page.locator('body').innerText();
  console.log(registerContent.substring(0, 500));
  
  // Check health page
  await page.goto('https://bigfootlive.io/health');
  await page.waitForTimeout(2000);
  console.log('\n=== HEALTH PAGE ===');
  const healthContent = await page.locator('body').innerText();
  console.log(healthContent.substring(0, 500));
  
  // Check unauthorized page
  await page.goto('https://bigfootlive.io/unauthorized');
  await page.waitForTimeout(2000);
  console.log('\n=== UNAUTHORIZED PAGE ===');
  const unauthorizedContent = await page.locator('body').innerText();
  console.log(unauthorizedContent.substring(0, 500));
  
  // Check navigation links
  await page.goto('https://bigfootlive.io');
  console.log('\n=== NAVIGATION LINKS ===');
  const getStarted = await page.locator('a:has-text("Get Started")').getAttribute('href');
  console.log('Get Started href:', getStarted);
  const dashboard = await page.locator('a:has-text("View Dashboard")').getAttribute('href');
  console.log('Dashboard href:', dashboard);
  const health = await page.locator('a:has-text("View Health Status")').getAttribute('href');
  console.log('Health href:', health);
});