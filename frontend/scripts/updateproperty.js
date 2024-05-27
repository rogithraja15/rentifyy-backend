const authToken = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", () => {
  fetchPropertyDetails();
});

function fetchPropertyDetails() {
  const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
  fetch(`https://rentify-afji.onrender.com/Rentify/properties/user`, {
    headers: {
      "x-auth-token": authToken, // Include token in the headers
    },
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        displayPropertyDetails(response.data);
      } else {
        console.error("Failed to fetch property details:", response.message);
      }
    })
    .catch((error) => console.error("Error fetching property details:", error));
}

function displayPropertyDetails(properties) {
  const propertyDetails = document.getElementById("property-details");
  propertyDetails.innerHTML = ""; // Clear any existing content
  properties.forEach((property) => {
    const propertyCard = document.createElement("div");
    propertyCard.className = "property-card";
    propertyCard.innerHTML = `
        <img src="${property.image[0]}" alt="${property.address}">
        <div class="details">
            <h3>${property.numberOfBedrooms} BHK at ${property.location.join(
      ", "
    )}</h3>
            <p>${property.address}</p>
            <p class="price">Rent: ₹${property.rent}</p>
            <p>Number of Bathrooms: ${property.numberOfBathrooms}</p>
            <p>Amenities: ${property.amenities.join(", ")}</p>
            <p>Nearby Hospitals: ${property.nearbyHospitals.join(", ")}</p>
            <p>Nearby Colleges: ${property.nearbyColleges.join(", ")}</p>
            <p>Likes: ${property.likes}</p>
            <button class="update-button" data-property-id="${
              property._id
            }">Update Property</button>
            <button class="delete-button" data-property-id="${
              property._id
            }">Delete Property</button>
        </div>
      `;

    propertyDetails.appendChild(propertyCard);

    const updateButton = propertyCard.querySelector(".update-button");
    updateButton.addEventListener("click", () => {
      showUpdateModal(property);
    });

    const deleteButton = propertyCard.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
      deleteProperty(property._id);
    });
  });
}

function showUpdateModal(property) {
  const modal = document.getElementById("update-modal");
  const modalContent = modal.querySelector(".modal-content");
  const validAmenities = [
    "parking",
    "ac",
    "wifi",
    "refrigerator",
    "almirah",
    "bedsheet",
    "cctv",
    "housekeeping",
    "pillow",
    "drinkingwater",
    "bathroom",
    "wash",
  ];

  modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h2>Update Property Details</h2>
        <form id="update-form">
            <label for="propertyType">Property Type:</label>
            <input type="text" id="propertyType" name="propertyType" value="${
              property.propertyType
            }">
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" value="${property.location.join(
              ", "
            )}">
            <label for="amenities">Amenities:</label>
            <select id="amenities" name="amenities" multiple>
                ${validAmenities
                  .map(
                    (amenity) =>
                      `<option value="${amenity}" ${
                        property.amenities.includes(amenity) ? "selected" : ""
                      }>${amenity}</option>`
                  )
                  .join("")}
            </select>
            <label for="rent">Rent:</label>
            <input type="number" id="rent" name="rent" value="${property.rent}">
            <label for="address">Address:</label>
            <input type="text" id="address" name="address" value="${
              property.address
            }">
            <label for="image">Image URL:</label>
            <input type="text" id="image" name="image" value="${property.image.join(
              ", "
            )}">
            <label for="numberOfBedrooms">Number of Bedrooms:</label>
            <input type="number" id="numberOfBedrooms" name="numberOfBedrooms" value="${
              property.numberOfBedrooms
            }">
            <label for="numberOfBathrooms">Number of Bathrooms:</label>
            <input type="number" id="numberOfBathrooms" name="numberOfBathrooms" value="${
              property.numberOfBathrooms
            }">
            <label for="nearbyHospitals">Nearby Hospitals:</label>
            <input type="text" id="nearbyHospitals" name="nearbyHospitals" value="${property.nearbyHospitals.join(
              ", "
            )}">
            <label for="nearbyColleges">Nearby Colleges:</label>
            <input type="text" id="nearbyColleges" name="nearbyColleges" value="${property.nearbyColleges.join(
              ", "
            )}">
            <button type="button" id="update-submit">Submit</button>
        </form>
    `;

  const closeButton = modalContent.querySelector(".close");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const submitButton = modalContent.querySelector("#update-submit");
  submitButton.addEventListener("click", () => {
    updatePropertyDetails(property._id);
  });

  modal.style.display = "block";
}

function updatePropertyDetails(propertyId) {
  const form = document.getElementById("update-form");
  const updatedProperty = {
    propertyType: form.propertyType.value,
    location: form.location.value.split(",").map((item) => item.trim()),
    amenities: Array.from(form.amenities.selectedOptions).map(
      (option) => option.value
    ),
    rent: form.rent.value,
    address: form.address.value,
    image: form.image.value.split(",").map((item) => item.trim()),
    numberOfBedrooms: form.numberOfBedrooms.value,
    numberOfBathrooms: form.numberOfBathrooms.value,
    nearbyHospitals: form.nearbyHospitals.value
      .split(",")
      .map((item) => item.trim()),
    nearbyColleges: form.nearbyColleges.value
      .split(",")
      .map((item) => item.trim()),
  };

  const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
  fetch(`https://rentify-afji.onrender.com/Rentify/Property/${propertyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": authToken, // Include token in the headers
    },
    body: JSON.stringify(updatedProperty),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Property details updated successfully!");
        document.getElementById("update-modal").style.display = "none";
        fetchPropertyDetails(); // Refresh the property details
      } else {
        alert("Failed to update property details: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error updating property details:", error);
      alert("Error updating property details.");
    });
}

function deleteProperty(propertyId) {
  const confirmation = confirm(
    "Are you sure you want to delete this property?"
  );
  if (confirmation) {
    const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
    fetch(`https://rentify-afji.onrender.com/Rentify/${propertyId}`, {
      method: "DELETE",
      headers: {
        "x-auth-token": authToken, // Include token in the headers
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Property deleted successfully!");
          fetchPropertyDetails(); // Refresh the property details
        } else {
          alert("Failed to delete property: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error deleting property:", error);
        alert("Error deleting property.");
      });
  }
}
