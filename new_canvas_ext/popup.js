const accessToken = "10706~KJPGAm3H6AtTuUZFCu7xaJuADHKn4NfTMfCaktfvtxWtxaPCMXJFawQDN97a6ExC";
const baseUrl = "https://byui.instructure.com/api/v1/";

// Get your list of courses
async function fetchCourses() {
  const response = await fetch(`${baseUrl}courses?per_page=100`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  console.log("Courses:", data);
  return data;
}

// For each course, fetch its assignments
async function fetchAssignments(courseId) {
  const response = await fetch(`${baseUrl}courses/${courseId}/assignments?per_page=100`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  return data;
}

// Gather all assignments from all courses
async function fetchAllAssignments() {
  const courses = await fetchCourses();

  const assignmentPromises = courses.map(course => fetchAssignments(course.id));

  const allAssignmentsArrays = await Promise.all(assignmentPromises);

  // Flatten all arrays into a single array
  const allAssignments = allAssignmentsArrays.flat();

  console.log("All Assignments:", allAssignments);
  return allAssignments;
}


// Build calendar based on assignment due dates
function buildCalendar(assignments) {
  const calendarEl = document.getElementById("calendar");
  const eventsByDate = {};

  assignments.forEach(assignment => {
    if (assignment.due_at) {
      const date = assignment.due_at.slice(0, 10);
      if (!eventsByDate[date]) eventsByDate[date] = [];
      eventsByDate[date].push(assignment);
    }
  });

  const daysInMonth = 31;
  const monthStr = "2025-06"; // hardcoded for now

  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${monthStr}-${String(i).padStart(2, "0")}`;
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.textContent = eventsByDate[dayStr] ? eventsByDate[dayStr].length : "";
    dayDiv.dataset.date = dayStr;

    dayDiv.addEventListener("click", () => showEvents(eventsByDate[dayStr] || [], dayStr));
    calendarEl.appendChild(dayDiv);
  }
}

// Show event list when clicking a calendar day
function showEvents(assignments, date) {
  const eventsEl = document.getElementById("events");
  eventsEl.innerHTML = `<h3>Assignments for ${date}</h3>`;

  if (assignments.length === 0) {
    eventsEl.innerHTML += "<p>No assignments.</p>";
  } else {
    assignments.forEach(assignment => {
      const div = document.createElement("div");
      div.textContent = `${assignment.name} (${assignment.course_id})`;
      eventsEl.appendChild(div);
    });
  }
}

// Fetch assignments and build the calendar
fetchAllAssignments().then(assignments => buildCalendar(assignments));
