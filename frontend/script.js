
        let rawData = [];
        let currentSubject = 'overall';
        const API = "https://aspirants-score-leaderboard.vercel.app";
        async function loadData() {
            const res = await fetch(`${API}/api/leaderboard`);
            rawData = await res.json();
            
            // Populate Date Selector
            const allDates = [...new Set(rawData.flatMap(p => p.sessions.map(s => s.date)))];
            const selector = document.getElementById('date-selector');
            allDates.forEach(date => {
                const opt = document.createElement('option');
                opt.value = date;
                opt.innerText = date;
                selector.appendChild(opt);
            });

            render();
        }

        function changeSubject(sub) {
            currentSubject = sub;
            document.getElementById('date-selector').value = 'overall'; // Reset to overall when switching subjects
            render();
        }

        function updateView() { render(); }

        function render() {
    const dateVal = document.getElementById('date-selector').value;
    const body = document.getElementById('leaderboard-body');
    const scoreHeader = document.getElementById('score-header');
    const viewLabel = document.getElementById('view-label');
    
    let displayData = [];

    if (dateVal === 'overall') {
        if (currentSubject === 'overall') {
            viewLabel.innerText = "Championship Points (Total 1st Place Wins)";
            scoreHeader.innerText = "Total Wins";
            
            const winMap = {};
            rawData.forEach(p => winMap[p.name] = 0);
            
            const dates = [...new Set(rawData.flatMap(p => p.sessions.map(s => s.date)))];
            dates.forEach(d => {
                let topScore = 0; // Start at 0 so only scores > 0 can win
                let winner = "";
                rawData.forEach(p => {
                    const s = p.sessions.find(x => x.date === d);
                    if(s) {
                        const total = (s.sql||0) + (s.coding||0) + (s.dsa||0);
                        if(total > topScore) { 
                            topScore = total; 
                            winner = p.name; 
                        }
                    }
                });
                if(winner) winMap[winner]++;
            });
            displayData = rawData.map(p => ({ name: p.name, val: winMap[p.name], suffix: " Wins" }));
        } else {
            viewLabel.innerText = `Highest Score Ever in ${currentSubject.toUpperCase()}`;
            scoreHeader.innerText = "Record Score";
            displayData = rawData.map(p => ({ 
                name: p.name, 
                val: Math.max(...p.sessions.map(s => s[currentSubject] || 0)),
                suffix: ""
            }));
        }
    } else {
        viewLabel.innerText = `Performance on ${dateVal}`;
        scoreHeader.innerText = currentSubject === 'overall' ? "Daily Total" : `${currentSubject.toUpperCase()} Score`;
        
        displayData = rawData.map(p => {
            const session = p.sessions.find(s => s.date === dateVal);
            let val = 0;
            if (session) {
                val = (currentSubject === 'overall') 
                    ? (session.sql||0) + (session.coding||0) + (session.dsa||0) 
                    : session[currentSubject] || 0;
            }
            return { name: p.name, val: val, suffix: "" };
        });
    }

    // Sort and Render
    displayData.sort((a, b) => parseFloat(b.val) - parseFloat(a.val));
    
    body.innerHTML = displayData.map((p, i) => {
        // Add Trophy to the top person ONLY if they have more than 0 wins/points
        const showTrophy = (i === 0 && parseFloat(p.val) > 0) ? " 🏆" : "";
        
        return `
            <tr class="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                <td class="p-6">${getRankBadge(i)}</td>
                <td class="p-6 font-bold text-blue-400 cursor-pointer hover:underline"
                                onclick="openPlayer('${p.name}')">
                        ${p.name}${showTrophy}
                </td>

                <td class="p-6 text-right font-mono text-xl text-blue-400">${p.val}${p.suffix || ''}</td>
            </tr>
        `;
    }).join('');
}

        function getRankBadge(i) {
            if(i === 0) return `<span class="gold px-3 py-1 rounded-full text-[10px] font-black">1st</span>`;
            if(i === 1) return `<span class="silver px-3 py-1 rounded-full text-[10px] font-black">2nd</span>`;
            if(i === 2) return `<span class="bronze px-3 py-1 rounded-full text-[10px] font-black">3rd</span>`;
            return `<span class="text-slate-600 font-bold ml-3">${i+1}</span>`;
        }

        function renderAdminControls() {
  const container = document.getElementById("admin-controls");
  const token = localStorage.getItem("token");

  if (!container) return;

  if (token) {
    container.innerHTML = `
      <a href="admin.html"
         class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold">
        Admin Dashboard
      </a>
      <button onclick="logout()"
        class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
        Logout
      </button>
    `;
  } else {
    container.innerHTML = `
      <a href="admin.html"
         class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold">
        Admin Login
      </a>
    `;
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  location.reload();
}

function openPlayer(name) {
  window.location.href = `player.html?name=${encodeURIComponent(name)}`;
}


        loadData();
        renderAdminControls();
