// Modern PDF Print Formatter for Liturgical Calendar
class PrintFormatter {
    constructor() {
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 15; // Margin in mm
        this.colors = {
            primary: [37, 99, 235], // Blue
            text: [15, 23, 42], // Dark gray
            secondary: [100, 116, 139], // Light gray
            border: [226, 232, 240], // Very light gray
            liturgical: {
                white: [248, 249, 250],
                red: [220, 38, 38],
                green: [5, 150, 105],
                purple: [124, 58, 237],
                black: [55, 65, 81],
                rose: [236, 72, 153],
                gold: [245, 158, 11]
            }
        };
    }

    async generateMonthPDF(year, month, dayData, options = {}) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: options.landscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set up document properties
        pdf.setProperties({
            title: `Liturgical Calendar - ${this.getMonthName(month)} ${year}`,
            subject: 'Liturgical Calendar',
            author: 'OrdoTools Calendar',
            creator: 'Modern Liturgical Calendar'
        });

        // Configure for orientation
        if (options.landscape) {
            this.pageWidth = 297;
            this.pageHeight = 210;
        }

        this.generateMonthPage(pdf, year, month, dayData, options);

        // Download the PDF
        const filename = `liturgical-calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`;
        pdf.save(filename);
    }

    async generateYearPDF(year, dayData, options = {}) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: options.landscape ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set up document properties
        pdf.setProperties({
            title: `Liturgical Calendar - ${year}`,
            subject: 'Liturgical Calendar',
            author: 'OrdoTools Calendar',
            creator: 'Modern Liturgical Calendar'
        });

        // Configure for orientation
        if (options.landscape) {
            this.pageWidth = 297;
            this.pageHeight = 210;
        }

        // Generate title page
        this.generateTitlePage(pdf, year, options);

        // Generate each month
        for (let month = 0; month < 12; month++) {
            if (month > 0 || !options.compact) {
                pdf.addPage();
            }
            this.generateMonthPage(pdf, year, month, dayData, options);
        }

        // Download the PDF
        const filename = `liturgical-calendar-${year}.pdf`;
        pdf.save(filename);
    }

    generateTitlePage(pdf, year, options) {
        const centerX = this.pageWidth / 2;
        const centerY = this.pageHeight / 2;

        // Title
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...this.colors.primary);
        pdf.text('Liturgical Calendar', centerX, centerY - 30, { align: 'center' });

        // Year
        pdf.setFontSize(36);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...this.colors.text);
        pdf.text(year.toString(), centerX, centerY, { align: 'center' });

        // Subtitle
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...this.colors.secondary);
        pdf.text('Generated from OrdoTools', centerX, centerY + 20, { align: 'center' });

        // Date generated
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pdf.setFontSize(10);
        pdf.text(`Generated on ${dateStr}`, centerX, this.pageHeight - this.margin, { align: 'center' });
    }

    generateMonthPage(pdf, year, month, dayData, options) {
        const monthName = this.getMonthName(month);
        const startY = this.margin + 20;

        // Month header
        this.drawMonthHeader(pdf, monthName, year, startY);

        // Calendar grid
        const gridStartY = startY + 15;
        this.drawCalendarGrid(pdf, year, month, dayData, gridStartY, options);

        // Footer with page number
        pdf.setFontSize(8);
        pdf.setTextColor(...this.colors.secondary);
        pdf.text(
            `Page ${pdf.internal.getNumberOfPages()}`,
            this.pageWidth - this.margin,
            this.pageHeight - 5,
            { align: 'right' }
        );
    }

    drawMonthHeader(pdf, monthName, year, y) {
        // Month and year title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...this.colors.primary);
        pdf.text(`${monthName} ${year}`, this.pageWidth / 2, y, { align: 'center' });

        // Draw line under header
        pdf.setDrawColor(...this.colors.border);
        pdf.setLineWidth(0.5);
        pdf.line(this.margin, y + 5, this.pageWidth - this.margin, y + 5);
    }

    drawCalendarGrid(pdf, year, month, dayData, startY, options) {
        const gridWidth = this.pageWidth - (2 * this.margin);
        const cellWidth = gridWidth / 7;
        const cellHeight = options.compact ? 20 : 25;
        const headerHeight = 8;

        // Draw day headers
        const dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        pdf.setFontSize(options.compact ? 8 : 10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...this.colors.text);

        for (let i = 0; i < 7; i++) {
            const x = this.margin + (i * cellWidth);
            
            // Header background
            pdf.setFillColor(248, 250, 252);
            pdf.rect(x, startY, cellWidth, headerHeight, 'F');
            
            // Header border
            pdf.setDrawColor(...this.colors.border);
            pdf.setLineWidth(0.2);
            pdf.rect(x, startY, cellWidth, headerHeight);
            
            // Header text
            pdf.text(dayHeaders[i], x + cellWidth / 2, startY + 6, { align: 'center' });
        }

        // Calculate calendar days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Draw calendar cells
        let currentY = startY + headerHeight;
        let dayCount = 1 - startOffset;
        
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const x = this.margin + (day * cellWidth);
                const cellDate = new Date(year, month, dayCount);
                const isCurrentMonth = cellDate.getMonth() === month;
                const dateKey = this.formatDateKey(cellDate);
                const dayInfo = dayData[dateKey];

                // Cell background
                if (isCurrentMonth) {
                    pdf.setFillColor(255, 255, 255);
                } else {
                    pdf.setFillColor(250, 250, 250);
                }
                pdf.rect(x, currentY, cellWidth, cellHeight, 'F');

                // Cell border
                pdf.setDrawColor(...this.colors.border);
                pdf.setLineWidth(0.2);
                pdf.rect(x, currentY, cellWidth, cellHeight);

                // Liturgical color indicator
                if (options.includeColors && dayInfo && dayInfo.liturgical_color) {
                    const color = this.colors.liturgical[dayInfo.liturgical_color.toLowerCase()];
                    if (color) {
                        pdf.setFillColor(...color);
                        pdf.rect(x, currentY, 3, cellHeight, 'F');
                    }
                }

                if (isCurrentMonth) {
                    // Day number
                    pdf.setFontSize(options.compact ? 10 : 12);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(...this.colors.text);
                    pdf.text(cellDate.getDate().toString(), x + 3, currentY + 8);

                    // Feast information
                    if (dayInfo) {
                        this.drawFeastInfo(pdf, dayInfo, x, currentY, cellWidth, cellHeight, options);
                    }
                } else {
                    // Other month day number (lighter)
                    pdf.setFontSize(options.compact ? 8 : 10);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(180, 180, 180);
                    pdf.text(cellDate.getDate().toString(), x + 3, currentY + 8);
                }

                dayCount++;
            }
            currentY += cellHeight;
        }
    }

    drawFeastInfo(pdf, dayInfo, x, y, cellWidth, cellHeight, options) {
        const textStartY = y + (options.compact ? 14 : 16);
        const maxWidth = cellWidth - 6;
        const lineHeight = options.compact ? 3 : 4;

        // Feast name
        if (dayInfo.feast_name || dayInfo.liturgical_season) {
            const feastText = dayInfo.feast_name || dayInfo.liturgical_season;
            pdf.setFontSize(options.compact ? 6 : 7);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...this.colors.text);
            
            const lines = this.wrapText(pdf, feastText, maxWidth);
            for (let i = 0; i < Math.min(lines.length, 2); i++) {
                pdf.text(lines[i], x + 3, textStartY + (i * lineHeight));
            }
        }

        // Feast rank
        if (dayInfo.feast_rank && !options.compact) {
            pdf.setFontSize(5);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(...this.colors.secondary);
            pdf.text(dayInfo.feast_rank, x + 3, y + cellHeight - 2);
        }

        // Special day indicators
        let indicatorX = x + cellWidth - 8;
        if (dayInfo.is_holy_day) {
            pdf.setFillColor(...this.colors.liturgical.gold);
            pdf.circle(indicatorX, y + 4, 1, 'F');
            indicatorX -= 4;
        }
        if (dayInfo.is_fast_day) {
            pdf.setFillColor(...this.colors.liturgical.purple);
            pdf.circle(indicatorX, y + 4, 1, 'F');
            indicatorX -= 4;
        }
        if (dayInfo.is_ember_day) {
            pdf.setFillColor(...this.colors.liturgical.green);
            pdf.circle(indicatorX, y + 4, 1, 'F');
        }
    }

    wrapText(pdf, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = pdf.getTextWidth(testLine);
            
            if (textWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    getMonthName(month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month];
    }

    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}