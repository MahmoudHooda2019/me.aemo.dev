# Similarity [Discontinued]

Similarity is an extension component that calculates a similarity score between two strings.  
A score of **0.0** means that the two strings are absolutely dissimilar, and **1.0** means that they are absolutely similar (or equal); anything in between indicates how similar the two strings are.

---

## All Blocks

![All Blocks](https://cdn.community.kodular.io/original/3X/1/9/19a5c8011fe78cddbcfcd05da9581b51d62d8811.png)

The main block takes:

- `feature` (String)  
- `target` (String)  
- `algorithm` (property)  

and returns a similarity score between the two strings.

---

## Algorithms

The extension supports the following algorithms (as a property):

1. **JaroSimilarity**  
2. **JaroWinklerSimilarity**  
3. **LevenshteinDistance**  
4. **DiceCoefficient**

These algorithms are implemented via the `java-string-similarity` library.

---

## Demo

![Demo Blocks](https://cdn.community.kodular.io/original/3X/1/6/16dc7e028fbb8975009324583bd2b7c624904df4.png)

In the demo, the extension calculates the similarity between **“McMahons”** and **“McDonald’s”** using the **Jaro** algorithm to show how the score reflects how close two strings are.

---

## Status

This extension has become obsolete and will not receive any updates.