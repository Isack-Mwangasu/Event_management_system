// Sample Data with High-Quality Placeholders
const events = [
    {
        title: "Introduction to AI & Robotics",
        time: "Tomorrow, 10:00 AM",
        location: "Computer Lab 4",
        dateDisplay: "NOV 21",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "SPU Cultural Night 2026",
        time: "Sat, Nov 25 • 6:00 PM",
        location: "Main Auditorium",
        dateDisplay: "NOV 25",
        image: "https://images.unsplash.com/photo-1514525253440-b393452e3726?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Varsity Football Finals",
        time: "Sun, Dec 02 • 2:00 PM",
        location: "University Sports Grounds",
        dateDisplay: "DEC 02",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Christian Union Worship",
        time: "Wed, Dec 05 • 7:00 PM",
        location: "Student Chapel",
        dateDisplay: "DEC 05",
        image: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

const grid = document.getElementById('event-grid');

function renderEvents() {
    grid.innerHTML = "";
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = "card";
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                <span class="card-date-badge">${event.dateDisplay}</span>
                <img src="${event.image}" alt="${event.title}" class="card-img">
            </div>
            <div class="card-content">
                <p class="card-time">${event.time}</p>
                <h3>${event.title}</h3>
                <p class="card-location">
                    <i class="fa-solid fa-location-dot"></i> ${event.location}
                </p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Run on load
renderEvents();