document.addEventListener("DOMContentLoaded", function () {
  const userLogo = document.getElementById("userLogo");
  const userPopup = document.getElementById("userPopup");
  const closePopup = document.getElementById("closePopup");

  if (userLogo && userPopup && closePopup) {
    userLogo.addEventListener("click", function (e) {
      e.stopPropagation();
      userPopup.style.display = "flex";
    });

    closePopup.addEventListener("click", function () {
      userPopup.style.display = "none";
    });

    userPopup.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        userPopup.style.display = "none";
      }
    });
  }

  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const deletePopup = document.getElementById("deletePopup");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteCloseBtn = document.getElementById("deleteCloseBtn");

  if (deleteAccountBtn && deletePopup) {
    deleteAccountBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deletePopup.style.display = "flex";
    });
  }

  const closeDeletePopup = function () {
    deletePopup.style.display = "none";
  };

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", function () {
      localStorage.clear();
      closeDeletePopup();
      hideAppSections();
      showLoginPage();
    });
  }

  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", function () {
      closeDeletePopup();
      if (userPopup) {
        userPopup.style.display = "flex";
      }
    });
  }

  if (deleteCloseBtn) {
    deleteCloseBtn.addEventListener("click", closeDeletePopup);
  }

  deletePopup.addEventListener("click", function (e) {
    if (e.target === deletePopup) {
      closeDeletePopup();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (userPopup && userPopup.style.display === "flex") {
        userPopup.style.display = "none";
      }
      if (deletePopup && deletePopup.style.display === "flex") {
        closeDeletePopup();
      }
    }
  });

  function hideAppSections() {
    appSidebar.style.display = "none";
    appHeader.style.display = "none";
    appContent.style.display = "none";
    appFooter.style.display = "none";
  }

  function showLoginPage() {
    if (loginPage) {
      loginPage.style.display = "flex";
      if (usernameInput) usernameInput.value = "";
    }
  }

  const loginPage = document.getElementById("loginPage");
  const loginButton = document.getElementById("loginButton");
  const usernameInput = document.getElementById("usernameInput");
  const rememberCheckbox = document.getElementById("rememberCheckbox");
  const greetingElement = document.getElementById("greetingElement");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const logoutButton = document.getElementById("logoutButton");

  const appSidebar = document.getElementById("appSidebar");
  const appHeader = document.getElementById("appHeader");
  const appContent = document.getElementById("appContent");
  const appFooter = document.getElementById("appFooter");

  const storedUsername = localStorage.getItem("taskflowUsername");
  if (storedUsername) {
    showApp(storedUsername);
  }

  loginButton.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    if (username) {
      if (rememberCheckbox.checked) {
        localStorage.setItem("taskflowUsername", username);
      }
      showApp(username);
    } else {
      alert("Please enter a username");
    }
  });

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("taskflowUsername");

    appSidebar.style.display = "none";
    appHeader.style.display = "none";
    appContent.style.display = "none";
    appFooter.style.display = "none";

    loginPage.style.display = "flex";
  });

  usernameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      loginButton.click();
    }
  });

  document.querySelector(".remember-label").addEventListener("click", function () {
    rememberCheckbox.checked = !rememberCheckbox.checked;
  });

  document.querySelector(".remember-checkbox-container").addEventListener("click", function () {
    rememberCheckbox.checked = !rememberCheckbox.checked;
  });

  function showApp(username) {
    loginPage.style.display = "none";

    appSidebar.style.display = "block";
    appHeader.style.display = "grid";
    appContent.style.display = "grid";
    appFooter.style.display = "grid";

    greetingElement.textContent = `Hello, ${username}!`;
    userNameDisplay.textContent = username;
  }
});

