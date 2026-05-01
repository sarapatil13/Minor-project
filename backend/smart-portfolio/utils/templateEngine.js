function renderTemplate(template, data) {
  let html = template;

  html = html.replace("{{name}}", data.name || "Student Name");

  // Render Publications
  const publicationsHtml = data.publications && data.publications.length > 0
    ? data.publications.map(p => `
        <li>
          <div class="item-header">
            <span class="item-title">${p.title}</span>
            <span class="date">${p.year}</span>
          </div>
          <span class="item-desc">${p.description}</span>
        </li>
      `).join("")
    : "<li>No publications recorded.</li>";

  html = html.replace("{{publications}}", publicationsHtml);

  // Render Events
  const eventsHtml = data.events && data.events.length > 0
    ? data.events.map(e => `
        <li>
          <div class="item-header">
            <span class="item-title">${e.title}</span>
            <span class="date">${e.year}</span>
          </div>
          <span class="item-desc">${e.description}</span>
        </li>
      `).join("")
    : "<li>No events recorded.</li>";

  html = html.replace("{{events}}", eventsHtml);

  return html;
}

module.exports = renderTemplate;