const checkEvents = setInterval(() => {
    const events = document.querySelectorAll('.agenda-event__item');
    if (events.length > 0) {
        console.log(`${events.length} events found.`);
        clearInterval(checkEvents);

        events.forEach(event => {
            const title = event.querySelector('.agenda-event__title')?.innerText.trim();
            const time = event.querySelector('.agenda-event__time')?.innerText.trim() || 'No time listed';
            const status = event.querySelector('.screenreader-only')?.innerText;

            console.log({
                title: title || "No title found",
                time: time || "No time listed",
                status: status || "No status listed",
            });
        });

        createButton(); // Create the button after events are found
    }
}, 1000);
