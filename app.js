// Modern Liturgical Calendar Application
class ModernLiturgicalCalendar {
    constructor() {
        this.currentDate = new Date();
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
        this.cache = new Map();
        this.isLoading = false;
        this.pendingRequests = new Map();
        
        // API Configuration
        this.apiBaseUrl = 'https://api-eky0.onrender.com';
        
        // Settings - hardcoded to show everything
        this.settings = {
            showFeastRanks: true,
            showLiturgicalColors: true,
            showCommemorations: true
        };
        
        // Initialize
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCacheFromStorage();
        this.render();
        this.loadData();
    }

    bindEvents() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changeMonth(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('currentMonth').addEventListener('click', () => this.goToToday());

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => this.loadData());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.changeMonth(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.changeMonth(1);
                break;
            case 'Home':
            case 't':
            case 'T':
                e.preventDefault();
                this.goToToday();
                break;
        }
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.render();
            this.refreshDisplay();
        }, 250);
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
        this.loadData();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
        this.loadData();
    }

    render() {
        this.updateHeader();
        this.renderDesktopCalendar();
        this.renderMobileCalendar();
    }

    updateHeader() {
        // Use native Intl API for month formatting (no dependency needed)
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('currentMonth').textContent = formatter.format(this.currentDate);
    }

    renderDesktopCalendar() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startOffset = firstDay.getDay();
        const totalCells = 42; // 6 weeks

        for (let i = 0; i < totalCells; i++) {
            const cellDate = new Date(firstDay);
            cellDate.setDate(1 - startOffset + i);
            
            const dayCell = this.createDayCell(cellDate);
            grid.appendChild(dayCell);
        }
    }

    renderMobileCalendar() {
        const container = document.getElementById('mobileView');
        container.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const cellDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            const mobileDay = this.createMobileDay(cellDate);
            container.appendChild(mobileDay);
        }
    }

    createDayCell(date) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.dataset.date = this.formatDateKey(date);

        if (date.getMonth() !== this.currentDate.getMonth()) {
            cell.classList.add('other-month');
        }

        if (date.getTime() === this.today.getTime()) {
            cell.classList.add('today');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();

        const feastInfo = document.createElement('div');
        feastInfo.className = 'feast-info';

        const feastName = document.createElement('div');
        feastName.className = 'feast-name';

        const feastRank = document.createElement('div');
        feastRank.className = 'feast-rank';

        const liturgicalIndicator = document.createElement('div');
        liturgicalIndicator.className = 'liturgical-indicator';

        const specialIndicators = document.createElement('div');
        specialIndicators.className = 'special-indicators';

        feastInfo.appendChild(feastName);
        feastInfo.appendChild(feastRank);

        cell.appendChild(liturgicalIndicator);
        cell.appendChild(dayNumber);
        cell.appendChild(feastInfo);
        cell.appendChild(specialIndicators);


        return cell;
    }

    createMobileDay(date) {
        const day = document.createElement('div');
        day.className = 'mobile-day';
        day.dataset.date = this.formatDateKey(date);

        if (date.getTime() === this.today.getTime()) {
            day.classList.add('today');
        }

        const header = document.createElement('div');
        header.className = 'mobile-day-header';

        const dateEl = document.createElement('div');
        dateEl.className = 'mobile-date';
        dateEl.textContent = date.getDate();

        const dayName = document.createElement('div');
        dayName.className = 'mobile-day-name';
        // Use native Intl for day names (no dependency)
        const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
        dayName.textContent = dayFormatter.format(date);

        const feast = document.createElement('div');
        feast.className = 'mobile-feast';

        const rank = document.createElement('div');
        rank.className = 'mobile-rank';

        const liturgicalIndicator = document.createElement('div');
        liturgicalIndicator.className = 'liturgical-indicator';

        header.appendChild(dateEl);
        header.appendChild(dayName);

        day.appendChild(liturgicalIndicator);
        day.appendChild(header);
        day.appendChild(feast);
        day.appendChild(rank);


        return day;
    }

    async loadData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const currentYear = this.currentDate.getFullYear();
            const currentMonth = this.currentDate.getMonth();
            const yearsNeeded = this.getYearsNeeded(currentYear, currentMonth);

            const allData = {};
            for (const year of yearsNeeded) {
                try {
                    const yearData = await this.loadYearData(year);
                    if (yearData) {
                        Object.assign(allData, yearData);
                    }
                } catch (error) {
                    console.warn(`Failed to load year ${year}:`, error);
                }
            }

            if (Object.keys(allData).length > 0) {
                this.populateCalendar(allData);
                this.hideLoading();
            } else {
                this.showError('No liturgical data available for this period.');
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showError('Unable to load liturgical data. Please check your connection and try again.');
        } finally {
            this.isLoading = false;
        }
    }

    async loadYearData(year) {
        // Check memory cache first
        if (this.cache.has(year)) {
            return this.cache.get(year);
        }

        // Check localStorage cache
        const cachedData = this.getCachedData(year);
        if (cachedData) {
            this.cache.set(year, cachedData);
            return cachedData;
        }

        // Check if request is already pending
        if (this.pendingRequests.has(year)) {
            return this.pendingRequests.get(year);
        }

        // Create new request promise
        const requestPromise = this.fetchYearData(year);
        this.pendingRequests.set(year, requestPromise);

        try {
            const yearData = await requestPromise;
            this.cache.set(year, yearData);
            this.saveCacheToStorage(year, yearData);
            return yearData;
        } finally {
            this.pendingRequests.delete(year);
        }
    }

    async fetchYearData(year) {
        const yearData = {};
        const monthPromises = [];

        for (let month = 1; month <= 12; month++) {
            monthPromises.push(this.fetchMonthData(year, month));
        }

        const results = await Promise.allSettled(monthPromises);

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value && result.value.days) {
                result.value.days.forEach(day => {
                    const dateKey = day.date || day.date_str;
                    if (dateKey) {
                        yearData[dateKey] = day;
                    }
                });
            }
        });

        return yearData;
    }

    async fetchMonthData(year, month) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const url = `${this.apiBaseUrl}/month/${year}/${month}`;
            const response = await fetch(url, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    populateCalendar(data) {
        // Desktop calendar
        document.querySelectorAll('.day-cell').forEach(cell => {
            const dateKey = cell.dataset.date;
            const dayData = data[dateKey];
            this.populateCell(cell, dayData, false);
        });

        // Mobile calendar
        document.querySelectorAll('.mobile-day').forEach(day => {
            const dateKey = day.dataset.date;
            const dayData = data[dateKey];
            this.populateCell(day, dayData, true);
        });
    }

    populateCell(element, dayData, isMobile) {
        if (!dayData) return;

        const feastElement = element.querySelector(isMobile ? '.mobile-feast' : '.feast-name');
        const rankElement = element.querySelector(isMobile ? '.mobile-rank' : '.feast-rank');
        const indicatorElement = element.querySelector('.liturgical-indicator');
        const specialIndicators = element.querySelector('.special-indicators');

        if (feastElement) {
            feastElement.textContent = dayData.feast_name || dayData.liturgical_season || '';
        }

        if (rankElement && this.settings.showFeastRanks) {
            rankElement.textContent = dayData.feast_rank || '';
            rankElement.style.display = 'block';
        } else if (rankElement) {
            rankElement.style.display = 'none';
        }

        if (indicatorElement && this.settings.showLiturgicalColors && dayData.liturgical_color) {
            this.applyLiturgicalColor(element, dayData.liturgical_color);
        } else if (indicatorElement) {
            this.removeLiturgicalColor(element);
        }

        // Add special day indicators
        if (specialIndicators) {
            specialIndicators.innerHTML = '';
            if (dayData.is_holy_day) {
                const indicator = document.createElement('div');
                indicator.className = 'special-indicator holy-day';
                indicator.title = 'Holy Day';
                specialIndicators.appendChild(indicator);
            }
            if (dayData.is_fast_day) {
                const indicator = document.createElement('div');
                indicator.className = 'special-indicator fast-day';
                indicator.title = 'Fast Day';
                specialIndicators.appendChild(indicator);
            }
            if (dayData.is_ember_day) {
                const indicator = document.createElement('div');
                indicator.className = 'special-indicator ember-day';
                indicator.title = 'Ember Day';
                specialIndicators.appendChild(indicator);
            }
        }
    }

    applyLiturgicalColor(element, color) {
        this.removeLiturgicalColor(element);
        const colorClass = this.getLiturgicalColorClass(color);
        if (colorClass) {
            element.classList.add(colorClass);
        }
    }

    removeLiturgicalColor(element) {
        element.classList.remove(
            'liturgical-white', 'liturgical-red', 'liturgical-green',
            'liturgical-purple', 'liturgical-black', 'liturgical-rose', 'liturgical-gold'
        );
    }

    getLiturgicalColorClass(color) {
        const colorMap = {
            'white': 'liturgical-white',
            'red': 'liturgical-red',
            'green': 'liturgical-green',
            'purple': 'liturgical-purple',
            'violet': 'liturgical-purple',
            'black': 'liturgical-black',
            'rose': 'liturgical-rose',
            'pink': 'liturgical-rose',
            'gold': 'liturgical-gold',
            'yellow': 'liturgical-gold'
        };
        return colorMap[color.toLowerCase().trim()] || null;
    }


    showLoading() {
        document.getElementById('calendarWrapper').style.display = 'none';
        document.getElementById('mobileView').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'none';
        document.getElementById('loadingContainer').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'none';
        
        if (window.innerWidth <= 768) {
            document.getElementById('calendarWrapper').style.display = 'none';
            document.getElementById('mobileView').style.display = 'flex';
        } else {
            document.getElementById('calendarWrapper').style.display = 'flex';
            document.getElementById('mobileView').style.display = 'none';
        }
    }

    showError(message) {
        document.getElementById('calendarWrapper').style.display = 'none';
        document.getElementById('mobileView').style.display = 'none';
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'flex';
        document.getElementById('errorMessage').textContent = message;
    }


    refreshDisplay() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        const yearsNeeded = this.getYearsNeeded(currentYear, currentMonth);

        const allData = {};
        for (const year of yearsNeeded) {
            const yearData = this.cache.get(year);
            if (yearData) {
                Object.assign(allData, yearData);
            }
        }

        this.populateCalendar(allData);
    }

    // Cache Management
    loadCacheFromStorage() {
        try {
            const cachedYears = JSON.parse(localStorage.getItem('liturgical_cache_years') || '[]');
            const now = Date.now();
            const expiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days

            cachedYears.forEach(year => {
                const cacheKey = `liturgical_cache_${year}`;
                const cachedData = localStorage.getItem(cacheKey);

                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (parsed.timestamp && (now - parsed.timestamp) < expiryTime) {
                        this.cache.set(year, parsed.data);
                    } else {
                        localStorage.removeItem(cacheKey);
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to load cache:', error);
        }
    }

    saveCacheToStorage(year, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };

            localStorage.setItem(`liturgical_cache_${year}`, JSON.stringify(cacheData));

            const cachedYears = JSON.parse(localStorage.getItem('liturgical_cache_years') || '[]');
            if (!cachedYears.includes(year)) {
                cachedYears.push(year);
                localStorage.setItem('liturgical_cache_years', JSON.stringify(cachedYears));
            }
        } catch (error) {
            console.warn('Failed to save cache:', error);
        }
    }

    getCachedData(year) {
        try {
            const cacheKey = `liturgical_cache_${year}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                const now = Date.now();
                const expiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days

                if (parsed.timestamp && (now - parsed.timestamp) < expiryTime) {
                    return parsed.data;
                } else {
                    localStorage.removeItem(cacheKey);
                }
            }
        } catch (error) {
            console.warn('Failed to get cached data:', error);
        }

        return null;
    }




    // Utility Methods
    getYearsNeeded(currentYear, currentMonth) {
        const years = new Set();
        years.add(currentYear);

        if (currentMonth === 0) {
            years.add(currentYear - 1);
        }

        if (currentMonth === 11) {
            years.add(currentYear + 1);
        }

        return Array.from(years).sort();
    }

    formatDateKey(date) {
        // Use native Intl for date formatting (no dependency)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernLiturgicalCalendar();
});