// Modern Liturgical Calendar Application
class ModernLiturgicalCalendar {
    constructor() {
        this.currentDate = new Date();
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
        this.cache = new Map();
        this.loadToken = 0;
        this.monthData = {};
        this.pendingRequests = new Map();
        this.isInitialLoad = true;
        this.shouldScrollToToday = false;
        
        this.apiBaseUrl = 'https://api.ordotools.org';
        
        this.settings = {
            showFeastRanks: true,
            showLiturgicalColors: true,
            showCommemorations: true
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initDatePicker();
        this.loadCacheFromStorage();
        this.render();
        this.loadData();
    }

    bindEvents() {
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changeMonth(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        
        // Current month click handler
        const currentMonthEl = document.getElementById('currentMonth');
        currentMonthEl.addEventListener('click', () => this.openDatePicker());
        currentMonthEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openDatePicker();
            }
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => this.loadData());

        // Day details: one delegated handler per view instead of per-cell listeners
        const openDay = (e) => {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            const el = e.target.closest('[data-date]');
            const dayData = el && this.monthData[el.dataset.date];
            if (!dayData) return;
            e.preventDefault();
            this.showDayModal(el, dayData);
        };
        for (const id of ['calendarGrid', 'mobileView']) {
            const view = document.getElementById(id);
            view.addEventListener('click', openDay);
            view.addEventListener('keydown', openDay);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    initDatePicker() {
        const input = document.getElementById('datePickerInput');
        // Browsers without a native month picker report type "text"; fall back to a date picker
        if (input.type !== 'month') input.type = 'date';
        input.addEventListener('change', () => {
            const [year, month] = input.value.split('-').map(Number);
            if (year && month) this.navigateToDate(new Date(year, month - 1, 1));
        });
    }

    openDatePicker() {
        const input = document.getElementById('datePickerInput');
        input.value = this.formatDateKey(this.currentDate).slice(0, input.type === 'month' ? 7 : 10);
        try {
            input.showPicker();
        } catch {
            input.focus();
        }
    }

    navigateToDate(date) {
        this.currentDate = new Date(date);
        this.currentDate.setDate(1); // Set to first day of month
        this.render();
        this.loadData();
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (document.getElementById('dayModal')) return;

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

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
        this.loadData();
    }

    goToToday() {
        this.currentDate = new Date();
        this.shouldScrollToToday = true;
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
        
        // Reset scroll position when rendering new month (except when we're about to scroll to today)
        if (!this.shouldScrollToToday && container) {
            container.scrollTop = 0;
        }

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
        cell.tabIndex = 0;
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

        const feastName = document.createElement('div');
        feastName.className = 'feast-name';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header-row';
        dayHeader.appendChild(dayNumber);
        dayHeader.appendChild(feastName);

        const feastInfo = document.createElement('div');
        feastInfo.className = 'feast-info';

        const commemorations = document.createElement('div');
        commemorations.className = 'commemorations';

        const feastRank = document.createElement('div');
        feastRank.className = 'feast-rank';

        const liturgicalIndicator = document.createElement('div');
        liturgicalIndicator.className = 'liturgical-indicator';

        const specialIndicators = document.createElement('div');
        specialIndicators.className = 'special-indicators';

        feastInfo.appendChild(commemorations);
        feastInfo.appendChild(feastRank);

        cell.appendChild(liturgicalIndicator);
        cell.appendChild(dayHeader);
        cell.appendChild(feastInfo);
        cell.appendChild(specialIndicators);


        return cell;
    }

    createMobileDay(date) {
        const day = document.createElement('div');
        day.className = 'mobile-day';
        day.tabIndex = 0;
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

        const commemorations = document.createElement('div');
        commemorations.className = 'mobile-commemorations';

        const rank = document.createElement('div');
        rank.className = 'mobile-rank';

        const liturgicalIndicator = document.createElement('div');
        liturgicalIndicator.className = 'liturgical-indicator';

        header.appendChild(dateEl);
        header.appendChild(dayName);

        day.appendChild(liturgicalIndicator);
        day.appendChild(header);
        day.appendChild(feast);
        day.appendChild(commemorations);
        day.appendChild(rank);


        return day;
    }

    async loadData() {
        // Newer calls supersede older ones, so fast navigation never leaves a month blank
        const token = ++this.loadToken;
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        const yearsNeeded = this.getYearsNeeded(currentYear, currentMonth);

        try {
            // Only show the spinner when we actually have to hit the network
            if (yearsNeeded.some(year => !this.cache.has(year))) {
                this.showLoading();
            }

            const results = await Promise.allSettled(yearsNeeded.map(year => this.loadYearData(year)));
            if (token !== this.loadToken) return;

            const allData = Object.assign({}, ...results.filter(r => r.status === 'fulfilled').map(r => r.value));
            if (Object.keys(allData).length === 0) {
                this.showError('No liturgical data available for this period.');
                return;
            }

            this.populateCalendar(allData);
            this.hideLoading();
            if (window.innerWidth <= 768 && (this.isInitialLoad || this.shouldScrollToToday)) {
                this.scrollToToday();
                this.isInitialLoad = false;
                this.shouldScrollToToday = false;
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            if (token === this.loadToken) {
                this.showError('Unable to load liturgical data. Please check your connection and try again.');
            }
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

    // One request per year; the /year endpoint returns the same day records as /month
    async fetchYearData(year) {
        const response = await fetch(`${this.apiBaseUrl}/year/${year}`, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const { calendar = [] } = await response.json();
        return Object.fromEntries(calendar.map(day => [day.date, day]));
    }


    populateCalendar(data) {
        this.monthData = data;
        document.querySelectorAll('.day-cell').forEach(cell => this.populateCell(cell, data[cell.dataset.date], false));
        document.querySelectorAll('.mobile-day').forEach(day => this.populateCell(day, data[day.dataset.date], true));
    }

    populateCell(element, dayData, isMobile) {
        if (!dayData) return;

        const feastElement = element.querySelector(isMobile ? '.mobile-feast' : '.feast-name');
        const commemorationsElement = element.querySelector(isMobile ? '.mobile-commemorations' : '.commemorations');
        const rankElement = element.querySelector(isMobile ? '.mobile-rank' : '.feast-rank');
        const indicatorElement = element.querySelector('.liturgical-indicator');
        const specialIndicators = element.querySelector('.special-indicators');

        if (feastElement) {
            feastElement.textContent = dayData.feast_name || dayData.liturgical_season || '';
        }

        // Extract and display commemorations
        if (commemorationsElement) {
            const commNames = this.extractCommemorations(dayData);
            if (commNames.length > 0) {
                commemorationsElement.innerHTML = commNames.join('<br>');
                commemorationsElement.style.display = 'block';
            } else {
                commemorationsElement.textContent = '';
                commemorationsElement.style.display = 'none';
            }
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

    extractCommemorations(dayData) {
        const commNames = [];
        
        // First check if commemorations array has data
        if (dayData.commemorations && Array.isArray(dayData.commemorations)) {
            dayData.commemorations.forEach(comm => {
                if (comm && comm.name) {
                    commNames.push(comm.name);
                }
            });
        }
        
        // If no commemorations in array, try parsing raw_data
        if (commNames.length === 0 && dayData.raw_data) {
            const rawData = dayData.raw_data;
            ['com_1', 'com_2', 'com_3'].forEach(comKey => {
                const comData = rawData[comKey];
                if (comData && typeof comData === 'string' && comData.trim().startsWith('{')) {
                    try {
                        // Parse Python dict string (replace single quotes with double quotes for JSON)
                        const jsonStr = comData.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false');
                        const parsed = JSON.parse(jsonStr);
                        if (parsed && parsed.name && parsed.name !== 'None' && parsed.name.trim()) {
                            commNames.push(parsed.name);
                        }
                    } catch (e) {
                        // If parsing fails, try to extract name using regex
                        const nameMatch = comData.match(/['"]name['"]:\s*['"]([^'"]+)['"]/);
                        if (nameMatch && nameMatch[1] && nameMatch[1] !== 'None') {
                            commNames.push(nameMatch[1]);
                        }
                    }
                }
            });
        }
        
        return commNames;
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
        // Clear inline display so the CSS media query picks desktop vs mobile (and follows resizes)
        document.getElementById('calendarWrapper').style.display = '';
        document.getElementById('mobileView').style.display = '';
    }

    showError(message) {
        document.getElementById('calendarWrapper').style.display = 'none';
        document.getElementById('mobileView').style.display = 'none';
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'flex';
        document.getElementById('errorMessage').textContent = message;
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

    scrollToToday() {
        // Only scroll on mobile
        if (window.innerWidth > 768) return;

        const mobileView = document.getElementById('mobileView');
        if (!mobileView) return;
        
        const todayElement = mobileView.querySelector('.mobile-day.today');
        
        if (todayElement) {
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => {
                todayElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }, 100);
        } else {
            // If today element not found yet, try again after a short delay
            // This handles cases where DOM hasn't fully updated
            setTimeout(() => {
                const retryElement = mobileView.querySelector('.mobile-day.today');
                if (retryElement) {
                    retryElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 300);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showDayModal(element, dayData) {
        // Close any existing modal
        this.closeDayModal();

        const isMobile = window.innerWidth <= 768;

        // On mobile, scroll the clicked day to the top
        // We'll handle this in setupDrawerBehavior after calculating height

        // Create modal element
        const modal = document.createElement('div');
        modal.className = isMobile ? 'day-modal day-modal-drawer' : 'day-modal';
        modal.id = 'dayModal';

        // Get commemorations
        const commemorations = this.extractCommemorations(dayData);

        // Parse mass data
        const massData = this.parseMassData(dayData, commemorations);

        // Build modal content (escape HTML to prevent XSS, except for Mass which contains safe HTML)
        const rank = dayData.feast_rank ? this.escapeHtml(dayData.feast_rank) : '';
        const commsText = commemorations.map(c => this.escapeHtml(c)).join(', ');
        // Mass data contains safe HTML tags (<em>) so we don't escape it, but we escape the values within parseMassData
        const massText = massData || '';

        let content = '';
        
        if (isMobile) {
            // Mobile drawer: no header, no date, no close button
            content = `
                <div class="day-modal-drag-handle"></div>
                <div class="day-modal-content">
                    ${rank ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Rank</div>
                        <div class="day-modal-value">${rank}</div>
                    </div>
                    ` : ''}
                    ${commemorations.length > 0 ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Commemorations</div>
                        <div class="day-modal-value">${commsText}</div>
                    </div>
                    ` : ''}
                    ${massText ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Mass</div>
                        <div class="day-modal-value">${massText}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        } else {
            // Desktop: keep original structure with header and date
            const dateParts = dayData.date.split('-');
            const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            const dateFormatter = new Intl.DateTimeFormat('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedDate = dateFormatter.format(date);
            const feastName = this.escapeHtml(dayData.feast_name || 'Liturgical Day');
            const liturgicalColor = dayData.liturgical_color || '';
            const colorClass = liturgicalColor ? this.getLiturgicalColorClass(liturgicalColor) : '';

            content = `
                <div class="day-modal-header">
                    <div class="day-modal-title">
                        ${colorClass ? `<span class="day-modal-color-circle ${colorClass}"></span>` : ''}
                        ${feastName}
                    </div>
                    <button class="day-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="day-modal-content">
                    <div class="day-modal-section">
                        <div class="day-modal-label">Date</div>
                        <div class="day-modal-value">${formattedDate}</div>
                    </div>
                    ${rank ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Rank</div>
                        <div class="day-modal-value">${rank}</div>
                    </div>
                    ` : ''}
                    ${commemorations.length > 0 ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Commemorations</div>
                        <div class="day-modal-value">${commsText}</div>
                    </div>
                    ` : ''}
                    ${massText ? `
                    <div class="day-modal-section">
                        <div class="day-modal-label">Mass</div>
                        <div class="day-modal-value">${massText}</div>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        modal.innerHTML = content;

        // Add close handler for desktop only
        if (!isMobile) {
            const closeBtn = modal.querySelector('.day-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeDayModal());
            }
            
            // Close on backdrop click (desktop only)
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDayModal();
                }
            });
        }

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDayModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);

        // On mobile, set up drawer behavior and calculate height
        if (isMobile) {
            this.setupDrawerBehavior(modal, element);
        } else {
            // Desktop: position modal relative to clicked element
            setTimeout(() => {
                this.positionModal(modal, element);
            }, 0);
        }
    }

    setupDrawerBehavior(modal, dayElement) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let initialTransform = 0;

        const backdrop = document.createElement('div');
        backdrop.className = 'day-modal-backdrop';
        backdrop.id = 'dayModalBackdrop';
        document.body.insertBefore(backdrop, modal);

        // Touch handlers
        const handleTouchStart = (e) => {
            if (e.target.closest('.day-modal-content')) {
                // Don't start dragging if touching the content area (allow scrolling)
                return;
            }
            startY = e.touches[0].clientY;
            initialTransform = currentY;
            isDragging = true;
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            currentY = initialTransform + (e.touches[0].clientY - startY);
            
            // Only allow downward dragging
            if (currentY > 0) {
                modal.style.transform = `translateY(${currentY}px)`;
                const opacity = 1 - (currentY / 300);
                backdrop.style.opacity = Math.max(0, opacity);
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            // If dragged down more than 100px, close the drawer
            if (currentY > 100) {
                this.closeDayModal();
            } else {
                // Snap back to open position
                currentY = 0;
                modal.style.transform = '';
                backdrop.style.opacity = '';
            }
        };

        // Add touch handlers to drag handle only
        const dragHandle = modal.querySelector('.day-modal-drag-handle');
        
        if (dragHandle) {
            dragHandle.addEventListener('touchstart', handleTouchStart, { passive: false });
            dragHandle.addEventListener('touchmove', handleTouchMove, { passive: false });
            dragHandle.addEventListener('touchend', handleTouchEnd, { passive: false });
        }

        // Close on backdrop click
        backdrop.addEventListener('click', () => this.closeDayModal());

        // First, scroll the day to the top, then calculate drawer height
        dayElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });

        // Wait for scroll animation to complete, then calculate and show drawer
        setTimeout(() => {
            // Calculate drawer height: from bottom of viewport to bottom of selected day
            const viewportHeight = window.innerHeight;
            const dayRect = dayElement.getBoundingClientRect();
            const dayBottom = dayRect.bottom;
            const drawerHeight = viewportHeight - dayBottom;
            const finalHeight = Math.max(200, drawerHeight); // Minimum 200px height

            // Set drawer height
            modal.style.height = `${finalHeight}px`;
            modal.style.maxHeight = `${finalHeight}px`;

            // Show drawer with animation
            requestAnimationFrame(() => {
                modal.classList.add('drawer-open');
                backdrop.classList.add('backdrop-visible');
            });
        }, 500); // Wait for scroll animation (typically 300-500ms)
    }

    positionModal(modal, element) {
        const rect = element.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 10;

        // Determine if modal should go right or left
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        const goRight = spaceRight >= spaceLeft && spaceRight >= 300;

        // Determine vertical position (center on element)
        let top = rect.top + (rect.height / 2) - (modalRect.height / 2);
        
        // Adjust if modal goes off screen vertically
        if (top < spacing) {
            top = spacing;
        } else if (top + modalRect.height > viewportHeight - spacing) {
            top = viewportHeight - modalRect.height - spacing;
        }

        // Set horizontal position
        let left;
        if (goRight) {
            left = rect.right + spacing;
        } else {
            left = rect.left - modalRect.width - spacing;
        }

        // Ensure modal stays within viewport
        if (left < spacing) {
            left = spacing;
        } else if (left + modalRect.width > viewportWidth - spacing) {
            left = viewportWidth - modalRect.width - spacing;
        }

        modal.style.position = 'fixed';
        modal.style.top = `${top}px`;
        modal.style.left = `${left}px`;
        modal.style.zIndex = '10000';
    }

    parseMassData(dayData, commemorations = []) {
        if (!dayData.raw_data || !dayData.raw_data.mass) {
            return null;
        }

        const massStr = dayData.raw_data.mass;
        
        try {
            // Parse Python dict string
            const jsonStr = massStr
                .replace(/'/g, '"')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false')
                .replace(/None/g, 'null');
            
            const massObj = JSON.parse(jsonStr);
            
            // Format mass data according to specification
            const parts = [];
            for (const [key, value] of Object.entries(massObj)) {
                if (value && typeof value === 'object') {
                    const formattedParts = [];
                    
                    // Introit in italics, then comma (escape HTML in the value itself)
                    if (value.int) {
                        const introitEscaped = this.escapeHtml(value.int);
                        formattedParts.push(`<em>${introitEscaped}</em>,`);
                    }
                    
                    // Gloria and Creed
                    if (value.glo === true) {
                        formattedParts.push('Gl,');
                    }
                    if (value.cre === true) {
                        formattedParts.push('Cr,');
                    }
                    
                    // Commemorations: "1 com" first comm, "2 com" second comm, etc. (escape HTML, comma delineated)
                    const commParts = [];
                    commemorations.forEach((comm, index) => {
                        const commEscaped = this.escapeHtml(comm);
                        commParts.push(`${index + 1} com ${commEscaped}`);
                    });
                    if (commParts.length > 0) {
                        formattedParts.push(commParts.join(', ') + ',');
                    }
                    
                    // Preface in italics if it exists (escape HTML in the value itself)
                    if (value.pre) {
                        const prefaceEscaped = this.escapeHtml(value.pre);
                        formattedParts.push(`Preface <em>${prefaceEscaped}</em>`);
                    }
                    
                    if (formattedParts.length > 0) {
                        // Join parts with spaces (no key prefix)
                        let formatted = formattedParts.join(' ');
                        parts.push(formatted);
                    }
                }
            }
            
            return parts.length > 0 ? parts.join('; ') : null;
        } catch (e) {
            // If parsing fails, return raw string (cleaned up)
            return massStr.length > 200 ? massStr.substring(0, 200) + '...' : massStr;
        }
    }

    closeDayModal() {
        const modal = document.getElementById('dayModal');
        const backdrop = document.getElementById('dayModalBackdrop');
        
        if (modal) {
            const isMobile = modal.classList.contains('day-modal-drawer');
            
            if (isMobile) {
                // Animate drawer closing
                modal.classList.remove('drawer-open');
                modal.classList.add('drawer-closing');
                if (backdrop) {
                    backdrop.classList.remove('backdrop-visible');
                }
                
                // Remove after animation
                setTimeout(() => {
                    modal.remove();
                    if (backdrop) backdrop.remove();
                }, 300);
            } else {
                modal.remove();
            }
        }
        
        if (backdrop && !modal) {
            backdrop.remove();
        }
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernLiturgicalCalendar();
});
