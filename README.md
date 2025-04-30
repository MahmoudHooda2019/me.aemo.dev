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
                        Extension extension = new Extension(
                            obj.getString("id"),
                            obj.getString("title"),
                            obj.getString("subtitle"),
                            obj.getString("price")
                        );
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

    // Get filtered extensions
    public void getFilteredExtensions(String filter, ExtensionsCallback callback) {
        new Thread(() -> {
            try {
                URL url = new URL(BASE_URL + "/api/extensions?filter=" + filter);
                // ... same implementation as getAllExtensions ...
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    callback.onError(e);
                });
            }
        }).start();
    }

    // Callback interface
    public interface ExtensionsCallback {
        void onSuccess(List<Extension> extensions);
        void onError(Exception e);
    }

    // Extension model class
    public static class Extension {
        private String id;
        private String title;
        private String subtitle;
        private String price;

        public Extension(String id, String title, String subtitle, String price) {
            this.id = id;
            this.title = title;
            this.subtitle = subtitle;
            this.price = price;
        }

        // Getters
        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getSubtitle() { return subtitle; }
        public String getPrice() { return price; }
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