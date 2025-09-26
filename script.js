document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  if (document.getElementById("site-name")) {
    document.getElementById("site-name").textContent = siteSettings.name;
  }
  if (document.getElementById("site-logo")) {
    document.getElementById("site-logo").src = siteSettings.logo;
  }

  const menuItems = document.getElementById("menu-items");
  if (menuItems) {
    siteSettings.menu.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      menuItems.appendChild(li);
    });
  }
});

if (document.getElementById("login-btn")) {
  document.getElementById("login-btn").addEventListener("click", () => {
    const pw = document.getElementById("admin-password").value;
    if (pw === ADMIN_PASSWORD) {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
    } else {
      alert("Wrong password!");
    }
  });
}

document.querySelectorAll(".admin-menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
    document.getElementById(btn.dataset.tab + "-tab").style.display = "block";
  });
});

if (document.getElementById("site-form")) {
  document.getElementById("site-form").addEventListener("submit", e => {
    e.preventDefault();
    siteSettings.name = document.getElementById("site-name-input").value || siteSettings.name;
    siteSettings.menu = document.getElementById("menu-items-input").value.split(",").map(i => i.trim());
    alert("Site settings updated! Refresh to see changes.");
  });
}
