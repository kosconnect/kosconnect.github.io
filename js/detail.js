document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const thumbnails = document.querySelectorAll(".thumbnail, .gambar-utama");
  const closeModal = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let images = [];
  let currentIndex = 0;

  // Ambil semua gambar dari HTML (Modular, nanti bisa diganti fetch)
  thumbnails.forEach((thumb, index) => {
    images.push(thumb.src);
    thumb.addEventListener("click", () => {
      openModal(index);
    });
  });

  function openModal(index) {
    currentIndex = index;
    modalImg.src = images[currentIndex];
    modal.style.display = "flex";
  }

  function closeModalFunc() {
    modal.style.display = "none";
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex];
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex];
  }

  closeModal.addEventListener("click", closeModalFunc);
  nextBtn.addEventListener("click", nextImage);
  prevBtn.addEventListener("click", prevImage);

  // Tutup modal jika klik di luar gambar
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModalFunc();
  });
});

