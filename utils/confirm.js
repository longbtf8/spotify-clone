export async function showConfirm(text, title = "Are you sure?") {
  const { isConfirmed } = await Swal.fire({
    title,
    text,
    background: "#282828",
    color: "#fff",
    confirmButtonColor: "#1ed760",
    confirmButtonText: "Confirm",
    cancelButtonColor: "transparent",
    cancelButtonText: "Cancel",
    showCancelButton: true,
    customClass: {
      cancelButton: "swal-cancel-btn",
    },
  });

  return isConfirmed;
}
