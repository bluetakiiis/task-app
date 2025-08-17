document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://bluetakiiis.github.io";

  const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const loginPage = $("#loginPage");
  const loginButton = $("#loginButton");
  const usernameInput = $("#usernameInput");
  const passwordInput = $("#passwordInput");
  const greetingElement = $("#greetingElement");
  const userNameDisplay = $("#userNameDisplay");
  const logoutButton = $("#logoutButton");

  const appSidebar = $("#appSidebar");
  const appHeader = $("#appHeader");
  const appContent = $("#appContent");
  const appFooter = $("#appFooter");

  const myListsNav = $("#myListsNav");
  const taskCategorySelect = $("#taskCategorySelect");

  const userLogo = $("#userLogo");
  const userPopup = $("#userPopup");
  const deleteAccountBtn = $("#deleteAccountBtn");
  const deletePopup = document.querySelector(".popup-overlay.delete-popup");
  const deleteConfirmBtn = $("#deleteConfirmBtn");
  const deleteCancelBtn = $("#deleteCancelBtn");

  const settingsPopup = $("#settingsPopup");
  const settingsLink = $(".settings-container a");
  const openAccountsBtn = $("#openAccounts");

  const tasksContainer = $("#tasksContainer");
  const filterWrapper = $("#priorityFilter");
  const filterMenu = $("#priorityFilterMenu");
  const boxes = $$(".priority-checkbox");
  const searchInput = $("#searchInput");

  const newTaskModalOverlay = $("#newTaskModalOverlay");
  const addTaskModalAddBtn = $("#newTaskModalOverlay .add-task-btn");
  const taskTitleInput = $("#newTaskModalOverlay .task-title-input");

  const addListModalOverlay = $("#addListModalOverlay");
  const confirmAddListBtn = $("#confirmAddListBtn");
  const newListNameInput = $("#new-list-name");

  const dueDateInput = $("#due-date");
  const dueTimeInput = $("#time");
  const taskPrioritySelect = $("#taskPrioritySelect");
  const taskDescriptionInput = $("#taskDescription");

  const newTaskBtn = $(".footer-left .new-task-button");
  const addListBtn = $(".footer-right .add-task-button");

  const header = $(".task-header");

  let tasks = [];
  let categories = [];
  let currentSearchQuery = "";

  // UTILS
  const html = (s) =>
    s == null
      ? ""
      : String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(dt)
      ? d
      : dt.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  };

  const priorityColor = (p) =>
    ({ High: "#cb0e11", Medium: "#EACC23", Low: "#95C51A" }[p] || "#e0e0e0");

  const getJSON = async (url, opts) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`${opts?.method || "GET"} ${url} failed`);
    return res.json();
  };

  async function fetchCategories() {
    try {
      categories = await getJSON(apiUrl("/api/categories"));
      renderMyLists();
      renderCategorySelect();
    } catch {
      alert("Error loading categories");
    }
  }

  async function fetchTasks() {
    try {
      tasks = await getJSON(apiUrl("/api/tasks"));
      renderForActiveSection();
    } catch {
      alert("Error loading tasks");
    }
  }

  // NAV
  let navItems = [];
  $$(".navigation-list").forEach((list) => {
    navItems = navItems.concat($$("li", list));
  });

  const navText = (li) => (li.querySelector("a")?.textContent || "").trim();

  function resetNav() {
    $$(".navigation-list li").forEach((li) => {
      li.classList.remove("active");
      const ic = li.querySelector(".nav-icon");
      if (ic?.dataset?.defaultSrc) ic.src = ic.dataset.defaultSrc;
    });
  }

  function setActiveSectionByName(name) {
    const target = (name || "").toLowerCase();
    resetNav();
    if (myListsNav) {
      $$("li", myListsNav).forEach((li) => {
        li.classList.remove("active");
        const ic = li.querySelector(".nav-icon");
        if (ic?.dataset?.defaultSrc) ic.src = ic.dataset.defaultSrc;
      });
    }

    navItems.forEach((li) => {
      if (navText(li).toLowerCase() === target) {
        li.classList.add("active");
        const ic = li.querySelector(".nav-icon");
        if (ic?.dataset?.activeSrc) ic.src = ic.dataset.activeSrc;
      }
    });

    updateHeaderForSection(name);
  }

  function updateHeaderForSection(sectionText) {
    if (!header) return;
    const s = (sectionText || "").trim().toLowerCase();
    const map = {
      today: "Today's Task",
      completed: "Completed Tasks",
      "all tasks": "All Tasks",
      upcoming: "Upcoming Tasks",
    };
    const title =
      map[s] ||
      (s ? `${s[0].toUpperCase()}${s.slice(1)} Tasks` : "Today's Task");
    const span = header.querySelector("span");
    if (span) span.textContent = title;
  }

  function attachMyListHandlers() {
    if (!myListsNav) return;
    $$("li", myListsNav).forEach((li) => {
      const ic = li.querySelector(".nav-icon");
      li.addEventListener("click", () => {
        resetNav();
        li.classList.add("active");
        if (ic?.dataset?.activeSrc) ic.src = ic.dataset.activeSrc;
        updateHeaderForSection(navText(li));
        renderForActiveSection();
      });
    });
  }

  // RENDER
  function renderMyLists() {
    if (!myListsNav) return;
    myListsNav.innerHTML = "";
    categories.forEach((cat) => {
      const li = document.createElement("li");
      li.dataset.category = cat.name;
      li.innerHTML = `<img src="images/Lists.png" class="nav-icon" /><a href="#">${html(
        cat.name
      )}</a>`;
      myListsNav.appendChild(li);
    });
    attachMyListHandlers();
  }

  function renderCategorySelect() {
    if (!taskCategorySelect) return;
    taskCategorySelect.innerHTML = categories
      .map((c) => `<option>${html(c.name)}</option>`)
      .join("");
  }

  function renderEmpty() {
    if (!tasksContainer) return;
    tasksContainer.classList.add("is-empty");
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <div class="empty-title">No tasks found</div>
        <div class="empty-subtitle">Enjoy your free time or add a new task to get started!</div>
      </div>`;
  }

  function updateUserStats() {
    try {
      const completed = tasks.filter((t) => t.status === "completed").length;
      const pending = tasks.length - completed;
      const counts = userPopup?.querySelectorAll(".task-status .task-count");
      if (counts?.length >= 2) {
        counts[0].textContent = String(completed);
        counts[1].textContent = String(pending);
      }
    } catch {}
  }

  function renderTaskCard(task) {
    const card = document.createElement("div");
    const p = (task.priority || "").toLowerCase();
    const cls = [
      "task-card",
      p === "high" || p === "medium" || p === "low" ? `priority-${p}` : null,
    ]
      .filter(Boolean)
      .join(" ");
    card.className = cls;

    const formattedDate = fmtDate(task.dueDate);

    card.innerHTML = `
      <div class="task-card-accent"></div>
      <div class="task-card-content">
        <div class="task-tick" title="Mark completed"></div>
        <div class="task-header-inline">
          <div class="task-title">${html(task.title || "")}</div>
          ${
            task.category
              ? `<span class="task-card-category-badge">${html(
                  task.category
                )}</span>`
              : ""
          }
        </div>
        <p class="task-details">${html(task.description || "")}</p>
        <div class="task-due-date">
          <img class="task-due-date-logo" src="images/Due Date Logo.png" alt="Due date" />
          <div class="task-due-texts">
            <span class="task-due-date-text">${html(formattedDate)}</span>
            <span class="task-due-time">${
              typeof task.dueTime === "string" && task.dueTime.trim() !== ""
                ? html(task.dueTime)
                : "-"
            }</span>
          </div>
        </div>
        <div class="task-card-features">
          <button class="task-feature-btn task-card-view" title="View"><img src="images/View.png" alt="View" /></button>
          <button class="task-feature-btn task-card-edit" title="Edit"><img src="images/Edit.png" alt="Edit" /></button>
          <button class="task-feature-btn task-card-delete" title="Delete"><img src="images/Delete.png" alt="Delete" /></button>
        </div>
        <img class="task-flag" src="images/Flag.png" alt="Flag" />
        <div class="task-priority-label" style="color:${priorityColor(
          task.priority
        )}">${html(task.priority || "")}</div>
      </div>`;

    const checkbox = card.querySelector(".task-tick");
    const updateUI = () => {
      const completed = task.status === "completed";
      checkbox.style.backgroundColor = completed ? "#0481fe" : "#fff";
      checkbox.style.borderColor = completed ? "#0481fe" : "#d1d1d1";
      card.style.opacity = completed ? "0.7" : "1";
    };
    updateUI();

    checkbox.addEventListener("click", async () => {
      task.status = task.status === "completed" ? "pending" : "completed";
      try {
        const id = task._id || task.id;
        await getJSON(apiUrl(`/api/tasks/${id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
      } catch {}
      updateUI();
      renderForActiveSection();
    });

    card
      .querySelector(".task-card-delete")
      .addEventListener("click", () => openDeleteTaskModal(task));
    card
      .querySelector(".task-card-edit")
      .addEventListener("click", () => openEditTaskModal(task));
    card
      .querySelector(".task-card-view")
      .addEventListener("click", () => openViewTaskModal(task));

    return card;
  }

  function renderTasks(list) {
    if (!tasksContainer) return;
    if (!list?.length) {
      renderEmpty();
      updateUserStats();
      return;
    }
    tasksContainer.classList.remove("is-empty");
    tasksContainer.innerHTML = "";
    list.forEach((t) => tasksContainer.appendChild(renderTaskCard(t)));
    updateUserStats();
  }

  // MODALS
  function openViewTaskModal(task) {
    const overlay = $("#viewTaskModalOverlay");
    const modal = $("#viewTaskModal");
    if (!overlay || !modal) return;

    modal.innerHTML = `
      <h3 class="modal-title" id="viewTaskTitle">${html(
        task.title || "Task Details"
      )}</h3>
      <div class="view-task-body">
        <div class="view-task-row"><div class="view-task-label">Description</div><div class="view-task-value">${html(
          task.description || "-"
        )}</div></div>
        <div class="view-task-row"><div class="view-task-label">Due Date</div><div class="view-task-value">${html(
          fmtDate(task.dueDate)
        )}${task.dueTime ? ", " + html(task.dueTime) : ""}</div></div>
        <div class="view-task-row"><div class="view-task-label">Priority</div><div class="view-task-value">${html(
          task.priority || "-"
        )}</div></div>
        <div class="view-task-row"><div class="view-task-label">Category</div><div class="view-task-value">${html(
          task.category || "-"
        )}</div></div>
        <div class="view-task-row"><div class="view-task-label">Status</div><div class="view-task-value">${
          task.status === "completed" ? "Completed" : "Pending"
        }</div></div>
      </div>
      <div class="view-task-actions">
        <button class="action-button primary-button" id="viewEditBtn">Edit</button>
        <button class="action-button delete-button" id="viewDeleteBtn">Delete</button>
      </div>`;

    overlay.style.display = "flex";
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    };

    $("#viewDeleteBtn")?.addEventListener("click", () => {
      overlay.style.display = "none";
      openDeleteTaskModal(task);
    });
    $("#viewEditBtn")?.addEventListener("click", () => {
      overlay.style.display = "none";
      openEditTaskModal(task);
    });
  }

  function openDeleteTaskModal(task) {
    const overlay = $("#deleteTaskModalOverlay");
    const modal = $("#deleteTaskModal");
    if (!overlay || !modal) return;

    modal.innerHTML = `
      <img src="images/Delete Logo.png" alt="Delete" class="delete-task-icon" />
      <div class="delete-task-title">Are you sure you want to delete the task?</div>
      <div class="delete-task-actions">
        <button class="delete-confirm" id="confirmDeleteBtn">Yes, Delete</button>
        <button class="delete-cancel" id="cancelDeleteBtn">Cancel</button>
      </div>`;

    const close = () => (overlay.style.display = "none");
    overlay.style.display = "flex";
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    $("#confirmDeleteBtn")?.addEventListener("click", async () => {
      try {
        const id = task._id || task.id;
        await fetch(apiUrl(`/api/tasks/${id}`), { method: "DELETE" });
        tasks = tasks.filter((t) => (t._id || t.id) !== id);
        renderForActiveSection();
      } catch {
        alert("Error deleting task");
      }
      close();
    });
    $("#cancelDeleteBtn")?.addEventListener("click", close);
  }

  function openEditTaskModal(task) {
    const overlay = $("#editTaskModalOverlay");
    const modal = $("#editTaskModal");
    if (!overlay || !modal) return;

    const categoryOptions = categories
      .map((c) => {
        const n = c.name || c;
        const sel = n === task.category ? "selected" : "";
        return `<option ${sel}>${html(n)}</option>`;
      })
      .join("");

    modal.innerHTML = `
      <h3 class="modal-title" id="editTaskTitle">Edit Task</h3>
      <form class="edit-form" id="editTaskForm">
        <div class="form-row"><label>Title</label><input type="text" id="editTitle" value="${html(
          task.title || ""
        )}" /></div>
        <div class="form-row"><label>Description</label><textarea id="editDescription">${html(
          task.description || ""
        )}</textarea></div>
        <div class="row-2-cols">
          <div class="form-row"><label>Due Date</label><input type="date" id="editDueDate" value="${html(
            task.dueDate || ""
          )}" /></div>
          <div class="form-row"><label>Priority</label>
            <select id="editPriority">
              <option ${
                task.priority === "High" ? "selected" : ""
              }>High</option>
              <option ${
                task.priority === "Medium" ? "selected" : ""
              }>Medium</option>
              <option ${task.priority === "Low" ? "selected" : ""}>Low</option>
            </select>
          </div>
        </div>
        <div class="form-row"><label>Category</label><select id="editCategory">${categoryOptions}</select></div>
        <div class="edit-actions"><button type="submit" class="action-button primary-button">Save</button></div>
      </form>`;

    const close = () => {
      overlay.style.display = "none";
      document.body.classList.remove("modal-open");
    };
    overlay.style.display = "flex";
    document.body.classList.add("modal-open");
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    $("#editTaskForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = $("#editTitle").value.trim();
      if (!title) {
        alert("Title is required");
        return;
      }
      const idx = tasks.findIndex(
        (t) => (t._id || t.id) === (task._id || task.id)
      );
      if (idx === -1) return close();

      const updated = {
        ...tasks[idx],
        title,
        description: $("#editDescription").value.trim(),
        dueDate: $("#editDueDate").value,
        priority: $("#editPriority").value,
        category: $("#editCategory").value,
      };

      try {
        const id = task._id || task.id;
        const saved = await getJSON(apiUrl(`/api/tasks/${id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        tasks[idx] = saved;
        renderForActiveSection();
      } catch {
        alert("Error updating task");
      }
      close();
    });
  }

  // FILTER / SEARCH / SORT
  const selectedPriorities = () =>
    new Set(boxes.filter((b) => b.checked).map((b) => b.value));
  const applyPriorityFilter = (list) => {
    const sel = selectedPriorities();
    return sel.size ? list.filter((t) => sel.has(t.priority)) : list;
  };

  const getActiveSection = () => {
    const active = $$(".navigation-list li").find((li) =>
      li.classList.contains("active")
    );
    const txt = active?.querySelector("a")?.textContent?.trim().toLowerCase();
    return txt || "today";
  };

  function renderForActiveSection() {
    const section = getActiveSection();
    const today = new Date().toISOString().slice(0, 10);

    let filtered = tasks.filter((task) => {
      switch (section) {
        case "today":
          const taskDate = task.dueDate
            ? new Date(task.dueDate).toISOString().slice(0, 10)
            : null;
          return taskDate === today && task.status !== "completed";
        case "upcoming":
          const upcomingDate = task.dueDate
            ? new Date(task.dueDate).toISOString().slice(0, 10)
            : null;
          return (
            upcomingDate && upcomingDate > today && task.status !== "completed"
          );
        case "completed":
          return task.status === "completed";
        case "all tasks":
          return true;
        default:
          return (
            task.category?.toLowerCase() === section &&
            task.status !== "completed"
          );
      }
    });

    filtered = applyPriorityFilter(filtered);

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    const now = Date.now();
    filtered.sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : null;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : null;

      const aOverdue = a.status !== "completed" && aDate && aDate < now;
      const bOverdue = b.status !== "completed" && bDate && bDate < now;

      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (aDate && bDate) return aDate - bDate;
      if (aDate) return -1;
      if (bDate) return 1;
      return 0;
    });

    renderTasks(filtered);
  }

  // CREATE TASK / UI HOOKS
  function newTaskFromInputs() {
    const title = (taskTitleInput?.value || "").trim();
    if (!title) {
      alert("Please add a task title.");
      return null;
    }
    const dueDate = (dueDateInput?.value || "").trim();
    const dueTime = (dueTimeInput?.value || "").trim();
    const priority = (taskPrioritySelect?.value || "Low").trim();
    const category = (
      taskCategorySelect?.value ||
      categories[0] ||
      "Personal"
    ).trim();
    const description = (taskDescriptionInput?.value || "").trim();
    const t = {
      title,
      description,
      dueDate: dueDate || "",
      dueTime: dueTime || "",
      priority,
      category,
      status: "pending",
    };
    return t;
  }

  addTaskModalAddBtn?.addEventListener("click", async () => {
    const t = newTaskFromInputs();
    if (!t) return;
    try {
      const saved = await getJSON(apiUrl("/api/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      tasks.push(saved);
      taskTitleInput && (taskTitleInput.value = "");
      dueDateInput && (dueDateInput.value = "");
      dueTimeInput && (dueTimeInput.value = "");
      taskPrioritySelect && (taskPrioritySelect.value = "Low");
      taskDescriptionInput && (taskDescriptionInput.value = "");
      if (newTaskModalOverlay) {
        newTaskModalOverlay.style.display = "none";
        document.body.classList.remove("modal-open");
      }
      renderForActiveSection();
    } catch {
      alert("Error adding task");
    }
  });

  // UI: OVERLAYS / POPUPS
  function bindOverlay(overlay) {
    if (!overlay) return;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });
  }

  bindOverlay(newTaskModalOverlay);
  bindOverlay(addListModalOverlay);

  newTaskBtn?.addEventListener("click", () => {
    newTaskModalOverlay.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  addListBtn?.addEventListener("click", () => {
    addListModalOverlay.style.display = "flex";
    if (newListNameInput) {
      newListNameInput.value = "";
      setTimeout(() => newListNameInput.focus(), 0);
    }
  });

  confirmAddListBtn?.addEventListener("click", async () => {
    const name = (newListNameInput?.value || "").trim();
    if (!name) return;
    if (await addList(name)) addListModalOverlay.style.display = "none";
  });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      currentSearchQuery = searchInput.value.trim();
      renderForActiveSection();
    }
  });

  if (filterWrapper && filterMenu) {
    filterWrapper.addEventListener("click", (e) => {
      if (!e.target.closest(".filter-menu"))
        filterMenu.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
      if (!filterWrapper.contains(e.target))
        filterMenu.classList.remove("show");
    });
    filterMenu.addEventListener("change", (e) => {
      if (e.target?.classList.contains("priority-checkbox"))
        renderForActiveSection();
    });
  }

  if (userLogo && userPopup) {
    userLogo.addEventListener("click", (e) => {
      e.stopPropagation();
      userPopup.style.display = "flex";
    });
    userPopup.addEventListener("click", (e) => {
      if (e.target === userPopup) userPopup.style.display = "none";
    });
  }

  if (deleteAccountBtn && deletePopup) {
    deleteAccountBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePopup.style.display = "flex";
    });
    deleteCancelBtn?.addEventListener("click", () => {
      deletePopup.style.display = "none";
      if (userPopup) userPopup.style.display = "flex";
    });
    deletePopup.addEventListener("click", (e) => {
      if (e.target === deletePopup) deletePopup.style.display = "none";
    });
  }

  deleteConfirmBtn?.addEventListener("click", async () => {
    const username = localStorage.getItem("taskflowUsername");
    if (username) {
      try {
        await getJSON(apiUrl("/api/deleteAccount"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
      } catch {
        alert("Error deleting account");
        return;
      }
    }
    localStorage.clear();
    hideAppSections();
    showLoginPage();
    deletePopup && (deletePopup.style.display = "none");
  });

  if (settingsLink && settingsPopup) {
    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      settingsPopup.style.display = "flex";
    });
    bindOverlay(settingsPopup);
  }

  if (openAccountsBtn && settingsPopup && userPopup) {
    openAccountsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsPopup.style.display = "none";
      userPopup.style.display = "flex";
    });
  }

  // AUTH / APP SHOW
  function hideAppSections() {
    appSidebar.style.display = "none";
    appHeader.style.display = "none";
    appContent.style.display = "none";
    appFooter.style.display = "none";
  }

  function showLoginPage() {
    if (loginPage) {
      loginPage.style.display = "flex";
      if (usernameInput) usernameInput.value = "";
    }
  }

  loginButton?.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!(username && password))
      return alert("Please enter both username and password");
    fetch(apiUrl("/api/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.message === "Login successful") {
          localStorage.setItem("taskflowUsername", username);
          showApp(username);
        } else alert(d.message);
      })
      .catch(() => alert("Error logging in"));
  });

  const storedUsername = localStorage.getItem("taskflowUsername");
  if (storedUsername) showApp(storedUsername);

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("taskflowUsername");
    hideAppSections();
    loginPage.style.display = "flex";
  });

  async function showApp(username) {
    loginPage.style.display = "none";
    appSidebar.style.display = "block";
    appHeader.style.display = "grid";
    appContent.style.display = "grid";
    appFooter.style.display = "grid";
    greetingElement.textContent = `Hello, ${username}!`;
    userNameDisplay.textContent = username;
    await fetchCategories();
    await fetchTasks();
  }

  // CATEGORIES
  async function addList(name) {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert("List already exists.");
      return false;
    }
    try {
      const newCat = await getJSON(apiUrl("/api/categories"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      categories.push(newCat);
      renderMyLists();
      renderCategorySelect();
      return true;
    } catch {
      alert("Error creating category");
      return false;
    }
  }

  // INITIALIZATION
  setActiveSectionByName("today");

  navItems.forEach((item) =>
    item.addEventListener("click", () => {
      setActiveSectionByName(navText(item));
      renderForActiveSection();
    })
  );
});
