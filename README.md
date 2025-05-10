# Welcome to our website!

## How to use `/api/extensions/` in Android Studio (Java)

### 1. Add Gson to your `build.gradle` dependencies:
```gradle
dependencies {
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

### 2. Create a model class for the JSON data:
```java
public class ExtensionData {
    public String id;
    public String title;
    public String subtitle;
    public String description;
    public String price;
    public String[] filters;
    public String[] tags;
    public String version;
    public String lastUpdated;
    public String url;
    public DocumentationSection[] documentation;

    public static class DocumentationSection {
        public String title;
        public String content;
    }
}
```

### 3. Fetch and parse the data in your Activity or ViewModel:
```java
import android.os.AsyncTask;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

new AsyncTask<Void, Void, List<ExtensionData>>() {
    @Override
    protected List<ExtensionData> doInBackground(Void... voids) {
        try {
            URL url = new URL("https://aemo.pages.dev/api/extensions");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            if (conn.getResponseCode() != 200) {
                return null;
            }

            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            conn.disconnect();

            Gson gson = new Gson();
            Type listType = new TypeToken<List<ExtensionData>>(){}.getType();
            return gson.fromJson(sb.toString(), listType);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    protected void onPostExecute(List<ExtensionData> data) {
        if (data != null) {
            // Use the fetched data here
            for (ExtensionData ext : data) {
                System.out.println(ext.title);
            }
        }
    }
}.execute();
```
