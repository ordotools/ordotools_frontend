/**
 * Enhanced API Client for handling all server communication with complete ordo data
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
     * Load year data from API with enhanced ordo information
     */
    async loadYearData(year) {
        if (this.ordoCache.has(year)) {
            return this.ordoCache.get(year);
        }

        console.log(`📡 Loading enhanced data for year ${year}`);
        
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
                                // Store the complete ordo data
                                yearData[dateKey] = day;
                            });
                        }
                    }
                } catch (monthError) {
                    console.warn(`Failed to load month ${month + 1}/${year}:`, monthError);
                }
            }
            
            console.log(`✅ Year ${year} loaded: ${Object.keys(yearData).length} days with enhanced data`);
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
     * Extract events from enhanced ordo data
     */
    extractEventsFromOrdo(ordoData, dateKey) {
        if (!ordoData) {
            return [{
                title: 'No Data',
                color: '#6c757d',
                date: dateKey,
                ordoData: null
            }];
        }

        // Determine the display title
        let title = 'Ordo Day';
        
        if (ordoData.feast_name) {
            title = ordoData.feast_name;
        } else if (ordoData.liturgical_season) {
            title = ordoData.liturgical_season;
        } else if (ordoData.saint_of_day) {
            title = ordoData.saint_of_day;
        }

        // Get liturgical color
        const color = this.getLiturgicalColor(ordoData);

        return [{
            title: title,
            color: color,
            date: dateKey,
            ordoData: ordoData, // Store complete ordo data
            apiEvent: true
        }];
    }

    /**
     * Enhanced liturgical color mapping
     */
    getLiturgicalColor(data) {
        const color = (data.liturgical_color || '').toLowerCase();
        const season = (data.liturgical_season || '').toLowerCase();
        const rank = (data.feast_rank || '').toLowerCase();

        // Direct color mapping with more comprehensive coverage
        switch (color) {
            case 'red':
                return '#dc3545';
            case 'white':
            case 'blanc':
                return '#f8f9fa';
            case 'green':
            case 'vert':
                return '#28a745';
            case 'purple':
            case 'violet':
            case 'pourpre':
                return '#6f42c1';
            case 'rose':
            case 'pink':
                return '#e83e8c';
            case 'gold':
            case 'golden':
                return '#ffc107';
            case 'black':
            case 'noir':
                return '#343a40';
        }

        // Season-based colors if direct color mapping fails
        if (season.includes('advent') || season.includes('avent')) {
            return '#6f42c1'; // Purple
        }
        if (season.includes('christmas') || season.includes('noel')) {
            return '#f8f9fa'; // White
        }
        if (season.includes('lent') || season.includes('careme')) {
            return '#6f42c1'; // Purple
        }
        if (season.includes('easter') || season.includes('paques')) {
            return '#f8f9fa'; // White
        }
        if (season.includes('ordinary') || season.includes('ordinaire')) {
            return '#28a745'; // Green
        }

        // Rank-based colors as fallback
        if (rank.includes('duplex') || rank.includes('totum duplex')) {
            return '#f8f9fa'; // White for high feasts
        }
        if (rank.includes('simplex')) {
            return '#28a745'; // Green for simple feasts
        }

        // Default to green
        return '#28a745';
    }

    /**
     * Get detailed ordo information for a specific date
     */
    async getDetailedOrdo(dateKey) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/day/${dateKey}`);
            if (response.ok) {
                const ordoData = await response.json();
                console.log(`📖 Detailed ordo data loaded for ${dateKey}:`, ordoData);
                return ordoData;
            } else {
                console.warn(`Failed to load detailed ordo for ${dateKey}: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error(`Error loading detailed ordo for ${dateKey}:`, error);
            return null;
        }
    }

    /**
     * Format commemoration for display
     */
    formatCommemorations(commemorations) {
        if (!commemorations || commemorations.length === 0) {
            return '';
        }

        return commemorations.map(comm => {
            let text = comm.name || 'Unnamed Commemoration';
            if (comm.rank) {
                text += ` (${comm.rank})`;
            }
            return text;
        }).join(', ');
    }

    /**
     * Format mass proper for display
     */
    formatMassProper(massProper) {
        if (!massProper) {
            return null;
        }

        const parts = [];
        
        if (massProper.collect) {
            parts.push(`Collect: ${massProper.collect}`);
        }
        
        if (massProper.epistle && massProper.epistle.reference) {
            parts.push(`Epistle: ${massProper.epistle.reference}`);
        }
        
        if (massProper.gospel && massProper.gospel.reference) {
            parts.push(`Gospel: ${massProper.gospel.reference}`);
        }

        return parts.length > 0 ? parts.join(' | ') : null;
    }

    /**
     * Check if a day has special significance
     */
    getSpecialDayIndicators(ordoData) {
        const indicators = [];
        
        if (ordoData.is_sunday) indicators.push('Sunday');
        if (ordoData.is_holy_day) indicators.push('Holy Day');
        if (ordoData.is_fast_day) indicators.push('Fast Day');
        if (ordoData.is_ember_day) indicators.push('Ember Day');
        
        // Check for high-ranking feasts
        const rank = (ordoData.feast_rank || '').toLowerCase();
        if (rank.includes('totum duplex')) {
            indicators.push('Totum Duplex');
        } else if (rank.includes('duplex')) {
            indicators.push('Duplex');
        }
        
        return indicators;
    }

    /**
     * Get summary text for a day
     */
    getDaySummary(ordoData) {
        let summary = ordoData.feast_name || ordoData.liturgical_season || 'Ordo Day';
        
        const commemorations = this.formatCommemorations(ordoData.commemorations);
        if (commemorations) {
            summary += ` (Comm: ${commemorations})`;
        }
        
        const indicators = this.getSpecialDayIndicators(ordoData);
        if (indicators.length > 0) {
            summary += ` [${indicators.join(', ')}]`;
        }
        
        return summary;
    }

    /**
     * Clear cached data
     */
    clearCache() {
        this.ordoCache.clear();
        console.log('🗑️ Enhanced API cache cleared');
    }

    /**
     * Get comprehensive cache info
     */
    getCacheInfo() {
        const cacheStats = {
            size: this.ordoCache.size,
            years: Array.from(this.ordoCache.keys()),
            totalDays: 0,
            totalFeasts: 0,
            totalCommemorations: 0,
            colorDistribution: {},
            rankDistribution: {}
        };

        // Analyze cached data
        Array.from(this.ordoCache.values()).forEach(yearData => {
            Object.values(yearData).forEach(dayData => {
                cacheStats.totalDays++;
                
                if (dayData.feast_name) {
                    cacheStats.totalFeasts++;
                }
                
                if (dayData.commemorations) {
                    cacheStats.totalCommemorations += dayData.commemorations.length;
                }
                
                // Track color distribution
                const color = dayData.liturgical_color || 'unknown';
                cacheStats.colorDistribution[color] = (cacheStats.colorDistribution[color] || 0) + 1;
                
                // Track rank distribution
                const rank = dayData.feast_rank || 'unknown';
                cacheStats.rankDistribution[rank] = (cacheStats.rankDistribution[rank] || 0) + 1;
            });
        });

        return cacheStats;
    }

    /**
     * Export ordo data for external use
     */
    exportOrdoData(year, format = 'json') {
        const yearData = this.ordoCache.get(year);
        if (!yearData) {
            console.warn(`No data cached for year ${year}`);
            return null;
        }

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(yearData, null, 2);
            
            case 'csv':
                const headers = ['Date', 'Feast Name', 'Rank', 'Color', 'Season', 'Commemorations'];
                const rows = [headers.join(',')];
                
                Object.entries(yearData).forEach(([date, data]) => {
                    const row = [
                        date,
                        data.feast_name || '',
                        data.feast_rank || '',
                        data.liturgical_color || '',
                        data.liturgical_season || '',
                        this.formatCommemorations(data.commemorations)
                    ];
                    rows.push(row.map(cell => `"${cell}"`).join(','));
                });
                
                return rows.join('\n');
            
            default:
                return yearData;
        }
    }

    /**
     * Search ordo data
     */
    searchOrdo(query, year = null) {
        const results = [];
        const searchLower = query.toLowerCase();
        
        const yearsToSearch = year ? [year] : Array.from(this.ordoCache.keys());
        
        yearsToSearch.forEach(searchYear => {
            const yearData = this.ordoCache.get(searchYear);
            if (!yearData) return;
            
            Object.entries(yearData).forEach(([date, data]) => {
                const searchableText = [
                    data.feast_name,
                    data.liturgical_season,
                    data.feast_rank,
                    data.saint_of_day,
                    this.formatCommemorations(data.commemorations)
                ].filter(Boolean).join(' ').toLowerCase();
                
                if (searchableText.includes(searchLower)) {
                    results.push({
                        date,
                        data,
                        summary: this.getDaySummary(data)
                    });
                }
            });
        });
        
        return results.sort((a, b) => a.date.localeCompare(b.date));
    }
}
