let chart = null;

function formatLaptime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds % 1) * 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

function showLoading() {
    document.getElementById("loading").classList.add("active");
    document.getElementById("loadBtn").disabled = true;
    document.getElementById("errorMessage").classList.remove("active");
    document.getElementById("chartCard").classList.remove("active");
}

function hideLoading() {
    document.getElementById("loading").classList.remove("active");
    document.getElementById("loadBtn").disabled = false;
}

function showError(message) {
    const errorEl = document.getElementById("errorMessage");
    errorEl.textContent = message;
    errorEl.classList.add("active");
    document.getElementById("chartCard").classList.remove("active");
}

function hideError() {
    document.getElementById("errorMessage").classList.remove("active");
}

function calculateStats(times) {
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    
    return {
        fastest: sorted[0],
        slowest: sorted[sorted.length - 1],
        average: sum / times.length,
        median: sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]
    };
}

function displayStats(stats) {
    const statsSection = document.getElementById("statsSection");
    if (!stats) {
        statsSection.innerHTML = "";
        return;
    }

    statsSection.innerHTML = `
        <div class="stat-card">
            <h3>Fastest Lap</h3>
            <div class="value">${formatLaptime(stats.fastest)}</div>
        </div>
        <div class="stat-card">
            <h3>Slowest Lap</h3>
            <div class="value">${formatLaptime(stats.slowest)}</div>
        </div>
        <div class="stat-card">
            <h3>Average Lap</h3>
            <div class="value">${formatLaptime(stats.average)}</div>
        </div>
        <div class="stat-card">
            <h3>Median Lap</h3>
            <div class="value">${formatLaptime(stats.median)}</div>
        </div>
    `;
}


async function loadLaps() {
    const year = document.getElementById("year").value.trim();
    const race = document.getElementById("race").value.trim();
    const driver = document.getElementById("driver").value.trim().toUpperCase();

    // Validation
    if (!year || !race || !driver) {
        showError("Please fill in all fields (Year, Race, and Driver).");
        return;
    }

    if (driver.length !== 3) {
        showError("Driver code must be 3 characters (e.g., VER, HAM).");
        return;
    }

    showLoading();
    hideError();

    try {
        const response = await fetch(`http://127.0.0.1:8000/laps?year=${year}&race=${race}&driver=${driver}`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            showError("No lap data found for the specified parameters. Please check your inputs.");
            hideLoading();
            return;
        }

        const laps = data.map(d => d.lap);
        const times = data.map(d => d.lap_time_sec);

        // Destroy existing chart
        if (chart) {
            chart.destroy();
        }

        // Create new chart with improved styling
        chart = new Chart(document.getElementById("lapChart"), {
            type: "line",
            data: {
                labels: laps,
                datasets: [{
                    label: "Lap Time (seconds)",
                    data: times,
                    borderColor: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#667eea",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `Lap ${context.label}: ${formatLaptime(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Lap Number",
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: { top: 10, bottom: 10 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Lap Time (seconds)",
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: { top: 10, bottom: 10 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return formatLaptime(value);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        // Calculate and display statistics
        const stats = calculateStats(times);
        displayStats(stats);

        // Show chart card
        document.getElementById("chartCard").classList.add("active");
        hideLoading();

    } catch (error) {
        console.error("Error loading laps:", error);
        showError(`Failed to load data: ${error.message}. Make sure the backend server is running on http://127.0.0.1:8000`);
        hideLoading();
    }
}

// Allow Enter key to trigger load
document.addEventListener("DOMContentLoaded", function() {
    const inputs = ["year", "race", "driver"];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                loadLaps();
            }
        });
    });

    // Auto-uppercase driver input
    document.getElementById("driver").addEventListener("input", function(e) {
        e.target.value = e.target.value.toUpperCase();
    });
});
