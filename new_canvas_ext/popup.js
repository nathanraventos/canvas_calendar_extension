const accessToken = "10706~KJPGAm3H6AtTuUZFCu7xaJuADHKn4NfTMfCaktfvtxWtxaPCMXJFawQDN97a6ExC";
const baseUrl = "https://byui.instructure.com/api/v1/";

let assignmentsCache = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

const completedAssignments = new Set();

// Load from localStorage on start for persistence
const savedCompleted = localStorage.getItem("completedAssignments");
if (savedCompleted) {
  JSON.parse(savedCompleted).forEach(id => completedAssignments.add(id));
}

// Fetch courses
async function fetchCourses() {
  const response = await fetch(`${baseUrl}courses?per_page=100`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  const data = await response.json();
  return data;
}

// Filter active courses
function filterActiveCourses(courses) {
  const now = new Date();
  return courses.filter(course => {
    if (!course.end_at) return true;
    return new Date(course.end_at) >= now;
  });
}

// Fetch assignments for a course
async function fetchAssignments(courseId) {
  const response = await fetch(`${baseUrl}courses/${courseId}/assignments?per_page=100`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  const data = await response.json();
  return data;
}

// Gather all assignments from active courses
async function fetchAllAssignments() {
  const courses = await fetchCourses();
  const activeCourses = filterActiveCourses(courses);
  const assignmentPromises = activeCourses.map(course => fetchAssignments(course.id));
  const allAssignmentsArrays = await Promise.all(assignmentPromises);
  return allAssignmentsArrays.flat();
}

// Helper: get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper: get first day of month (0=Sun)
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Helper: Convert ISO UTC date string to local YYYY-MM-DD string
function getLocalDateString(isoDateStr) {
  if (!isoDateStr) return null;
  const d = new Date(isoDateStr);
  return d.toLocaleDateString('en-CA');
}

// Helper: check if a date is today
function isToday(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year &&
         today.getMonth() === month &&
         today.getDate() === day;
}

// Build the calendar
function buildCalendar(events, year, month) {
  const calendarEl = document.getElementById("calendar");
  const monthLabel = document.getElementById("monthLabel");
  calendarEl.innerHTML = "";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthLabel.textContent = `${monthNames[month]} ${year}`;

  // Group events by local date string
  const eventsByDate = {};
  events.forEach(event => {
    const date = getLocalDateString(event.due_at);
    if (!date) return;
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(event);
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Add empty divs for alignment before the first day
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day empty";
    calendarEl.appendChild(emptyDiv);
  }

  // Add day cells
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = i;
    dayDiv.appendChild(dayNumber);

    if (eventsByDate[dayStr]) {
      const countBadge = document.createElement("div");
      countBadge.className = "count-badge";
      // Show count of incomplete assignments only
      const incompleteCount = eventsByDate[dayStr].filter(a => !completedAssignments.has(a.id)).length;
      if (incompleteCount > 0) {
        countBadge.textContent = incompleteCount;
        dayDiv.appendChild(countBadge);
        dayDiv.style.background = "#def";
      }
    }

    // Highlight if today
    if (isToday(year, month, i)) {
      dayDiv.classList.add("today");
    }

    dayDiv.dataset.date = dayStr;
    dayDiv.addEventListener("click", () => showEvents(assignmentsCache.filter(a => getLocalDateString(a.due_at) === dayStr), dayStr));
    calendarEl.appendChild(dayDiv);
  }
}

// Show assignments for selected day WITHOUT checkboxes (right panel)
function showEvents(assignments, date) {
  const eventsEl = document.getElementById("events");
  eventsEl.innerHTML = `<h3>Assignments for ${date}</h3>`;

  if (assignments.length === 0) {
    eventsEl.innerHTML += "<p>No assignments.</p>";
  } else {
    assignments.forEach(assignment => {
      const div = document.createElement("div");
      const link = document.createElement("a");
      link.href = assignment.html_url;
      link.textContent = `${assignment.name} (Course: ${assignment.course_id})`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      div.appendChild(link);
      eventsEl.appendChild(div);
    });
  }
}

// Render all assignments with checkboxes on the left panel (#assignments-list)
function renderAllAssignmentsList(assignments) {
  const listEl = document.getElementById("assignments-list");
  listEl.innerHTML = "";

  // Group assignments by due date string
  const assignmentsByDate = {};
  assignments.forEach(a => {
    const date = getLocalDateString(a.due_at) || "No Due Date";
    if (!assignmentsByDate[date]) assignmentsByDate[date] = [];
    assignmentsByDate[date].push(a);
  });

  // Sort dates (put "No Due Date" at end)
  const sortedDates = Object.keys(assignmentsByDate).sort((a, b) => {
    if (a === "No Due Date") return 1;
    if (b === "No Due Date") return -1;
    return new Date(a) - new Date(b);
  });

  sortedDates.forEach(date => {
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = date === "No Due Date" ? "No Due Date" : `Assignments for ${date}`;
    listEl.appendChild(dateHeader);

    assignmentsByDate[date].forEach(assignment => {
      const div = document.createElement("div");
      div.className = "assignment-item";

      // Checkbox circle
      const checkbox = document.createElement("span");
      checkbox.className = "checkbox-circle";
      if (completedAssignments.has(assignment.id)) {
        checkbox.classList.add("checked");
        div.classList.add("completed");
      }

      checkbox.addEventListener("click", () => {
        if (completedAssignments.has(assignment.id)) {
          completedAssignments.delete(assignment.id);
          checkbox.classList.remove("checked");
          div.classList.remove("completed");
        } else {
          completedAssignments.add(assignment.id);
          checkbox.classList.add("checked");
          div.classList.add("completed");
        }
        updateCalendarBadge(getLocalDateString(assignment.due_at));
        saveCompletedAssignments();
      });

      // Assignment link
      const link = document.createElement("a");
      link.href = assignment.html_url;
      link.textContent = `${assignment.name} (Course: ${assignment.course_id})`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      div.appendChild(checkbox);
      div.appendChild(link);
      listEl.appendChild(div);
      
      // Scroll to today's date header if it exists
      const todayStr = new Date().toLocaleDateString('en-CA');
      const todayHeader = document.querySelector(`#assignments-list h3`);
      const headers = Array.from(document.querySelectorAll('#assignments-list h3'));
      const targetHeader = headers.find(h => h.textContent.includes(todayStr));
      if (targetHeader) {
        targetHeader.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// Update the calendar badge count for a given date
function updateCalendarBadge(date) {
  const dayDiv = document.querySelector(`#calendar .day[data-date='${date}']`);
  if (!dayDiv) return;

  // Filter assignments for date and count incomplete ones
  const assignmentsForDate = assignmentsCache.filter(a => getLocalDateString(a.due_at) === date);
  const incompleteCount = assignmentsForDate.filter(a => !completedAssignments.has(a.id)).length;

  let badge = dayDiv.querySelector(".count-badge");
  if (incompleteCount > 0) {
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "count-badge";
      dayDiv.appendChild(badge);
      dayDiv.style.background = "#def";
    }
    badge.textContent = incompleteCount;
  } else {
    if (badge) {
      badge.remove();
      dayDiv.style.background = "";
    }
  }
}

// Save completed assignments to localStorage
function saveCompletedAssignments() {
  localStorage.setItem("completedAssignments", JSON.stringify(Array.from(completedAssignments)));
}

// Navigation buttons
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  buildCalendar(assignmentsCache, currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  buildCalendar(assignmentsCache, currentYear, currentMonth);
});

// Initial load
fetchAllAssignments().then(assignments => {
  assignmentsCache = assignments;
  buildCalendar(assignmentsCache, currentYear, currentMonth);

  // Update badges for all relevant dates
  const uniqueDates = new Set(assignmentsCache.map(a => getLocalDateString(a.due_at)).filter(Boolean));
  uniqueDates.forEach(date => {
    updateCalendarBadge(date);
  });

  // Show today's assignments in right panel (no checkboxes)
  const todayStr = new Date().toLocaleDateString('en-CA');
  showEvents(assignmentsCache.filter(a => getLocalDateString(a.due_at) === todayStr), todayStr);

  // Render full assignments list with checkboxes in left panel
  renderAllAssignmentsList(assignmentsCache);
});
