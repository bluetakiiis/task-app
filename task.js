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
  } else {
    console.error("Popup elements not found in the DOM.");
  }
});
