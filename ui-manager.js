/**
 * Enhanced UI Manager for handling all user interface operations
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
            feastText.className = 'feast-text clickable-feast';
            feastText.textContent = ''; // Will be populated by API
            feastText.style.cursor = 'pointer';
            feastText.title = 'Click to view details';

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
            feastText.className = 'feast-text clickable-feast';
            feastText.textContent = ''; // Will be populated by API
            feastText.style.cursor = 'pointer';
            feastText.title = 'Click to view details';

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
            feastText.className = 'feast-text clickable-feast';
            feastText.textContent = ''; // Will be populated by API
            feastText.style.cursor = 'pointer';
            feastText.title = 'Click to view details';

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
     * Render events on calendar with enhanced ordo data handling
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
            
            if (apiEvent && apiEvent.ordoData) {
                // Update liturgical color
                if (colorIndicator) {
                    colorIndicator.style.backgroundColor = apiEvent.color || '#28a745';
                }
                
                // Update feast text and make it clickable
                if (feastText) {
                    const feastName = apiEvent.ordoData.feast_name || 
                                    apiEvent.ordoData.liturgical_season || 
                                    'Ordo Day';
                    feastText.textContent = feastName;
                    
                    // Add click handler for detailed view
                    feastText.onclick = (e) => {
                        e.stopPropagation();
                        this.showOrdoDetails(apiEvent.ordoData, dateKey);
                    };
                    
                    // Add visual feedback
                    feastText.addEventListener('mouseenter', () => {
                        feastText.style.textDecoration = 'underline';
                    });
                    
                    feastText.addEventListener('mouseleave', () => {
                        feastText.style.textDecoration = 'none';
                    });
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
     * Show detailed ordo information modal
     */
    showOrdoDetails(ordoData, dateKey) {
        const modal = document.getElementById('eventModal');
        const content = document.getElementById('modalContent');
        
        let html = `<div class="ordo-modal-content">`;
        
        // Header with date and main feast
        html += `<div class="ordo-header">`;
        html += `<h2>${this.formatDisplayDate(new Date(dateKey))}</h2>`;
        if (ordoData.feast_name) {
            html += `<h3 class="feast-name">${ordoData.feast_name}</h3>`;
        }
        html += `</div>`;
        
        // Basic liturgical information
        html += `<div class="ordo-section">`;
        html += `<h4>Liturgical Information</h4>`;
        
        if (ordoData.liturgical_season) {
            html += `<p><strong>Season:</strong> ${ordoData.liturgical_season}</p>`;
        }
        
        if (ordoData.liturgical_color) {
            html += `<p><strong>Liturgical Color:</strong> <span style="display: inline-block; width: 20px; height: 20px; background-color: ${this.getLiturgicalColorCode(ordoData.liturgical_color)}; border: 1px solid #ccc; margin-left: 5px; vertical-align: middle;"></span> ${ordoData.liturgical_color}</p>`;
        }
        
        if (ordoData.feast_rank) {
            html += `<p><strong>Rank:</strong> ${ordoData.feast_rank}</p>`;
        }
        
        // Special day indicators
        const specialDays = [];
        if (ordoData.is_sunday) specialDays.push('Sunday');
        if (ordoData.is_holy_day) specialDays.push('Holy Day');
        if (ordoData.is_fast_day) specialDays.push('Fast Day');
        if (ordoData.is_ember_day) specialDays.push('Ember Day');
        
        if (specialDays.length > 0) {
            html += `<p><strong>Special Day:</strong> ${specialDays.join(', ')}</p>`;
        }
        
        html += `</div>`;
        
        // Commemorations
        if (ordoData.commemorations && ordoData.commemorations.length > 0) {
            html += `<div class="ordo-section">`;
            html += `<h4>Commemorations</h4>`;
            ordoData.commemorations.forEach(comm => {
                html += `<div class="commemoration">`;
                html += `<strong>${comm.name}</strong>`;
                if (comm.rank) html += ` (${comm.rank})`;
                if (comm.notes) html += `<br><em>${comm.notes}</em>`;
                html += `</div>`;
            });
            html += `</div>`;
        }
        
        // Mass Proper
        if (ordoData.mass_proper) {
            html += `<div class="ordo-section">`;
            html += `<h4>Mass Proper</h4>`;
            
            const massProper = ordoData.mass_proper;
            
            if (massProper.collect) {
                html += `<div class="mass-part"><strong>Collect:</strong> ${massProper.collect}</div>`;
            }
            
            if (massProper.epistle) {
                html += `<div class="mass-part">`;
                html += `<strong>Epistle:</strong> `;
                if (massProper.epistle.reference) {
                    html += `${massProper.epistle.reference}`;
                }
                if (massProper.epistle.text) {
                    html += `<br><em>${massProper.epistle.text}</em>`;
                }
                html += `</div>`;
            }
            
            if (massProper.gradual) {
                html += `<div class="mass-part"><strong>Gradual:</strong> ${massProper.gradual}</div>`;
            }
            
            if (massProper.gospel) {
                html += `<div class="mass-part">`;
                html += `<strong>Gospel:</strong> `;
                if (massProper.gospel.reference) {
                    html += `${massProper.gospel.reference}`;
                }
                if (massProper.gospel.text) {
                    html += `<br><em>${massProper.gospel.text}</em>`;
                }
                html += `</div>`;
            }
            
            if (massProper.offertory) {
                html += `<div class="mass-part"><strong>Offertory:</strong> ${massProper.offertory}</div>`;
            }
            
            if (massProper.secret) {
                html += `<div class="mass-part"><strong>Secret:</strong> ${massProper.secret}</div>`;
            }
            
            if (massProper.communion) {
                html += `<div class="mass-part"><strong>Communion:</strong> ${massProper.communion}</div>`;
            }
            
            if (massProper.postcommunion) {
                html += `<div class="mass-part"><strong>Postcommunion:</strong> ${massProper.postcommunion}</div>`;
            }
            
            html += `</div>`;
        }
        
        // Debug information (collapsible)
        if (ordoData.notes || ordoData.feast_id) {
            html += `<div class="ordo-section">`;
            html += `<details>`;
            html += `<summary style="cursor: pointer; font-weight: bold;">Debug Information</summary>`;
            if (ordoData.feast_id) {
                html += `<p><strong>Feast ID:</strong> ${ordoData.feast_id}</p>`;
            }
            if (ordoData.notes) {
                html += `<p><strong>Notes:</strong> ${ordoData.notes}</p>`;
            }
            html += `</details>`;
            html += `</div>`;
        }
        
        html += `</div>`;
        
        // Add some basic styling
        html += `<style>
            .ordo-modal-content {
                max-height: 80vh;
                overflow-y: auto;
            }
            .ordo-header {
                border-bottom: 2px solid #dee2e6;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
            }
            .ordo-header h2 {
                margin: 0 0 0.5rem 0;
                color: #495057;
            }
            .ordo-header h3.feast-name {
                margin: 0;
                color: #6f42c1;
                font-style: italic;
            }
            .ordo-section {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background-color: #f8f9fa;
                border-radius: 0.25rem;
            }
            .ordo-section h4 {
                margin-top: 0;
                margin-bottom: 0.75rem;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 0.25rem;
            }
            .commemoration {
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background-color: white;
                border-left: 3px solid #6f42c1;
                border-radius: 0.25rem;
            }
            .mass-part {
                margin-bottom: 1rem;
                padding: 0.75rem;
                background-color: white;
                border-radius: 0.25rem;
                border: 1px solid #e9ecef;
            }
            .mass-part strong {
                color: #6f42c1;
            }
        </style>`;
        
        content.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * Get liturgical color hex code
     */
    getLiturgicalColorCode(colorName) {
        const color = (colorName || '').toLowerCase();
        
        switch (color) {
            case 'red': return '#dc3545';
            case 'white': return '#f8f9fa';
            case 'green': return '#28a745';
            case 'purple':
            case 'violet': return '#6f42c1';
            case 'rose':
            case 'pink': return '#e83e8c';
            case 'gold': return '#ffc107';
            case 'black': return '#343a40';
            default: return '#28a745';
        }
    }

    /**
     * Format date for display
     */
    formatDisplayDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Show event details modal (legacy support)
     */
    showEventDetails(event) {
        const modal = document.getElementById('eventModal');
        const content = document.getElementById('modalContent');
        
        let html = `<h3>${event.title}</h3>`;
        html += `<p><strong>Date:</strong> ${event.date}</p>`;
        
        if (event.ordoData) {
            // Use the new detailed view for ordo data
            this.showOrdoDetails(event.ordoData, event.date);
            return;
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
