# PCS Inventory

Simple spreadsheet-driven inventory for:

- GitHub user: `SHAMMY33`
- Repository: `PCS-INVENTORY`
- Site: `https://shammy33.github.io/PCS-INVENTORY/`

## Before uploading

1. Put your existing spreadsheet in this folder.
2. Name it exactly `MasterInventory.xlsx`.
3. Put item photos in folders named with the numeric Item ID:

```text
photos/
├── 0001/
│   ├── 01.jpg
│   └── 02.jpg
├── 0002/
│   └── 01.jpg
└── ...
```

4. Upload the **contents of this folder** to the root of the `PCS-INVENTORY` repository. Do not upload this as an extra parent folder.

The repository root must visibly contain `.github`, `photos`, `scripts`, `site`, `requirements.txt`, and `MasterInventory.xlsx`.

## Spreadsheet headers

The active sheet is read by header name. Column order does not matter.

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

`ITEM ID` and `ITEM NAME` are required. The PHOTOS cell can be blank because photos are found automatically from the matching photo folder.

Item IDs are numeric and normalized to four digits. `1`, `0001`, and numeric Excel value `1` all become `0001`.

## GitHub Pages setup

In the repository go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Every push to `main` that changes the spreadsheet, photos, or site files triggers the deployment.

## URLs

Homepage:

`https://shammy33.github.io/PCS-INVENTORY/`

Item 0001:

`https://shammy33.github.io/PCS-INVENTORY/?item=0001`

QR image for item 0001:

`https://shammy33.github.io/PCS-INVENTORY/qr-codes/0001.png`

Every populated spreadsheet row receives a QR code automatically during the build.
