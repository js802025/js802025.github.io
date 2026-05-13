

// ================= GITHUB CONTRIBUTION GRAPH =================
async function loadContributionGraph() {
  const container = document.getElementById("contribution-graph");
  if (!container) return;

  try {
    const response = await fetch("https://github-contributions-api.jogruber.de/v4/js802025");
    const data = await response.json();
    console.log("GitHub data:", data);
    var sorted = data.contributions.sort((a, b) => new Date(a.date) - new Date(b.date));

    var endIndex = 0;
    while (endIndex < data.contributions.length && new Date(data.contributions[endIndex].date) < new Date()) {
      endIndex++;
    }
    const contributions = data.contributions.slice(endIndex - 371, endIndex);
    console.log("Contributions count:", contributions.length, endIndex);

    const weeks = [];
    for (let i = 0; i < contributions.length; i += 7) {
      weeks.push(contributions.slice(i, i + 7));
    }

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      for (let week = 0; week < weeks.length; week++) {
        const day = weeks[week][dayOfWeek];
        const cell = document.createElement("div");
        cell.className = `contrib-cell contrib-level-${day ? day.level : 0}`;
        if (day) {
          cell.title = `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`;
        }
        container.appendChild(cell);
      }
    }
  } catch (error) {
    console.error("Failed to load contribution graph:", error);
    // Fallback: generate random pattern
    for (let i = 0; i < 371; i++) {
      const cell = document.createElement("div");
      const level = Math.floor(Math.random() * 5);
      cell.className = `contrib-cell contrib-level-${level}`;
      container.appendChild(cell);
    }
  }
}

async function getLiveActivity() {
  try {
    const response = await fetch("https://api.github.com/gists/87faa18d1808b0282fd22c7d7f54ff02", {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2026-03-10"
      }
    });
    const gist = await response.json();
    const currentActivity = JSON.parse(gist.files["activities.json"].content).activities.at(-1);
    const activityElement = document.getElementById("live-activity");
    const statusImg = document.getElementById("status-img");
    const statusText = document.getElementById("status-text");
    const statusTime = document.getElementById("status-time");
    console.log("Current activity:", currentActivity);
    if (currentActivity) {
      statusImg.src = currentActivity.imageURL;
      statusText.textContent = currentActivity.status;
      const timeAgo = new Date(currentActivity.date);
      const now = new Date();
      const diffMinutes = Math.floor((now - timeAgo) / 60000);
      if (diffMinutes < 60) {
        statusTime.textContent = `${diffMinutes} minutes ago`;
      } else if (diffMinutes < 1440) {
        statusTime.textContent = `${Math.floor(diffMinutes / 60)} hours ago`;
      } else if (diffMinutes < 10080) {
        statusTime.textContent = `${Math.floor(diffMinutes / 1440)} days ago`;
      } else {
        activityElement.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Failed to get live activity:", error);
  }
}


loadContributionGraph();
getLiveActivity();