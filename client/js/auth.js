import { api, setToken } from "./api.js";

const msg = document.getElementById("msg");

document.getElementById("btn_register").addEventListener("click", async () => {
  try {
    msg.textContent = "Registrando...";
    const fullName = document.getElementById("r_name").value;
    const email = document.getElementById("r_email").value;
    const password = document.getElementById("r_pass").value;

    const res = await api("/auth/register", { method: "POST", auth: false, body: { fullName, email, password } });
    setToken(res.accessToken);
    window.location.href = "./dashboard.html";
  } catch (e) {
    msg.textContent = e.message;
  }
});

document.getElementById("btn_login").addEventListener("click", async () => {
  try {
    msg.textContent = "Logueando...";
    const email = document.getElementById("l_email").value;
    const password = document.getElementById("l_pass").value;

    const res = await api("/auth/login", { method: "POST", auth: false, body: { email, password } });
    setToken(res.accessToken);
    window.location.href = "./dashboard.html";
  } catch (e) {
    msg.textContent = e.message;
  }
});
