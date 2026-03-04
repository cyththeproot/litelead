/**
* Litelead Search Engine Logic
* Features: Material You Tabs, Liquid Glass Animations, Fuse.js Search, Open-Meteo Weather
*/

let fuse;
const input = document.getElementById('search-input');
const container = document.getElementById('main-container');
const tabs = document.querySelectorAll('.tab-btn');
const resultsArea = document.getElementById('results-area');
const utilityArea = document.getElementById('utility-area');

// 1. Clock & Calendar Initialization
function updateTime() {
const now = new Date();
// Update main clock
document.getElementById('clock').innerText = now.toLocaleTimeString([], {
hour: '2-digit',
minute: '2-digit'
});
// Update Utility Calendar Card
document.getElementById('util-month').innerText = now.toLocaleString('default', { month: 'short' }).toUpperCase();
document.getElementById('util-day').innerText = now.getDate();
}
setInterval(updateTime, 1000);
updateTime();

// 2. Fetch Search Data (data.json)
fetch('data.json')
.then(res => res.json())
.then(data => {
// threshold: 0.3 allows for minor typos while staying relevant
fuse = new Fuse(data, {
keys: ['title', 'description'],
threshold: 0.3
});
console.log("Litelead: Search Index Loaded.");
})
.catch(err => {
console.error("Litelead Error: Ensure data.json exists in your root folder.", err);
});

// 3. Core Search Function
function performSearch() {
const rawValue = input.value;
const query = rawValue.trim(); // The FIX: Ignore leading/trailing spaces
const activeTab = document.querySelector('.tab-btn.active').dataset.target;

// Reset UI if input is empty or just whitespace
if (query.length === 0) {
resultsArea.innerHTML = '';
container.classList.remove('searching');
return;
}

// Trigger Material You "Searching" State
container.classList.add('searching');

if (!fuse) return; // Prevent errors if JSON hasn't loaded yet

let results = fuse.search(query);

// Tab Filtering Logic
if (activeTab !== 'all' && activeTab !== 'utility') {
results = results.filter(r => r.item.category === activeTab);
}

// Render Results with Bloom Animation
if (results.length > 0) {
resultsArea.innerHTML = results.map(r => `
<div class="result-item">
<a href="${r.item.url}" target="_blank">${r.item.title}</a>
<div style="font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">
${r.item.description}
</div>
</div>
`).join('');
} else {
resultsArea.innerHTML = `<div class="result-item" style="opacity:0.6;">No matches found in ${activeTab}...</div>`;
}
}

// 4. Event Listeners (Typing & Enter Key)
input.addEventListener('input', performSearch);

input.addEventListener('keydown', (e) => {
if (e.key === 'Enter') {
const firstLink = resultsArea.querySelector('a');
if (firstLink) {
// "I'm Feeling Lucky" style - opens the top result
window.open(firstLink.href, '_blank');
}
}
});

// 5. Tab Navigation Logic
tabs.forEach(tab => {
tab.addEventListener('click', () => {
// Update UI state for Liquid Glass effect
tabs.forEach(t => t.classList.remove('active'));
tab.classList.add('active');

if(tab.dataset.target === 'utility') {
resultsArea.classList.add('hidden');
utilityArea.classList.remove('hidden');
fetchWeather(); // Only fetch weather when needed
} else {
resultsArea.classList.remove('hidden');
utilityArea.classList.add('hidden');
performSearch(); // Re-run search based on new category
}
});
});

// 6. Weather API (Open-Meteo)
async function fetchWeather() {
const tempDisplay = document.getElementById('temp');
const iconDisplay = document.getElementById('weather-icon');

if ("geolocation" in navigator) {
navigator.geolocation.getCurrentPosition(async (pos) => {
const { latitude, longitude } = pos.coords;
try {
const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
const data = await res.json();

const temp = Math.round(data.current_weather.temperature);
const code = data.current_weather.weathercode;

tempDisplay.innerText = `${temp}°C`;
// Weather codes: 0 = Clear, 1-3 = Partly Cloudy, >3 = Overcast/Rain
iconDisplay.innerText = code === 0 ? "☀️" : (code < 4 ? "🌤️" : "☁️");
} catch(e) {
tempDisplay.innerText = "Offline";
}
}, () => {
tempDisplay.innerText = "Locked"; // If user denies location
iconDisplay.innerText = "📍";
});
} else {
tempDisplay.innerText = "N/A";
}
}