# Hijri Date for Muslim

Hijri Date for Muslim is a simple extension to get the Hijri (Islamic) date from a given **Gregorian** date (year, month, day).  
It focuses only on converting between Gregorian date inputs and Hijri date output; it does not handle full calendar UIs or prayer times.

---

## All Blocks

![All Blocks](https://cdn.community.kodular.io/original/3X/d/d/dd2ab7b972e27e951493f90bea167870803f3b8b.png)

---

## Instructions to Use

- **year** (`Kind: integer`) – Write the year in Gregorian date.  
- **month** (`Kind: integer`) – Write the month in Gregorian date.  
- **day** (`Kind: integer`) – Write the day in Gregorian date.  

The extension returns a Hijri date string in the format `yyyy-mm-dd` (example: `1444-12-17`).
You can easily reorder it in your app logic to `dd-mm-yyyy` (example: `17-12-1444`) if needed.

---

## JavaScript Alternative

You can also get Hijri (Saudi) date using JavaScript:

```javascript
// Hijri Saudi date
let today = new Date().toLocaleDateString('ar-SA');
console.log(today); // e.g. "1444/12/17"
```