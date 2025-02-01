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

    // Fetch user data from API
    const userResponse = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!userResponse.ok) {
      console.error("Error fetching user details");
      return;
    }

    const userData = await userResponse.json();
    const userId = userData.user.user_id || userData.user._id; // Handle both BSON and JSON formats

    document.getElementById("full_name").value = userData.user.fullname || "";
    document.getElementById("email").value = userData.user.email || "";

    // Store userId directly to use in transaction
    document.userId = userId; // Store userId in a global object for later use

    // Fetch room details based on roomId
    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );

    if (!roomResponse.ok) {
      console.error(`Error fetching room details for room_id ${roomId}`);
      return;
    }

    const roomDetail = await roomResponse.json();
    const roomData = Array.isArray(roomDetail) ? roomDetail[0] : roomDetail;

    document.querySelector(".room-name").textContent =
      roomData.room_name || "Unknown";
    document.querySelector(".address").textContent =
      roomData.address || "Address not available";

    const termTranslations = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      semi_annual: "Semi-annual",
      yearly: "Yearly",
    };

    const priceList = document.getElementById("price-list");
    if (priceList) {
      priceList.innerHTML = "";

      if (roomData.price && typeof roomData.price === "object") {
        Object.entries(roomData.price).forEach(([duration, price], index) => {
          const radioWrapper = document.createElement("div");
          radioWrapper.style.display = "flex";
          radioWrapper.style.alignItems = "center";
          radioWrapper.style.marginBottom = "5px";
          radioWrapper.style.gap = "5px";

          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = "rental_price";
          radioInput.value = duration;
          radioInput.id = `price-${index}`;
          if (index === 0) radioInput.checked = true;

          const radioLabel = document.createElement("label");
          radioLabel.setAttribute("for", radioInput.id);
          radioLabel.textContent = `Rp ${price.toLocaleString("id-ID")} / ${
            termTranslations[duration] || duration
          }`;

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

      if (Array.isArray(roomData.custom_facilities)) {
        roomData.custom_facilities.forEach((facility, index) => {
          const checkboxWrapper = document.createElement("div");
          checkboxWrapper.style.display = "flex";
          checkboxWrapper.style.alignItems = "center";
          checkboxWrapper.style.marginBottom = "5px";
          checkboxWrapper.style.gap = "5px";

          const checkboxInput = document.createElement("input");
          checkboxInput.type = "checkbox";
          checkboxInput.name = "custom_facility";
          checkboxInput.value = facility._id;
          checkboxInput.id = `facility-${index}`;

          const checkboxLabel = document.createElement("label");
          checkboxLabel.setAttribute("for", checkboxInput.id);
          checkboxLabel.textContent = `${
            facility.name
          } - Rp ${facility.price.toLocaleString("id-ID")}`;

          checkboxWrapper.appendChild(checkboxInput);
          checkboxWrapper.appendChild(checkboxLabel);
          facilitiesList.appendChild(checkboxWrapper);
        });
      }
    }

    // No longer store boardingHouseId and ownerId in cookies
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
async function submitTransaction() {
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

  const userId = document.userId;  // Directly use userId from stored userData
  if (!userId) {
    alert("User ID is missing.");
    return;
  }

  // Fetch room details based on roomId to get boarding_house_id and owner_id
 const roomResponse = await fetch(
   `https://kosconnect-server.vercel.app/api/rooms/${document.roomId}/pages`
 );


  if (!roomResponse.ok) {
    console.error(`Error fetching room details for room_id ${roomId}`);
    return;
  }

  const roomDetail = await roomResponse.json();
  const roomData = Array.isArray(roomDetail) ? roomDetail[0] : roomDetail;

  const roomId = roomData._id;
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

    // SweetAlert notification after transaction
    swal({
      title: "Room booked successfully!",
      text: "You will be redirected to payment.",
      icon: "success",
      buttons: ["OK"],
    }).then(async (value) => {
      if (value) {
        // Proceed with payment
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
          alert(`Payment failed: ${paymentError.error}`);
          return;
        }

        const paymentResult = await paymentResponse.json();
        const redirectURL = paymentResult.redirectURL;

        // Redirect to Midtrans
        window.location.href = redirectURL;
      }
    });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    alert("An error occurred while creating the transaction.");
  }
}

// Submit button listener
document.getElementById("submit-button")?.addEventListener("click", () => {
  submitTransaction();
});

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
