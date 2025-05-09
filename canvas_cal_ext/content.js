if (window.location.href.includes("calendar"))
{

    console.log("Hello from the Canvas Calendar Organizer!");
      
    window.addEventListener('load', () => {
        const events = document.querySelectorAll('.calendar-event'); // Select all event elements
        events.forEach(event => {
            console.log({
                title: event.querySelector('.calendar-event-title')?.innerText,
                date: event.querySelector('.calendar-event-date')?.innerText,
                time: event.querySelector('.calendar-event-time')?.innerText,
            });
        });
    });
      
      

    function createButton(){
        const button = document.createElement("button");
        button.innerText = "Organize Calendar";

        button.style.position = "fixed";
        button.style.top = "10px";
        button.style.right = "10px";
        button.style.zIndex = "9999";
        button.style.padding = "10px 15px";
        button.style.backgroundColor = "#008CBA";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";

        button.addEventListener("click", () => {
        alert("Button clicked! Now let\'s organize the calendar!");

        });

        document.body.appendChild(button);
    }
    
    
}