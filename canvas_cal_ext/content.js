const eventTitles = document.querySelectorAll('.agenda-event__title');

eventTitles.forEach(titleElement => {
    const timeElement = titleElement.closest('.agenda-event').querySelector('.agenda-event__time');

    console.log({
        title: titleElement.innerText.trim(),
        time: timeElement ? timeElement.innerText.trim() : 'No time listed',
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
    
    
