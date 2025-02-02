// Import getCookie, renderMinimalHeader from header.js
import { getCookie, renderMinimalHeader } from "./header.js";

// Function to render checkout details to the page
async function renderCheckoutDetail(roomId) {
  if (!roomId) {
    console.error("room_id not found in URL.");
    return;
  }

  try {
    const authToken = getCookie("authToken");
    if (!authToken) {
      alert("You must be logged in to continue checkout.");
      return;
    }

    renderMinimalHeader(authToken);

    // Fetch user and room data
    const [userResponse, roomResponse] = await Promise.all([
      fetch("https://kosconnect-server.vercel.app/api/users/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      fetch(`https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`),
    ]);

    if (!userResponse.ok || !roomResponse.ok) {
      console.error("Error fetching data");
      return;
    }

    const userData = await userResponse.json();
    const userId = userData.user.user_id || userData.user._id;
    document.getElementById("full_name").value = userData.user.fullname || "";
    document.getElementById("email").value = userData.user.email || "";

    document.userId = userId; // Store userId globally

    window.roomData = await roomResponse.json();
    const roomData = Array.isArray(window.roomData)
      ? window.roomData[0]
      : window.roomData;

    document.querySelector(".room-name").textContent =
      roomData.room_name || "Unknown";
    document.querySelector(".address").textContent =
      roomData.address || "Address not available";

    // Render price options
    const priceList = document.getElementById("price-list");
    if (priceList) {
      priceList.innerHTML = "";
      if (roomData.price && typeof roomData.price === "object") {
        Object.entries(roomData.price).forEach(([duration, price], index) => {
          const radioWrapper = document.createElement("div");

          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = "rental_price";
          radioInput.value = duration;
          radioInput.id = `price-${index}`;
          if (index === 0) radioInput.checked = true;

          const radioLabel = document.createElement("label");
          radioLabel.setAttribute("for", radioInput.id);
          radioLabel.textContent = `Rp ${price.toLocaleString("id-ID")} / ${duration}`;

          radioWrapper.appendChild(radioInput);
          radioWrapper.appendChild(radioLabel);
          priceList.appendChild(radioWrapper);
        });
      }
    }

    // Render custom facilities
    const facilitiesList = document.getElementById("custom-facilities");
    if (facilitiesList) {
      facilitiesList.innerHTML = "";
      if (
        Array.isArray(roomData.custom_facilities) &&
        roomData.custom_facilities.length > 0
      ) {
        roomData.custom_facilities.forEach((facility, index) => {
          const checkboxWrapper = document.createElement("div");

          const checkboxInput = document.createElement("input");
          checkboxInput.type = "checkbox";
          checkboxInput.name = "custom_facility";
          checkboxInput.value = facility._id;
          checkboxInput.id = `facility-${index}`;

          const checkboxLabel = document.createElement("label");
          checkboxLabel.setAttribute("for", checkboxInput.id);
          checkboxLabel.textContent = `${facility.name} - Rp ${facility.price.toLocaleString("id-ID")}`;

          checkboxWrapper.appendChild(checkboxInput);
          checkboxWrapper.appendChild(checkboxLabel);
          facilitiesList.appendChild(checkboxWrapper);
        });
      }
    }

    addEventListeners();
    updateOrderSummary();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Back button functionality
const backButton = document.querySelector(".back-button");
backButton.addEventListener("click", () => {
  window.history.back();
});

// Function to submit the transaction
async function submitTransaction(event) {
  event.preventDefault(); // Prevent default form submission behavior

  console.log(window.location.href);
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");

  if (!roomId) {
    alert("Room ID is missing.");
    return;
  }

  console.log("Room ID:", roomId);

  const authToken = getCookie("authToken");
  if (!authToken) {
    alert("You must be logged in to continue the transaction.");
    return;
  }

  const fullName = document.getElementById("full_name").value;
  const email = document.getElementById("email").value;
  let phoneNumber = document.getElementById("phone_number").value.trim();
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = phoneNumber.startsWith("0")
      ? "+62" + phoneNumber.slice(1)
      : "+62" + phoneNumber;
  }

  const selectedPaymentTerm = document.querySelector(
    'input[name="rental_price"]:checked'
  )?.value;
  if (!selectedPaymentTerm) {
    alert("Please select rental term before continuing.");
    return;
  }

  const selectedFacilities = Array.from(
    document.querySelectorAll('input[name="custom_facility"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkInDate = document.getElementById("check_in_date").value;
  if (checkInDate) {
    const dateParts = checkInDate.split("/");
    if (dateParts.length === 3) {
      checkInDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
  }
  if (!checkInDate) {
    alert("Please select a check-in date.");
    return;
  }

  const userId = document.userId; // Directly use userId from stored userData
  if (!userId) {
    alert("User ID is missing.");
    return;
  }

  const roomData = Array.isArray(window.roomData)
    ? window.roomData[0]
    : window.roomData;

  if (!roomData) {
    alert("Room details not found. Please refresh the page.");
    return;
  }

  const boardingHouseId = roomData.boarding_house_id;
  const ownerId = roomData.owner_id;


  if (!boardingHouseId || !ownerId) {
    alert("Boarding house ID or owner ID is missing.");
    return;
  }

  const transactionData = {
    personal_info: {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
    },
    custom_facilities: selectedFacilities || [],
    payment_term: selectedPaymentTerm,
    check_in_date: checkInDate,
  };

  try {
    const transactionResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/?room_id=${roomId}&boarding_house_id=${boardingHouseId}&owner_id=${ownerId}&user_id=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(transactionData),
      }
    );

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.json();
      alert(`Failed to create transaction: ${errorData.error}`);
      return;
    }

    const transactionResult = await transactionResponse.json();
    const transactionId = transactionResult.transaction_id;

    Swal.fire({
      title: "Room booked successfully!",
      text: "You will be redirected to payment.",
      icon: "success",
      showCancelButton: false,
      confirmButtonText: "OK",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Lanjutkan ke pembayaran
        const paymentResponse = await fetch(
          `https://kosconnect-server.vercel.app/transactions/${transactionId}/payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!paymentResponse.ok) {
          const paymentError = await paymentResponse.json();
          Swal.fire("Payment Failed", paymentError.error, "error");
          return;
        }

        const paymentResult = await paymentResponse.json();
        const redirectURL = paymentResult.redirectURL;

        // Redirect ke Midtrans
        window.location.href = redirectURL;
      }
    });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    alert("An error occurred while creating the transaction.");
  }
}

// Submit button listener with event.preventDefault()
document
  .getElementById("submit-button")
  ?.addEventListener("click", submitTransaction);

// Function to update order summary
function updateOrderSummary() {
  const checkInDate = document.getElementById("check_in_date")?.value || "-";
  const selectedRental = document.querySelector(
    'input[name="rental_price"]:checked'
  );
  const rentalPrice = selectedRental
    ? selectedRental.nextElementSibling.textContent.trim()
    : "-";

  // Get selected facilities
  const selectedFacilities = Array.from(
    document.querySelectorAll('input[name="custom_facility"]:checked')
  ).map((facility) => facility.nextElementSibling.textContent.trim());

  // Calculate facility cost
  let facilityCost = selectedFacilities.reduce((total, facility) => {
    const priceMatch = facility.match(/Rp ([0-9.,]+)/);
    return total + (priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0);
  }, 0);

  // Get rental cost
  let rentalCost = 0;
  const rentalMatch = rentalPrice.match(/Rp ([0-9.,]+)/);
  if (rentalMatch) {
    rentalCost = parseInt(rentalMatch[1].replace(/\./g, ""));
  }

  // Calculate subtotal, PPN, and total price
  const subTotal = rentalCost + facilityCost;
  const ppn = subTotal * 0.11;
  const totalHarga = subTotal + ppn;

  // Update summary display
  document.getElementById("checkin-date").textContent = checkInDate;
  document.getElementById("fasilitas-list").innerHTML =
    selectedFacilities.length > 0
      ? selectedFacilities.map((facility) => `<li>${facility}</li>`).join("")
      : "";
  document.getElementById("harga-sewa").textContent = `Rp ${rentalCost.toLocaleString("id-ID")}`;
  document.getElementById("sub-total").textContent = `Rp ${subTotal.toLocaleString("id-ID")}`;
  document.getElementById("ppn").textContent = `Rp ${ppn.toLocaleString("id-ID")}`;
  document.getElementById("total-harga").textContent = `Rp ${totalHarga.toLocaleString("id-ID")}`;
}

// Function to add event listeners once
function addEventListeners() {
  document
    .getElementById("check_in_date")
    ?.addEventListener("input", updateOrderSummary);

  document.querySelectorAll('input[name="rental_price"]').forEach((input) => {
    input.addEventListener("change", updateOrderSummary);
  });

  document.querySelectorAll('input[name="custom_facility"]').forEach((input) => {
    input.addEventListener("change", updateOrderSummary);
  });
}

// Observe only the custom facilities section
const facilitiesObserver = new MutationObserver(() => {
  addEventListeners();
  updateOrderSummary();
});

const facilitiesList = document.getElementById("custom-facilities");
if (facilitiesList) {
  facilitiesObserver.observe(facilitiesList, { childList: true });
}

// Onload function
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  if (roomId) {
    renderCheckoutDetail(roomId);
  } else {
    console.error("room_id not found in URL.");
  }
};

// Onload function to render checkout details
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  if (roomId) {
    renderCheckoutDetail(roomId);
  } else {
    console.error("room_id not found in URL.");
  }
};
