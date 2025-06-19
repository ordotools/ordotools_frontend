/**
 * UI Manager for handling all user interface operations
 */
class UIManager {
    constructor() {
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
        this.setupEnvironmentIndicator();
        this.setupModal();
    }

    /**
     * Setup environment indicator
     */
    setupEnvironmentIndicator() {
        const envIndicator = document.getElementById('envIndicator');
        envIndicator.textContent = ENV === 'development' ? 'DEV' : 'PROD';
        envIndicator.className = `env-indicator env-${ENV}`;
    }

    /**
     * Setup modal event handlers
     */
    setupModal() {
        const modal = document.getElementById('eventModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Update status indicator
     */
    updateStatus(status, type = 'success') {
        const indicator = document.getElementById('statusIndicator');
        indicator.textContent = status;
        indicator.className = `status-indicator status-${type}`;
    }

    /**
     * Render calendar header
     */
    renderHeader(currentDate) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('monthName').textContent = monthNames[currentDate.getMonth()];
        document.getElementById('yearName').textContent = currentDate.getFullYear();
    }

    /**
     * Calculate optimal number of weeks to display
     */
    calculateWeeksNeeded(currentDate) {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startOffset = firstDay.getDay(); // Days from Sunday to first day
        const daysInMonth = lastDay.getDate();
        const totalCells = startOffset + daysInMonth;
        
        // Need 6 weeks if we have more than 35 cells, otherwise 5 weeks
        return totalCells > 35 ? 6 : 5;
    }

    /**
     * Render desktop calendar view
     */
    renderDesktopView(currentDate) {
        const desktopView = document.getElementById('desktopView');
        const existingCells = desktopView.querySelectorAll('.day-cell');
        existingCells.forEach(cell => cell.remove());

        const weeksNeeded = this.calculateWeeksNeeded(currentDate);
        const totalCells = weeksNeeded * 7;

        // Add CSS class based on number of weeks
        desktopView.className = `desktop-view ${weeksNeeded === 5 ? 'five-weeks' : 'six-weeks'}`;

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < totalCells; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.dataset.date = this.formatDateKey(cellDate);
            
            if (cellDate.getMonth() !== currentDate.getMonth()) {
                dayCell.classList.add('other-month');
            }
            
            if (cellDate.getTime() === this.today.getTime()) {
                dayCell.classList.add('today');
            }

            // Create header section with date, feast text, and color indicator
            const headerSection = document.createElement('div');
            headerSection.className = 'day-header-section';

            const headerContent = document.createElement('div');
            headerContent.className = 'day-header-content';

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = cellDate.getDate();

            const feastText = document.createElement('div');
            feastText.className = 'feast-text';
            feastText.textContent = ''; // Will be populated by API

            const colorIndicator = document.createElement('div');
            colorIndicator.className = 'liturgical-color';
            colorIndicator.style.backgroundColor = '#28a745'; // Default green, will be updated by API

            headerContent.appendChild(dayNumber);
            headerContent.appendChild(feastText);
            headerSection.appendChild(headerContent);
            headerSection.appendChild(colorIndicator);
            dayCell.appendChild(headerSection);

            desktopView.appendChild(dayCell);
        }
    }

    /**
     * Render mobile calendar view
     */
    renderMobileView(currentDate) {
        const mobileView = document.getElementById('mobileView');
        mobileView.innerHTML = '';
        
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        for (let i = 0; i < 30; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const mobileDay = document.createElement('div');
            mobileDay.className = 'mobile-day';
            mobileDay.dataset.date = this.formatDateKey(cellDate);
            
            if (cellDate.getTime() === this.today.getTime()) {
                mobileDay.classList.add('today');
            }

            // Create header section with date, feast text, and color indicator
            const headerSection = document.createElement('div');
            headerSection.className = 'day-header-section';
            headerSection.style.margin = '-15px -15px 10px -15px';
            headerSection.style.padding = '8px 15px';

            const headerContent = document.createElement('div');
            headerContent.className = 'day-header-content';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'mobile-day-header';
            dayHeader.textContent = this.formatMobileDate(cellDate);

            const feastText = document.createElement('div');
            feastText.className = 'feast-text';
            feastText.textContent = ''; // Will be populated by API

            const colorIndicator = document.createElement('div');
            colorIndicator.className = 'liturgical-color';
            colorIndicator.style.backgroundColor = '#28a745'; // Default green, will be updated by API

            headerContent.appendChild(dayHeader);
            headerContent.appendChild(feastText);
            headerSection.appendChild(headerContent);
            headerSection.appendChild(colorIndicator);
            mobileDay.appendChild(headerSection);

            mobileView.appendChild(mobileDay);
        }
    }

    /**
     * Add more days to mobile view (infinite scroll)
     */
    loadMoreMobileDays(currentDate) {
        const mobileView = document.getElementById('mobileView');
        const lastDay = mobileView.lastElementChild;
        if (!lastDay) return;

        const lastDate = new Date(currentDate);
        lastDate.setDate(lastDate.getDate() + mobileView.children.length);

        for (let i = 0; i < 15; i++) {
            const cellDate = new Date(lastDate);
            cellDate.setDate(lastDate.getDate() + i);
            
            const mobileDay = document.createElement('div');
            mobileDay.className = 'mobile-day';
            mobileDay.dataset.date = this.formatDateKey(cellDate);

            // Create header section with date, feast text, and color indicator
            const headerSection = document.createElement('div');
            headerSection.className = 'day-header-section';
            headerSection.style.margin = '-15px -15px 10px -15px';
            headerSection.style.padding = '8px 15px';

            const headerContent = document.createElement('div');
            headerContent.className = 'day-header-content';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'mobile-day-header';
            dayHeader.textContent = this.formatMobileDate(cellDate);

            const feastText = document.createElement('div');
            feastText.className = 'feast-text';
            feastText.textContent = ''; // Will be populated by API

            const colorIndicator = document.createElement('div');
            colorIndicator.className = 'liturgical-color';
            colorIndicator.style.backgroundColor = '#28a745'; // Default green, will be updated by API

            headerContent.appendChild(dayHeader);
            headerContent.appendChild(feastText);
            headerSection.appendChild(headerContent);
            headerSection.appendChild(colorIndicator);
            mobileDay.appendChild(headerSection);

            mobileView.appendChild(mobileDay);
        }
    }

    /**
     * Render events on calendar
     */
    renderEvents(eventsMap) {
        // Clear existing events from display (but preserve header sections)
        document.querySelectorAll('.event').forEach(el => el.remove());
        
        // Render events for all visible days
        document.querySelectorAll('[data-date]').forEach(container => {
            const dateKey = container.dataset.date;
            const dayEvents = eventsMap.get(dateKey) || [];
            
            // Update liturgical color indicator and feast text if we have API events
            const colorIndicator = container.querySelector('.liturgical-color');
            const feastText = container.querySelector('.feast-text');
            const apiEvent = dayEvents.find(event => event.apiEvent);
            
            if (apiEvent) {
                if (colorIndicator) {
                    colorIndicator.style.backgroundColor = apiEvent.color || '#28a745';
                }
                if (feastText) {
                    feastText.textContent = apiEvent.title || '';
                }
            }
            
            // Only render non-API events as separate event elements
            dayEvents.filter(event => !event.apiEvent).forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.textContent = event.title;
                
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventDetails(event);
                });
                container.appendChild(eventElement);
            });
        });
    }

    /**
     * Show event details modal
     */
    showEventDetails(event) {
        const modal = document.getElementById('eventModal');
        const content = document.getElementById('modalContent');
        
        let html = `<h3>${event.title}</h3>`;
        html += `<p><strong>Date:</strong> ${event.date}</p>`;
        
        if (event.ordoData) {
            const data = event.ordoData;
            if (data.liturgical_season) html += `<p><strong>Season:</strong> ${data.liturgical_season}</p>`;
            if (data.liturgical_color) html += `<p><strong>Color:</strong> ${data.liturgical_color}</p>`;
            if (data.feast_rank) html += `<p><strong>Rank:</strong> ${data.feast_rank}</p>`;
            if (data.saint_of_day) html += `<p><strong>Saint:</strong> ${data.saint_of_day}</p>`;
            if (data.commemorations && data.commemorations.length > 0) {
                html += `<p><strong>Commemorations:</strong> ${data.commemorations.join(', ')}</p>`;
            }
            if (data.notes) html += `<p><strong>Notes:</strong> ${data.notes}</p>`;
        }
        
        content.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * Hide date picker (keeping for compatibility)
     */
    hideDatePicker() {
        // No-op since date picker is removed
    }

    /**
     * Update today button visibility
     */
    updateTodayButton(currentDate) {
        const todayBtn = document.getElementById('todayBtn');
        const isCurrentMonth = currentDate.getMonth() === this.today.getMonth() && 
                             currentDate.getFullYear() === this.today.getFullYear();
        
        if (window.innerWidth <= 768) {
            todayBtn.style.display = 'block';
        } else {
            todayBtn.style.display = isCurrentMonth ? 'none' : 'block';
        }
    }

    /**
     * Scroll to today on mobile
     */
    scrollToTodayOnMobile() {
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const todayElement = document.querySelector('.mobile-day.today');
                if (todayElement) {
                    todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }

    /**
     * Get displayed dates for current view
     */
    getDisplayedDates(currentDate) {
        const dates = [];
        const weeksNeeded = this.calculateWeeksNeeded(currentDate);
        const totalCells = weeksNeeded * 7;
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Get all dates displayed in the calendar grid
        for (let i = 0; i < totalCells; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            dates.push(this.formatDateKey(cellDate));
        }

        return dates;
    }

    /**
     * Format date for mobile display
     */
    formatMobileDate(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }

    /**
     * Format date as key (YYYY-MM-DD)
     */
    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}
