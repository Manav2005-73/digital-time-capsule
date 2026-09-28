const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

const dataFile = path.join(__dirname, "data", "capsules.json");
console.log("DATA FILE:", dataFile);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));


// ------------------------------------
// HOME PAGE
// ------------------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ------------------------------------
// HEALTH CHECK
// ------------------------------------

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});
app.get("/api/version", (req, res) => {
    res.json({
        commitId: process.env.RENDER_GIT_COMMIT || "local"
    });
});

// ------------------------------------
// GET ALL CAPSULES
// ------------------------------------

app.get("/api/capsules", (req, res) => {
    try {
        const data = fs.readFileSync(dataFile, "utf8");
        const capsules = JSON.parse(data);

        res.json(capsules);
    } catch (error) {
        console.error("Error reading capsules:", error);

        res.status(500).json({
            error: "Unable to load capsules"
        });
    }
});


// ------------------------------------
// CREATE A CAPSULE
// ------------------------------------

app.post("/capsules", (req, res) => {
    const { title, message, unlockDate } = req.body;

    // Validate input
    if (!title || !message || !unlockDate) {
        return res.status(400).json({
            error: "Title, message and unlock date are required"
        });
        
    }

    try {
        const data = fs.readFileSync(dataFile, "utf8");
        const capsules = JSON.parse(data);

        const newCapsule = {
            id: Date.now().toString(),
            title: title.trim(),
            message: message.trim(),
            unlockDate,
            createdAt: new Date().toISOString()
        };

        capsules.push(newCapsule);

        fs.writeFileSync(
            dataFile,
            JSON.stringify(capsules, null, 2)
        );

        res.status(201).json({
            message: "Capsule created successfully",
            capsule: newCapsule
        });

    } catch (error) {
        console.error("Error saving capsule:", error);

        res.status(500).json({
            error: "Unable to save capsule"
        });
    }
});
// ------------------------------------
// DELETE A CAPSULE
// ------------------------------------

app.delete("/capsules/:id", (req, res) => {
    const capsuleId = req.params.id;

    try {
        const data = fs.readFileSync(dataFile, "utf8");
        const capsules = JSON.parse(data);

        const updatedCapsules = capsules.filter(
            (capsule) => capsule.id !== capsuleId
        );

        if (updatedCapsules.length === capsules.length) {
            return res.status(404).json({
                error: "Capsule not found"
            });
        }

        fs.writeFileSync(
            dataFile,
            JSON.stringify(updatedCapsules, null, 2)
        );

        res.json({
            message: "Capsule deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting capsule:", error);

        res.status(500).json({
            error: "Unable to delete capsule"
        });
    }
});

// ------------------------------------
// START SERVER
// ------------------------------------

if (require.main === module) {
    app.listen(PORT,"0.0.0.0", () => {
        console.log(`ChronoCapsule running on port ${PORT}`);
    });
}

module.exports = app;