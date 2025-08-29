# Modern Liturgical Calendar

A beautiful, responsive liturgical calendar application that displays liturgical information from OrdoTools. Completely rebuilt with modern web technologies for an exceptional user experience.

## ✨ Features

### 🎨 Modern Design
- Clean, minimalist interface with beautiful typography
- Responsive design that works perfectly on all devices
- Smooth animations and hover effects
- Professional color scheme with liturgical color indicators
- Dark mode support (automatic based on system preference)

### 📅 Robust Calendar
- **Desktop View**: Full calendar grid with detailed day information
- **Mobile View**: Optimized list view for smaller screens
- **Navigation**: Easy month/year navigation with keyboard shortcuts
- **Today Button**: Quick navigation back to current date
- **Day Details**: Click any day to see detailed liturgical information

### 🔧 Advanced Features
- **Settings Panel**: Customize display options
  - Toggle feast ranks display
  - Show/hide liturgical colors
  - Control commemorations display
- **Smart Caching**: Intelligent data caching for fast performance
- **PDF Export**: Generate beautiful PDFs of calendar data
  - Current month or entire year
  - Compact or standard layouts
  - Landscape or portrait orientation
  - Include liturgical colors
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Complete accessibility features

### 🌐 Data Integration
- **OrdoTools API**: Seamless integration with liturgical data
- **Offline Support**: Cached data available when offline
- **Fast Loading**: Optimized data fetching and caching
- **Error Handling**: Graceful error handling with retry options

## 🚀 Usage

### Basic Navigation
- Use arrow buttons or arrow keys to navigate months
- Click "Today" or press `T` to return to current date
- Click any day to view detailed information

### Keyboard Shortcuts
- `←` / `→` : Navigate months
- `Home` / `T` : Go to today
- `Ctrl+S` : Open settings
- `Ctrl+P` : Open PDF export
- `Escape` : Close modals

### Mobile Experience
- Optimized list view for mobile devices
- Touch-friendly interface
- Swipe gestures supported
- Automatic responsive layout switching

## 🔧 Technical Details

### Architecture
- **Modern JavaScript**: ES6+ with class-based architecture
- **CSS Grid & Flexbox**: Modern layout techniques
- **Web APIs**: Fetch, LocalStorage, Intersection Observer
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

### Performance
- **Smart Caching**: 7-day cache with automatic cleanup
- **Lazy Loading**: Load data only when needed
- **Request Deduplication**: Prevent duplicate API calls
- **Optimized Rendering**: Batch DOM updates for smooth performance

### Accessibility
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast Support**: Automatic high contrast mode
- **Reduced Motion**: Respects user motion preferences

### Browser Support
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Progressive Enhancement**: Graceful degradation for older browsers

## 📱 Device Support

### Desktop
- **Optimal Experience**: Full calendar grid view
- **Large Screens**: Supports up to 1400px container width
- **Keyboard Navigation**: Full keyboard support
- **Mouse Interactions**: Hover effects and click handlers

### Tablet
- **Responsive Layout**: Adapts to tablet screen sizes
- **Touch Support**: Touch-optimized interactions
- **Landscape/Portrait**: Works in both orientations

### Mobile
- **Optimized View**: Special mobile list layout
- **Touch-First**: Designed for touch interactions
- **Performance**: Optimized for mobile performance
- **PWA Ready**: Can be installed as Progressive Web App

## 🎨 Customization

### Liturgical Colors
The calendar displays liturgical colors as indicators:
- **White**: Major feasts, Christmas, Easter
- **Red**: Martyrs, Palm Sunday, Pentecost
- **Green**: Ordinary Time
- **Purple/Violet**: Advent, Lent
- **Rose/Pink**: Gaudete and Laetare Sundays
- **Gold**: Special solemnities
- **Black**: Good Friday, All Souls

### Display Options
Customize the calendar display through settings:
- **Feast Ranks**: Show liturgical rank information
- **Liturgical Colors**: Display color indicators
- **Commemorations**: Show additional saints and commemorations

## 📄 PDF Export

Generate professional PDF calendars with:
- **Month View**: Single month with detailed information
- **Year View**: Complete year overview
- **Layout Options**: Compact or standard layouts
- **Orientation**: Portrait or landscape
- **Colors**: Include or exclude liturgical color indicators

## 🔗 API Integration

### OrdoTools API
- **Endpoint**: `https://api-eky0.onrender.com`
- **Data Format**: Structured liturgical data with feast information
- **Caching**: Intelligent caching reduces API calls
- **Error Handling**: Graceful handling of API failures

### Data Structure
Each day includes:
- Feast name and liturgical season
- Feast rank and liturgical color
- Special day indicators (Holy Days, Fast Days, etc.)
- Mass readings and propers
- Commemorations and additional saints

## 🛠️ Development

### File Structure
```
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── app.js             # Main application logic
├── print-formatter.js  # PDF generation functionality
└── README.md          # This documentation
```

### Maintenance
- **Cache Management**: Automatic cleanup of expired cache
- **Error Logging**: Console logging for debugging
- **Performance Monitoring**: Built-in performance tracking
- **Settings Persistence**: User preferences saved locally

## 📄 License

This project integrates with OrdoTools for liturgical data. The calendar interface is designed for educational and liturgical use.

## 🤝 Contributing

This is a modern rebuild of the liturgical calendar. Contributions are welcome for:
- UI/UX improvements
- Additional liturgical features
- Performance optimizations
- Accessibility enhancements

## 📧 Support

For issues with the calendar interface, please check:
1. Browser compatibility
2. JavaScript enabled
3. Network connection for data loading
4. Cache management in settings

Built with ❤️ for the liturgical community.