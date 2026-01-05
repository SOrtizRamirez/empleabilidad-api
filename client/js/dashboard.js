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

document.getElementById("btn_clear").addEventListener("click", () => {
  document.getElementById("q").value = "";
  document.getElementById("tech").value = "";
  document.getElementById("seniority").value = "";
  document.getElementById("status").value = "";
});

document.getElementById("btn_all").addEventListener("click", loadAllVacancies);
document.getElementById("btn_search").addEventListener("click", searchVacancies);

async function loadAllVacancies() {
  try {
    msg.textContent = "Loading all vacancies...";
    ulVac.innerHTML = "";

    const res = await api("/vacancies");
    renderVacancies(res);

    msg.textContent = "";
  } catch (e) {
    msg.textContent = e.message;
  }
}

async function searchVacancies() {
  try {
    msg.textContent = "Searching vacancies...";
    ulVac.innerHTML = "";

    const q = document.getElementById("q").value.trim();
    const tech = document.getElementById("tech").value.trim();
    const seniority = document.getElementById("seniority").value;
    const status = document.getElementById("status").value;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tech) params.set("tech", tech);
    if (seniority) params.set("seniority", seniority);
    if (status) params.set("status", status);

    const path = params.toString()
      ? `/vacancies/search?${params.toString()}`
      : "/vacancies/search";

    const res = await api(path);
    renderVacancies(res);

    msg.textContent = "";
  } catch (e) {
    msg.textContent = e.message;
  }
}

function normalizeListResponse(res) {
  const root = res?.data ?? res;
  if (Array.isArray(root)) return root;

  if (root?.data && Array.isArray(root.data)) return root.data;

  return [];
}

function renderVacancies(res) {
  const rows = normalizeListResponse(res);

  if (!rows.length) {
    ulVac.innerHTML = "<li>No vacancies found.</li>";
    return;
  }

  rows.forEach((v) => {
    const techs = Array.isArray(v.technologies) && v.technologies.length
      ? v.technologies.join(", ")
      : "N/A";

    const senior = v.seniority ?? "N/A";

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="vacancy-item">
        <div class="vacancy-left">
          <div><strong>${v.title}</strong> — ${v.company}</div>
          <div class="meta">
            Status: ${v.status} | Seniority: ${senior} | Tech: ${techs}
          </div>
        </div>
        <button data-id="${v.id}">Apply</button>
      </div>
    `;

    li.querySelector("button").addEventListener("click", () => apply(v.id));
    ulVac.appendChild(li);
  });
}

async function apply(vacancyId) {
  try {
    msg.textContent = "Applying...";
    await api("/applications", {
      method: "POST",
      body: {
        vacancyId,
        coverLetter:
          "I am interested in this vacancy. I have experience with NestJS and PostgreSQL.",
      },
    });
    msg.textContent = "Application created.";
  } catch (e) {
    msg.textContent = e.message;
  }
}

document.getElementById("load_apps").addEventListener("click", async () => {
  try {
    msg.textContent = "Loading applications...";
    ulApps.innerHTML = "";

    const res = await api("/applications/me");
    const root = res?.data ?? res;
    const rows = Array.isArray(root) ? root : (root?.data ?? []);

    if (!rows.length) {
      ulApps.innerHTML = "<li>No applications yet.</li>";
      msg.textContent = "";
      return;
    }

    rows.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = `Application #${a.id} — Vacancy ${a.vacancyId} — ${a.status}`;
      ulApps.appendChild(li);
    });

    msg.textContent = "";
  } catch (e) {
    msg.textContent = e.message;
  }
});
