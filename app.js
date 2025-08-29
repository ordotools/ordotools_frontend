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
        
        // Settings
        this.settings = this.loadSettings();
        
        // Initialize
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCacheFromStorage();
        this.render();
        this.loadData();
        this.initializeSettings();
    }

    bindEvents() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changeMonth(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('currentMonth').addEventListener('click', () => this.goToToday());

        // Modal controls
        document.getElementById('settingsBtn').addEventListener('click', () => this.openModal('settingsModal'));
        document.getElementById('pdfBtn').addEventListener('click', () => this.openModal('pdfModal'));
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                this.closeModal(modal.id);
            });
        });

        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Settings
        document.getElementById('showFeastRanks').addEventListener('change', (e) => {
            this.updateSetting('showFeastRanks', e.target.checked);
        });
        document.getElementById('showLiturgicalColors').addEventListener('change', (e) => {
            this.updateSetting('showLiturgicalColors', e.target.checked);
        });
        document.getElementById('showCommemorations').addEventListener('change', (e) => {
            this.updateSetting('showCommemorations', e.target.checked);
        });

        // Cache management
        document.getElementById('clearCacheBtn').addEventListener('click', () => this.clearCache());

        // PDF export
        document.querySelectorAll('.pdf-option').forEach(option => {
            option.addEventListener('click', () => this.exportPDF(option.dataset.option));
        });

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
            case 'Escape':
                e.preventDefault();
                this.closeAllModals();
                break;
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.openModal('settingsModal');
                }
                break;
            case 'p':
            case 'P':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.openModal('pdfModal');
                }
                break;
        }
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.render();
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
        this.showNotification('Jumped to today', 'info');
    }

    render() {
        this.updateHeader();
        this.renderDesktopCalendar();
        this.renderMobileCalendar();
    }

    updateHeader() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const month = monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        
        document.getElementById('currentMonth').textContent = `${month} ${year}`;
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
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');

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

        cell.addEventListener('click', () => this.openDayDetail(date));
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openDayDetail(date);
            }
        });

        return cell;
    }

    createMobileDay(date) {
        const day = document.createElement('div');
        day.className = 'mobile-day';
        day.dataset.date = this.formatDateKey(date);
        day.setAttribute('tabindex', '0');
        day.setAttribute('role', 'button');

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
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayName.textContent = dayNames[date.getDay()];

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

        day.addEventListener('click', () => this.openDayDetail(date));
        day.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openDayDetail(date);
            }
        });

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

    openDayDetail(date) {
        const dateKey = this.formatDateKey(date);
        const currentYear = this.currentDate.getFullYear();
        const yearData = this.cache.get(currentYear) || {};
        const dayData = yearData[dateKey];

        this.populateDayDetail(date, dayData);
        this.openModal('dayModal');
    }

    populateDayDetail(date, dayData) {
        const title = document.getElementById('dayModalTitle');
        const content = document.getElementById('dayModalContent');

        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        title.textContent = formattedDate;

        if (!dayData) {
            content.innerHTML = `
                <div class="detail-section">
                    <h3>No Data Available</h3>
                    <p>No liturgical data is available for this date.</p>
                </div>
            `;
            return;
        }

        let html = '';

        // Main liturgical information
        html += '<div class="detail-section">';
        html += '<h3>Liturgical Information</h3>';

        if (dayData.feast_name) {
            html += `<div class="detail-item">
                <span class="detail-label">Feast:</span>
                <span class="detail-value">${dayData.feast_name}</span>
            </div>`;
        }

        if (dayData.liturgical_season) {
            html += `<div class="detail-item">
                <span class="detail-label">Season:</span>
                <span class="detail-value">${dayData.liturgical_season}</span>
            </div>`;
        }

        if (this.settings.showFeastRanks && dayData.feast_rank) {
            html += `<div class="detail-item">
                <span class="detail-label">Rank:</span>
                <span class="detail-value">${dayData.feast_rank}</span>
            </div>`;
        }

        if (this.settings.showLiturgicalColors && dayData.liturgical_color) {
            html += `<div class="detail-item">
                <span class="detail-label">Color:</span>
                <span class="detail-value">${dayData.liturgical_color}</span>
            </div>`;
        }

        html += '</div>';

        // Special days
        const specialDays = [];
        if (dayData.is_sunday) specialDays.push('Sunday');
        if (dayData.is_holy_day) specialDays.push('Holy Day');
        if (dayData.is_fast_day) specialDays.push('Fast Day');
        if (dayData.is_ember_day) specialDays.push('Ember Day');

        if (specialDays.length > 0) {
            html += '<div class="detail-section">';
            html += '<h3>Special Observances</h3>';
            html += `<div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${specialDays.join(', ')}</span>
            </div>`;
            html += '</div>';
        }

        // Commemorations
        if (this.settings.showCommemorations && dayData.commemorations && dayData.commemorations.length > 0) {
            html += '<div class="detail-section">';
            html += '<h3>Commemorations</h3>';
            dayData.commemorations.forEach(comm => {
                html += `<div class="detail-item">
                    <span class="detail-label">${comm.rank || 'Commemoration'}:</span>
                    <span class="detail-value">${comm.name}</span>
                </div>`;
            });
            html += '</div>';
        }

        // Mass readings
        if (dayData.mass_proper) {
            html += '<div class="detail-section">';
            html += '<h3>Mass Readings</h3>';

            const massProper = dayData.mass_proper;

            if (massProper.epistle && massProper.epistle.reference) {
                html += `<div class="detail-item">
                    <span class="detail-label">Epistle:</span>
                    <span class="detail-value">${massProper.epistle.reference}</span>
                </div>`;
            }

            if (massProper.gospel && massProper.gospel.reference) {
                html += `<div class="detail-item">
                    <span class="detail-label">Gospel:</span>
                    <span class="detail-value">${massProper.gospel.reference}</span>
                </div>`;
            }

            html += '</div>';
        }

        content.innerHTML = html;
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            const closeButton = modal.querySelector('.modal-close');
            if (closeButton) {
                setTimeout(() => closeButton.focus(), 100);
            }
        }

        if (modalId === 'settingsModal') {
            this.updateSettingsDisplay();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
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
            document.getElementById('mobileView').style.display = 'block';
        } else {
            document.getElementById('calendarWrapper').style.display = 'block';
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

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${icon}</span>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Settings Management
    loadSettings() {
        try {
            const saved = localStorage.getItem('liturgical_settings');
            if (saved) {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        return this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            showFeastRanks: true,
            showLiturgicalColors: true,
            showCommemorations: true
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('liturgical_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.refreshDisplay();
        this.showNotification('Settings updated', 'success');
    }

    initializeSettings() {
        document.getElementById('showFeastRanks').checked = this.settings.showFeastRanks;
        document.getElementById('showLiturgicalColors').checked = this.settings.showLiturgicalColors;
        document.getElementById('showCommemorations').checked = this.settings.showCommemorations;
    }

    updateSettingsDisplay() {
        const cacheInfo = this.getCacheInfo();
        document.getElementById('cachedYearsInfo').textContent = 
            cacheInfo.years.length > 0 ? cacheInfo.years.join(', ') : 'None';
        
        document.getElementById('apiStatus').textContent = 'Connected';
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

    clearCache() {
        this.cache.clear();
        this.pendingRequests.clear();

        try {
            const cachedYears = JSON.parse(localStorage.getItem('liturgical_cache_years') || '[]');
            cachedYears.forEach(year => {
                localStorage.removeItem(`liturgical_cache_${year}`);
            });
            localStorage.removeItem('liturgical_cache_years');
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }

        this.updateSettingsDisplay();
        this.showNotification('Cache cleared successfully', 'success');
    }

    getCacheInfo() {
        const years = Array.from(this.cache.keys()).sort();
        return {
            years: years,
            count: years.length
        };
    }

    // PDF Export
    async exportPDF(type) {
        try {
            const options = {
                compact: document.getElementById('pdfCompact').checked,
                landscape: document.getElementById('pdfLandscape').checked,
                includeColors: document.getElementById('pdfColors').checked
            };

            this.showNotification('Generating PDF...', 'info');

            if (typeof PrintFormatter !== 'undefined') {
                const printFormatter = new PrintFormatter();
                
                if (type === 'current-month') {
                    const year = this.currentDate.getFullYear();
                    const month = this.currentDate.getMonth();
                    const yearData = this.cache.get(year) || {};
                    await printFormatter.generateMonthPDF(year, month, yearData, options);
                } else if (type === 'current-year') {
                    const year = this.currentDate.getFullYear();
                    const yearData = this.cache.get(year) || {};
                    await printFormatter.generateYearPDF(year, yearData, options);
                }

                this.showNotification('PDF generated successfully', 'success');
            } else {
                throw new Error('PDF generator not available');
            }

            this.closeModal('pdfModal');
        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showNotification('Failed to generate PDF', 'error');
        }
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
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernLiturgicalCalendar();
});