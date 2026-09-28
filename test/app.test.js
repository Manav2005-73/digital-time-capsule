const test = require("node:test");
const assert = require("node:assert");
const app = require("../app");

test("GET /health returns status ok", async () => {
    const server = app.listen(0);

    try {
        const port = server.address().port;

        const response = await fetch(
            `http://localhost:${port}/health`
        );

        const data = await response.json();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(data.status, "ok");
    } finally {
        server.close();
    }
});
test("POST /capsules creates a new capsule", async () => {
    const server = app.listen(0);

    try {
        const port = server.address().port;

        const response = await fetch(
            `http://localhost:${port}/capsules`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: "Test Capsule",
                    message: "This is a test message",
                    unlockDate: "2099-12-31"
                })
            }
        );

        const data = await response.json();

        assert.strictEqual(response.status, 201);
        assert.strictEqual(data.capsule.title, "Test Capsule");
        assert.strictEqual(
            data.capsule.message,
            "This is a test message"
        );
    } finally {
        server.close();
    }
});
test("POST /capsules rejects missing input", async () => {
    const server = app.listen(0);

    try {
        const port = server.address().port;

        const response = await fetch(
            `http://localhost:${port}/capsules`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: "",
                    message: "",
                    unlockDate: ""
                })
            }
        );

        const data = await response.json();

        assert.strictEqual(response.status, 400);
        assert.strictEqual(
            data.error,
            "Title, message and unlock date are required"
        );
    } finally {
        server.close();
    }
});