/**
 * Keyboard Navigation Handler for Calendar
 * Supports arrow keys and Vim-style navigation
 */
class KeyboardNavigation {
    constructor(calendar) {
        this.calendar = calendar;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        console.log('⌨️ Keyboard navigation initialized');
        console.log('🔧 Controls:');
        console.log('  - Left/Right Arrows or H/L: Change month');
        console.log('  - Up/Down Arrows or K/J: Change year');
        console.log('  - T: Go to today');
        console.log('  - R: Refresh data');
    }

    handleKeydown(e) {
        // Don't handle keyboard events if user is typing in an input, modal is open, etc.
        if (this.shouldIgnoreKeypress(e)) {
            return;
        }

        let handled = false;

        switch (e.key) {
            // Month navigation
            case 'ArrowLeft':
            case 'h':
            case 'H':
                this.changeMonth(-1);
                handled = true;
                break;

            case 'ArrowRight':
            case 'l':
            case 'L':
                this.changeMonth(1);
                handled = true;
                break;

            // Year navigation
            case 'ArrowUp':
            case 'k':
            case 'K':
                this.changeYear(-1);
                handled = true;
                break;

            case 'ArrowDown':
            case 'j':
            case 'J':
                this.changeYear(1);
                handled = true;
                break;

            // Additional shortcuts
            case 't':
            case 'T':
                this.goToToday();
                handled = true;
                break;

            case 'r':
            case 'R':
                this.refreshData();
                handled = true;
                break;

            // Vim-style page navigation
            case 'g':
                if (e.shiftKey) { // G (Shift+g)
                    this.goToToday();
                    handled = true;
                }
                break;
        }

        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    shouldIgnoreKeypress(e) {
        // Ignore if modal is open
        const modal = document.getElementById('eventModal');
        if (modal && modal.style.display === 'block') {
            return true;
        }

        // Ignore if user is typing in input elements
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        )) {
            return true;
        }

        return false;
    }

    changeMonth(delta) {
        this.calendar.currentDate.setMonth(this.calendar.currentDate.getMonth() + delta);
        this.calendar.render();
        this.calendar.uiManager.updateTodayButton(this.calendar.currentDate);
        
        if (API_CONFIG.DEBUG) {
            console.log(`📅 Month changed: ${this.calendar.uiManager.formatDateKey(this.calendar.currentDate)}`);
        }
    }

    changeYear(delta) {
        this.calendar.currentDate.setFullYear(this.calendar.currentDate.getFullYear() + delta);
        this.calendar.render();
        this.calendar.uiManager.updateTodayButton(this.calendar.currentDate);
        
        if (API_CONFIG.DEBUG) {
            console.log(`📅 Year changed: ${this.calendar.uiManager.formatDateKey(this.calendar.currentDate)}`);
        }
    }

    goToToday() {
        this.calendar.currentDate = new Date();
        this.calendar.render();
        this.calendar.uiManager.scrollToTodayOnMobile();
        this.calendar.uiManager.updateTodayButton(this.calendar.currentDate);
        
        if (API_CONFIG.DEBUG) {
            console.log('📅 Navigated to today');
        }
    }

    refreshData() {
        this.calendar.apiClient.clearCache();
        this.calendar.loadAPIData();
        
        if (API_CONFIG.DEBUG) {
            console.log('🔄 Data refreshed via keyboard');
        }
    }

    // Public method to temporarily disable keyboard navigation
    disable() {
        this.disabled = true;
    }

    // Public method to re-enable keyboard navigation
    enable() {
        this.disabled = false;
    }
}
