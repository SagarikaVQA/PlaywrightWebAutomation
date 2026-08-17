import { test, expect } from '@playwright/test';

test.describe('QA Playground - GitHub User Search Application', () => {

  const validUser = 'kundalik-dev';
  const invalidUser = 'invalid-user-xyz-123';

  test.beforeEach(async ({ page }) => {

    // Mock GitHub API calls
    await page.route('**/api.github.com/**', async route => {

      const url = route.request().url();

      // -----------------------------------------
      // Valid user profile
      // -----------------------------------------
      if (url === `https://api.github.com/users/${validUser}`) {

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            login: 'kundalik-dev',
            name: 'Kundalik Jadhav',
            bio: 'I am QA Automation and manual teste analyst',
            location: null,
            avatar_url: 'https://avatars.githubusercontent.com/u/123456',
            html_url: 'https://github.com/kundalik-dev',
            public_repos: 0,
            followers: 0,
            following: 0
          })
        });

        return;
      }

      // -----------------------------------------
      // Invalid user
      // -----------------------------------------
      if (url === `https://api.github.com/users/${invalidUser}`) {

        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Not Found'
          })
        });

        return;
      }

      // -----------------------------------------
      // Followers API
      // -----------------------------------------
      if (url.includes(`/users/${validUser}/followers`)) {

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });

        return;
      }

      // -----------------------------------------
      // Repositories API
      // -----------------------------------------
      if (url.includes(`/users/${validUser}/repos`)) {

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });

        return;
      }

      // Any other request
      await route.continue();
    });

    await page.goto('/demo/github-user-search');
  });


  // =========================================================
  // GH-001
  // =========================================================
  test('GH-001: Search for valid user (Positive Scenario)', async ({ page }) => {

    await page
      .getByPlaceholder('Search GitHub username...')
      .fill(validUser);

    await page
      .getByRole('button', {
        name: 'Search',
        exact: true
      })
      .click();

    await expect(
  page.getByTestId('user-display-name')
).toBeVisible({ timeout: 10000 });
  });


  // =========================================================
  // GH-002
  // =========================================================
  test('GH-002: Search for invalid user (Negative Scenario)', async ({ page }) => {

    await page
      .getByPlaceholder('Search GitHub username...')
      .fill(invalidUser);

    await page
      .getByRole('button', {
        name: 'Search',
        exact: true
      })
      .click();

    await expect(
      page.getByText('User not found', {
        exact: true
      })
    ).toBeVisible({ timeout: 10000 });
  });


  // =========================================================
  // GH-003
  // =========================================================
  test('GH-003: Locate User Biography Challenge', async ({ page }) => {

    await page
      .getByPlaceholder('Search GitHub username...')
      .fill(validUser);

    await page
      .getByRole('button', {
        name: 'Search',
        exact: true
      })
      .click();

    await expect(
  page.getByTestId('user-display-name')
).toBeVisible({ timeout: 10000 });

    const biography = page
      .locator('p')
      .filter({
        hasText: 'Biography:'
      });

    await expect(biography).toBeVisible({
      timeout: 10000
    });

    const biographyText = await biography.innerText();

    console.log('Biography:', biographyText);

    expect(biographyText).toContain(
      'I am QA Automation and manual teste analyst'
    );
  });


  // =========================================================
  // GH-004
  // =========================================================
  test('GH-004: Extract Location without data-testid Challenge', async ({ page }) => {

    await page
      .getByPlaceholder('Search GitHub username...')
      .fill(validUser);

    await page
      .getByRole('button', {
        name: 'Search',
        exact: true
      })
      .click();

    await expect(
  page.getByTestId('user-display-name')
).toBeVisible({ timeout: 10000 });

    const locationIcon = page.getByRole('img', {
      name: 'Location'
    });

    await expect(locationIcon).toBeVisible({
      timeout: 10000
    });

    const locationContainer = locationIcon.locator('..');

    const locationValue = locationContainer.getByText(
      'Not specified',
      {
        exact: true
      }
    );

    await expect(locationValue).toBeVisible({
      timeout: 10000
    });

    const locationText = await locationValue.innerText();

    console.log('Location:', locationText);

    expect(locationText.trim()).toBe(
      'Not specified'
    );
  });

});