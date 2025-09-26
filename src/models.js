const dayjs = require('dayjs');
const path = require('path');
const storage = require('./storage');

function listWebsites() {
  const data = storage.read();
  return data.websites.map(website => ({
    ...website,
    created_at: dayjs(website.created_at).toISOString(),
    last_digest_at: website.last_digest_at ? dayjs(website.last_digest_at).toISOString() : null
  }));
}

function nextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

function createWebsite({ url, recipientEmail }) {
  const data = storage.read();
  const website = {
    id: nextId(data.websites),
    url,
    recipient_email: recipientEmail,
    created_at: dayjs().toISOString(),
    last_digest_at: null
  };
  data.websites.push(website);
  storage.write(data);
  return { ...website };
}

function findWebsite(id) {
  const data = storage.read();
  const website = data.websites.find(item => item.id === Number(id));
  if (!website) return null;
  return { ...website };
}

function updateWebsite(id, { url, recipientEmail }) {
  const data = storage.read();
  const index = data.websites.findIndex(item => item.id === Number(id));
  if (index === -1) return null;
  data.websites[index] = {
    ...data.websites[index],
    url,
    recipient_email: recipientEmail
  };
  storage.write(data);
  return { ...data.websites[index] };
}

function deleteWebsite(id) {
  const data = storage.read();
  data.websites = data.websites.filter(item => item.id !== Number(id));
  data.captures = data.captures.filter(item => item.website_id !== Number(id));
  storage.write(data);
}

function recordCapture(websiteId, imagePath, capturedAt) {
  const data = storage.read();
  data.captures.push({
    id: nextId(data.captures),
    website_id: Number(websiteId),
    image_path: imagePath,
    captured_at: capturedAt
  });
  storage.write(data);
}

function listCaptures(websiteId) {
  const data = storage.read();
  return data.captures
    .filter(capture => capture.website_id === Number(websiteId))
    .sort((a, b) => dayjs(b.captured_at).valueOf() - dayjs(a.captured_at).valueOf())
    .map(capture => ({
      ...capture,
      image_url: `/storage/${path.relative(path.join(__dirname, '..', 'storage'), capture.image_path).replace(/\\/g, '/')}`
    }));
}

function recentCaptures(websiteId, limit = 30) {
  return listCaptures(websiteId)
    .slice(0, limit)
    .map(capture => ({
      ...capture,
      image_url: undefined
    }));
}

function capturesSince(websiteId, isoDate) {
  const captures = listCaptures(websiteId);
  return captures.filter(capture => dayjs(capture.captured_at).isAfter(dayjs(isoDate))).length;
}

function updateDigestTimestamp(websiteId, isoDate) {
  const data = storage.read();
  const index = data.websites.findIndex(item => item.id === Number(websiteId));
  if (index === -1) return;
  data.websites[index].last_digest_at = isoDate;
  storage.write(data);
}

module.exports = {
  listWebsites,
  createWebsite,
  findWebsite,
  updateWebsite,
  deleteWebsite,
  recordCapture,
  listCaptures,
  recentCaptures,
  capturesSince,
  updateDigestTimestamp
};
