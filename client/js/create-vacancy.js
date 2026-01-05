import { api, clearToken, getToken } from './api.js';

const msg = document.getElementById('msg');
const form = document.getElementById('vacancyForm');

if (!getToken()) window.location.href = './login.html';

document.getElementById('logout').addEventListener('click', () => {
  clearToken();
  window.location.href = './login.html';
});

function setMsg(text, isError = false) {
  msg.textContent = text;
  msg.style.color = isError ? 'crimson' : 'green';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  const technologiesRaw = (fd.get('technologies') || '').toString().trim();
  const technologies = technologiesRaw
    ? technologiesRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const body = {
    title: fd.get('title')?.toString().trim(),
    company: fd.get('company')?.toString().trim(),
    description: fd.get('description')?.toString().trim(),
    location: fd.get('location')?.toString().trim() || null,
    seniority: fd.get('seniority')?.toString() || null,
    salaryMin: fd.get('salaryMin') ? fd.get('salaryMin').toString() : null,
    salaryMax: fd.get('salaryMax') ? fd.get('salaryMax').toString() : null,
    technologies,
  };

  try {
    setMsg('Creating vacancy...');

    const res = await api('/vacancies', {
      method: 'POST',
      body,
    });

    setMsg(res?.message || 'Vacancy created.');
    form.reset();
  } catch (e) {
    setMsg(e.message || 'Error creating vacancy.', true);
  }
});
