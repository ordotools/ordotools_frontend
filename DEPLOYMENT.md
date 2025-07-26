# Deployment Guide

## 🚀 Quick Deployment

The liturgical calendar is designed for simple deployment with no build process required.

## 📁 Files to Deploy

You only need these files:
- `index.html` - The complete application
- `LICENSE` - License file (optional)

## 🌐 Deployment Options

### **1. Render (Recommended)**
The project includes a `render.yaml` file for automatic deployment:

1. Connect your GitHub repository to Render
2. Render will automatically detect the static site configuration
3. Deploy with one click

### **2. GitHub Pages**
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/` folder
5. Your site will be available at `https://username.github.io/repository-name`

### **3. Netlify**
1. Drag and drop the `index.html` file to Netlify
2. Or connect your GitHub repository
3. Automatic deployment with global CDN

### **4. Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

### **5. Traditional Web Server**
1. Upload `index.html` to your web server
2. Ensure the file is served with proper MIME type
3. No additional configuration needed

## 🔧 Configuration

### **API Endpoint**
The calendar connects to the ordotools API at:
```
https://api-eky0.onrender.com
```

### **CORS**
The API supports CORS for cross-origin requests, so the calendar will work from any domain.

## 📱 Testing After Deployment

1. **Load Time** - Should load in under 2 seconds
2. **Responsive Design** - Test on mobile and desktop
3. **Accessibility** - Test with keyboard navigation
4. **Offline Mode** - Test with cached data
5. **API Integration** - Verify liturgical data loads

## 🐛 Troubleshooting

### **Common Issues**

**Calendar not loading:**
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure HTTPS is used (required for API calls)

**Styling issues:**
- Check if CSS is loading properly
- Verify no caching issues
- Test in different browsers

**API errors:**
- Check network connectivity
- Verify API endpoint is working
- Check browser console for error messages

### **Performance Issues**

**Slow loading:**
- Check network speed
- Verify API response times
- Consider using a CDN

**Memory usage:**
- Clear browser cache
- Check for memory leaks in console
- Monitor localStorage usage

## 📊 Monitoring

### **Key Metrics to Monitor**
- Page load time
- API response times
- User engagement
- Error rates
- Accessibility compliance

### **Tools**
- Browser DevTools
- Lighthouse audits
- WebPageTest
- Real User Monitoring (RUM)

## 🔄 Updates

To update the calendar:
1. Replace the `index.html` file
2. Clear browser cache if needed
3. Test functionality
4. Monitor for any issues

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify all files are uploaded correctly
3. Test on different browsers and devices
4. Check the README.md for detailed documentation

---

**The liturgical calendar is designed to be simple to deploy and maintain!** 