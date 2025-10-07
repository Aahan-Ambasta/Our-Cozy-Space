/* ========= CONFIG ========= */
const firebaseConfig = {
  apiKey: "AIzaSyBo1Lxlf54CLfg2hG59xUUK54M_d3vHBPk",
  authDomain: "gift1-93491.firebaseapp.com",
  projectId: "gift1-93491",
  storageBucket: "gift1-93491.firebasestorage.app",
  messagingSenderId: "1087986659383",
  appId: "1:1087986659383:web:4bcca98ced809b9bae8fb2",
  measurementId: "G-Q5H05RBCCG"
};

// Only allow you two
const allowedEmails = [
  "aahan.ambasta2@gmail.com",      // Aahan
  "rithikarani930@gmail.com"       // Rithika
];

// OpenWeather key
const OPENWEATHER_API_KEY = "f0b190a68378a9823d9c777cde012db5";

// Your cities and timezones
const mine = { name: "Lucknow, India", lat: 26.8467, lon: 80.9462, tz: "Asia/Kolkata" };
const hers = { name: "Bengaluru, India", lat: 13.1253951, lon: 77.6250540, tz: "Asia/Kolkata" };

/* ========= Firebase init ========= */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ========= Elements ========= */
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmailEl = document.getElementById("userEmail");
const appEl = document.getElementById("app");

/* ========= Auth ========= */
loginBtn.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const email = result.user.email;
    if (!allowedEmails.includes(email)) {
      alert("This private space is just for us.");
      await auth.signOut();
    }
  } catch (e) {
    alert("Sign-in failed. Please try again.");
    console.error(e);
  }
});

logoutBtn.addEventListener("click", async () => { await auth.signOut(); });

auth.onAuthStateChanged((user) => {
  if (user && allowedEmails.includes(user.email)) {
    userEmailEl.textContent = user.email;
    appEl.classList.remove("hidden");
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    initDashboard(user.email);
  } else {
    userEmailEl.textContent = "";
    appEl.classList.add("hidden");
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

/* ========= Dashboard ========= */
async function initDashboard(email) {
  renderClocks(); setInterval(renderClocks, 1000);
  fetchWeather(mine, "Mine"); fetchWeather(hers, "Her");
  renderMoonPhase(); setInterval(renderMoonPhase, 6 * 60 * 60 * 1000);
  renderCountdown(); setInterval(renderCountdown, 60 * 1000);
  initMap();
  loadNotes(); bindNotes();
  bindCatEaster();
  spawnSparkles();
  spawnEmojis();
  showQuote();
  updateStreak();
  customGreeting(email);
  bindNightToggle();
  bindSecret();
  bindTrails();
}

/* ========= Clocks ========= */
function formatTime(zone) { return new Date().toLocaleTimeString("en-IN",{timeZone:zone,hour:"2-digit",minute:"2-digit"}); }
function formatDate(zone) { return new Date().toLocaleDateString("en-IN",{timeZone:zone,weekday:"short",year:"numeric",month:"short",day:"numeric"}); }
function renderClocks() {
  document.getElementById("timeMine").textContent = formatTime(mine.tz);
  document.getElementById("dateMine").textContent = formatDate(mine.tz);
  document.getElementById("timeHer").textContent = formatTime(hers.tz);
  document.getElementById("dateHer").textContent = formatDate(hers.tz);
}

/* ========= Weather ========= */
async function fetchWeather(loc, keyPrefix) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url); const data = await res.json();
    document.getElementById(`temp${keyPrefix}`).textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById(`desc${keyPrefix}`).textContent = data.weather[0].description;
  } catch (e) {
    document.getElementById(`temp${keyPrefix}`).textContent = "--°";
    document.getElementById(`desc${keyPrefix}`).textContent = "Weather unavailable";
  }
}

/* ========= Moon phase ========= */
function moonPhaseInfo(date=new Date()){const lp=2551443;const now=date.getTime()/1000;const newMoon=Date.UTC(1970,0,7,20,35,0)/1000;const phase=(now-newMoon)%lp;const phasePercent=Math.round((phase/lp)*100);let label="New Moon";if(phasePercent<7)label="New Moon";else if(phasePercent<25)label="Waxing Crescent";else if(phasePercent<32)label="First Quarter";else if(phasePercent<50)label="Waxing Gibbous";else if(phasePercent<57)label="Full Moon";else if(phasePercent<75)label="Waning Gibbous";else if(phasePercent<82)label="Last Quarter";else label="Waning Crescent";return{label,percent:phasePercent};}
function renderMoonPhase(){const info=moonPhaseInfo();document.getElementById("moonText").textContent=`Current moon phase: ${info.label} (${info.percent}%)`;}

/* ========= Anniversary countdown ========= */
function nextAnniversary(){const now=new Date();const isAfter=now.getMonth()>8||(now.getMonth()===8&&now.getDate()>=23);const year=isAfter?now.getFullYear()+1:now.getFullYear();return new Date(year,8,23,0,0,0);}
function renderCountdown(){const target=nextAnniversary();const now=new Date();const diff=target-now;const days=Math.floor(diff/(1000*60*60*24));const hours=Math.floor((diff%(1000*60*60*24))/(1000*60*60));const mins=Math.floor((diff%(1000*60*60))/(1000*60));document.getElementById("countdown").innerHTML=`<span class="pill">Days: ${days}</span><span class="pill">Hours: ${hours}</span><span class="pill">Minutes: ${mins}</span>`;}

/* ========= Map ========= */
let map;
function initMap(){map=L.map('map').setView([(mine.lat+hers.lat)/2,(mine.lon+hers.lon)/2],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap'}).addTo(map);L.marker([mine.lat,mine.lon]).addTo(map).bindPopup(mine.name);L.marker([hers.lat,hers.lon]).addTo(map).bindPopup(hers.name);const line=L.polyline([[mine.lat,mine.lon],[hers.lat,hers.lon]],{color:'#777aa8',weight:4,opacity:0.8}).addTo(map);map.fitBounds(line.getBounds(),{padding:[30,30]});const dkm=haversine(mine.lat,mine.lon,hers.lat,hers.lon);document.getElementById("distance").textContent=`Distance between us: ${dkm.toFixed(1)} km — close in heart, always.`;}
function haversine(lat1,lon1,lat2,lon2){const R=6371;const toRad=v=>v*Math.PI/180;const dLat=toRad(lat2-lat1);const dLon=toRad(lon2-lon1);const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return R*c;}

/* ========= Notes ========= */
const notesEl=document.getElementById("notes");const noteInput=document.getElementById("noteInput");const saveNoteBtn=document.getElementById("saveNoteBtn");
function bindNotes(){saveNoteBtn.addEventListener("click",async()=>{const user=auth.currentUser;if(!user)return alert("Please sign in.");const text=noteInput.value.trim();if(!text)return alert("Write something first.");try{const todayKey=new Date().toISOString().slice(0,10);await      db.collection("love-notes").add({
        dateKey: todayKey,
        text,
        author: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      noteInput.value = "";
      loadNotes();
      updateStreak();

      // 🌸 Add blooming lily animation
      const lily = document.createElement("div");
      lily.className = "lily-anim";
      document.querySelector(".lily-bar").appendChild(lily);

    } catch (e) {
      alert("Could not save note. Try again.");
      console.error(e);
    }
  });
}

async function loadNotes() {
  try {
    notesEl.innerHTML = "";
    const snap = await db.collection("love-notes").orderBy("createdAt", "desc").limit(100).get();
    const frags = [];
    snap.forEach(doc => {
      const n = doc.data();
      frags.push(`
        <div class="note-item">
          <div>${escapeHTML(n.text || "")}</div>
          <div class="note-meta">${n.author || "Unknown"} • ${n.dateKey || ""}</div>
        </div>
      `);
    });
    notesEl.innerHTML = frags.join("");
    updateStreak();
  } catch (e) {
    notesEl.innerHTML = `<div class="muted">Notes unavailable.</div>`;
    console.error(e);
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

/* ========= Cat easter egg ========= */
function bindCatEaster() {
  const cat = document.getElementById("catEaster");
  cat.style.position = "absolute";
  cat.style.bottom = "10px";
  cat.style.left = "-50px";
  cat.style.fontSize = "28px";
  cat.style.animation = "walk 20s linear infinite";

  cat.addEventListener("click", () => {
    const lines = [
      "You’re my favorite person 🐾",
      "If love had nine lives, I’d spend all of them with you.",
      "Purr-haps we’re meant to be. 💜",
      "Under the same moon, always."
    ];
    alert(lines[Math.floor(Math.random()*lines.length)]);
  });
}

/* ========= Sparkles ========= */
function spawnSparkles() {
  setInterval(() => {
    const sparkle = document.createElement("div");
    sparkle.textContent = "✨";
    sparkle.style.position = "absolute";
    sparkle.style.left = Math.random() * window.innerWidth + "px";
    sparkle.style.top = Math.random() * window.innerHeight + "px";
    sparkle.style.fontSize = "18px";
    sparkle.style.opacity = "0";
    sparkle.style.transition = "all 3s ease-out";
    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.style.opacity = "1";
      sparkle.style.top = (parseInt(sparkle.style.top) - 50) + "px";
    }, 50);

    setTimeout(() => sparkle.remove(), 3000);
  }, 2000);
}

/* ========= Floating Emojis ========= */
function spawnEmojis() {
  const container = document.getElementById("emojiContainer");
  const emojis = ["💖","😘","💏","💕","💞","💓","Mwahhhhh 😘","🌸","🌺","🌷"];
  setInterval(() => {
    const span = document.createElement("span");
    span.className = "emoji";
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.animationDuration = (6 + Math.random() * 4) + "s";
    container.appendChild(span);
    setTimeout(() => span.remove(), 10000);
  }, 1200);
}

/* ========= Streak Counter ========= */
async function updateStreak() {
  try {
    const snap = await db.collection("love-notes").orderBy("dateKey").get();
    const dates = [...new Set(snap.docs.map(d => d.data().dateKey))];
    let streak = 0;
    let today = new Date();
    while (dates.includes(today.toISOString().slice(0,10))) {
      streak++;
      today.setDate(today.getDate()-1);
    }
    const el = document.getElementById("streak");
    if (el) el.textContent = `We’ve written notes for ${streak} days in a row 💕`;
  } catch (e) { console.error(e); }
}

/* ========= Quote of the Day ========= */
function showQuote() {
  const quotes = [
    "Love you to the moon 🌙 and back.",
    "Our inside joke: *Mwahhhhhh* 😘",
    "Every day with you is my favorite day 💖",
    "Cats + lilies + us = perfect."
  ];
  const q = quotes[new Date().getDate() % quotes.length];
  const el = document.getElementById("quote");
  if (el) el.textContent = q;
}

/* ========= Custom Greeting ========= */
function customGreeting(email) {
  const el = document.getElementById("greeting");
  if (!el) return;
  if (email === "aahan.ambasta2@gmail.com") {
    el.textContent = "Welcome back, my sun ☀️";
  } else {
    el.textContent = "Welcome back, my moon 🌙";
  }
}

/* ========= Night Mode Toggle ========= */
function bindNightToggle() {
  const btn = document.getElementById("toggleNight");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.body.classList.toggle("night");
  });
}

/* ========= Secret Section ========= */
function bindSecret() {
  const btn = document.getElementById("secretBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.getElementById("secret").classList.toggle("hidden");
  });
}

/* ========= Emoji Trails ========= */
function bindTrails() {
  document.addEventListener("mousemove", e => {
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.textContent = ["💖","✨","💕"][Math.floor(Math.random()*3)];
    trail.style.left = e.pageX + "px";
    trail.style.top = e.pageY + "px";
    document.body.appendChild(trail);
    setTimeout(()=>trail.remove(),1000);
  });
}
