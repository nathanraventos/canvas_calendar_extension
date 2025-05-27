const container = document.getElementById("eventsContainer");

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript(
        {
            target:{tabId: tabs[0].id},
            func: () => {
                const events = document.querySelectorAll('.agenda-event__item');
                const data = [];

                events.forEach(event => {
                    const title = event.querySelector('.agenda-event__title')?.innerText.trim();
                    const time = event.querySelector('.agenda-event__time')?.innerText.trim() || "No time listed";
                    const status = event.querySelector('.screenreader-only')?.innerText;

                    data.push({
                        title: title || "No title found",
                        time: time,
                        status:status || "No status listed"
                    });
                });
                return data;
            }
        },
        (injectionResults) => {

            const events = injectionResults[0].result;

            if(events.length === 0) {
                container.innerText = "No events found.";
                return;
            }
            

            events.forEach(event => {
                const div = document.createElement("div");
                div.className = "event";
                div.innerHTML = `
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${event.time}</div>
                    <div class="event-status">${event.status}</div>
                `;
                container.appendChild(div);
            });
        }
    );
});