document.addEventListener("DOMContentLoaded", () => {
  loadActivities();

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", handleSignup);
});

// Load activities from the server
async function loadActivities() {
  try {
    const response = await fetch("/activities");
    const activities = await response.json();

    displayActivities(activities);
    populateActivitySelect(activities);
  } catch (error) {
    console.error("Error loading activities:", error);
    document.getElementById("activities-list").innerHTML =
      '<p class="error">Error loading activities. Please try again later.</p>';
  }
}

// Display activities on the page
function displayActivities(activities) {
  const activitiesList = document.getElementById("activities-list");

  if (Object.keys(activities).length === 0) {
    activitiesList.innerHTML = "<p>No activities available.</p>";
    return;
  }

  const activitiesHTML = Object.entries(activities)
    .map(([name, details]) => {
      const participantsList =
        details.participants.length > 0
          ? `<ul class="participants-list">
                 ${details.participants.map((email) => `<li>${email}</li>`).join("")}
               </ul>`
          : `<p class="no-participants">No participants yet</p>`;

      return `
            <div class="activity-card">
                <h4>${name}</h4>
                <p><strong>Description:</strong> ${details.description}</p>
                <p><strong>Schedule:</strong> ${details.schedule}</p>
                <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
                <div class="participants-section">
                    <h5>Current Participants:</h5>
                    ${participantsList}
                </div>
            </div>
        `;
    })
    .join("");

  activitiesList.innerHTML = activitiesHTML;
}

// Populate the activity select dropdown
function populateActivitySelect(activities) {
  const select = document.getElementById("activity");
  const options = Object.keys(activities)
    .map(
      (name) => `<option value="${name}">${name}</option>`
    )
    .join("");

  select.innerHTML = '<option value="">-- Select an activity --</option>' + options;
}

// Handle signup form submission
async function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const activity = document.getElementById("activity").value;
  const messageDiv = document.getElementById("message");

  if (!email || !activity) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  try {
    const response = await fetch(
      `/activities/${encodeURIComponent(activity)}/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(email)}`,
      }
    );

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message, "success");
      document.getElementById("signup-form").reset();
      // Reload activities to show updated participant list
      loadActivities();
    } else {
      showMessage(result.detail || "Signup failed", "error");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    showMessage("Error occurred during signup. Please try again.", "error");
  }
}

// Show message to the user
function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove("hidden");

  // Hide message after 5 seconds
  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}
