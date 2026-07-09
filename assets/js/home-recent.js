/* Renders the homepage's "Recently Filed Ordinances & Resolutions" list
   from the same data used by the Ordinances/Resolutions pages, latest first. */

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("home-doc-list");
  if (!listEl || typeof ORDINANCES === "undefined" || typeof RESOLUTIONS === "undefined") return;

  const docIconSvg = `<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6V2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 4h8v1.5H8V16zm0-8h4v1.5H8V8z"/></svg>`;

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

  const latest = [
    ...ORDINANCES.map((d) => ({ ...d, type: "ordinance" })),
    ...RESOLUTIONS.map((d) => ({ ...d, type: "resolution" }))
  ]
    .sort((a, b) => sortKey(b) - sortKey(a))
    .slice(0, 3);

  listEl.innerHTML = latest
    .map((d) => {
      const detailPage = d.type === "ordinance" ? "ordinance-detail.html" : "resolution-detail.html";
      return `
      <div class="doc-item">
        <div class="doc-icon">${docIconSvg}</div>
        <div class="doc-body">
          <div class="doc-meta">
            <span class="tag">${d.number}</span>
            <span>${d.category}</span>
            <span>${d.dateApproved ? "Approved " + formatDate(d.dateApproved) : "Series " + d.series}</span>
          </div>
          <h3><a href="${detailPage}?id=${d.id}">${d.title}</a></h3>
          <p class="doc-excerpt">${d.excerpt}</p>
        </div>
        <div class="doc-actions"><a href="${detailPage}?id=${d.id}">View Details →</a></div>
      </div>`;
    })
    .join("");
});
