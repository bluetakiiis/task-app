document.addEventListener("DOMContentLoaded", function () {

  // DOM ELEMENTS (cached)
  const loginPage = document.getElementById("loginPage");
  const loginButton = document.getElementById("loginButton");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  const greetingElement = document.getElementById("greetingElement");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const logoutButton = document.getElementById("logoutButton");

  const appSidebar = document.getElementById("appSidebar");
  const appHeader = document.getElementById("appHeader");
  const appContent = document.getElementById("appContent");
  const appFooter = document.getElementById("appFooter");

  const myListsNav = document.getElementById("myListsNav");
  const taskCategorySelect = document.getElementById("taskCategorySelect");

  const userLogo = document.getElementById("userLogo");
  const userPopup = document.getElementById("userPopup");
  const userPopupRef = document.getElementById("userPopup");

  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const deletePopup = document.getElementById("deletePopup");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");

  const settingsPopup = document.getElementById("settingsPopup");
  const openAccountsBtn = document.getElementById("openAccounts");
  const settingsLink = document.querySelector(".settings-container a");

  const tasksContainer = document.getElementById("tasksContainer");
  const filterWrapper = document.getElementById("priorityFilter");
  const filterMenu = document.getElementById("priorityFilterMenu");
  const boxes = document.querySelectorAll(".priority-checkbox");

  const searchInput = document.getElementById("searchInput");

  const newTaskModalOverlay = document.getElementById("newTaskModalOverlay");
  const newTaskModal = document.getElementById("newTaskModal");
  const addTaskModalAddBtn = newTaskModalOverlay?.querySelector(".add-task-btn");
  const taskTitleInput = newTaskModalOverlay?.querySelector(".task-title-input");

  const addListModalOverlay = document.getElementById("addListModalOverlay");
  const confirmAddListBtn = document.getElementById("confirmAddListBtn");
  const newListNameInput = document.getElementById("new-list-name");

  const dueDateInput = document.getElementById("due-date");
  const dueTimeInput = document.getElementById("time");
  const taskPrioritySelect = document.getElementById("taskPrioritySelect");
  const taskDescriptionInput = document.getElementById("taskDescription");

  const newTaskBtn = document.querySelector(".footer-left .new-task-button");
  const addListBtn = document.querySelector(".footer-right .add-task-button");

  const navLists = document.querySelectorAll(".navigation-list");
  const header = document.querySelector(".task-header");
  const allNavItems = document.querySelectorAll(".navigation-list li");

  // APPLICATION STATE
  let tasks = [];
  let categories = [];
  let currentSearchQuery = "";

  // UTILITIES
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDateForView(d) {
    if (!d) return "-";
    try {
      const date = new Date(d);
      if (isNaN(date)) return d;
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return d;
    }
  }

  function getPriorityColor(priority) {
    if (priority === "High") return "#cb0e11";
    if (priority === "Medium") return "#EACC23";
    if (priority === "Low") return "#95C51A";
    return "#e0e0e0";
  }

  function generateId() {
    return `t_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  // determines derived status based on due date and explicit status
  function determineTaskStatus(task) {
    if (task.status === "completed") return "completed";
    const today = new Date().toISOString().slice(0, 10);
    if (!task.dueDate) return "none";
    if (task.dueDate === today) return "today";
    if (task.dueDate > today) return "upcoming";
    return "past";
  }

  // API / DATA LOADERS
  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      categories = await res.json();
      renderMyLists();
      renderCategorySelect();
    } catch (err) {
      alert("Error loading categories");
    }
  }

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      tasks = await res.json();
      renderForActiveSection();
    } catch (err) {
      alert("Error loading tasks");
    }
  }

//   async function saveTasks() {}

  function saveCategories() {
    localStorage.setItem("taskflowCategories", JSON.stringify(categories));
  }

  // NAV & HEADER HELPERS
  let navItems = [];
  navLists.forEach((list) => {
    navItems = navItems.concat(Array.from(list.querySelectorAll("li")));
  });

  function getNavItemText(item) {
    return item.querySelector("a")?.textContent?.trim() || "";
  }

  function prepareNavIcon(item) {
    const icon = item.querySelector(".nav-icon");
    if (!icon) return;
    if (!icon.dataset.defaultSrc) icon.dataset.defaultSrc = icon.src;
    let activeSrc = icon.src;
    if (activeSrc.includes("All Task Logo.png")) {
      activeSrc = activeSrc.replace("All Task Logo.png", "All Task Logo Active.png");
    } else if (activeSrc.includes("Completed Logo.png")) {
      activeSrc = activeSrc.replace(
        "Completed Logo.png",
        "Completed Logo Active.png"
      );
    } else if (activeSrc.includes("Today Logo.png")) {
      activeSrc = activeSrc.replace("Today Logo.png", "Today Logo Active.png");
    } else if (activeSrc.includes("Upcoming Logo.png")) {
      activeSrc = activeSrc.replace("Upcoming Logo.png", "Upcoming Logo Active.png");
    }
    icon.dataset.activeSrc = activeSrc;
  }

  navItems.forEach(prepareNavIcon);

  function resetAllNavItems() {
    document.querySelectorAll(".navigation-list li").forEach((i) => {
      i.classList.remove("active");
      const icon = i.querySelector(".nav-icon");
      if (icon && icon.dataset && icon.dataset.defaultSrc) {
        icon.src = icon.dataset.defaultSrc;
      }
    });
  }

  function setActiveSectionByName(name) {
    const target = (name || "").toLowerCase();
    resetAllNavItems();
    if (myListsNav) {
      myListsNav.querySelectorAll("li").forEach((li) => {
        li.classList.remove("active");
        const icon = li.querySelector(".nav-icon");
        if (icon && icon.dataset && icon.dataset.defaultSrc) {
          icon.src = icon.dataset.defaultSrc;
        }
      });
    }

    navItems.forEach((i) => {
      const isActive = getNavItemText(i).toLowerCase() === target;
      if (isActive) {
        i.classList.add("active");
        const icon = i.querySelector(".nav-icon");
        if (icon && icon.dataset.activeSrc) {
          icon.src = icon.dataset.activeSrc;
        }
      }
    });
    updateHeaderForSection(name);
  }

  function updateHeaderForSection(sectionText) {
    if (!header) return;
    const section = (sectionText || "").trim().toLowerCase();
    let heading = "Today's Task";
    if (section === "today") heading = "Today's Task";
    else if (section === "completed") heading = "Completed Tasks";
    else if (section === "all tasks") heading = "All Tasks";
    else if (section === "upcoming") heading = "Upcoming Tasks";
    else if (section)
      heading = section.charAt(0).toUpperCase() + section.slice(1) + " Tasks";
    const titleSpan = header.querySelector("span");
    if (titleSpan) titleSpan.textContent = heading;
  }

  function attachMyListHandlers() {
    if (!myListsNav) return;
    myListsNav.querySelectorAll("li").forEach((item) => {
      setupNavIconDataForItem(item);
      item.addEventListener("click", function () {
        resetAllNavItems();
        this.classList.add("active");
        const icon = this.querySelector(".nav-icon");
        if (icon && icon.dataset.activeSrc) {
          icon.src = icon.dataset.activeSrc;
        }
        const name = this.querySelector("a")?.textContent || "";
        updateHeaderForSection(name);
        renderForActiveSection();
      });
    });
  }

  function setupNavIconDataForItem(item) {
    const icon = item.querySelector(".nav-icon");
    if (icon) {
      icon.dataset.defaultSrc = icon.src;
      icon.dataset.activeSrc = icon.src;
    }
  }

  // RENDERERS
  function renderMyLists() {
    if (!myListsNav) return;
    myListsNav.innerHTML = "";
    categories.forEach((cat) => {
      const li = document.createElement("li");
      li.dataset.category = cat.name;
      li.innerHTML = `<img src="images/Lists.png" class="nav-icon" /><a href="#">${cat.name}</a>`;
      myListsNav.appendChild(li);
    });
    attachMyListHandlers();
  }

  function renderCategorySelect() {
    if (!taskCategorySelect) return;
    taskCategorySelect.innerHTML = "";
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.textContent = cat.name;
      taskCategorySelect.appendChild(opt);
    });
  }

  function renderEmptyState() {
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
      const pending = tasks.filter((t) => t.status !== "completed").length;
      const counts = userPopup?.querySelectorAll(".task-status .task-count");
      if (counts && counts.length >= 2) {
        counts[0].textContent = String(completed);
        counts[1].textContent = String(pending);
      }
    } catch (_) {}
  }

  function renderTaskCard(task) {
    const card = document.createElement("div");

    const p = (task.priority || "").toLowerCase();
    const priorityClass = p === "high" || p === "medium" || p === "low" ? `priority-${p}` : "";
    card.className = `task-card ${priorityClass}`.trim();

    const priorityColor = getPriorityColor(task.priority);
    const formattedDate = task.dueDate
      ? (() => {
          try {
            const d = new Date(task.dueDate);
            if (isNaN(d)) return task.dueDate;
            return d.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
          } catch (_) {
            return task.dueDate;
          }
        })()
      : "";

    card.innerHTML = `
      <div class="task-card-accent"></div>
      <div class="task-card-content">
        <div class="task-tick" title="Mark completed"></div>

        <div class="task-header-inline">
          <div class="task-title">${escapeHtml(task.title || "")}</div>
          ${
            task.category
              ? `<span class="task-card-category-badge">${escapeHtml(task.category)}</span>`
              : ""
          }
        </div>

        <p class="task-details">${escapeHtml(task.description || "")}</p>

        <div class="task-due-date">
          <img class="task-due-date-logo" src="images/Due Date Logo.png" alt="Due date" />
          <div class="task-due-texts">
            <span class="task-due-date-text">${escapeHtml(formattedDate)}</span>
            <span class="task-due-time">${task.dueTime ? escapeHtml(task.dueTime) : ""}</span>
          </div>
        </div>

        <div class="task-card-features">
          <button class="task-feature-btn task-card-view" title="View"><img src="images/View.png" alt="View" /></button>
          <button class="task-feature-btn task-card-edit" title="Edit"><img src="images/Edit.png" alt="Edit" /></button>
          <button class="task-feature-btn task-card-delete" title="Delete"><img src="images/Delete.png" alt="Delete" /></button>
        </div>

        <img class="task-flag" src="images/Flag.png" alt="Flag" />
        <div class="task-priority-label" style="color:${priorityColor}">${escapeHtml(task.priority || "")}</div>
      </div>
    `;

    const checkbox = card.querySelector(".task-tick");
    const deleteBtn = card.querySelector(".task-card-delete");
    const editBtn = card.querySelector(".task-card-edit");
    const viewBtn = card.querySelector(".task-card-view");

    function updateCheckboxVisual() {
      if (task.status === "completed") {
        checkbox.style.backgroundColor = "#0481fe";
        checkbox.style.borderColor = "#0481fe";
        card.style.opacity = "0.7";
      } else {
        checkbox.style.backgroundColor = "#fff";
        checkbox.style.borderColor = "#d1d1d1";
        card.style.opacity = "1";
      }
    }
    updateCheckboxVisual();

    checkbox.addEventListener("click", () => {
      task.status = task.status === "completed" ? "upcoming" : "completed";
      task.updatedAt = Date.now();
      saveTasks();
      updateCheckboxVisual();

      renderForActiveSection();
    });

    deleteBtn.addEventListener("click", () => {
      openDeleteTaskModal(task);
    });

    editBtn.addEventListener("click", () => {
      openEditTaskModal(task);
    });
    viewBtn.addEventListener("click", () => {
      openViewTaskModal(task);
    });

    return card;
  }

  function renderTasks(list) {
    if (!tasksContainer) return;
    if (!list || list.length === 0) {
      renderEmptyState();
      updateUserStats();
      return;
    }
    tasksContainer.classList.remove("is-empty");
    tasksContainer.innerHTML = "";
    list.forEach((t) => tasksContainer.appendChild(renderTaskCard(t)));
    updateUserStats();
  }

  // MODALS: view / edit / delete
  function openViewTaskModal(task) {
    const overlay = document.getElementById("viewTaskModalOverlay");
    const modal = document.getElementById("viewTaskModal");
    if (!overlay || !modal) return;

    const statusText = task.status === "completed" ? "Completed" : "Pending";

    modal.innerHTML = `
      <h3 class="modal-title" id="viewTaskTitle">${escapeHtml(task.title || "Task Details")}</h3>
      <div class="view-task-body">
        <div class="view-task-row">
          <div class="view-task-label">Description</div>
          <div class="view-task-value">${escapeHtml(task.description || "-")}</div>
        </div>
        <div class="view-task-row">
          <div class="view-task-label">Due Date</div>
          <div class="view-task-value">${escapeHtml(formatDateForView(task.dueDate))}${task.dueTime ? ", " + escapeHtml(task.dueTime) : ""}</div>
        </div>
        <div class="view-task-row">
          <div class="view-task-label">Priority</div>
          <div class="view-task-value">${escapeHtml(task.priority || "-")}</div>
        </div>
        <div class="view-task-row">
          <div class="view-task-label">Category</div>
          <div class="view-task-value">${escapeHtml(task.category || "-")}</div>
        </div>
        <div class="view-task-row">
          <div class="view-task-label">Status</div>
          <div class="view-task-value">${statusText}</div>
        </div>
      </div>
      <div class="view-task-actions">
        <button class="action-button primary-button" id="viewEditBtn">Edit</button>
        <button class="action-button delete-button" id="viewDeleteBtn">Delete</button>
      </div>
    `;

    overlay.style.display = "flex";

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    };

    const onEsc = (e) => {
      if (e.key === "Escape") {
        overlay.style.display = "none";
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);

    const delBtn = document.getElementById("viewDeleteBtn");
    delBtn?.addEventListener("click", () => {
      overlay.style.display = "none";
      openDeleteTaskModal(task);
    });

    const editBtn = document.getElementById("viewEditBtn");
    editBtn?.addEventListener("click", () => {
      overlay.style.display = "none";
      openEditTaskModal(task);
    });
  }

  function openDeleteTaskModal(task) {
    const overlay = document.getElementById("deleteTaskModalOverlay");
    const modal = document.getElementById("deleteTaskModal");
    if (!overlay || !modal) return;

    modal.innerHTML = `
      <img src="images/Delete Logo.png" alt="Delete" class="delete-task-icon" />
      <div class="delete-task-title">Are you sure you want to delete the task?</div>
      <div class="delete-task-actions">
        <button class="delete-confirm" id="confirmDeleteBtn">Yes, Delete</button>
        <button class="delete-cancel" id="cancelDeleteBtn">Cancel</button>
      </div>
    `;

    overlay.style.display = "flex";

    const close = () => {
      overlay.style.display = "none";
    };
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);

    document
      .getElementById("confirmDeleteBtn")
      ?.addEventListener("click", async () => {
        try {
          const deleteId = task._id || task.id;
          const res = await fetch(`/api/tasks/${deleteId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Error deleting task");
          tasks = tasks.filter((t) => (t._id || t.id) !== deleteId);
          renderForActiveSection();
        } catch (err) {
          alert("Error deleting task");
        }
        close();
      });
    document.getElementById("cancelDeleteBtn")?.addEventListener("click", close);
  }

  function openEditTaskModal(task) {
    const overlay = document.getElementById("editTaskModalOverlay");
    const modal = document.getElementById("editTaskModal");
    if (!overlay || !modal) return;

    modal.innerHTML = `
      <h3 class="modal-title" id="editTaskTitle">Edit Task</h3>
      <form class="edit-form" id="editTaskForm">
        <div class="form-row">
          <label>Title</label>
          <input type="text" id="editTitle" value="${escapeHtml(task.title || "")}" />
        </div>
        <div class="form-row">
          <label>Description</label>
          <textarea id="editDescription">${escapeHtml(task.description || "")}</textarea>
        </div>
        <div class="row-2-cols">
          <div class="form-row">
            <label>Due Date</label>
            <input type="date" id="editDueDate" value="${escapeHtml(task.dueDate || "")}" />
          </div>
          <div class="form-row">
            <label>Priority</label>
            <select id="editPriority">
              <option ${task.priority === "High" ? "selected" : ""}>High</option>
              <option ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
              <option ${task.priority === "Low" ? "selected" : ""}>Low</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label>Category</label>
          <select id="editCategory">
            ${categories
              .map((c) => {
                const catName = c.name || c;
                const selected = catName === task.category ? "selected" : "";
                return `<option ${selected}>${escapeHtml(catName)}</option>`;
              })
              .join("")}
          </select>
        </div>
        <div class="edit-actions">
          <button type="submit" class="action-button primary-button">Save</button>
        </div>
      </form>
    `;

    overlay.style.display = "flex";
    document.body.classList.add("modal-open");

    const closeOverlay = () => {
      overlay.style.display = "none";
      document.body.classList.remove("modal-open");
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) closeOverlay();
    };

    const onEsc = (e) => {
      if (e.key === "Escape") {
        closeOverlay();
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);

    const form = document.getElementById("editTaskForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("editTitle").value.trim();
      const description = document.getElementById("editDescription").value.trim();
      const dueDate = document.getElementById("editDueDate").value;
      const priority = document.getElementById("editPriority").value;
      const category = document.getElementById("editCategory").value;

      if (!title) {
        alert("Title is required");
        return;
      }

      const idx = tasks.findIndex((t) => (t._id || t.id) === (task._id || task.id));
      if (idx !== -1) {
        const updatedTask = {
          ...tasks[idx],
          title,
          description,
          dueDate,
          priority,
          category,
          updatedAt: Date.now(),
        };
        if (updatedTask.status !== "completed") {
          updatedTask.status = determineTaskStatus(updatedTask);
        }
        try {
          const updateId = task._id || task.id;
          const res = await fetch(`/api/tasks/${updateId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
          });
          if (!res.ok) throw new Error("Error updating task");
          const savedTask = await res.json();
          tasks[idx] = savedTask;
          renderForActiveSection();
        } catch (err) {
          alert("Error updating task");
        }
      }
      closeOverlay();
    });
  }

  // FILTERS / SEARCH / SORT
  function getSelectedPriorities() {
    const selected = new Set();
    boxes.forEach((b) => b.checked && selected.add(b.value));
    return selected;
  }

  function applyPriorityFilter(list) {
    const selected = getSelectedPriorities();
    if (!selected || selected.size === 0) return list;
    return list.filter((t) => selected.has(t.priority));
  }

  function getActiveSection() {
    const items = document.querySelectorAll(".navigation-list li");
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.classList.contains("active")) {
        const txt = it.querySelector("a")?.textContent?.trim().toLowerCase();
        return txt || "today";
      }
    }
    return "today";
  }

  function renderForActiveSection() {
    const section = getActiveSection();
    let filtered = tasks.map((t) => {
      t._derivedStatus = determineTaskStatus(t);
      return t;
    });

    if (section === "today") {
      filtered = filtered.filter((t) => t._derivedStatus === "today");
    } else if (section === "upcoming") {
      filtered = filtered.filter((t) => t._derivedStatus === "upcoming");
    } else if (section === "completed") {
      filtered = filtered.filter((t) => t._derivedStatus === "completed");
    } else if (section === "all tasks") {
      // keep all
    } else if (categories.map((c) => (c.name || "").toLowerCase()).includes(section)) {
      filtered = filtered.filter((t) => (t.category || "").toLowerCase() === section && t.status !== "completed");
    } else {
      filtered = [];
    }

    filtered = applyPriorityFilter(filtered);

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    const nowTs = Date.now();
    function taskDueTimestamp(t) {
      if (!t.dueDate) return null;
      const parts = String(t.dueDate).split("-").map((n) => parseInt(n, 10));
      const y = parts[0] || 0;
      const m = (parts[1] || 1) - 1;
      const d = parts[2] || 1;
      let hh = 23,
        mm = 59;
      if (t.dueTime) {
        const tp = String(t.dueTime).split(":");
        hh = parseInt(tp[0], 10) || 0;
        mm = parseInt(tp[1], 10) || 0;
      }
      return new Date(y, m, d, hh, mm, 0, 0).getTime();
    }
    function idTimestamp(t) {
      const m = String(t.id || "").match(/^t_(\d+)_/);
      return m ? parseInt(m[1], 10) : 0;
    }
    function lastUpdateTs(t) {
      return t.updatedAt || t.createdAt || idTimestamp(t) || 0;
    }
    filtered.sort((a, b) => {
      const aDue = taskDueTimestamp(a);
      const bDue = taskDueTimestamp(b);
      const aOver = a.status !== "completed" && aDue !== null && aDue < nowTs;
      const bOver = b.status !== "completed" && bDue !== null && bDue < nowTs;
      if (aOver !== bOver) return aOver ? -1 : 1;
      if (aDue !== null && bDue !== null) {
        if (aDue !== bDue) return aDue - bDue;
        return lastUpdateTs(b) - lastUpdateTs(a);
      }
      if (aDue !== null) return -1;
      if (bDue !== null) return 1;
      return lastUpdateTs(b) - lastUpdateTs(a);
    });
    renderTasks(filtered);
  }

  // TASK CREATION & UI HOOKS
  function createTaskFromInputs() {
    const title = (taskTitleInput?.value || "").trim();
    if (!title) {
      alert("Please add a task title.");
      return null;
    }
    const dueDate = (dueDateInput?.value || "").trim();
    const dueTime = (dueTimeInput?.value || "").trim();
    const priority = (taskPrioritySelect?.value || "Low").trim();
    const category = (taskCategorySelect?.value || categories[0] || "Personal").trim();
    const description = (taskDescriptionInput?.value || "").trim();

    const newTask = {
      id: generateId(),
      title,
      description,
      dueDate: dueDate || "",
      dueTime: dueTime || "",
      priority,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    newTask.status = determineTaskStatus(newTask);
    return newTask;
  }

  if (addTaskModalAddBtn) {
    addTaskModalAddBtn.addEventListener("click", async () => {
      const newTask = createTaskFromInputs();
      if (!newTask) return;
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
        if (!res.ok) throw new Error("Error adding task");
        const savedTask = await res.json();
        tasks.push(savedTask);
        if (taskTitleInput) taskTitleInput.value = "";
        if (dueDateInput) dueDateInput.value = "";
        if (dueTimeInput) dueTimeInput.value = "";
        if (taskPrioritySelect) taskPrioritySelect.value = "Low";
        if (taskDescriptionInput) taskDescriptionInput.value = "";
        if (newTaskModalOverlay) {
          newTaskModalOverlay.style.display = "none";
          document.body.classList.remove("modal-open");
        }
        renderForActiveSection();
      } catch (err) {
        alert("Error adding task");
      }
    });
  }

  // UI BINDINGS: modals, login, logout, user popups, settings
  if (newTaskBtn && newTaskModalOverlay) {
    newTaskBtn.addEventListener("click", () => {
      newTaskModalOverlay.style.display = "flex";
      document.body.classList.add("modal-open");
    });

    newTaskModalOverlay.addEventListener("click", (e) => {
      if (e.target === newTaskModalOverlay) {
        newTaskModalOverlay.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && newTaskModalOverlay.style.display === "flex") {
        newTaskModalOverlay.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });
  }

  if (addListBtn && addListModalOverlay) {
    addListBtn.addEventListener("click", () => {
      addListModalOverlay.style.display = "flex";
      newListNameInput && (newListNameInput.value = "");
      setTimeout(() => newListNameInput && newListNameInput.focus(), 0);
    });

    addListModalOverlay.addEventListener("click", (e) => {
      if (e.target === addListModalOverlay) {
        addListModalOverlay.style.display = "none";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && addListModalOverlay.style.display === "flex") {
        addListModalOverlay.style.display = "none";
      }
    });
  }

  if (confirmAddListBtn) {
    confirmAddListBtn.addEventListener("click", () => {
      const name = (newListNameInput?.value || "").trim();
      if (!name) return;
      if (addList(name)) {
        addListModalOverlay.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        currentSearchQuery = searchInput.value.trim();
        renderForActiveSection();
      }
    });
  }

  if (filterWrapper && filterMenu) {
    filterWrapper.addEventListener("click", (e) => {
      if (e.target.closest(".filter-menu")) return;
      filterMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!filterWrapper.contains(e.target)) {
        filterMenu.classList.remove("show");
      }
    });

    filterMenu.addEventListener("change", (e) => {
      if (e.target && e.target.classList.contains("priority-checkbox")) {
        renderForActiveSection();
      }
    });
  }

  if (userLogo && userPopup) {
    userLogo.addEventListener("click", function (e) {
      e.stopPropagation();
      userPopup.style.display = "flex";
    });

    userPopup.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        userPopup.style.display = "none";
      }
    });
  }

  if (deleteAccountBtn && deletePopup) {
    deleteAccountBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deletePopup.style.display = "flex";
    });
  }

  const closeDeletePopup = function () {
    if (deletePopup) deletePopup.style.display = "none";
  };

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", async function () {
      const username = localStorage.getItem("taskflowUsername");
      if (username) {
        try {
          const res = await fetch("/api/deleteAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          if (!res.ok) throw new Error("Error deleting account");
        } catch (err) {
          alert("Error deleting account");
          return;
        }
      }
      localStorage.clear();
      closeDeletePopup();
      hideAppSections();
      showLoginPage();
    });
  }

  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", function () {
      closeDeletePopup();
      if (userPopup) {
        userPopup.style.display = "flex";
      }
    });
  }

  if (deletePopup) {
    deletePopup.addEventListener("click", function (e) {
      if (e.target === deletePopup) {
        closeDeletePopup();
      }
    });
  }

  if (settingsLink && settingsPopup) {
    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      settingsPopup.style.display = "flex";
    });

    settingsPopup.addEventListener("click", (e) => {
      if (e.target === settingsPopup) settingsPopup.style.display = "none";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && settingsPopup.style.display === "flex") {
        settingsPopup.style.display = "none";
      }
    });
  }

  if (openAccountsBtn) {
    openAccountsBtn.addEventListener("click", () => {
      if (settingsPopup) settingsPopup.style.display = "none";
      if (userPopupRef) userPopupRef.style.display = "flex";
    });
  }

  // LOGIN / LOGOUT / APP SHOW
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

  loginButton.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (username && password) {
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Login successful") {
            localStorage.setItem("taskflowUsername", username);
            showApp(username);
          } else {
            alert(data.message);
          }
        })
        .catch(() => alert("Error logging in"));
    } else {
      alert("Please enter both username and password");
    }
  });

  const storedUsername = localStorage.getItem("taskflowUsername");
  if (storedUsername) {
    showApp(storedUsername);
  }

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("taskflowUsername");

    appSidebar.style.display = "none";
    appHeader.style.display = "none";
    appContent.style.display = "none";
    appFooter.style.display = "none";

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

  // CATEGORY MANAGEMENT
  async function addList(name) {
    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert("List already exists.");
      return false;
    }
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      alert("Error creating category");
      return false;
    }
    const newCat = await res.json();
    categories.push(newCat);
    renderMyLists();
    renderCategorySelect();
    const evt = new CustomEvent("taskflow:addList", { detail: { name } });
    window.dispatchEvent(evt);
    return true;
  }

  // INITIALIZATION
  renderMyLists();
  renderCategorySelect();
  setActiveSectionByName("today");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionName = getNavItemText(this);
      setActiveSectionByName(sectionName);
      renderForActiveSection();
    });
  });

  // trigger initial render
  renderForActiveSection();

  // keep external listeners (others may dispatch these)
  window.addEventListener("taskflow:tasksUpdated", () => {
    renderForActiveSection();
  });
});
