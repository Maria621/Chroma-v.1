import { test, expect } from "@playwright/test";

const pages = [
  "/",
  "/nossa-escola.html",
  "/nossa-essencia.html",
  "/metodologia.html",
  "/estrutura.html",
  "/experiencia-chroma.html",
  "/unidades.html",
  "/novidades.html",
  "/contato.html",
  "/parcerias.html",
  "/aluno-nota-10.html",
  "/privacidade.html",
];

test("all 12 pages have a visible heading and no horizontal overflow", async ({ page }) => {
  for (const url of pages) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(overflow.scroll, "Horizontal overflow on " + url).toBeLessThanOrEqual(overflow.viewport + 3);
  }
});

test("home shows main CTA, photo credit and responsive visual", async ({ page }, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".hero#inicio h1")).toBeVisible();
  await expect(page.locator('.hero#inicio a[href="nossa-escola.html"]')).toBeVisible();
  await expect(page.locator(".hero-photo .photograph")).toBeVisible();
  await expect(page.locator(".v5-hero-credit")).toContainText("ilustrativa");
  await page.screenshot({
    path: "test-results/" + info.project.name + "-home.png",
    fullPage: false,
  });
});

test("main navigation can open and close with keyboard/touch", async ({ page }, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  if (info.project.name === "mobile") {
    const menu = page.locator("#mobile-menu");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-panel")).toBeHidden();
  } else {
    const toggle = page.locator(".nav-dropdown-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  }
});

test("methodology has five interactive stages", async ({ page }) => {
  await page.goto("/metodologia.html", { waitUntil: "domcontentloaded" });
  const buttons = page.locator(".method-step");
  await expect(buttons).toHaveCount(5);
  await buttons.nth(2).click();
  await expect(buttons.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(buttons.first()).toHaveAttribute("aria-expanded", "false");
  await buttons.nth(2).focus();
  await page.keyboard.press("End");
  await expect(buttons.last()).toBeFocused();
});

test("news art opens a dialog and restores focus when closed", async ({ page }) => {
  await page.goto("/novidades.html", { waitUntil: "domcontentloaded" });
  const button = page.locator("[data-view-image]").first();
  await button.click();
  const dialog = page.locator("#chroma-image-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", /presenca-premiada/);
  await dialog.locator("[data-close-image]").click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test("contact form remains disabled without institutional credentials", async ({ page }) => {
  await page.goto("/contato.html", { waitUntil: "domcontentloaded" });
  const submit = page.locator('[data-chroma-form] button[type="submit"]');
  await expect(submit).toBeDisabled();
  await expect(page.locator(".v4-fallback-contact a")).toHaveAttribute("href", /instagram\.com/);
});

test("unit selection reaches the correctly prefilled contact form", async ({ page }) => {
  await page.goto("/unidades.html", { waitUntil: "domcontentloaded" });
  await page.locator('#itavuvu a[href*="contato.html"]').click();
  await expect(page).toHaveURL(/contato\.html\?unidade=/);
  await expect(page.locator('select[name="unidade"]'))
    .toHaveValue("Sorocaba — Itavuvu");
});
