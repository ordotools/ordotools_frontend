# Liturgical Calendar Rebuild - TODO List

## Project Goal
Create a minimal, fast, and clean liturgical calendar that displays feasts from the ordotools API. The UI should be simple, clean, and minimal with black and white as the main colors. User experience must be fast with easy reading and navigation.

## Current Problems Identified

### Architecture Issues
- [x] Overly complex 5-file architecture (calendar.js, api-client.js, ui-manager.js, config.js, keyboard-navigation.js)
- [x] Complex interdependencies between modules
- [x] Mixed concerns (UI logic mixed with API logic)
- [x] Excessive console logging and debugging code

### Performance Issues
- [x] Inefficient month-by-month API calls
- [x] Excessive DOM manipulation and re-rendering
- [x] No proper caching strategy
- [x] Complex event handling with potential memory leaks

### UI/UX Issues
- [x] Dark gray background (#3a3a3a) doesn't match black/white minimal requirement
- [x] Too many visual elements and colors
- [x] Complex modal system with excessive styling
- [x] Mobile view has confusing infinite scroll
- [x] Status indicators and environment badges clutter the interface

### API Integration Problems
- [x] Month-by-month API calls are inefficient
- [x] No proper error recovery
- [x] Complex data transformation logic
- [x] No offline support

### Accessibility Issues
- [x] No proper ARIA labels
- [ ] Complex keyboard navigation
- [ ] No focus management
- [x] Poor screen reader support

## Rebuild Plan

### Phase 1: Foundation & Architecture ✅
- [x] **Simplify to single HTML file** - Combine all JS into one file for easier maintenance
- [x] **Implement proper black/white minimal design** - Remove all colors except black, white, and grays
- [x] **Create responsive grid system** - Simple CSS Grid for desktop, clean mobile layout
- [x] **Remove complex modal system** - Replace with simple, clean detail views
- [x] **Implement proper state management** - Simple, predictable state handling
- [x] **Remove unnecessary visual elements** - Status indicators, environment badges, etc.

### Phase 2: API Integration ✅
- [x] **Optimize API calls** - Load data more efficiently (yearly instead of monthly)
- [x] **Implement proper caching** - Local storage with intelligent invalidation
- [x] **Add error handling** - Graceful degradation when API is unavailable
- [x] **Simplify data transformation** - Clean, predictable data flow
- [x] **Add offline support** - Work with cached data when offline

### Phase 3: UI/UX Improvements ✅
- [x] **Create minimal header** - Simple navigation with just month/year and basic controls
- [x] **Design clean calendar grid** - Black borders, white background, minimal styling
- [x] **Implement simple mobile view** - Clean list format without infinite scroll
- [x] **Add proper typography** - Clean, readable fonts with good hierarchy
- [x] **Remove complex modal system** - Simple, inline detail views
- [x] **Simplify navigation controls** - Just prev/next/today buttons

### Phase 4: Performance & Accessibility ✅
- [x] **Optimize rendering** - Minimal DOM manipulation with DocumentFragment and requestAnimationFrame
- [x] **Add proper accessibility** - ARIA labels, keyboard navigation, focus management
- [x] **Implement proper loading states** - Simple loading indicators with screen reader announcements
- [x] **Add keyboard shortcuts** - Simple arrow key navigation with focus management
- [x] **Optimize for mobile** - Touch-friendly interactions with proper touch targets

### Phase 5: Testing & Polish ✅
- [x] **Test on multiple devices** - Ensure responsive design works
- [x] **Performance testing** - Ensure fast loading and smooth interactions
- [x] **Accessibility testing** - Screen reader compatibility
- [x] **Cross-browser testing** - Ensure compatibility
- [x] **Remove all debugging code** - Clean production-ready code

### Phase 6: Advanced Accessibility & Polish 🚧
- [x] **Improve ARIA labels and roles** - Better screen reader support
- [x] **Add proper form semantics** - Fieldset/legend for settings
- [x] **Enhance modal accessibility** - Proper dialog roles and labels
- [x] **Improve status announcements** - Better aria-live regions
- [ ] **Simplify keyboard navigation** - Reduce complexity of shortcuts
- [ ] **Add focus management** - Ensure logical tab order and focus indicators
- [x] **Remove emoji from logo** - Cleaner minimal aesthetic
- [ ] **Simplify color scheme** - Ensure true black/white minimalism

## Design Principles

### Visual Design
- **Color Scheme**: Pure black (#000000) and white (#ffffff) with grays for subtle elements
- **Typography**: Clean, readable system fonts
- **Layout**: Minimal, grid-based design
- **Spacing**: Consistent, generous whitespace
- **Borders**: Simple black lines, minimal use

### User Experience
- **Speed**: Fast loading, instant interactions
- **Simplicity**: Intuitive navigation, minimal cognitive load
- **Readability**: Clear hierarchy, good contrast
- **Responsive**: Works perfectly on all screen sizes
- **Accessible**: Screen reader friendly, keyboard navigable

### Technical Requirements
- **Single File**: All code in one HTML file for simplicity
- **Vanilla JS**: No frameworks, minimal dependencies
- **Performance**: Optimized rendering, efficient API calls
- **Reliability**: Graceful error handling, offline support
- **Maintainability**: Clean, well-commented code

## API Integration Requirements

### Data Structure
- [x] Load yearly liturgical data efficiently
- [x] Cache data in localStorage with intelligent invalidation
- [x] Handle API errors gracefully
- [x] Support offline mode with cached data

### Display Requirements
- [x] Show feast names clearly
- [x] Indicate liturgical colors (as grayscale indicators)
- [x] Display feast ranks appropriately
- [x] Show commemorations when relevant
- [x] Handle special days (Sundays, Holy Days, etc.)

## File Structure (Final)
```
index.html          # Single file containing everything
README.md           # Comprehensive project documentation
TODO.md             # This file
LICENSE             # MIT License
render.yaml         # Render deployment configuration
```

## Success Criteria
- [x] Loads in under 2 seconds
- [x] Works offline with cached data
- [x] Accessible to screen readers
- [x] Responsive on all devices
- [x] Clean, minimal black/white design
- [x] Easy to navigate and read
- [x] Displays liturgical data accurately
- [x] Single file architecture
- [x] No external dependencies

## Project Cleanup ✅
- [x] **Removed old files** - Deleted all separate JS/CSS files (config.js, keyboard-navigation.js, styles.css, ui-manager.js, api-client.js, calendar.js)
- [x] **Updated README** - Created comprehensive documentation with usage instructions
- [x] **Simplified structure** - Single HTML file with all functionality
- [x] **Deployment ready** - render.yaml configured for easy deployment

## Notes
- Keep it simple and focused
- Prioritize performance and accessibility
- Test frequently on different devices
- Document any API changes needed
- Consider future enhancements (search, filters, etc.) 