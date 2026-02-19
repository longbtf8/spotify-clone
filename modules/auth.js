// js/modules/auth.js
import httpRequest from "../service/httpRequest.js";

import { $, $$ } from "../utils/commonPage.js";

// Function to show signup form
function showSignupForm() {
  $("#signupForm").style.display = "block";
  $("#loginForm").style.display = "none";
}

function showLoginForm() {
  $("#signupForm").style.display = "none";
  $("#loginForm").style.display = "block";
}
function openModal() {
  $("#authModal").classList.add("show");
  document.body.style.overflow = "hidden";
}
// Close modal function
function closeModal() {
  $("#authModal").classList.remove("show");
  document.body.style.overflow = "auto";
}
function updateCurrentUser(user) {
  const userName = document.querySelector(".user-name");
  const userAvatar = document.querySelector("#user-avatar");
  if (user.avatar_url) {
    userAvatar.src = user.avatar_url;
  }
  if (user.email) {
    const userNameInfo = user.email.split("@")[0];
    const result =
      userNameInfo.length > 10
        ? userNameInfo.slice(0, 10) + "..."
        : userNameInfo;
    userName.textContent = result;
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
async function checkLoginStatus() {
  const authButtons = document.querySelector(".auth-buttons");
  const userInfo = document.querySelector(".user-menu");

  try {
    const { user } = await httpRequest.get("users/me");
    console.log(user);
    updateCurrentUser(user);
    userInfo.classList.add("show");
  } catch (error) {
    authButtons.classList.add("show");
  }
}
function toggleSeenPassword() {
  const password = document
    .querySelectorAll(".toggle-password")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector("i");
        if (input.type === "password") {
          input.type = "text";
          icon.classList = " fas fa-eye-slash";
        } else {
          input.type = "password";
          icon.classList = " fas fa-eye";
        }
      }),
    );
  console.log(password);
}

export function initAuth() {
  // Get DOM elements
  const signupBtn = $(".signup-btn");
  const loginBtn = $(".login-btn");
  const authModal = $("#authModal");
  const modalClose = $("#modalClose");
  const signupForm = $("#signupForm");
  const loginForm = $("#loginForm");
  const showLoginBtn = $("#showLogin");
  const showSignupBtn = $("#showSignup");
  const formSignUpLog = $$(".auth-form-content");
  const userAvatarBtn = $("#userAvatar");
  const userDropdown = $("#userDropdown");
  const logoutBtn = $("#logoutBtn");

  // 1. Xử lý đóng mở Modal
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      showSignupForm();
      openModal();
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      showLoginForm();
      openModal();
    });
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      authModal &&
      authModal.classList.contains("show")
    ) {
      closeModal();
    }
  });

  if (showLoginBtn) showLoginBtn.addEventListener("click", showLoginForm);
  if (showSignupBtn) showSignupBtn.addEventListener("click", showSignupForm);

  //  xoá lỗi khi focus
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

  //  Xử lý Đăng ký (Register)
  if (signupForm) {
    signupForm
      .querySelector(".auth-form-content")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = signupForm.querySelector("#signupEmail").value.trim();
        const password = signupForm.querySelector("#signupPassword").value;

        let isValid = true;
        const emailGroup = signupForm
          .querySelector("#signupEmail")
          .closest(".form-group");
        const passwordGroup = signupForm
          .querySelector("#signupPassword")
          .closest(".form-group");

        if (!email) {
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message span").textContent =
            "Please enter your email address.";
          isValid = false;
        } else if (
          !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
        ) {
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message span").textContent =
            "Please enter your email address in the correct format.";
          isValid = false;
        }
        if (!password) {
          passwordGroup.classList.add("invalid");
          passwordGroup.querySelector(".error-message span").textContent =
            "Please enter the password.";
          isValid = false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
          passwordGroup.classList.add("invalid");
          passwordGroup.querySelector(".error-message span").textContent =
            "Passwords must contain at least one uppercase letter, one lowercase letter, and one number.";
          isValid = false;
        }

        if (!isValid) {
          return;
        }

        try {
          const { user, access_token } = await httpRequest.post(
            "auth/register",
            { email, password },
          );
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("currentUser", JSON.stringify(user));
          updateCurrentUser(user);
          showUserMenu();
          closeModal();

          // Kiểm tra lại user sau khi đăng ký
          try {
            const { user: me } = await httpRequest.get("users/me");
            updateCurrentUser(me);
          } catch (_) {}
        } catch (error) {
          console.log(error);
          // Xử lý lỗi đăng ký
          if (error?.response?.error?.code === "EMAIL_EXISTS") {
            const emailGroup = e.target.querySelector(".form-group");
            emailGroup.classList.add("invalid");
            emailGroup.querySelector(".error-message span").textContent =
              `The email already exists.`;
          }
          if (error?.response?.error?.details?.[0]?.field === "email") {
            const emailGroup = e.target.querySelector(".form-group");
            emailGroup.classList.add("invalid");
            emailGroup.querySelector(".error-message span").textContent =
              "Please enter your email address in the correct format.";
          }

          if (error?.response?.error?.details?.[0]?.field === "password") {
            const pwdGroup = e.target.querySelector(".form-group:nth-child(2)");
            pwdGroup.classList.add("invalid");
            pwdGroup.querySelector(".error-message span").textContent =
              `Passwords must contain at least one uppercase letter, one lowercase letter, and one number.`;
          }
        }
      });
  }

  //  Xử lý Đăng nhập (Login)
  if (loginForm) {
    loginForm
      .querySelector(".auth-form-content")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector("#loginEmail").value.trim();
        const password = loginForm.querySelector("#loginPassword").value;
        const emailGroup = loginForm
          .querySelector("#loginEmail")
          .closest(".form-group");
        const pwdGroup = loginForm
          .querySelector("#loginPassword")
          .closest(".form-group");
        // reset lỗi
        emailGroup.classList.remove("invalid");
        pwdGroup.classList.remove("invalid");

        let isValid = true;
        if (!email) {
          emailGroup.classList.add("invalid");
          emailGroup.querySelector(".error-message").textContent =
            "Please enter your email address.";
          isValid = false;
        }
        if (!password) {
          pwdGroup.classList.add("invalid");
          pwdGroup.querySelector(".error-message").textContent =
            "Please enter the password.";
          isValid = false;
        }

        if (!isValid) return;
        try {
          const { user, access_token } = await httpRequest.post("auth/login", {
            email,
            password,
          });
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("currentUser", JSON.stringify(user));
          updateCurrentUser(user);
          showUserMenu();
          closeModal();
          location.reload();
        } catch (error) {
          // Xử lý lỗi đăng nhập
          if (error?.response?.error?.code == "VALIDATION_ERROR") {
            const emailGroup = e.target.querySelector(".form-group");
            emailGroup.classList.add("invalid");
            emailGroup.querySelector(".error-message").textContent =
              "Please check your email again.";
          }
          if (error?.response?.error?.code == "INVALID_CREDENTIALS") {
            const pwdGroup = e.target.querySelector(".form-group:nth-child(2)");
            pwdGroup.classList.add("invalid");
            pwdGroup.querySelector(".error-message").textContent =
              error?.response?.error?.message;
          }
        }
      });
  }

  toggleSeenPassword();
  // Xử lý User Menu & Logout
  if (userAvatarBtn) {
    userAvatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (userDropdown) userDropdown.classList.toggle("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      userAvatarBtn &&
      !userAvatarBtn.contains(e.target) &&
      userDropdown &&
      !userDropdown.contains(e.target)
    ) {
      userDropdown.classList.remove("show");
    }
  });
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (userDropdown) userDropdown.classList.remove("show");
      const token = localStorage.getItem("accessToken");
      try {
        if (token) {
          await httpRequest.post("auth/logout", { refresh_token: token });
        } else {
          await httpRequest.post("auth/logout", {});
        }
      } catch (_) {
      } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        showSigninLogin();
        location.reload();
      }
    });
  }
  checkLoginStatus();
}
