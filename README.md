# Shipping Inventory

A simple GitHub Pages inventory viewer generated from one Excel master sheet.

## Routine update

1. Keep your spreadsheet named exactly `MasterInventory.xlsx`.
2. Replace the existing `MasterInventory.xlsx` in the repository.
3. Commit the change to `main`.
4. GitHub Actions rebuilds and republishes the site automatically.

Photos only need to be uploaded when photos change. Put them in:

`photos/ITEM-0001/`

Any `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` file in that folder appears on ITEM-0001's page.

## Expected spreadsheet headers

The generator reads the active worksheet and finds columns by header name rather than fixed column position.

- ITEM ID
- ITEM NAME
- CATEGORY
- SERIAL NUMBER
- DESCRIPTION
- BATTERY TYPE
- BATTERY Wh
- HAZARDOUS/RESTRICTED
- SHIPMENT LOCATION
- NOTES
- PHOTOS

`ITEM ID` and `ITEM NAME` are required. Other missing columns produce a warning instead of stopping the build.

The PHOTOS cell itself does not need a filename. Photos are matched automatically by the ITEM ID folder.

## QR codes

Every build automatically creates QR images in `qr-codes/` while the workflow runs. Each QR points directly to:

`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/?item=ITEM-0001`

The site's own URL is inferred automatically from the GitHub repository name during Actions builds.

Note: the generated `qr-codes/` directory is not committed back to the repository by the workflow. The item URLs are stable and are what matter for printed QR codes. If you want downloadable QR files as a build artifact later, that can be added without changing the site design.

## First-time GitHub setup

1. Create a public GitHub repository.
2. Upload the contents of this folder to the repository.
3. Add your `MasterInventory.xlsx` at the repository root.
4. Go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **GitHub Actions**.
6. Commit/push to `main` if needed. The `Build and deploy inventory` workflow will publish the site.

## Local folder layout

```text
shipping-inventory/
├── MasterInventory.xlsx        <- your existing sheet; add this yourself
├── photos/
│   ├── ITEM-0001/
│   │   ├── 01.jpg
│   │   └── 02.jpg
│   └── ITEM-0002/
├── site/
├── scripts/
├── requirements.txt
└── .github/workflows/deploy.yml
```
