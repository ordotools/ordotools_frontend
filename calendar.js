/**
 * Main Calendar class that orchestrates UI and API components
 */
class APICalendar {
    constructor() {
        this.currentDate = new Date();
        this.events = new Map();
        this.apiClient = new APIClient();
        this.uiManager = new UIManager();
        
        this.init();
    }

    /**
     * Initialize calendar
     */
    init() {
        this.bindEvents();
        
        // Initialize keyboard navigation
        this.keyboardNav = new KeyboardNavigation(this);
        
        this.render();
        this.uiManager.scrollToTodayOnMobile();
        console.log(`📅 Calendar initialized in ${ENV} mode`);
        
        // Auto-test API connection
        this.performInitialAPITest();
    }

    /**
     * Test API connection on startup
     */
    async performInitialAPITest() {
        setTimeout(async () => {
            try {
                const result = await this.apiClient.testConnection();
                if (result.success) {
                    console.log('✅ Initial API test successful');
                } else {
                    console.log('⚠️ Initial API test failed - calendar will work but without API data');
                }
            } catch (error) {
                console.log('⚠️ Initial API test failed - calendar will work but without API data');
            }
        }, 1000);
    }

    /**
     * Bind all event handlers
     */
    bindEvents() {
        try {
            // Navigation buttons - with safe access
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const todayBtn = document.getElementById('todayBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const mobileView = document.getElementById('mobileView');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                    this.render();
                    this.uiManager.updateTodayButton(this.currentDate);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                    this.render();
                    this.uiManager.updateTodayButton(this.currentDate);
                });
            }

            if (todayBtn) {
                todayBtn.addEventListener('click', () => {
                    this.currentDate = new Date();
                    this.render();
                    this.uiManager.scrollToTodayOnMobile();
                    this.uiManager.updateTodayButton(this.currentDate);
                });
            }

            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.apiClient.clearCache();
                    this.loadAPIData();
                });
            }

            // Mobile infinite scroll
            if (mobileView) {
                mobileView.addEventListener('scroll', () => {
                    if (mobileView.scrollTop + mobileView.clientHeight >= mobileView.scrollHeight - 100) {
                        this.uiManager.loadMoreMobileDays(this.currentDate);
                        this.uiManager.renderEvents(this.events);
                    }
                });
            }

            console.log('✅ Event handlers bound successfully');
        } catch (error) {
            console.error('❌ Error binding events:', error);
        }
    }

    /**
     * Load API data for current view
     */
    async loadAPIData() {
        if (this.apiClient.isLoading) return;
        
        this.apiClient.isLoading = true;
        this.uiManager.updateStatus('Loading...', 'loading');
        
        try {
            const currentYear = this.currentDate.getFullYear();
            
            // Load year data if not cached
            await this.apiClient.loadYearData(currentYear);
            
            // Get displayed dates and populate from cache
            const datesToShow = this.uiManager.getDisplayedDates(this.currentDate);
            const cachedData = this.apiClient.getCachedData(currentYear, datesToShow);
            let loadedCount = 0;
            
            // Clear existing API events
            this.clearAPIEvents();
            
            // Process cached data
            Object.entries(cachedData).forEach(([dateKey, ordoData]) => {
                const events = this.apiClient.extractEventsFromOrdo(ordoData, dateKey);
                events.forEach(event => {
                    this.addEventToMap(dateKey, {
                        ...event,
                        apiEvent: true
                    });
                });
                loadedCount++;
            });
            
            this.uiManager.updateStatus(`${loadedCount} days loaded`, 'success');
            this.uiManager.renderEvents(this.events);
            
        } catch (error) {
            console.error('API Error:', error);
            this.uiManager.updateStatus('API Error', 'error');
        } finally {
            this.apiClient.isLoading = false;
        }
    }

    /**
     * Clear API events from memory
     */
    clearAPIEvents() {
        this.events.forEach((eventList, dateKey) => {
            this.events.set(dateKey, eventList.filter(event => !event.apiEvent));
            if (this.events.get(dateKey).length === 0) {
                this.events.delete(dateKey);
            }
        });
    }

    /**
     * Render entire calendar
     */
    render() {
        this.uiManager.renderHeader(this.currentDate);
        this.uiManager.renderDesktopView(this.currentDate);
        this.uiManager.renderMobileView(this.currentDate);
        this.uiManager.updateTodayButton(this.currentDate);
        
        // Load API data after calendar is built
        this.loadAPIData();
    }

    /**
     * Add event to internal map
     */
    addEventToMap(dateKey, event) {
        if (!this.events.has(dateKey)) {
            this.events.set(dateKey, []);
        }
        this.events.get(dateKey).push(event);
    }

    // Public API methods for external use

    /**
     * Add a single event
     */
    addEvent(date, event) {
        const dateKey = typeof date === 'string' ? date : this.uiManager.formatDateKey(date);
        this.addEventToMap(dateKey, event);
        this.uiManager.renderEvents(this.events);
    }

    /**
     * Add multiple events
     */
    addEvents(eventsData) {
        eventsData.forEach(eventData => {
            this.addEvent(eventData.date, {
                title: eventData.title,
                color: eventData.color,
                onClick: eventData.onClick
            });
        });
    }

    /**
     * Clear all events
     */
    clearEvents() {
        this.events.clear();
        this.uiManager.renderEvents(this.events);
    }

    /**
     * Debug information
     */
    debugAPI() {
        const cacheInfo = this.apiClient.getCacheInfo();
        const debugInfo = {
            environment: ENV,
            apiUrl: this.apiClient.apiBaseUrl,
            eventsCount: this.events.size,
            cacheInfo: cacheInfo,
            currentDate: this.uiManager.formatDateKey(this.currentDate),
            keyboardNavigation: this.keyboardNav ? 'enabled' : 'disabled'
        };
        
        console.log('🔍 Calendar Debug Info:', debugInfo);
        return debugInfo;
    }

    /**
     * Test API connection
     */
    async testAPI() {
        console.log('🧪 Testing API connection...');
        return await this.apiClient.testConnection();
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize calendar
        const calendar = new APICalendar();

        // Expose calendar globally for debugging
        window.calendar = calendar;

        // Console helpers
        console.log('📅 Calendar initialized');
        console.log('🔧 Debug methods available:');
        console.log('  - calendar.debugAPI() - Show debug info');
        console.log('  - calendar.testAPI() - Test API connection');
        console.log('  - calendar.loadAPIData() - Refresh calendar data');
        console.log('  - calendar.clearEvents() - Clear all events');
        console.log('⌨️ Keyboard shortcuts:');
        console.log('  - ←/→ or H/L: Change month');
        console.log('  - ↑/↓ or J/K: Change year');
        console.log('  - T: Today, R: Refresh, G: Today (Vim)');
    } catch (error) {
        console.error('❌ Failed to initialize calendar:', error);
        console.error('Stack trace:', error.stack);
    }
});
