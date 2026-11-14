/**
 * API client for Earth Trend Detective FastAPI backend.
 */

const API_BASE = '/api';

export async function fetchVariables() {
  const res = await fetch(`${API_BASE}/variables`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch variables (${res.status})`);
  }
  return res.json();
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch presets (${res.status})`);
  }
  return res.json();
}

export async function fetchDemos() {
  const res = await fetch(`${API_BASE}/demos`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch demos (${res.status})`);
  }
  return res.json();
}

export async function fetchDetectiveQuestions() {
  const res = await fetch(`${API_BASE}/detective/questions`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch questions (${res.status})`);
  }
  return res.json();
}

export async function recommendMission(environment, sphere, concern) {
  const res = await fetch(`${API_BASE}/detective/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment, sphere, concern }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Recommendation failed (${res.status})`);
  }
  return res.json();
}

export async function runAnalysis({ lat, lon, variable, start_year, end_year, name }) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      variable,
      start_year: parseInt(start_year, 10),
      end_year: parseInt(end_year, 10),
      name: name || undefined,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Analysis request failed (HTTP ${res.status})`);
  }
  return res.json();
}

export async function runComparison({ locationA, locationB, variable, start_year, end_year }) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationA: {
        lat: parseFloat(locationA.lat),
        lon: parseFloat(locationA.lon),
        name: locationA.name || undefined,
      },
      locationB: {
        lat: parseFloat(locationB.lat),
        lon: parseFloat(locationB.lon),
        name: locationB.name || undefined,
      },
      variable,
      start_year: parseInt(start_year, 10),
      end_year: parseInt(end_year, 10),
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Comparison request failed (HTTP ${res.status})`);
  }
  return res.json();
}
