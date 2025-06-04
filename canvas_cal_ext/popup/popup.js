const container = document.getElementById("eventsContainer");

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => {
        const data = [];
        const agendaDays = document.querySelectorAll(".agenda-day");

        agendaDays.forEach(day => {
          const date = day.querySelector('.agenda-date span[aria-hidden="true"]')?.innerText.trim() || "No date listed";

          // Next sibling should be the event container
          const eventContainer = day.nextElementSibling;
          if (eventContainer && eventContainer.classList.contains("agenda-event__container")) {
            const events = eventContainer.querySelectorAll(".agenda-event__item");

            events.forEach(eventEl => {
              const title = eventEl.querySelector('.agenda-event__title')?.innerText.trim() || "No title found";
              const time = eventEl.querySelector('.agenda-event__time')?.innerText.trim() || "No time listed";
              const status = eventEl.querySelector('.screenreader-only')?.innerText.trim() || "No status listed";

              data.push({
                date,
                title,
                time,
                status
              });
            });
          }
        });

        return data;
      }
    },
    (injectionResults) => {
      const events = injectionResults[0].result;

      if (!events.length) {
        container.innerText = "No events found.";
        return;
      }

      // Group events by date
      const groupedEvents = {};

      events.forEach(event => {
        if (!groupedEvents[event.date]) {
          groupedEvents[event.date] = [];
        }
        groupedEvents[event.date].push(event);
      });

      // Sort and display
      const sortedDates = Object.keys(groupedEvents);

      sortedDates.forEach(date => {
        const dateHeader = document.createElement("h3");
        dateHeader.className = "event-date";
        dateHeader.innerText = date;
        container.appendChild(dateHeader);

        groupedEvents[date].forEach(event => {
          const div = document.createElement("div");
          div.className = "event";
          div.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">${event.time}</div>
            <div class="event-status">${event.status}</div>
          `;
          container.appendChild(div);
        });
      });
    }
  );
});
