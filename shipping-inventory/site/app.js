(() => {
  const inventory = window.INVENTORY || {};
  const orderedFields = [
    ["ITEM ID", "item_id"],
    ["ITEM NAME", "item_name"],
    ["CATEGORY", "category"],
    ["SERIAL NUMBER", "serial_number"],
    ["DESCRIPTION", "description"],
    ["BATTERY TYPE", "battery_type"],
    ["BATTERY Wh", "battery_wh"],
    ["HAZARDOUS/RESTRICTED", "hazardous_restricted"],
    ["SHIPMENT LOCATION", "shipment_location"],
    ["NOTES", "notes"]
  ];

  const homePanel = document.getElementById("homePanel");
  const messagePanel = document.getElementById("messagePanel");
  const itemPanel = document.getElementById("itemPanel");
  const itemTitle = document.getElementById("itemTitle");
  const itemFields = document.getElementById("itemFields");
  const photosSection = document.getElementById("photosSection");
  const photosGrid = document.getElementById("photosGrid");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  function normalizeId(value) {
    let text = String(value || "").trim().toUpperCase();
    if (/^\d+$/.test(text)) text = `ITEM-${text.padStart(4, "0")}`;
    if (/^ITEM\d+$/.test(text)) text = `ITEM-${text.slice(4).padStart(4, "0")}`;
    return text;
  }

  function showMessage(text) {
    homePanel.classList.add("hidden");
    itemPanel.classList.add("hidden");
    messagePanel.textContent = text;
    messagePanel.classList.remove("hidden");
  }

  function showItem(id) {
    const normalized = normalizeId(id);
    const item = inventory[normalized];
    if (!item) {
      showMessage(`No item found for ${normalized || "that ID"}.`);
      return;
    }

    messagePanel.classList.add("hidden");
    homePanel.classList.add("hidden");
    itemPanel.classList.remove("hidden");
    itemTitle.textContent = `${item.item_id} — ${item.item_name || "Unnamed Item"}`;
    itemFields.replaceChildren();

    for (const [label, key] of orderedFields) {
      const row = document.createElement("div");
      row.className = "field-row";
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      const value = item[key];
      dd.textContent = value === null || value === undefined || value === "" ? "—" : String(value);
      row.append(dt, dd);
      itemFields.append(row);
    }

    photosGrid.replaceChildren();
    const photos = Array.isArray(item.photos) ? item.photos : [];
    photosSection.classList.toggle("hidden", photos.length === 0);
    for (const photo of photos) {
      const link = document.createElement("a");
      link.href = photo;
      link.target = "_blank";
      link.rel = "noopener";
      const img = document.createElement("img");
      img.src = photo;
      img.alt = `Photo for ${item.item_id}`;
      img.loading = "lazy";
      link.append(img);
      photosGrid.append(link);
    }

    searchInput.value = item.item_id;
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.item_id);
    history.replaceState(null, "", url);
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showItem(searchInput.value);
  });

  document.getElementById("refreshButton").addEventListener("click", () => window.location.reload());

  const queryId = new URLSearchParams(window.location.search).get("item");
  if (queryId) showItem(queryId);
})();
