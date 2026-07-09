/* Renders the filterable Ordinances / Resolutions list.
   Expects <body data-doctype="ordinance"|"resolution"> and the markup IDs below. */

document.addEventListener("DOMContentLoaded", () => {
  const doctype = document.body.dataset.doctype;
  if (!doctype) return;

  const isOrdinance = doctype === "ordinance";
  const data = isOrdinance ? ORDINANCES : RESOLUTIONS;
  const detailPage = isOrdinance ? "ordinance-detail.html" : "resolution-detail.html";
  const label = isOrdinance ? "Ordinance" : "Resolution";

  const listEl = document.getElementById("doc-list");
  const countEl = document.getElementById("doc-count");
  const searchEl = document.getElementById("doc-search");
  const categoryEl = document.getElementById("doc-category");
  const yearEl = document.getElementById("doc-year");
  const paginationEl = document.getElementById("doc-pagination");

  const PAGE_SIZE = 6;
  let currentPage = 1;

  // Populate category filter
  CATEGORIES.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryEl.appendChild(opt);
  });

  // Populate year filter
  const years = [...new Set(data.map((d) => d.series))].sort((a, b) => b - a);
  const allYearsOpt = document.createElement("option");
  allYearsOpt.value = "All Years";
  allYearsOpt.textContent = "All Years";
  yearEl.appendChild(allYearsOpt);
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = "Series of " + y;
    yearEl.appendChild(opt);
  });

  const docIconSvg = `<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6V2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 4h8v1.5H8V16zm0-8h4v1.5H8V8z"/></svg>`;

  function render() {
    const q = (searchEl.value || "").toLowerCase().trim();
    const cat = categoryEl.value;
    const yr = yearEl.value;

    const filtered = data
      .filter((d) => {
        const matchesQ = !q || d.title.toLowerCase().includes(q) || d.number.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q);
        const matchesCat = !cat || cat === "All Categories" || d.category === cat;
        const matchesYr = !yr || yr === "All Years" || d.series === yr;
        return matchesQ && matchesCat && matchesYr;
      })
      .sort((a, b) => sortKey(b) - sortKey(a));

    if (filtered.length === 0) {
      countEl.textContent = `Showing 0 of ${data.length} ${label.toLowerCase()}${data.length === 1 ? "" : "s"}`;
      listEl.innerHTML = `<div class="no-results">No ${label.toLowerCase()}s match your search. Try a different keyword or clear the filters.</div>`;
      if (paginationEl) paginationEl.innerHTML = "";
      return;
    }

    let itemsToShow = filtered;
    let totalPages = 1;

    if (paginationEl) {
      totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const start = (currentPage - 1) * PAGE_SIZE;
      itemsToShow = filtered.slice(start, start + PAGE_SIZE);

      countEl.textContent = `Showing ${start + 1}–${start + itemsToShow.length} of ${filtered.length} ${label.toLowerCase()}${filtered.length === 1 ? "" : "s"}`;
    } else {
      countEl.textContent = `Showing ${filtered.length} of ${data.length} ${label.toLowerCase()}${data.length === 1 ? "" : "s"}`;
    }

    listEl.innerHTML = itemsToShow
      .map(
        (d) => `
      <div class="doc-item">
        <div class="doc-icon">${docIconSvg}</div>
        <div class="doc-body">
          <div class="doc-meta">
            <span class="tag">${d.number}</span>
            <span>${d.category}</span>
            <span>${d.dateApproved ? "Approved " + formatDate(d.dateApproved) : "Series " + d.series}</span>
            <span>${d.status}</span>
          </div>
          <h3><a href="${detailPage}?id=${d.id}">${d.title}</a></h3>
          <p class="doc-excerpt">${d.excerpt}</p>
        </div>
        <div class="doc-actions">
          <a href="${detailPage}?id=${d.id}">View Details →</a>
        </div>
      </div>`
      )
      .join("");

    if (paginationEl) renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    let html = "";
    html += currentPage > 1
      ? `<a href="#" data-page="${currentPage - 1}">←</a>`
      : `<span style="opacity:.4;">←</span>`;

    for (let p = 1; p <= totalPages; p++) {
      html += p === currentPage
        ? `<span class="active">${p}</span>`
        : `<a href="#" data-page="${p}">${p}</a>`;
    }

    html += currentPage < totalPages
      ? `<a href="#" data-page="${currentPage + 1}">Next →</a>`
      : `<span style="opacity:.4;">Next →</span>`;

    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll("a[data-page]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = parseInt(a.dataset.page, 10);
        render();
        document.querySelector(".doc-toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function sortKey(d) {
    const parts = d.id.split("-");
    const series = parseInt(parts[1], 10) || 0;
    const rest = parts.slice(2).join("-");
    const m = rest.match(/^(\d+)([a-z]*)$/i);
    const base = m ? parseInt(m[1], 10) : 0;
    const suffix = m && m[2] ? 1 : 0;
    return series * 10000 + base * 10 + suffix;
  }

  function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function onFilterChange() {
    currentPage = 1;
    render();
  }

  searchEl.addEventListener("input", onFilterChange);
  categoryEl.addEventListener("change", onFilterChange);
  yearEl.addEventListener("change", onFilterChange);

  render();
});
