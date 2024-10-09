function parseICS(icsContent) {
    const events = [];
    const lines = icsContent.split('\n');
    let currentEvent = null;

    function unescapeICSValue(value) {
        return value
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\[nN]/g, '\n')
            .replace(/\\\\/g, '\\');
    }

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            }
        } else if (currentEvent) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                currentEvent[key.trim()] = unescapeICSValue(value);
            }
        }
    }

    return events;
}

function createEventCard(event) {
    const card = document.createElement('div');
    const now = new Date();
    const startDate = new Date(event.DTSTART.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
    const endDate = new Date(event.DTEND.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
  
    const isPastEvent = endDate < now;
  
    card.className = `bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300 mb-4 ${
      isPastEvent ? 'opacity-50' : 'border-l-4 border-blue-500'
    }`;

    const title = document.createElement('h2');
    title.className = 'text-lg font-semibold text-gray-800';
    title.textContent = event.SUMMARY || 'Untitled Event';
    card.appendChild(title);
  
    const dateInfo = document.createElement('p');
    dateInfo.className = 'text-sm text-gray-600 mt-1';
    dateInfo.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    card.appendChild(dateInfo);
  
    const timeInfo = document.createElement('p');
    timeInfo.className = 'text-sm text-gray-600';
    timeInfo.textContent = `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
    card.appendChild(timeInfo);
  
    // Add event summary
    if (event.SUMMARY) {
      const summary = document.createElement('p');
      summary.className = 'text-sm text-gray-700 mt-2';
      summary.textContent = event.SUMMARY;
      card.appendChild(summary);
    }

    return card;
}

function injectStyles() {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

function displayEvents(events) {
    const container = document.createElement('div');
    container.className = 'max-w-2xl mx-auto p-4';
  
    const heading = document.createElement('h1');
    heading.className = 'text-2xl font-bold mb-6 text-gray-800';
    heading.textContent = 'Event Agenda';
    container.appendChild(heading);
  
    // Sort events by start date
    events.sort((a, b) => {
      const dateA = new Date(a.DTSTART.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
      const dateB = new Date(b.DTSTART.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
      return dateA - dateB;
    });

    events.forEach(event => {
      container.appendChild(createEventCard(event));
    });
  
    document.body.innerHTML = '';
    document.body.appendChild(container);
}

function init() {
    const preElements = document.getElementsByTagName('pre');
    for (const pre of preElements) {
        if (pre.textContent.includes('BEGIN:VCALENDAR') && pre.textContent.includes('END:VCALENDAR')) {
            const events = parseICS(pre.textContent);
            injectStyles();
            displayEvents(events);
            break;
        }
    }
}

init();