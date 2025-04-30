# Aemo Developer Website

A platform for MIT App Inventor extensions and tools.

## API Documentation

### Extensions API

The website provides an API to interact with extensions data. Here's how to use it:

#### Get All Extensions
```javascript
const allExtensions = ExtensionsAPI.getAllExtensions();
```
Returns an array of all available extensions.

#### Get Extensions by Filter
```javascript
const filteredExtensions = ExtensionsAPI.getExtensionsByFilter(filter);
```
Parameters:
- `filter` (String): Can be 'all', 'free', or 'paid'

Returns an array of extensions matching the filter.

#### Extension Object Structure
```javascript
{
    id: String,          // Unique identifier
    title: String,       // Extension name
    subtitle: String,    // Short description
    price: String,       // 'Free' or price in USD
    filters: Array,      // Array of filter tags
    // ... other properties
}
```

### Features
- Load more functionality (10 extensions per batch)
- Filter extensions by price (Free/Paid)
- Responsive design
- Smooth animations
- Modern UI

### How to Use
1. Visit the website
2. Browse extensions
3. Use filters to find specific extensions
4. Click "Load More" to see additional extensions
5. Click on an extension to view details

### Development
To contribute or modify the website:
1. Clone the repository
2. Make your changes
3. Test locally
4. Submit a pull request