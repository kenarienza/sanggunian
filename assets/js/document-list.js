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

    countEl.textContent = `Showing ${filtered.length} of ${data.length} ${label.toLowerCase()}${data.length === 1 ? "" : "s"}`;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="no-results">No ${label.toLowerCase()}s match your search. Try a different keyword or clear the filters.</div>`;
      return;
    }

    listEl.innerHTML = filtered
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

  searchEl.addEventListener("input", render);
  categoryEl.addEventListener("change", render);
  yearEl.addEventListener("change", render);

  render();
});
