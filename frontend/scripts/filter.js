// script.js
const authToken = localStorage.getItem("authToken");
document
  .getElementById("filterForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch(
      "https://rentify-afji.onrender.com/Rentify/filters",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": authToken, // Use token from localStorage
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (result.success) {
      displayProperties(result.data);
    } else {
      alert("Error fetching properties");
    }
  });

function displayProperties(properties) {
  const propertyList = document.getElementById("property-list");

  properties.forEach((property) => {
    const propertyCard = document.createElement("div");
    propertyCard.className = "property-card";
    propertyCard.addEventListener("click", () => showPropertyDetails(property));

    const propertyImage = document.createElement("img");
    propertyImage.src = property.image[0]; // Assuming image is an array of URLs
    propertyImage.alt = property.address;

    const propertyDetails = document.createElement("div");
    propertyDetails.className = "details";

    const propertyTitle = document.createElement("h3");
    propertyTitle.textContent = `${
      property.numberOfBedrooms
    } BHK at ${property.location.join(", ")}`;

    const propertyAddress = document.createElement("p");
    propertyAddress.textContent = property.address;

    const propertyRent = document.createElement("p");
    propertyRent.className = "price";
    propertyRent.textContent = `Rent: ₹${property.rent}`;

    const likeButton = document.createElement("button");
    likeButton.className = "like-button";
    likeButton.innerHTML = "&#9825;"; // Empty heart icon
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLike(property._id, likeButton);
    });

    propertyDetails.appendChild(propertyTitle);
    propertyDetails.appendChild(propertyAddress);
    propertyDetails.appendChild(propertyRent);
    propertyDetails.appendChild(likeButton);

    propertyCard.appendChild(propertyImage);
    propertyCard.appendChild(propertyDetails);

    propertyList.appendChild(propertyCard);
  });
}

function showPropertyDetails(property) {
  const modal = document.getElementById("property-modal");
  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = `
      <span class="close">&times;</span>
      <img src="${property.image[0]}" alt="${
    property.address
  }" class="modal-image">
      <h2>${property.numberOfBedrooms} BHK at ${property.location.join(
    ", "
  )}</h2>
      <p><strong>Address:</strong> ${property.address}</p>
      <p><strong>Rent:</strong> ₹${property.rent}</p>
      <p><strong>Number of Bathrooms:</strong> ${property.numberOfBathrooms}</p>
      <p><strong>Amenities:</strong> ${property.amenities.join(", ")}</p>
      <p><strong>Nearby Hospitals:</strong> ${property.nearbyHospitals.join(
        ", "
      )}</p>
      <p><strong>Nearby Colleges:</strong> ${property.nearbyColleges.join(
        ", "
      )}</p>
      <button class="interest-button" data-property-id="${
        property._id
      }">I'm Interested</button>
    `;

  const closeButton = modalContent.querySelector(".close");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const interestButton = modalContent.querySelector(".interest-button");
  interestButton.addEventListener("click", () => {
    expressInterest(property._id);
  });

  modal.style.display = "block";
}

function expressInterest(propertyId) {
  fetch(
    `https://rentify-afji.onrender.com/Rentify/Property/interested/${propertyId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": authToken, // Use token from localStorage
      },
    }
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        displaySellerDetails(response.data.sellerDetails, response.message);
      } else {
        console.error("Failed to express interest:", response.message);
      }
    })
    .catch((error) => console.error("Error expressing interest:", error));
}

function displaySellerDetails(sellerDetails, message) {
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML += `
      <h3>${message}</h3>
      <p><strong>Seller Name:</strong> ${sellerDetails.name}</p>
      <p><strong>Email:</strong> ${sellerDetails.email}</p>
      <p><strong>Phone:</strong> ${sellerDetails.phone}</p>
    `;
}

function toggleLike(propertyId, likeButton) {
  const isLiked = likeButton.classList.toggle("liked");
  likeButton.innerHTML = isLiked ? "&#9829;" : "&#9825;"; // Toggle heart icon

  fetch(`https://rentify-afji.onrender.com/Property/like/${propertyId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": authToken, // Use token from localStorage
    },
  })
    .then((response) => response.json())
    .then((response) => {
      if (!response.success) {
        console.error("Failed to like property:", response.message);
        likeButton.classList.toggle("liked"); // Revert like state if failed
        likeButton.innerHTML = !isLiked ? "&#9829;" : "&#9825;"; // Revert icon
      }
    })
    .catch((error) => {
      console.error("Error liking property:", error);
      likeButton.classList.toggle("liked"); // Revert like state if error
      likeButton.innerHTML = !isLiked ? "&#9829;" : "&#9825;"; // Revert icon
    });
}

window.onclick = function (event) {
  const modal = document.getElementById("property-modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
