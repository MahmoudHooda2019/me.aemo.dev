export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve extensions data as API endpoint
    if (url.pathname === "/api/extensions") {
      // Import the embedded extensions data from the static file
      // (We can't import directly, so copy the data here or require it)
      const extensions = [
        {
          "id": "number_checker",
          "title": "Number Checker",
          "subtitle": "Check if a number is prime, even, or odd",
          "description": "A powerful extension that helps you check various properties of numbers. Features include prime number checking, even/odd detection, and more mathematical utilities.",
          "price": "Free",
          "filters": ["all", "free"],
          "version": "1.0.0",
          "lastUpdated": "2024-03-15",
          "url": "https://github.com/yourusername/number_checker/releases/latest",
          "documentation": [
            { "title": "Getting Started", "content": "To use the Number Checker extension, simply drag and drop the component into your app and use the provided blocks." },
            { "title": "Available Blocks", "content": "1. IsPrime(number) - Returns true if the number is prime\n2. IsEven(number) - Returns true if the number is even\n3. IsOdd(number) - Returns true if the number is odd" },
            { "title": "Example Usage", "content": "Here's a simple example of how to use the Number Checker:\n\n1. Add the Number Checker component to your app\n2. Use the blocks in your logic to check number properties\n3. Display the results to the user" }
          ]
        },
        // ...existing code from your extensions.js, add all extension objects here...
      ];
      return new Response(JSON.stringify(extensions), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  }
}