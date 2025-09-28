const createForm = document.querySelector('#create-form');
const refreshButton = document.querySelector('#refresh');
const websitesContainer = document.querySelector('#websites');
const template = document.querySelector('#website-template');
const capturesCard = document.querySelector('#captures-card');
const capturesContainer = document.querySelector('#captures');
const closeCaptures = document.querySelector('#close-captures');

async function fetchJSON(url, options) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error de red');
  }
  return response.json();
}

async function loadWebsites() {
  websitesContainer.innerHTML = '<p>Cargando...</p>';
  try {
    const websites = await fetchJSON('/api/websites');
    if (!websites.length) {
      websitesContainer.innerHTML = '<p>No hay webs registradas todavía.</p>';
      return;
    }
    websitesContainer.innerHTML = '';
    websites.forEach(website => {
      const node = template.content.cloneNode(true);
      node.querySelector('.website').dataset.id = website.id;
      node.querySelector('.website__url').textContent = website.url;
      node.querySelector('.website__email').textContent = `Destino: ${website.recipient_email}`;
      node.querySelector('.edit').addEventListener('click', () => openEditModal(website));
      node.querySelector('.delete').addEventListener('click', () => deleteWebsite(website.id));
      node.querySelector('.show-captures').addEventListener('click', () => showCaptures(website.id));
      const captureButton = node.querySelector('.capture-now');
      captureButton.addEventListener('click', () => triggerCapture(website.id, captureButton));
      websitesContainer.appendChild(node);
    });
  } catch (error) {
    websitesContainer.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function createWebsite(event) {
  event.preventDefault();
  const formData = new FormData(createForm);
  const payload = {
    url: formData.get('url'),
    recipientEmail: formData.get('recipientEmail')
  };
  try {
    await fetchJSON('/api/websites', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    createForm.reset();
    await loadWebsites();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteWebsite(id) {
  if (!confirm('¿Eliminar esta web?')) return;
  try {
    await fetch(`/api/websites/${id}`, { method: 'DELETE' });
    await loadWebsites();
  } catch (error) {
    alert(error.message);
  }
}

function openEditModal(website) {
  const url = prompt('Nueva URL', website.url);
  if (!url) return;
  const recipientEmail = prompt('Nuevo correo destinatario', website.recipient_email);
  if (!recipientEmail) return;
  fetchJSON(`/api/websites/${website.id}`, {
    method: 'PUT',
    body: JSON.stringify({ url, recipientEmail })
  })
    .then(loadWebsites)
    .catch(error => alert(error.message));
}

async function showCaptures(id) {
  capturesCard.hidden = false;
  capturesCard.dataset.websiteId = String(id);
  capturesContainer.innerHTML = '<p>Cargando capturas...</p>';
  try {
    const captures = await fetchJSON(`/api/websites/${id}/captures`);
    if (!captures.length) {
      capturesContainer.innerHTML = '<p>No hay capturas todavía.</p>';
      return;
    }
    capturesContainer.innerHTML = '';
    captures.forEach(capture => {
      const article = document.createElement('article');
      article.className = 'capture';
      const img = document.createElement('img');
      img.src = capture.image_url;
      img.alt = `Captura del ${capture.captured_at_formatted}`;
      const meta = document.createElement('div');
      meta.className = 'capture__meta';
      meta.innerHTML = `
        <strong>${capture.captured_at_formatted}</strong>
        <a href="${capture.image_url}" download>Descargar</a>
      `;
      article.appendChild(img);
      article.appendChild(meta);
      capturesContainer.appendChild(article);
    });
  } catch (error) {
    capturesContainer.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function triggerCapture(id, button) {
  const originalText = button ? button.textContent : '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Capturando...';
  }
  try {
    const result = await fetchJSON(`/api/websites/${id}/capture`, { method: 'POST' });
    const { capture, notifications } = result;
    const lines = [result.message];
    if (notifications) {
      lines.push(
        `Correo de captura: ${notifications.screenshotEmailSent ? 'enviado' : 'omitido'}`
      );
      if (notifications.digestPeriod) {
        lines.push(
          `Resumen mensual: ${notifications.digestEmailSent ? 'enviado' : 'omitido'} (${notifications.digestPeriod.start} - ${notifications.digestPeriod.end})`
        );
      }
    }
    alert(lines.join('\n'));
    if (!capturesCard.hidden && capturesCard.dataset.websiteId === String(id)) {
      await showCaptures(id);
    }
    return capture;
  } catch (error) {
    alert(error.message);
    throw error;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText || 'Captura de prueba';
    }
  }
}

createForm.addEventListener('submit', createWebsite);
refreshButton.addEventListener('click', loadWebsites);
closeCaptures.addEventListener('click', () => {
  capturesCard.hidden = true;
  delete capturesCard.dataset.websiteId;
});

loadWebsites();
