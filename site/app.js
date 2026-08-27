(() => {
  const inventory = window.INVENTORY || {};
  const GITHUB_OWNER = "SHAMMY33";
  const GITHUB_REPO = "PCS-INVENTORY";
  const GITHUB_BRANCH = "main";
  const TOKEN_KEY = "pcs_inventory_github_token";

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
  const inventoryRows = document.getElementById("inventoryRows");
  const inventoryCount = document.getElementById("inventoryCount");
  const categoryFilters = document.getElementById("categoryFilters");
  const clearFiltersButton = document.getElementById("clearFiltersButton");
  const emptyResults = document.getElementById("emptyResults");
  const toggleUploadButton = document.getElementById("toggleUploadButton");
  const uploadPanel = document.getElementById("uploadPanel");
  const uploadPath = document.getElementById("uploadPath");
  const tokenInput = document.getElementById("tokenInput");
  const clearTokenButton = document.getElementById("clearTokenButton");
  const photoInput = document.getElementById("photoInput");
  const fileSummary = document.getElementById("fileSummary");
  const uploadButton = document.getElementById("uploadButton");
  const uploadStatus = document.getElementById("uploadStatus");

  const items = Object.values(inventory).sort((a, b) =>
    String(a.item_id || "").localeCompare(String(b.item_id || ""), undefined, { numeric: true })
  );
  const selectedCategories = new Set();
  let currentItemId = "";

  try {
    tokenInput.value = sessionStorage.getItem(TOKEN_KEY) || "";
  } catch (_) {}

  function normalizeId(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    if (/^\d+$/.test(text)) return text.padStart(4, "0");
    return text;
  }

  function categoriesForInventory() {
    return [...new Set(
      items
        .map(item => String(item.category ?? "").trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function buildCategoryFilters() {
    categoryFilters.replaceChildren();
    const categories = categoriesForInventory();

    if (categories.length === 0) {
      const note = document.createElement("span");
      note.className = "filter-help";
      note.textContent = "No categories found in the master sheet.";
      categoryFilters.append(note);
      return;
    }

    for (const category of categories) {
      const label = document.createElement("label");
      label.className = "category-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = category;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) selectedCategories.add(category);
        else selectedCategories.delete(category);
        renderHomeList();
      });

      const text = document.createElement("span");
      text.textContent = category;
      label.append(checkbox, text);
      categoryFilters.append(label);
    }
  }

  function matchingItems() {
    const query = searchInput.value.trim().toLowerCase();
    return items.filter(item => {
      const category = String(item.category ?? "").trim();
      const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(category);
      if (!categoryMatch) return false;
      if (!query) return true;

      const id = String(item.item_id ?? "").toLowerCase();
      const name = String(item.item_name ?? "").toLowerCase();
      return id.includes(query) || name.includes(query);
    });
  }

  function renderHomeList() {
    const results = matchingItems();
    inventoryRows.replaceChildren();

    for (const item of results) {
      const row = document.createElement("tr");
      row.tabIndex = 0;
      row.className = "inventory-row";
      row.setAttribute("aria-label", `Open item ${item.item_id}: ${item.item_name || "Unnamed Item"}`);

      const idCell = document.createElement("td");
      const nameCell = document.createElement("td");
      const categoryCell = document.createElement("td");
      idCell.textContent = item.item_id || "—";
      nameCell.textContent = item.item_name || "—";
      categoryCell.textContent = item.category || "—";
      row.append(idCell, nameCell, categoryCell);

      const open = () => showItem(item.item_id);
      row.addEventListener("click", open);
      row.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
      inventoryRows.append(row);
    }

    inventoryCount.textContent = `${results.length} of ${items.length} item${items.length === 1 ? "" : "s"} shown`;
    emptyResults.classList.toggle("hidden", results.length !== 0);
  }

  function showHome({ clearSearch = false } = {}) {
    currentItemId = "";
    if (clearSearch) searchInput.value = "";
    messagePanel.classList.add("hidden");
    itemPanel.classList.add("hidden");
    homePanel.classList.remove("hidden");
    uploadPanel.classList.add("hidden");
    toggleUploadButton.textContent = "Add Photos";
    const url = new URL(window.location.href);
    url.searchParams.delete("item");
    history.replaceState(null, "", url);
    renderHomeList();
  }

  function showMessage(text) {
    currentItemId = "";
    homePanel.classList.add("hidden");
    itemPanel.classList.add("hidden");
    messagePanel.textContent = text;
    messagePanel.classList.remove("hidden");
  }

  function resetUploader(itemId) {
    currentItemId = itemId;
    uploadPath.textContent = `photos/${itemId}/`;
    photoInput.value = "";
    fileSummary.textContent = "No photos selected.";
    uploadStatus.textContent = "";
    uploadStatus.className = "upload-status";
    uploadButton.disabled = false;
    uploadPanel.classList.add("hidden");
    toggleUploadButton.textContent = "Add Photos";
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

    resetUploader(item.item_id);
    searchInput.value = item.item_id;
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.item_id);
    history.replaceState(null, "", url);
  }

  async function githubRequest(path, token, options = {}) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`, {
      ...options,
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers || {})
      }
    });

    let body = null;
    const text = await response.text();
    if (text) {
      try { body = JSON.parse(text); } catch (_) { body = text; }
    }
    if (!response.ok) {
      const message = body && body.message ? body.message : `GitHub returned ${response.status}`;
      throw new Error(message);
    }
    return body;
  }

  async function fileToBase64(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function safeFileName(name, index) {
    const dot = name.lastIndexOf(".");
    const rawBase = dot > 0 ? name.slice(0, dot) : "photo";
    const rawExt = dot > 0 ? name.slice(dot).toLowerCase() : ".jpg";
    const base = rawBase.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
    const ext = /^\.(jpe?g|png|webp|gif)$/i.test(rawExt) ? rawExt : ".jpg";
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    return `${stamp}-${String(index + 1).padStart(2, "0")}-${base}${ext}`;
  }

  async function uploadFiles() {
    if (!currentItemId) return;
    const token = tokenInput.value.trim();
    const files = Array.from(photoInput.files || []);

    if (!token) {
      uploadStatus.textContent = "Enter your GitHub token first.";
      uploadStatus.className = "upload-status error";
      return;
    }
    if (files.length === 0) {
      uploadStatus.textContent = "Select at least one photo.";
      uploadStatus.className = "upload-status error";
      return;
    }
    if (files.length > 20) {
      uploadStatus.textContent = "Upload up to 20 photos at a time.";
      uploadStatus.className = "upload-status error";
      return;
    }

    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (_) {}

    uploadButton.disabled = true;
    uploadStatus.textContent = `Preparing ${files.length} photo${files.length === 1 ? "" : "s"}…`;
    uploadStatus.className = "upload-status";

    try {
      const ref = await githubRequest(`/git/ref/heads/${GITHUB_BRANCH}`, token);
      const parentSha = ref.object.sha;
      const parentCommit = await githubRequest(`/git/commits/${parentSha}`, token);
      const baseTreeSha = parentCommit.tree.sha;

      const treeEntries = [];
      for (let i = 0; i < files.length; i++) {
        uploadStatus.textContent = `Preparing photo ${i + 1} of ${files.length}…`;
        const file = files[i];
        const content = await fileToBase64(file);
        const blob = await githubRequest("/git/blobs", token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, encoding: "base64" })
        });
        treeEntries.push({
          path: `photos/${currentItemId}/${safeFileName(file.name, i)}`,
          mode: "100644",
          type: "blob",
          sha: blob.sha
        });
      }

      uploadStatus.textContent = "Saving photos to GitHub…";
      const newTree = await githubRequest("/git/trees", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries })
      });

      const newCommit = await githubRequest("/git/commits", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Add photos for item ${currentItemId}`,
          tree: newTree.sha,
          parents: [parentSha]
        })
      });

      await githubRequest(`/git/refs/heads/${GITHUB_BRANCH}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha: newCommit.sha, force: false })
      });

      photoInput.value = "";
      fileSummary.textContent = "No photos selected.";
      uploadStatus.textContent = `${files.length} photo${files.length === 1 ? "" : "s"} uploaded. The site will show them after GitHub Pages rebuilds.`;
      uploadStatus.className = "upload-status success";
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      uploadStatus.textContent = `Upload failed: ${detail}`;
      uploadStatus.className = "upload-status error";
    } finally {
      uploadButton.disabled = false;
    }
  }

  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    const normalized = normalizeId(searchInput.value);
    if (inventory[normalized]) showItem(normalized);
    else showHome();
  });

  searchInput.addEventListener("input", () => {
    if (!homePanel.classList.contains("hidden")) renderHomeList();
  });

  document.getElementById("refreshButton").addEventListener("click", () => window.location.reload());

  clearFiltersButton.addEventListener("click", () => {
    selectedCategories.clear();
    searchInput.value = "";
    for (const checkbox of categoryFilters.querySelectorAll('input[type="checkbox"]')) checkbox.checked = false;
    renderHomeList();
  });

  toggleUploadButton.addEventListener("click", () => {
    uploadPanel.classList.toggle("hidden");
    toggleUploadButton.textContent = uploadPanel.classList.contains("hidden") ? "Add Photos" : "Hide Upload";
  });

  clearTokenButton.addEventListener("click", () => {
    tokenInput.value = "";
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (_) {}
    uploadStatus.textContent = "Token cleared from this browser session.";
    uploadStatus.className = "upload-status";
  });

  photoInput.addEventListener("change", () => {
    const count = photoInput.files ? photoInput.files.length : 0;
    fileSummary.textContent = count ? `${count} photo${count === 1 ? "" : "s"} selected.` : "No photos selected.";
  });

  uploadButton.addEventListener("click", uploadFiles);

  buildCategoryFilters();
  renderHomeList();

  const queryId = new URLSearchParams(window.location.search).get("item");
  if (queryId) showItem(queryId);
})();
