document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initializeCharts();
    
    // Load initial data
    loadReportData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up auto-refresh (every 5 minutes)
    setInterval(loadReportData, 5 * 60 * 1000);
});

// Initialize all charts
function initializeCharts() {
    // Issues Trend Chart
    const trendCtx = document.getElementById('issuesTrendChart').getContext('2d');
    window.issuesTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Arıza Sayısı',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    // Issues Distribution Chart
    const distributionCtx = document.getElementById('issuesDistributionChart').getContext('2d');
    window.issuesDistributionChart = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#F44336',
                    '#9C27B0',
                    '#00BCD4',
                    '#FF9800',
                    '#795548'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Load report data from localStorage or API
function loadReportData() {
    // In a real application, this would fetch data from an API
    // For now, we'll use localStorage data or generate mock data
    
    // Get issues from localStorage
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    // Update summary cards
    updateSummaryCards(issues);
    
    // Update charts
    updateCharts(issues);
    
    // Update tables
    updateTables(issues);
    
    // Show last update time
    updateLastRefreshTime();
}

// Update summary cards with real data
function updateSummaryCards(issues) {
    // Total issues
    const totalIssues = issues.length;
    document.querySelector('.stat-card:nth-child(1) .stat-info p').textContent = totalIssues;
    
    // Resolved issues
    const resolvedIssues = issues.filter(issue => issue.status === 'Çözüldü').length;
    document.querySelector('.stat-card:nth-child(2) .stat-info p').textContent = resolvedIssues;
    
    // Average resolution time (mock data for now)
    const avgResolutionTime = calculateAverageResolutionTime(issues);
    document.querySelector('.stat-card:nth-child(3) .stat-info p').textContent = avgResolutionTime;
    
    // Active devices (mock data for now)
    const activeDevices = 342; // This would come from a devices API
    document.querySelector('.stat-card:nth-child(4) .stat-info p').textContent = activeDevices;
}

// Calculate average resolution time
function calculateAverageResolutionTime(issues) {
    if (issues.length === 0) return '0 saat';
    
    const resolvedIssues = issues.filter(issue => issue.status === 'Çözüldü' && issue.resolutionTime);
    if (resolvedIssues.length === 0) return '0 saat';
    
    const totalTime = resolvedIssues.reduce((sum, issue) => sum + issue.resolutionTime, 0);
    const avgTime = totalTime / resolvedIssues.length;
    
    return `${avgTime.toFixed(1)} saat`;
}

// Update charts with real data
function updateCharts(issues) {
    // Update trend chart
    updateTrendChart(issues);
    
    // Update distribution chart
    updateDistributionChart(issues);
}

// Update trend chart
function updateTrendChart(issues) {
    // Group issues by date
    const issuesByDate = {};
    
    issues.forEach(issue => {
        const date = new Date(issue.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        if (!issuesByDate[date]) {
            issuesByDate[date] = 0;
        }
        issuesByDate[date]++;
    });
    
    // Sort dates
    const sortedDates = Object.keys(issuesByDate).sort((a, b) => {
        const dateA = new Date(a.split(' ').reverse().join(' '));
        const dateB = new Date(b.split(' ').reverse().join(' '));
        return dateA - dateB;
    });
    
    // Prepare data
    const labels = sortedDates;
    const data = sortedDates.map(date => issuesByDate[date]);
    
    // Update chart
    window.issuesTrendChart.data.labels = labels;
    window.issuesTrendChart.data.datasets[0].data = data;
    window.issuesTrendChart.update();
}

// Update distribution chart
function updateDistributionChart(issues) {
    // Group issues by location
    const issuesByLocation = {};
    
    issues.forEach(issue => {
        const location = issue.location || 'Bilinmiyor';
        if (!issuesByLocation[location]) {
            issuesByLocation[location] = 0;
        }
        issuesByLocation[location]++;
    });
    
    // Sort by count (descending)
    const sortedLocations = Object.keys(issuesByLocation).sort((a, b) => 
        issuesByLocation[b] - issuesByLocation[a]
    );
    
    // Prepare data
    const labels = sortedLocations;
    const data = sortedLocations.map(location => issuesByLocation[location]);
    
    // Update chart
    window.issuesDistributionChart.data.labels = labels;
    window.issuesDistributionChart.data.datasets[0].data = data;
    window.issuesDistributionChart.update();
}

// Update tables with real data
function updateTables(issues) {
    // Update "Most Reported Devices" table
    updateMostReportedDevicesTable(issues);
    
    // Update "Recent Issues" table
    updateRecentIssuesTable(issues);
}

// Update "Most Reported Devices" table
function updateMostReportedDevicesTable(issues) {
    // Group issues by device
    const issuesByDevice = {};
    
    issues.forEach(issue => {
        const device = issue.device || 'Bilinmiyor';
        if (!issuesByDevice[device]) {
            issuesByDevice[device] = {
                count: 0,
                location: issue.location || 'Bilinmiyor',
                status: issue.status || 'Beklemede'
            };
        } else {
            issuesByDevice[device].count++;
        }
    });
    
    // Sort by count (descending)
    const sortedDevices = Object.keys(issuesByDevice).sort((a, b) => 
        issuesByDevice[b].count - issuesByDevice[a].count
    );
    
    // Get table body
    const tableBody = document.querySelector('.table-card:nth-child(1) tbody');
    tableBody.innerHTML = '';
    
    // Add rows
    sortedDevices.slice(0, 10).forEach(device => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${device}</td>
            <td>${issuesByDevice[device].location}</td>
            <td>${issuesByDevice[device].count}</td>
            <td><span class="status-badge ${getStatusClass(issuesByDevice[device].status)}">${issuesByDevice[device].status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Update "Recent Issues" table
function updateRecentIssuesTable(issues) {
    // Sort issues by date (descending)
    const sortedIssues = [...issues].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Get table body
    const tableBody = document.querySelector('.table-card:nth-child(2) tbody');
    tableBody.innerHTML = '';
    
    // Add rows
    sortedIssues.slice(0, 10).forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(issue.date)}</td>
            <td>${issue.title}</td>
            <td>${issue.location || 'Bilinmiyor'}</td>
            <td><span class="status-badge ${getStatusClass(issue.status)}">${issue.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get CSS class for status badge
function getStatusClass(status) {
    switch(status) {
        case 'Çözüldü':
            return 'status-success';
        case 'Beklemede':
            return 'status-warning';
        case 'İşlemde':
            return 'status-info';
        case 'İptal Edildi':
            return 'status-danger';
        default:
            return 'status-warning';
    }
}

// Update last refresh time
function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    // Add a small indicator that data was refreshed
    const refreshBtn = document.querySelector('.refresh-data');
    refreshBtn.innerHTML = `<i class="fas fa-sync-alt"></i> Verileri Güncelle`;
    
    // Show a toast notification
    showToast(`Veriler ${timeString} tarihinde güncellendi`);
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-data');
    refreshBtn.addEventListener('click', () => {
        // Show loading state
        refreshBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Güncelleniyor...`;
        
        // Load data
        loadReportData();
    });
    
    // Date range buttons
    const dateRangeBtns = document.querySelectorAll('.date-range .btn');
    dateRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            dateRangeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Filter data based on selected date range
            filterDataByDateRange(btn.textContent.trim());
        });
    });
    
    // Chart action buttons
    const chartActionBtns = document.querySelectorAll('.chart-actions .btn');
    chartActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons in the same group
            const parent = btn.parentElement;
            parent.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update chart based on selected option
            updateChartView(btn.closest('.chart-card').querySelector('h2').textContent, btn.textContent.trim());
        });
    });
    
    // Download buttons
    const downloadBtns = document.querySelectorAll('.btn-download');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tableTitle = btn.closest('.card-header').querySelector('h2').textContent;
            downloadTableData(tableTitle);
        });
    });
}

// Filter data by date range
function filterDataByDateRange(range) {
    // Get issues from localStorage
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    // Filter issues based on date range
    let filteredIssues = [...issues];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(range) {
        case 'Günlük':
            filteredIssues = issues.filter(issue => {
                const issueDate = new Date(issue.date);
                return issueDate >= today;
            });
            break;
        case 'Haftalık':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredIssues = issues.filter(issue => {
                const issueDate = new Date(issue.date);
                return issueDate >= weekAgo;
            });
            break;
        case 'Aylık':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredIssues = issues.filter(issue => {
                const issueDate = new Date(issue.date);
                return issueDate >= monthAgo;
            });
            break;
    }
    
    // Update UI with filtered data
    updateSummaryCards(filteredIssues);
    updateCharts(filteredIssues);
    updateTables(filteredIssues);
}

// Update chart view based on selected option
function updateChartView(chartTitle, option) {
    // Get issues from localStorage
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    if (chartTitle === 'Arıza Trendi') {
        // Update trend chart based on selected time range
        updateTrendChartByTimeRange(issues, option);
    } else if (chartTitle === 'Arıza Dağılımı') {
        // Update distribution chart based on selected grouping
        updateDistributionChartByGrouping(issues, option);
    }
}

// Update trend chart by time range
function updateTrendChartByTimeRange(issues, range) {
    // Group issues by date based on selected range
    const issuesByDate = {};
    
    issues.forEach(issue => {
        const issueDate = new Date(issue.date);
        let dateKey;
        
        switch(range) {
            case 'Günlük':
                dateKey = issueDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                break;
            case 'Haftalık':
                // Get week number
                const firstDayOfYear = new Date(issueDate.getFullYear(), 0, 1);
                const pastDaysOfYear = (issueDate - firstDayOfYear) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                dateKey = `Hafta ${weekNumber}`;
                break;
            case 'Aylık':
                dateKey = issueDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                break;
        }
        
        if (!issuesByDate[dateKey]) {
            issuesByDate[dateKey] = 0;
        }
        issuesByDate[dateKey]++;
    });
    
    // Sort dates
    const sortedDates = Object.keys(issuesByDate).sort((a, b) => {
        if (range === 'Günlük') {
            const dateA = new Date(a.split(' ').reverse().join(' '));
            const dateB = new Date(b.split(' ').reverse().join(' '));
            return dateA - dateB;
        } else if (range === 'Haftalık') {
            const weekA = parseInt(a.split(' ')[1]);
            const weekB = parseInt(b.split(' ')[1]);
            return weekA - weekB;
        } else {
            // For monthly, just use the original order
            return 0;
        }
    });
    
    // Prepare data
    const labels = sortedDates;
    const data = sortedDates.map(date => issuesByDate[date]);
    
    // Update chart
    window.issuesTrendChart.data.labels = labels;
    window.issuesTrendChart.data.datasets[0].data = data;
    window.issuesTrendChart.update();
}

// Update distribution chart by grouping
function updateDistributionChartByGrouping(issues, grouping) {
    // Group issues based on selected grouping
    const groupedData = {};
    
    issues.forEach(issue => {
        let key;
        
        if (grouping === 'Konum') {
            key = issue.location || 'Bilinmiyor';
        } else if (grouping === 'Cihaz') {
            key = issue.device || 'Bilinmiyor';
        }
        
        if (!groupedData[key]) {
            groupedData[key] = 0;
        }
        groupedData[key]++;
    });
    
    // Sort by count (descending)
    const sortedKeys = Object.keys(groupedData).sort((a, b) => 
        groupedData[b] - groupedData[a]
    );
    
    // Prepare data
    const labels = sortedKeys;
    const data = sortedKeys.map(key => groupedData[key]);
    
    // Update chart
    window.issuesDistributionChart.data.labels = labels;
    window.issuesDistributionChart.data.datasets[0].data = data;
    window.issuesDistributionChart.update();
}

// Download table data as CSV
function downloadTableData(tableTitle) {
    // Get table data
    const table = document.querySelector(`.table-card h2:contains('${tableTitle}')`).closest('.table-card').querySelector('table');
    const rows = table.querySelectorAll('tr');
    
    // Prepare CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = [];
    rows[0].querySelectorAll('th').forEach(header => {
        headers.push(header.textContent);
    });
    csvContent += headers.join(',') + '\n';
    
    // Add rows
    for (let i = 1; i < rows.length; i++) {
        const row = [];
        rows[i].querySelectorAll('td').forEach(cell => {
            // Get text content without HTML
            const text = cell.textContent.trim();
            row.push(`"${text}"`);
        });
        csvContent += row.join(',') + '\n';
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tableTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
} 