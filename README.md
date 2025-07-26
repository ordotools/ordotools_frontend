# Liturgical Calendar

A fast, accessible, and beautiful liturgical calendar that displays feasts from the ordotools API. Built with vanilla JavaScript and designed for simplicity, performance, and accessibility.

## 🌟 Features

### **Core Functionality**
- **Liturgical Calendar Display** - Shows feasts, liturgical seasons, and special days
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Offline Support** - Caches data locally and works without internet connection
- **Fast Loading** - Optimized for speed with efficient API calls and caching

### **Accessibility**
- **Screen Reader Support** - Full ARIA labels and semantic markup
- **Keyboard Navigation** - Complete keyboard accessibility with arrow keys
- **Focus Management** - Proper focus handling for all interactive elements
- **High Contrast** - Clean black and white design for excellent readability

### **User Experience**
- **Minimal Design** - Clean, distraction-free interface
- **Touch-Friendly** - Optimized for mobile touch interactions
- **Settings Panel** - Customizable display options
- **Detail Views** - Rich information for each liturgical day

## 🚀 Quick Start

### **Deployment**
Simply deploy the `index.html` file to any web server. The application is completely self-contained with no external dependencies.

### **Local Development**
1. Clone the repository
2. Open `index.html` in a web browser
3. The calendar will automatically load and display the current month

### **API Requirements**
The calendar connects to the ordotools API at `https://api-eky0.onrender.com` for liturgical data.

## 📱 Usage

### **Navigation**
- **Previous/Next Month** - Use the navigation buttons or arrow keys
- **Go to Today** - Click "Today" button or press `Home` key
- **Keyboard Shortcuts**:
  - `←/→` - Navigate between months
  - `Home` - Go to today
  - `Escape` - Close panels
  - `Enter/Space` - Open day details

### **Settings**
Click the ⚙️ button to access settings:
- **Show Feast Ranks** - Display liturgical feast ranks
- **Show Liturgical Colors** - Display colored borders for liturgical colors
- **Show Commemorations** - Display commemorations in detail views
- **Cache Management** - Clear cached data or test API connection

### **Day Details**
Click on any day to view detailed liturgical information including:
- Feast name and rank
- Liturgical season
- Special day indicators (Sundays, Holy Days, etc.)
- Commemorations
- Mass proper readings

## 🏗️ Architecture

### **Single File Design**
The entire application is contained in one HTML file for maximum simplicity:
- **HTML Structure** - Semantic markup with accessibility features
- **CSS Styling** - Clean, responsive design with CSS Grid
- **JavaScript Logic** - Vanilla JS with modern ES6+ features

### **Performance Optimizations**
- **DocumentFragment** - Batch DOM operations for smooth rendering
- **RequestAnimationFrame** - Optimized visual updates
- **Intelligent Caching** - Local storage with smart invalidation
- **Concurrent API Calls** - Efficient data loading with rate limiting

### **Data Flow**
1. **API Integration** - Yearly data loading from ordotools API
2. **Caching Layer** - Local storage with 7-day expiration
3. **State Management** - Simple, predictable state handling
4. **UI Updates** - Optimized rendering with minimal DOM manipulation

## 🎨 Design Principles

### **Visual Design**
- **Color Scheme** - Pure black (#000000) and white (#ffffff) with grays
- **Typography** - Clean system fonts for optimal readability
- **Layout** - Minimal grid-based design with generous whitespace
- **Borders** - Simple black lines for structure

### **User Experience**
- **Speed** - Fast loading and instant interactions
- **Simplicity** - Intuitive navigation with minimal cognitive load
- **Readability** - Clear hierarchy and excellent contrast
- **Responsive** - Perfect experience on all screen sizes

## 🔧 Technical Details

### **Browser Support**
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### **Performance Targets**
- **Load Time** - Under 2 seconds on 3G connection
- **Interaction** - Instant response to user actions
- **Memory** - Efficient memory usage with proper cleanup
- **Offline** - Full functionality with cached data

### **Accessibility Standards**
- **WCAG 2.1 AA** - Full compliance with accessibility guidelines
- **Screen Readers** - Compatible with NVDA, JAWS, VoiceOver
- **Keyboard Navigation** - Complete keyboard accessibility
- **Focus Management** - Proper focus handling and visible focus indicators

## 📊 API Integration

### **Data Structure**
The calendar integrates with the ordotools API to display:
- **Feast Names** - Primary liturgical celebrations
- **Liturgical Seasons** - Current liturgical time
- **Feast Ranks** - Importance level of celebrations
- **Liturgical Colors** - Traditional color indicators
- **Commemorations** - Secondary celebrations
- **Mass Proper** - Readings and prayers for the day

### **Caching Strategy**
- **Yearly Data** - Caches complete year data for fast access
- **Smart Invalidation** - 7-day cache expiration
- **Offline Support** - Works with cached data when offline
- **Background Updates** - Updates data without blocking UI

## 🚀 Deployment

### **Simple Deployment**
1. Upload `index.html` to any web server
2. No build process or dependencies required
3. Works with any static hosting service

### **Recommended Hosting**
- **GitHub Pages** - Free static hosting
- **Netlify** - Fast global CDN
- **Vercel** - Optimized for performance
- **Traditional Web Server** - Apache, Nginx, etc.

## 🤝 Contributing

### **Development Guidelines**
- Maintain the single-file architecture
- Follow accessibility best practices
- Test on multiple devices and browsers
- Keep performance optimizations in mind

### **Code Style**
- Clean, readable JavaScript
- Semantic HTML structure
- Minimal, purposeful CSS
- Comprehensive comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ordotools API** - Providing liturgical data
- **Accessibility Community** - Guidance on inclusive design
- **Open Source Community** - Inspiration and best practices

---

**Built with ❤️ for the liturgical community**