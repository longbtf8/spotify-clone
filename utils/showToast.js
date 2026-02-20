export function showToast(message, type = "success") {
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };
  // xoá khi quá 3 cái
  const toasts = document.querySelectorAll(".toastify");
  if (toasts.length >= 3) {
    toasts[toasts.length - 1].remove();
  }

  Toastify({
    text: `${icons[type]} ${message}`,
    duration: 3000,
    gravity: "bottom",
    position: "center",
    stopOnFocus: true,
    style: {
      background: "#ffffff",
      color: "#000000",
      borderRadius: "500px",
      fontSize: "14px",
      fontWeight: "700",
      padding: "14px 24px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
      minWidth: "200px",
      letterSpacing: "0.01em",
      fontFamily: `"Circular", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    },
  }).showToast();
}
