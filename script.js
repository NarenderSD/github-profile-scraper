const API_URL = "https://api.github.com/users/";
let repos = [];
const chartElement = document.getElementById('language-chart').getContext('2d');
let languageChart = null;

document.getElementById('search-btn').addEventListener('click', () => {
    const username = document.getElementById('search').value;
    if (username) {
        fetchGitHubProfile(username);
        fetchGitHubRepos(username);
    }
});

function fetchGitHubProfile(username) {
    document.getElementById('profile-container').innerHTML = "<p>Loading...</p>";
    fetch(`${API_URL}${username}`)
        .then(response => response.json())
        .then(data => displayProfile(data))
        .catch(error => console.error('Error fetching profile:', error));
}

function displayProfile(data) {
    const profileContainer = document.getElementById('profile-container');
    profileContainer.innerHTML = `
        <img src="${data.avatar_url}" alt="Profile Picture" width="150">
        <h2>${data.name || "N/A"}</h2>
        <p><strong>Location:</strong> ${data.location || "N/A"}</p>
        <p><strong>Followers:</strong> ${data.followers}</p>
        <p><strong>Following:</strong> ${data.following}</p>
        <p><strong>Email:</strong> ${data.email || "N/A"}</p>
        <p><strong>Company:</strong> ${data.company || "N/A"}</p>
        <p><strong>Twitter:</strong> ${data.twitter_username || "N/A"}</p>
        <p><strong>Public Repos:</strong> ${data.public_repos}</p>
        <p><strong>Account Created On:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
        <p><strong>Bio:</strong> ${data.bio || "N/A"}</p>
        <p><strong>GitHub ID:</strong> ${data.id}</p>
        <hr>
    `;
}

function fetchGitHubRepos(username) {
    fetch(`${API_URL}${username}/repos?per_page=100`)
        .then(response => response.json())
        .then(data => {
            repos = data;
            displayRepos(repos);
            analyzeLanguages(repos);
        })
        .catch(error => console.error('Error fetching repositories:', error));
}

function displayRepos(repos) {
    const repoContainer = document.getElementById('repo-list');
    repoContainer.innerHTML = '';
    repos.forEach(repo => {
        repoContainer.innerHTML += `
            <div class="repo-item">
                <h3>${repo.name}</h3>
                <p><strong>Stars:</strong> ${repo.stargazers_count}</p>
                <p><strong>Forks:</strong> ${repo.forks_count}</p>
                <p><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank">Live Link</a>` : ''}
                <a href="${repo.html_url}" target="_blank">View on GitHub</a>
            </div>
        `;
    });
}

document.getElementById('sort-repos').addEventListener('change', (event) => {
    const sortBy = event.target.value;
    let sortedRepos = [...repos];
    
    if (sortBy === 'stars') {
        sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sortBy === 'forks') {
        sortedRepos.sort((a, b) => b.forks_count - a.forks_count);
    } else if (sortBy === 'updated') {
        sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    displayRepos(sortedRepos);
});

function analyzeLanguages(repos) {
    const languageCounts = {};
    repos.forEach(repo => {
        const language = repo.language;
        if (language) {
            languageCounts[language] = (languageCounts[language] || 0) + 1;
        }
    });

    const languages = Object.keys(languageCounts);
    const languageData = Object.values(languageCounts);

    // Check if any languages were found
    if (languages.length === 0) {
        document.getElementById('language-analysis').innerHTML = "<p>No language data available.</p>";
        return;
    }

    if (languageChart) {
        languageChart.destroy();
    }

    languageChart = new Chart(chartElement, {
        type: 'pie',
        data: {
            labels: languages,
            datasets: [{
                label: 'Languages',
                data: languageData,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        }
    });
}

// Theme Toggle with Icon Change
const themeToggleButton = document.getElementById('theme-toggle');
themeToggleButton.addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        themeToggleButton.textContent = '☀️';
    } else {
        themeToggleButton.textContent = '🌙';
    }
});
