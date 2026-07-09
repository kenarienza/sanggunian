/* Renders a single ordinance/resolution detail page.
   Expects <body data-doctype="ordinance"|"resolution"> and markup IDs below. */

document.addEventListener("DOMContentLoaded", () => {
  const doctype = document.body.dataset.doctype;
  if (!doctype) return;

  const isOrdinance = doctype === "ordinance";
  const data = isOrdinance ? ORDINANCES : RESOLUTIONS;
  const listPage = isOrdinance ? "ordinances.html" : "resolutions.html";
  const detailPage = isOrdinance ? "ordinance-detail.html" : "resolution-detail.html";
  const label = isOrdinance ? "Ordinance" : "Resolution";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const doc = data.find((d) => d.id === id) || data[0];

  function formatDate(str) {
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  document.title = `${doc.number} — Sangguniang Bayan ng Carmen`;

  document.getElementById("breadcrumb-current").textContent = doc.number;
  document.getElementById("doc-number-tag").textContent = doc.number;
  document.getElementById("doc-title").textContent = doc.title;
  document.getElementById("doc-status").textContent = doc.status;

  document.getElementById("doc-sidebar-number").textContent = doc.number;
  document.getElementById("doc-sidebar-series").textContent = "Series of " + doc.series;
  document.getElementById("doc-sidebar-category").textContent = doc.category;
  document.getElementById("doc-sidebar-author").textContent = doc.author;
  document.getElementById("doc-sidebar-date").textContent = doc.dateApproved ? formatDate(doc.dateApproved) : "On file (exact date pending)";
  document.getElementById("doc-sidebar-status").textContent = doc.status;

  const bodyEl = document.getElementById("doc-body-content");
  if (doc.pdf) {
    bodyEl.innerHTML = `
      <p>${doc.body[0]}</p>
      <div class="pdf-embed"><embed src="${doc.pdf}" type="application/pdf"></div>
      <p><a href="${doc.pdf}" target="_blank" rel="noopener">Open the scanned copy in a new tab →</a></p>
    `;
  } else {
    bodyEl.innerHTML = doc.body.map((p) => `<p>${p}</p>`).join("");
  }

  const downloadLink = document.getElementById("doc-download");
  if (downloadLink) {
    if (doc.pdf) {
      downloadLink.href = doc.pdf;
      downloadLink.setAttribute("download", doc.number.replace(/\s+/g, "_") + ".pdf");
      downloadLink.target = "_blank";
    } else {
      downloadLink.setAttribute("download", doc.number.replace(/\s+/g, "_") + ".txt");
    }
  }

  // Related documents (same category, excluding current)
  const related = data.filter((d) => d.category === doc.category && d.id !== doc.id).slice(0, 3);
  const relatedEl = document.getElementById("related-docs");
  if (relatedEl) {
    if (related.length === 0) {
      relatedEl.innerHTML = `<p style="font-size:14px;color:var(--text-muted);">No related ${label.toLowerCase()}s found in this category yet.</p>`;
    } else {
      relatedEl.innerHTML = related
        .map(
          (d) => `<a href="${detailPage}?id=${d.id}" style="display:block;padding:12px 0;border-bottom:1px solid var(--border);font-size:14px;font-weight:600;">${d.number}<br><span style="font-weight:400;color:var(--text-muted);font-size:13px;">${d.title}</span></a>`
        )
        .join("");
    }
  }

  const backLink = document.getElementById("back-to-list");
  if (backLink) backLink.href = listPage;
});
