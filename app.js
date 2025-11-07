// Modern Liturgical Calendar Application
class ModernLiturgicalCalendar {
    constructor() {
        this.currentDate = new Date();
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
        this.cache = new Map();
        this.isLoading = false;
        this.pendingRequests = new Map();
        this.isInitialLoad = true;
        this.shouldScrollToToday = false;
        this.datePicker = null;
        
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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    initDatePicker() {
        const input = document.getElementById('datePickerInput');
        const currentMonthEl = document.getElementById('currentMonth');
        if (!input || !currentMonthEl || typeof flatpickr === 'undefined') return;

        this.datePicker = flatpickr(input, {
            dateFormat: 'Y-m-d',
            defaultDate: this.currentDate,
            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length > 0) {
                    this.navigateToDate(selectedDates[0]);
                    instance.close();
                }
                // Hide mobile input after date change
                this.hideMobileInput();
            },
            clickOpens: false,
            disableMobile: false, // Allow mobile mode for native date picker
            positionElement: currentMonthEl,
            position: 'below',
            onReady: (selectedDates, dateStr, instance) => {
                // Hide mobile input after flatpickr creates it
                this.hideMobileInput();
            },
            onClose: (selectedDates, dateStr, instance) => {
                // Hide mobile input when calendar closes
                this.hideMobileInput();
            }
        });

        // Hide mobile input immediately if it exists
        this.hideMobileInput();
    }

    hideMobileInput() {
        // Hide all mobile inputs when not in use
        const mobileInputs = [
            this.datePicker?.mobileInput,
            document.querySelector('.flatpickr-mobile')
        ].filter(Boolean);
        
        mobileInputs.forEach(mobileInput => {
            if (mobileInput) {
                mobileInput.style.position = 'absolute';
                mobileInput.style.opacity = '0';
                mobileInput.style.width = '1px';
                mobileInput.style.height = '1px';
                mobileInput.style.overflow = 'hidden';
                mobileInput.style.clip = 'rect(0, 0, 0, 0)';
                mobileInput.style.left = '-9999px';
                mobileInput.style.pointerEvents = 'none';
            }
        });
    }

    openDatePicker() {
        if (!this.datePicker) {
            console.warn('Date picker not initialized');
            return;
        }
        
        // Update the date in the picker
        this.datePicker.setDate(this.currentDate, false);
        
        // On mobile, use the native date picker
        if (window.innerWidth <= 768) {
            // Try to get the mobile input - wait a bit if it doesn't exist yet
            let mobileInput = this.datePicker.mobileInput || 
                             document.querySelector('.flatpickr-mobile');
            
            if (!mobileInput) {
                // Wait a moment for flatpickr to create it
                setTimeout(() => {
                    mobileInput = this.datePicker.mobileInput || 
                                 document.querySelector('.flatpickr-mobile');
                    if (mobileInput) {
                        this.triggerMobileDatePicker(mobileInput);
                    } else {
                        // Fallback: open the calendar picker
                        try {
                            this.datePicker.open();
                        } catch (e) {
                            console.error('Failed to open date picker:', e);
                        }
                    }
                }, 50);
                return;
            }
            
            this.triggerMobileDatePicker(mobileInput);
        } else {
            // Desktop: open the calendar picker
            try {
                // Ensure the calendar is positioned correctly
                if (this.datePicker.isOpen) {
                    this.datePicker.close();
                }
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    this.datePicker.open();
                }, 10);
            } catch (e) {
                console.error('Failed to open date picker:', e);
            }
        }
    }

    triggerMobileDatePicker(mobileInput) {
        // Position it over the current month element so users can click it directly
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl && mobileInput) {
            const rect = currentMonthEl.getBoundingClientRect();
            
            // Make it visible and positioned over the month text
            mobileInput.style.position = 'fixed';
            mobileInput.style.top = rect.top + 'px';
            mobileInput.style.left = rect.left + 'px';
            mobileInput.style.width = rect.width + 'px';
            mobileInput.style.height = rect.height + 'px';
            mobileInput.style.opacity = '0.01'; // Nearly invisible but clickable
            mobileInput.style.zIndex = '9999';
            mobileInput.style.pointerEvents = 'auto';
            mobileInput.style.visibility = 'visible';
            mobileInput.style.border = 'none';
            mobileInput.style.background = 'transparent';
            mobileInput.style.cursor = 'pointer';
            
            // Set the value to match current date
            const dateStr = this.currentDate.toISOString().split('T')[0];
            mobileInput.value = dateStr;
            
            // Try to focus and click it (works on some browsers)
            mobileInput.focus();
            
            // For browsers that allow programmatic clicks, try it
            try {
                mobileInput.click();
            } catch (e) {
                // If click fails, the input is still positioned for user interaction
                console.log('Programmatic click not supported, user can click directly');
            }
            
            // Hide it again after user interaction or when date changes
            const hideAfterInteraction = () => {
                setTimeout(() => {
                    this.hideMobileInput();
                }, 300);
            };
            
            mobileInput.addEventListener('change', hideAfterInteraction, { once: true });
            mobileInput.addEventListener('blur', hideAfterInteraction, { once: true });
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
                if (window.innerWidth <= 768) {
                    if (this.isInitialLoad || this.shouldScrollToToday) {
                        this.scrollToToday();
                        this.isInitialLoad = false;
                        this.shouldScrollToToday = false;
                    }
                }
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
            // Store dayData in cell for click handler
            if (dayData) {
                cell.dataset.dayData = JSON.stringify(dayData);
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDayModal(cell, dayData);
                });
            }
        });

        // Mobile calendar
        document.querySelectorAll('.mobile-day').forEach(day => {
            const dateKey = day.dataset.date;
            const dayData = data[dateKey];
            this.populateCell(day, dayData, true);
            // Store dayData in day for click handler
            if (dayData) {
                day.dataset.dayData = JSON.stringify(dayData);
                day.style.cursor = 'pointer';
                day.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDayModal(day, dayData);
                });
            }
        });
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

        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'day-modal';
        modal.id = 'dayModal';

        // Format date
        const date = new Date(dayData.date);
        const dateFormatter = new Intl.DateTimeFormat('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedDate = dateFormatter.format(date);

        // Get commemorations
        const commemorations = this.extractCommemorations(dayData);

        // Parse mass data
        const massData = this.parseMassData(dayData);

        // Build modal content (escape HTML to prevent XSS)
        const feastName = this.escapeHtml(dayData.feast_name || 'Liturgical Day');
        const rank = dayData.feast_rank ? this.escapeHtml(dayData.feast_rank) : '';
        const commsText = commemorations.map(c => this.escapeHtml(c)).join(', ');
        const massText = massData ? this.escapeHtml(massData) : '';

        let content = `
            <div class="day-modal-header">
                <div class="day-modal-title">${feastName}</div>
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

        modal.innerHTML = content;

        // Add close handler
        modal.querySelector('.day-modal-close').addEventListener('click', () => this.closeDayModal());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDayModal();
            }
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDayModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);

        // Position modal relative to clicked element (use setTimeout to ensure DOM is ready)
        setTimeout(() => {
            this.positionModal(modal, element);
        }, 0);
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

    parseMassData(dayData) {
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
            
            // Format mass data
            const parts = [];
            for (const [key, value] of Object.entries(massObj)) {
                if (value && typeof value === 'object') {
                    const massParts = [];
                    if (value.int) massParts.push(`Introit: ${value.int}`);
                    if (value.glo !== undefined) massParts.push(`Gloria: ${value.glo ? 'Yes' : 'No'}`);
                    if (value.cre !== undefined) massParts.push(`Creed: ${value.cre ? 'Yes' : 'No'}`);
                    if (value.pre) massParts.push(`Preface: ${value.pre}`);
                    if (value.ep) massParts.push(`Epistle: ${value.ep}`);
                    if (value.gos) massParts.push(`Gospel: ${value.gos}`);
                    
                    if (massParts.length > 0) {
                        parts.push(`${key}: ${massParts.join(', ')}`);
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
        if (modal) {
            modal.remove();
        }
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernLiturgicalCalendar();
});