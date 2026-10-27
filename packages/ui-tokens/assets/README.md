# App icon source

The Hire Shelby mark is an ID badge with a friendly face: a cream badge with a coral clip on a
teal (`#0E5B53`) plate. Three SVGs are the editable sources:

- `hire-shelby.svg`: the full-bleed icon, plate included.
- `hire-shelby-foreground.svg`: the badge alone on transparency, for Android's adaptive layer.
- `hire-shelby-monochrome.svg`: the badge as a white silhouette with the face cut out.

Run `pnpm --filter @rakazo/ui-tokens export:brand` after changing them. It regenerates:

- the web favicons and install icons in `apps/web/public` (`logo.svg` is the rounded mark the
  welcome page shows; update it alongside `hire-shelby.svg`);
- `apps/desktop/assets/icon.png`, `icon.ico` and `icon-macos.png` (pre-Tahoe macOS export with
  Dock margins and shadow, used for development launches);
- `Rakazo.icon/Assets/hire-shelby.png`, the single opaque layer of the Icon Composer source that
  macOS packaging and Expo's iOS build compile;
- `apps/mobile/assets`: `icon.png` (opaque square), `adaptive-icon.png` and
  `monochrome-icon.png` (badge shrunk into the launcher's safe zone), `icon-background.png`,
  `favicon.png`, `splash-icon.png` and `notification-icon.png`.

The marketing site in `apps/www` keeps the upstream project's marks.
