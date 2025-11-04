# Simplification Analysis & Recommendations

## Current Codebase Analysis

### Issues Identified

1. **Manual Date Handling** (Lines 895-897, 148-156, 163-173, etc.)
   - Manual month name arrays
   - Manual date formatting
   - Manual date calculations
   - **Solution**: Use `dayjs` (2KB) or native `Intl.DateTimeFormat`

2. **Dual Rendering System** (Desktop + Mobile separate functions)
   - `renderDesktopCalendar()` and `renderMobileCalendar()` duplicate logic
   - `createDayCell()` and `createMobileDay()` are nearly identical
   - **Solution**: Single render function with CSS media queries

3. **Custom Modal System** (Lines 630-660)
   - Manual overlay management
   - Manual body scroll locking
   - **Solution**: Use native `<dialog>` element

4. **Complex Caching Logic** (Lines 784-875)
   - Multiple cache layers (memory + localStorage)
   - Complex expiry logic
   - **Solution**: Simplify to single localStorage cache with simple expiry

5. **Unused Code**
   - `print-formatter.js` is completely commented out (PDF export)
   - Keyboard shortcuts for PDF modal (line 111-116) reference non-existent modal

6. **Manual DOM Manipulation**
   - Extensive `createElement()` calls
   - Manual HTML string building in `populateDayDetail()`
   - **Solution**: Use template literals or minimal templating

7. **Month Name Arrays** (Lines 148-151)
   - Hardcoded month names
   - **Solution**: Use `Intl.DateTimeFormat` or `dayjs`

## Recommended Libraries

### 1. **dayjs** (2KB) - Date Handling
- **Why**: Replaces manual date formatting, month names, date calculations
- **Size**: 2KB gzipped
- **Usage**: Date parsing, formatting, manipulation
- **Alternative**: Native `Intl.DateTimeFormat` (no dependency)

### 2. **Native `<dialog>`** - Modals
- **Why**: Built-in browser API, no library needed
- **Size**: 0KB (native)
- **Usage**: Replace custom modal system

### 3. **CSS Grid** - Calendar Layout
- **Why**: Already using, but can simplify further
- **Size**: 0KB (native)
- **Usage**: Single responsive grid, no dual rendering

## Simplification Strategy

### Phase 1: Remove Unused Code
- Delete or simplify `print-formatter.js`
- Remove PDF modal references
- Clean up unused keyboard shortcuts

### Phase 2: Simplify Date Handling
- Replace manual date formatting with `dayjs` or `Intl`
- Remove month name arrays
- Simplify date calculations

### Phase 3: Unify Rendering
- Single calendar render function
- CSS-only responsive switching
- Remove duplicate mobile/desktop code

### Phase 4: Simplify Modals
- Replace custom modals with `<dialog>`
- Remove manual overlay management

### Phase 5: Simplify Caching
- Single cache layer
- Simple expiry check
- Remove complex cache management

## Expected Improvements

- **Code Reduction**: ~200-300 lines
- **Bundle Size**: Minimal (dayjs is 2KB, or use native APIs)
- **Maintainability**: Much simpler codebase
- **Performance**: Similar or better (less DOM manipulation)

## Implementation Priority

1. **High Priority**: Remove unused PDF code
2. **High Priority**: Simplify date handling (dayjs or native)
3. **Medium Priority**: Unify desktop/mobile rendering
4. **Medium Priority**: Use native `<dialog>`
5. **Low Priority**: Simplify caching (if working fine)

