const modal = document.getElementById("capsuleModal");

const createBtn = document.getElementById("createBtn");
const heroCreateBtn = document.getElementById("heroCreateBtn");
const emptyCreateBtn = document.getElementById("emptyCreateBtn");

const closeModal = document.getElementById("closeModal");
const capsuleForm = document.getElementById("capsuleForm");

const capsuleContainer = document.getElementById("capsuleContainer");
const capsuleCount = document.getElementById("capsuleCount");


// ------------------------------------
// MODAL FUNCTIONS
// ------------------------------------

function openModal() {
    modal.classList.add("active");
}

function closeCapsuleModal() {
    modal.classList.remove("active");
}


// ------------------------------------
// CREATE BUTTONS
// ------------------------------------

createBtn.addEventListener("click", openModal);

heroCreateBtn.addEventListener("click", openModal);

emptyCreateBtn.addEventListener("click", openModal);


// ------------------------------------
// CLOSE MODAL
// ------------------------------------

closeModal.addEventListener("click", closeCapsuleModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeCapsuleModal();
    }
});


// ------------------------------------
// LOAD CAPSULES
// ------------------------------------

async function loadCapsules() {
    try {
        const response = await fetch("/api/capsules");

        if (!response.ok) {
            throw new Error("Failed to load capsules");
        }

        const capsules = await response.json();

        displayCapsules(capsules);

    } catch (error) {
        console.error("Error loading capsules:", error);

        capsuleContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load capsules</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}


// ------------------------------------
// DISPLAY CAPSULES
// ------------------------------------

function displayCapsules(capsules) {

    capsuleCount.textContent =
        `${capsules.length} ${capsules.length === 1 ? "capsule" : "capsules"}`;


    if (capsules.length === 0) {

        capsuleContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⏳
                </div>

                <h3>
                    No capsules yet
                </h3>

                <p>
                    Create your first message for the future.
                </p>

                <button class="primary-btn" id="emptyCreateBtn">
                    Create Capsule
                </button>

            </div>
        `;

        document
            .getElementById("emptyCreateBtn")
            .addEventListener("click", openModal);

        return;
    }


    capsuleContainer.innerHTML = "";


    capsules.forEach((capsule) => {

        const unlockDate = new Date(
            `${capsule.unlockDate}T00:00:00`
        );

        const now = new Date();

        const isUnlocked = now >= unlockDate;


        const capsuleCard = document.createElement("div");

        capsuleCard.className =
            `capsule-card ${isUnlocked ? "unlocked" : "locked"}`;


        capsuleCard.innerHTML = `

            <div class="capsule-icon">
                ${isUnlocked ? "🔓" : "🔒"}
            </div>

            <div class="capsule-content">

                <h3>
                    ${escapeHtml(capsule.title)}
                </h3>

               <p class="capsule-date">
    ${isUnlocked
        ? "🔓 Unlocked"
        : `🔒 Unlocks on ${formatDate(capsule.unlockDate)}`
    }
</p>

${!isUnlocked
    ? `
        <p class="capsule-countdown">
            ⏳ ${getCountdown(capsule.unlockDate)}
        </p>
      `
    : ""
}

                <p class="capsule-status">
                    ${isUnlocked
                        ? "🔓 Your memory is ready to open."
                        : "🔒 This memory is still sealed."
                    }
                </p>
                <button class="delete-btn" data-id="${escapeHtml(capsule.id)}">
    🗑️ Delete
</button>

                ${
                    isUnlocked
                        ? `
                            <div class="capsule-message">
                                ${escapeHtml(capsule.message)}
                            </div>
                          `
                        : ""
                }

            </div>
        `;


        capsuleContainer.appendChild(capsuleCard);
    });
}


// ------------------------------------
// FORMAT DATE
// ------------------------------------

function formatDate(dateString) {

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
function getCountdown(dateString) {
    const unlockDate = new Date(`${dateString}T00:00:00`);
    const now = new Date();

    const difference = unlockDate - now;

    if (difference <= 0) {
        return "Ready to unlock!";
    }

    const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days === 1) {
        return "Unlocks tomorrow!";
    }

    return `${days} days remaining`;
}


// ------------------------------------
// BASIC HTML ESCAPING
// ------------------------------------

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ------------------------------------
// CREATE CAPSULE
// ------------------------------------

capsuleForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const title =
        document.getElementById("title").value.trim();

    const message =
        document.getElementById("message").value.trim();

    const unlockDate =
        document.getElementById("unlockDate").value;
        // Make sure the unlock date is in the future
const selectedDate = new Date(`${unlockDate}T00:00:00`);
const today = new Date();

today.setHours(0, 0, 0, 0);

if (selectedDate <= today) {
    alert("Please choose a future date for your time capsule. ⏳");
    return;
}


    try {

        const response = await fetch("/capsules", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title,
                message,
                unlockDate
            })
        });


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Unable to create capsule."
            );

            return;
        }


        alert(
            "Your time capsule has been sealed! 🔒⏳"
        );


        capsuleForm.reset();

        closeCapsuleModal();


        // Reload capsules immediately
        loadCapsules();


    } catch (error) {

        console.error(
            "Connection error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
});


// ------------------------------------
// LOAD CAPSULES WHEN PAGE OPENS
// ------------------------------------

loadCapsules();
// DELETE CAPSULE
capsuleContainer.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("delete-btn")) {
        return;
    }

    const capsuleId = event.target.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this capsule?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/capsules/${capsuleId}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Unable to delete capsule.");
            return;
        }

        alert("Capsule deleted successfully! 🗑️");

        loadCapsules();

    } catch (error) {
        console.error("Error deleting capsule:", error);
        alert("Unable to connect to the server.");
    }
});
async function loadVersion() {
    try {
        const response = await fetch("/api/version");
        const data = await response.json();

        document.getElementById("commitId").textContent = data.commitId;
    } catch (error) {
        console.error("Error loading version:", error);
    }
}

loadVersion();