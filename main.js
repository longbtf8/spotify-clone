import httpRequest from "./utils/httpRequest.js";
import {
  showTodayBiggestHit,
  showPopularArtists,
  playerSongHome,
} from "./utils/tracks.js";
import { showFlowerArtist } from "./utils/library.js";
import { initPlayListManager } from "./utils/playlist.js";
// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");
  const formSignUpLog = document.querySelectorAll(".auth-form-content");
  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });
  formSignUpLog.forEach((form) => {
    form.addEventListener("focusin", (e) => {
      const formField = e.target.closest(".form-group");

      if (!formField) return;
      formField.classList.remove("invalid");
      const err = formField.querySelector(".error-message span ");
      if (err) {
        err.textContent = "";
      }
    });
  });

  signupForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.querySelector("#signupEmail").value.trim();
      const password = document.querySelector("#signupPassword").value;
      const credentials = {
        email,
        password,
      };
      try {
        const { user, access_token } = await httpRequest.post(
          "auth/register",
          credentials
        );
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("currentUser", user);
        updateCurrentUser(user);
        showUserMenu();
        closeModal();
        try {
          const { user } = await httpRequest.get("users/me");
          updateCurrentUser(user);
        } catch (error) {
          const authButtons = document.querySelector(".auth-buttons");
          authButtons.classList.add("show");
        }
      } catch (error) {
        if (error?.response?.error?.code === "EMAIL_EXISTS") {
          const emailGroup = e.target.querySelector(".form-group");
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message span").textContent =
            error.response.error.message;
        }
        if (error?.response?.error?.details[0]?.field === "email") {
          const emailGroup = e.target.querySelector(".form-group");
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message span").textContent =
            error.response.error.details[0].message;
        }
        if (error?.response?.error?.details[0]?.field === "password") {
          const pwdGroup = e.target.querySelector(".form-group:nth-child(2)");

          pwdGroup.classList.add("invalid");
          pwdGroup.querySelector(".error-message span").textContent =
            error.response.error.details[0].message;
        }
      }
    });
  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });
  //Login
  loginForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.querySelector("#loginEmail").value.trim();
      const password = document.querySelector("#loginPassword").value;
      const credentials = {
        email,
        password,
      };
      try {
        const { user, access_token } = await httpRequest.post(
          "auth/login",
          credentials
        );
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("currentUser", user);
        updateCurrentUser(user);
        showUserMenu();
        closeModal();
        location.reload();
        try {
          const { user } = await httpRequest.get("users/me");
          updateCurrentUser(user);
        } catch (error) {
          const authButtons = document.querySelector(".auth-buttons");
          authButtons.classList.add("show");
        }
      } catch (error) {
        if (error?.response?.error?.code == "VALIDATION_ERROR") {
          const emailGroup = e.target.querySelector(".form-group");
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message").textContent =
            error?.response?.error?.details[0].message;
        }
        if (error?.response?.error?.code == "INVALID_CREDENTIALS") {
          const password = e.target.querySelector(".form-group:nth-child(2)");
          password.classList.add("invalid");
          password.querySelector(".error-message").textContent =
            error?.response?.error?.message;
        }
      }
    });
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", async () => {
    // Close dropdown first
    userDropdown.classList.remove("show");
    const token = localStorage.getItem("accessToken");

    console.log("Logout clicked");
    // TODO: Students will implement logout logic here
    try {
      if (token) {
        await httpRequest.post("auth/logout", { refresh_token: token });
      } else {
        try {
          await httpRequest.post("auth/logout", {});
        } catch (_) {}
      }
    } catch (_) {
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      showSigninLogin();
      location.href = "/";
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelector(".auth-buttons");
  const userInfo = document.querySelector(".user-menu");

  try {
    const { user } = await httpRequest.get("users/me");
    updateCurrentUser(user);
    userInfo.classList.add("show");
  } catch (error) {
    authButtons.classList.add("show");
  }
});
function updateCurrentUser(user) {
  const userName = document.querySelector(".user-name");
  const userAvatar = document.querySelector("#user-avatar");
  if (user.avatar_url) {
    userAvatar.src = user.avatar_url;
  }
  if (user.email) {
    userName.textContent = user.email;
  }
}
function showUserMenu() {
  const userInfo = document.querySelector(".user-menu");
  const authButtons = document.querySelector(".auth-buttons");
  userInfo.classList.add("show");

  authButtons.classList.remove("show");
}
function showSigninLogin() {
  const userInfo = document.querySelector(".user-menu");
  const authButtons = document.querySelector(".auth-buttons");
  userInfo.classList.remove("show");

  authButtons.classList.add("show");
}

document.addEventListener("DOMContentLoaded", () => {
  // Lấy dữ liệu cho home
  showTodayBiggestHit();
  showPopularArtists();
  playerSongHome();
  showFlowerArtist();
  initPlayListManager();
});
