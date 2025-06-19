/**
 * API Client for handling all server communication
 */
class APIClient {
    constructor() {
        this.apiBaseUrl = API_CONFIG.API_BASE_URL;
        this.ordoCache = new Map();
        this.isLoading = false;
    }

    /**
     * Test API connectivity
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/`);
            if (!response.ok) {
                throw new Error(`API test failed: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ API connection successful:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load year data from API
     */
    async loadYearData(year) {
        if (this.ordoCache.has(year)) {
            return this.ordoCache.get(year);
        }

        console.log(`📡 Loading data for year ${year}`);
        
        try {
            // Test connectivity first
            const testResult = await this.testConnection();
            if (!testResult.success) {
                throw new Error(`API not accessible: ${testResult.error}`);
            }
            
            const yearData = {};
            
            // Load data month by month for better compatibility
            for (let month = 0; month < 12; month++) {
                try {
                    const response = await fetch(`${this.apiBaseUrl}/month/${year}/${month + 1}`);
                    if (response.ok) {
                        const monthData = await response.json();
                        if (monthData.days && Array.isArray(monthData.days)) {
                            monthData.days.forEach(day => {
                                const dateKey = day.date;
                                yearData[dateKey] = day;
                            });
                        }
                    }
                } catch (monthError) {
                    console.warn(`Failed to load month ${month + 1}/${year}:`, monthError);
                }
            }
            
            console.log(`✅ Year ${year} loaded: ${Object.keys(yearData).length} days`);
            this.ordoCache.set(year, yearData);
            return yearData;
            
        } catch (error) {
            console.error(`❌ Failed to load year ${year}:`, error);
            throw error;
        }
    }

    /**
     * Get cached data for specific dates
     */
    getCachedData(year, dates) {
        const yearData = this.ordoCache.get(year) || {};
        const result = {};
        
        dates.forEach(dateKey => {
            if (yearData[dateKey]) {
                result[dateKey] = yearData[dateKey];
            }
        });
        
        return result;
    }

    /**
     * Extract events from ordo data
     */
    extractEventsFromOrdo(ordoData, dateKey) {
        if (!ordoData) {
            return [{
                title: 'No Data',
                color: '#6c757d',
                date: dateKey
            }];
        }

        let title = 'Ordo Data';
        let color = '#28a745';

        if (ordoData.feast_name) {
            title = ordoData.feast_name;
        } else if (ordoData.liturgical_season) {
            title = ordoData.liturgical_season;
        } else if (ordoData.saint_of_day) {
            title = ordoData.saint_of_day;
        }

        color = this.getLiturgicalColor(ordoData);

        return [{
            title: title,
            color: color,
            date: dateKey,
            ordoData: ordoData
        }];
    }

    /**
     * Get liturgical color based on data
     */
    getLiturgicalColor(data) {
        const color = (data.liturgical_color || '').toLowerCase();
        const season = (data.liturgical_season || '').toLowerCase();

        // Direct color mapping
        if (color === 'red') return '#dc3545';
        if (color === 'white') return '#f8f9fa';
        if (color === 'green') return '#28a745';
        if (color === 'purple' || color === 'violet') return '#6f42c1';
        if (color === 'rose' || color === 'pink') return '#e83e8c';
        if (color === 'gold') return '#ffc107';

        // Season-based colors
        if (season.includes('advent')) return '#6f42c1';
        if (season.includes('christmas')) return '#f8f9fa';
        if (season.includes('lent')) return '#6f42c1';
        if (season.includes('easter')) return '#f8f9fa';
        if (season.includes('ordinary')) return '#28a745';

        return '#28a745';
    }

    /**
     * Clear cached data
     */
    clearCache() {
        this.ordoCache.clear();
        console.log('🗑️ API cache cleared');
    }

    /**
     * Get cache info
     */
    getCacheInfo() {
        return {
            size: this.ordoCache.size,
            years: Array.from(this.ordoCache.keys()),
            totalDays: Array.from(this.ordoCache.values())
                .reduce((total, yearData) => total + Object.keys(yearData).length, 0)
        };
    }
}
