// ---------- DOM ELEMENTS ----------
const API_BASE = "https://mini-note-app.onrender.com";
const addBtn = document.getElementById("addBtn");
const noteInput = document.getElementById("noteInput");
const noteList = document.getElementById("noteList");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authForm = document.getElementById("authForm");
const authStatus = document.getElementById("authStatus");
const currentUser = document.getElementById("currentUser");
const notesSection = document.getElementById("notesSection");

let token = null;
let loggedInEmail = null;

console.log("app.js loaded");

// ---------- HELPER: จัดการ UI ตามสถานะ login ----------
function updateUI() {
    if (token) {
        notesSection.style.display = "block";
        logoutBtn.style.display = "inline-block";
        loginBtn.disabled = true;
        registerBtn.disabled = true;
        emailInput.disabled = true;
        passwordInput.disabled = true;
        currentUser.textContent = `Logged in as: ${loggedInEmail}`;
    } else {
        notesSection.style.display = "none";
        logoutBtn.style.display = "none";
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        emailInput.disabled = false;
        passwordInput.disabled = false;
        currentUser.textContent = "";
        noteList.innerHTML = "";
    }
}

// ---------- HELPER: เคลียร์ token ----------
function clearAuth() {
    token = null;
    loggedInEmail = null;
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    authStatus.textContent = "Please login.";
    updateUI();
}

// ---------- โหลดสถานะจาก localStorage ถ้ามี ----------
(function initAuthFromStorage() {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("email");
    if (savedToken && savedEmail) {
        token = savedToken;
        loggedInEmail = savedEmail;
        authStatus.textContent = "Restored session.";
        updateUI();
        loadNotes(); // พยายามโหลด note ถ้า token ยังใช้ได้
    } else {
        updateUI();
    }
})();

// ---------- AUTH ----------

// สมัครสมาชิก
registerBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        authStatus.textContent = "Please enter email & password";
        authStatus.className = "status-text error";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            authStatus.textContent = "Registered! Now login.";
            authStatus.className = "status-text success";
        } else {
            authStatus.textContent = data.error || "Register failed";
            authStatus.className = "status-text error";
        }
    } catch (err) {
        console.error(err);
        authStatus.textContent = "Register error (check console)";
    }
});

// ล็อกอิน
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        authStatus.textContent = "Please enter email & password";
        authStatus.className = "status-text error";
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            token = data.token;
            loggedInEmail = email;

            localStorage.setItem("token", token);
            localStorage.setItem("email", email);

            authStatus.textContent = "Logged in!";
            authStatus.className = "status-text success";

            updateUI();
            loadNotes();
        } else {
            authStatus.textContent = data.error || "Login failed";
            authStatus.className = "status-text error";
        }
    } catch (err) {
        console.error(err);
        authStatus.textContent = "Login error (check console)";
    }
});

// Logout
logoutBtn.addEventListener("click", () => {
    clearAuth();
    function clearAuth() {
        token = null;
        loggedInEmail = null;
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        authStatus.textContent = "Logged out.";
        authStatus.className = "status-text";
        updateUI();
    }

});

// ---------- NOTES ----------

async function loadNotes() {
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/notes`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });


        if (res.status === 401) {
            // token หมดอายุ / ใช้ไม่ได้แล้ว
            clearAuth();
            return;
        }

        const data = await res.json();
        noteList.innerHTML = "";
        data.forEach((note) => addNoteToUI(note));
    } catch (err) {
        console.error(err);
    }
}

function addNoteToUI(note) {
    const li = document.createElement("li");

    // ส่วนข้อความโน้ต
    const textSpan = document.createElement("span");
    textSpan.textContent = note.text;

    // ปุ่ม Edit
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "8px";

    editBtn.addEventListener("click", async () => {
        const newText = prompt("แก้ไขโน้ต:", textSpan.textContent);
        if (!newText || !token) return;

        try {
            const res = await fetch(`${API_BASE}/notes/${note.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ note: newText }),
            });

            if (res.status === 401) {
                clearAuth();
                return;
            }

            const data = await res.json();
            if (res.ok) {
                textSpan.textContent = data.note.text;
            } else {
                console.error(data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // ปุ่ม Delete
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.marginLeft = "8px";

    delBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`${API_BASE}/notes/${note.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                clearAuth();
                return;
            }

            li.remove();
        } catch (err) {
            console.error(err);
        }
    });

    // เอาทุกอย่างใส่ใน li
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    noteList.appendChild(li);
}


function updateUI() {
    if (token) {
        // มี token = ล็อกอินแล้ว
        notesSection.style.display = "block";
        logoutBtn.style.display = "inline-block";

        if (authForm) authForm.style.display = "none"; // ซ่อนช่อง Email/Password

        currentUser.textContent = `Logged in as: ${loggedInEmail}`;
    } else {
        // ยังไม่ได้ล็อกอิน
        notesSection.style.display = "none";
        logoutBtn.style.display = "none";

        if (authForm) authForm.style.display = "block"; // โชว์ฟอร์มกลับมา

        currentUser.textContent = "";
        noteList.innerHTML = "";
    }
}


addBtn.addEventListener("click", async () => {
    const text = noteInput.value.trim();
    if (!text || !token) return;

    try {
        const res = await fetch(`${API_BASE}/notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ note: text }),
        });

        if (res.status === 401) {
            clearAuth();
            return;
        }

        const data = await res.json();

        if (res.ok) {
            addNoteToUI(data.note);
            noteInput.value = "";
        } else {
            console.error(data);
        }
    } catch (err) {
        console.error(err);
    }
});
