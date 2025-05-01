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

#### Get Extension by ID
```javascript
const extension = ExtensionsAPI.getExtensionById(id);
```
Parameters:
- `id` (String): The unique identifier of the extension

Returns a single extension object matching the ID.

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
    description: String, // Detailed description
    price: String,       // 'Free' or price in USD
    version: String,     // Current version number
    author: String,      // Author name
    lastUpdated: String, // Last update date
    downloadUrl: String, // Download link
    documentationUrl: String, // Documentation link
    filters: Array,      // Array of filter tags
    features: Array,     // Array of feature descriptions
    requirements: Array, // Array of requirements
    changelog: Array,    // Array of version history
    screenshots: Array,  // Array of screenshot URLs
    rating: Number,      // User rating (0-5)
    downloads: Number,   // Number of downloads
    compatibility: {     // Compatibility information
        minVersion: String,
        maxVersion: String,
        platforms: Array
    },
    license: String,     // License type
    support: {           // Support information
        email: String,
        website: String,
        forum: String
    }
}
```

## API Usage Guide

The Aemo Developer API provides endpoints to interact with extensions. Below is a guide on how to use the API:

### Root Endpoint
- **URL**: `/`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Welcome to Aemo Developer API",
    "endpoints": {
      "allExtensions": "/api/extensions",
      "filterExtensions": "/api/extensions/filter/:type",
      "getExtensionById": "/api/extensions/:id"
    }
  }
  ```

### Fetch All Extensions
- **URL**: `/api/extensions`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      // List of all extensions
    ]
  }
  ```

### Filter Extensions
- **URL**: `/api/extensions/filter/:type`
- **Method**: GET
- **Path Parameter**:
  - `type`: The type of extensions to filter (e.g., `free`, `paid`)
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      // List of filtered extensions
    ]
  }
  ```

### Get Extension by ID
- **URL**: `/api/extensions/:id`
- **Method**: GET
- **Path Parameter**:
  - `id`: The unique identifier of the extension
- **Response** (if found):
  ```json
  {
    "status": "success",
    "data": {
      // Extension details
    }
  }
  ```
- **Response** (if not found):
  ```json
  {
    "status": "error",
    "message": "Extension not found"
  }
  ```

### Android Implementation (Java)

#### Required Permissions
Add these permissions to your `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### Example Code
```java
public class ExtensionsApi {
    private static final String BASE_URL = "https://me.aemo.dev";
    
    // Get all extensions
    public void getAllExtensions(ExtensionsCallback callback) {
        new Thread(() -> {
            try {
                URL url = new URL(BASE_URL + "/api/extensions");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/json");

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream())
                    );
                    StringBuilder response = new StringBuilder();
                    String line;
                    
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // Parse JSON response
                    JSONArray jsonArray = new JSONArray(response.toString());
                    List<Extension> extensions = new ArrayList<>();
                    
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject obj = jsonArray.getJSONObject(i);
                        Extension extension = parseExtension(obj);
                        extensions.add(extension);
                    }

                    // Return result on main thread
                    new Handler(Looper.getMainLooper()).post(() -> {
                        callback.onSuccess(extensions);
                    });
                } else {
                    throw new IOException("HTTP error code: " + conn.getResponseCode());
                }

                conn.disconnect();
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onError(e);
                });
            }
        }).start();
    }

    // Get extension by ID
    public void getExtensionById(String id, ExtensionCallback callback) {
        new Thread(() -> {
            try {
                URL url = new URL(BASE_URL + "/api/extensions/" + id);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/json");

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream())
                    );
                    StringBuilder response = new StringBuilder();
                    String line;
                    
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // Parse JSON response
                    JSONObject obj = new JSONObject(response.toString());
                    Extension extension = parseExtension(obj);

                    // Return result on main thread
                    new Handler(Looper.getMainLooper()).post(() -> {
                        callback.onSuccess(extension);
                    });
                } else {
                    throw new IOException("HTTP error code: " + conn.getResponseCode());
                }

                conn.disconnect();
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onError(e);
                });
            }
        }).start();
    }

    // Get filtered extensions
    public void getFilteredExtensions(String filter, ExtensionsCallback callback) {
        new Thread(() -> {
            try {
                URL url = new URL(BASE_URL + "/api/extensions?filter=" + filter);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/json");

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream())
                    );
                    StringBuilder response = new StringBuilder();
                    String line;
                    
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // Parse JSON response
                    JSONArray jsonArray = new JSONArray(response.toString());
                    List<Extension> extensions = new ArrayList<>();
                    
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject obj = jsonArray.getJSONObject(i);
                        Extension extension = parseExtension(obj);
                        extensions.add(extension);
                    }

                    // Return result on main thread
                    new Handler(Looper.getMainLooper()).post(() -> {
                        callback.onSuccess(extensions);
                    });
                } else {
                    throw new IOException("HTTP error code: " + conn.getResponseCode());
                }

                conn.disconnect();
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onError(e);
                });
            }
        }).start();
    }

    // Parse extension from JSON
    private Extension parseExtension(JSONObject obj) throws JSONException {
        JSONObject compatibility = obj.getJSONObject("compatibility");
        JSONObject support = obj.getJSONObject("support");

        return new Extension(
            obj.getString("id"),
            obj.getString("title"),
            obj.getString("subtitle"),
            obj.getString("description"),
            obj.getString("price"),
            obj.getString("version"),
            obj.getString("author"),
            obj.getString("lastUpdated"),
            obj.getString("downloadUrl"),
            obj.getString("documentationUrl"),
            obj.getJSONArray("filters"),
            obj.getJSONArray("features"),
            obj.getJSONArray("requirements"),
            obj.getJSONArray("changelog"),
            obj.getJSONArray("screenshots"),
            obj.getDouble("rating"),
            obj.getInt("downloads"),
            new Extension.Compatibility(
                compatibility.getString("minVersion"),
                compatibility.getString("maxVersion"),
                compatibility.getJSONArray("platforms")
            ),
            obj.getString("license"),
            new Extension.Support(
                support.getString("email"),
                support.getString("website"),
                support.getString("forum")
            )
        );
    }

    // Callback interfaces
    public interface ExtensionsCallback {
        void onSuccess(List<Extension> extensions);
        void onError(Exception e);
    }

    public interface ExtensionCallback {
        void onSuccess(Extension extension);
        void onError(Exception e);
    }

    // Extension model class
    public static class Extension {
        private String id;
        private String title;
        private String subtitle;
        private String description;
        private String price;
        private String version;
        private String author;
        private String lastUpdated;
        private String downloadUrl;
        private String documentationUrl;
        private JSONArray filters;
        private JSONArray features;
        private JSONArray requirements;
        private JSONArray changelog;
        private JSONArray screenshots;
        private double rating;
        private int downloads;
        private Compatibility compatibility;
        private String license;
        private Support support;

        public Extension(String id, String title, String subtitle, String description,
                        String price, String version, String author, String lastUpdated,
                        String downloadUrl, String documentationUrl, JSONArray filters,
                        JSONArray features, JSONArray requirements, JSONArray changelog,
                        JSONArray screenshots, double rating, int downloads,
                        Compatibility compatibility, String license, Support support) {
            this.id = id;
            this.title = title;
            this.subtitle = subtitle;
            this.description = description;
            this.price = price;
            this.version = version;
            this.author = author;
            this.lastUpdated = lastUpdated;
            this.downloadUrl = downloadUrl;
            this.documentationUrl = documentationUrl;
            this.filters = filters;
            this.features = features;
            this.requirements = requirements;
            this.changelog = changelog;
            this.screenshots = screenshots;
            this.rating = rating;
            this.downloads = downloads;
            this.compatibility = compatibility;
            this.license = license;
            this.support = support;
        }

        // Getters
        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getSubtitle() { return subtitle; }
        public String getDescription() { return description; }
        public String getPrice() { return price; }
        public String getVersion() { return version; }
        public String getAuthor() { return author; }
        public String getLastUpdated() { return lastUpdated; }
        public String getDownloadUrl() { return downloadUrl; }
        public String getDocumentationUrl() { return documentationUrl; }
        public JSONArray getFilters() { return filters; }
        public JSONArray getFeatures() { return features; }
        public JSONArray getRequirements() { return requirements; }
        public JSONArray getChangelog() { return changelog; }
        public JSONArray getScreenshots() { return screenshots; }
        public double getRating() { return rating; }
        public int getDownloads() { return downloads; }
        public Compatibility getCompatibility() { return compatibility; }
        public String getLicense() { return license; }
        public Support getSupport() { return support; }

        // Nested classes
        public static class Compatibility {
            private String minVersion;
            private String maxVersion;
            private JSONArray platforms;

            public Compatibility(String minVersion, String maxVersion, JSONArray platforms) {
                this.minVersion = minVersion;
                this.maxVersion = maxVersion;
                this.platforms = platforms;
            }

            public String getMinVersion() { return minVersion; }
            public String getMaxVersion() { return maxVersion; }
            public JSONArray getPlatforms() { return platforms; }
        }

        public static class Support {
            private String email;
            private String website;
            private String forum;

            public Support(String email, String website, String forum) {
                this.email = email;
                this.website = website;
                this.forum = forum;
            }

            public String getEmail() { return email; }
            public String getWebsite() { return website; }
            public String getForum() { return forum; }
        }
    }
}
```

#### Usage Example
```java
// In your Activity or Fragment
ExtensionsApi api = new ExtensionsApi();

// Get all extensions
api.getAllExtensions(new ExtensionsApi.ExtensionsCallback() {
    @Override
    public void onSuccess(List<ExtensionsApi.Extension> extensions) {
        // Handle the extensions list
        for (ExtensionsApi.Extension ext : extensions) {
            Log.d("Extension", ext.getTitle());
        }
    }

    @Override
    public void onError(Exception e) {
        Log.e("API Error", e.getMessage());
    }
});

// Get extension by ID
api.getExtensionById("extension-id", new ExtensionsApi.ExtensionCallback() {
    @Override
    public void onSuccess(ExtensionsApi.Extension extension) {
        // Handle the extension
        Log.d("Extension", "Title: " + extension.getTitle());
        Log.d("Extension", "Description: " + extension.getDescription());
    }

    @Override
    public void onError(Exception e) {
        Log.e("API Error", e.getMessage());
    }
});

// Get filtered extensions
api.getFilteredExtensions("free", new ExtensionsApi.ExtensionsCallback() {
    @Override
    public void onSuccess(List<ExtensionsApi.Extension> extensions) {
        // Handle the filtered extensions list
    }

    @Override
    public void onError(Exception e) {
        Log.e("API Error", e.getMessage());
    }
});
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