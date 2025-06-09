const accessToken = "10706~KJPGAm3H6AtTuUZFCu7xaJuADHKn4NfTMfCaktfvtxWtxaPCMXJFawQDN97a6ExC";
const baseUrl = "https://byui.instructure.com/api/v1/";

let assignmentsCache = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

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
  // Format as 'YYYY-MM-DD' using toLocaleDateString with 'en-CA' locale
  return d.toLocaleDateString('en-CA'); 
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
    if (!date) return; // skip if no due date
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
      countBadge.textContent = eventsByDate[dayStr].length;
      dayDiv.appendChild(countBadge);
      dayDiv.style.background = "#def"; // optional: highlight day with assignments
    }

    dayDiv.dataset.date = dayStr;
    dayDiv.addEventListener("click", () => showEvents(eventsByDate[dayStr] || [], dayStr));
    calendarEl.appendChild(dayDiv);

  }
}

// Show events for a selected day
function showEvents(assignments, date) {
  const eventsEl = document.getElementById("events");
  eventsEl.innerHTML = `<h3>Assignments for ${date}</h3>`;

  if (assignments.length === 0) {
    eventsEl.innerHTML += "<p>No assignments.</p>";
  } 
  else {
    assignments.forEach(assignment => {
      const link = document.createElement("a");
      link.href = assignment.html_url;   // <-- Canvas assignment URL
      link.textContent = `${assignment.name} (Course: ${assignment.course_id})`;
      link.target = "_blank";             // Open in new tab
      link.rel = "noopener noreferrer";  // Security best practice

      const div = document.createElement("div");
      div.appendChild(link);
      eventsEl.appendChild(div);

    });
  }
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

// Load data and build calendar initially
fetchAllAssignments().then(assignments => {
  assignmentsCache = assignments;
  buildCalendar(assignmentsCache, currentYear, currentMonth);
});
