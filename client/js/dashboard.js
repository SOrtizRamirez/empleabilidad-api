import { api, clearToken, getToken } from "./api.js";

const msg = document.getElementById("msg");
const ulVac = document.getElementById("vacancies");
const ulApps = document.getElementById("apps");

if (!getToken()) window.location.href = "./login.html";

document.getElementById("logout").addEventListener("click", async () => {
  try {
  } catch {}
  clearToken();
  window.location.href = "./login.html";
});

document.getElementById("load_vacancies").addEventListener("click", async () => {
  try {
    msg.textContent = "Cargando vacantes...";
    ulVac.innerHTML = "";

    const res = await api("/vacancies");
    const data = res.data ?? res;

    (data.data ?? data).forEach((v) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${v.title}</strong> — ${v.company} (${v.status})
        <button data-id="${v.id}">Apply</button>
      `;
      li.querySelector("button").addEventListener("click", () => apply(v.id));
      ulVac.appendChild(li);
    });

    msg.textContent = "";
  } catch (e) {
    msg.textContent = e.message;
  }
});

async function apply(vacancyId) {
  try {
    msg.textContent = "Aplicando...";
    await api("/applications", {
      method: "POST",
      body: { vacancyId, coverLetter: "Me interesa esta vacante. Tengo experiencia con NestJS y Postgres." },
    });
    msg.textContent = "Aplicación creada";
  } catch (e) {
    msg.textContent = e.message;
  }
}

document.getElementById("load_apps").addEventListener("click", async () => {
  try {
    msg.textContent = "Cargando aplicaciones...";
    ulApps.innerHTML = "";

    const res = await api("/applications/me");
    const data = res.data ?? res;

    (data.data ?? data).forEach((a) => {
      const li = document.createElement("li");
      li.textContent = `Application #${a.id} — Vacancy ${a.vacancyId} — ${a.status}`;
      ulApps.appendChild(li);
    });

    msg.textContent = "";
  } catch (e) {
    msg.textContent = e.message;
  }
});
