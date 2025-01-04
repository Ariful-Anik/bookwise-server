const transactions = require('../data/transactions.json');
const books = require('../data/books.json');

// Helper function to get all subsets of an array
const getSubsets = (arr) => {
  const subsets = [];
  const totalSubsets = Math.pow(2, arr.length);

  // Iterate through all possible subsets (excluding empty set)
  for (let i = 1; i < totalSubsets; i++) {
    const subset = [];
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) subset.push(arr[j]);
    }
    subsets.push(subset);
  }
  return subsets;
};

// Helper function to calculate support for itemsets
const calculateSupport = (itemset, transactions) => {
  let count = 0;
  transactions.forEach((transaction) => {
    if (itemset.every((item) => transaction.includes(item))) {
      count++;
    }
  });
  return count / transactions.length;
};

// Helper function to get itemsets with support > minSupport
const getFrequentItemsets = (transactions, minSupport) => {
  const itemsets = {};
  const totalTransactions = transactions.length;

  // Iterate through all transactions and generate subsets
  transactions.forEach((transaction) => {
    const subsets = getSubsets(transaction);
    subsets.forEach((subset) => {
      const key = subset.sort().join(','); // Sort and join to create unique key
      itemsets[key] = (itemsets[key] || 0) + 1;
    });
  });

  // Filter itemsets by support threshold
  const frequentItemsets = Object.entries(itemsets)
    .filter(([key, count]) => count / totalTransactions >= minSupport)
    .reduce((acc, [key, count]) => {
      acc[key] = count / totalTransactions; // Store support value
      return acc;
    }, {});

  return frequentItemsets;
};

// Generate book recommendations with full details and confidence
const getRecommendations = (bookId) => {
  const minSupport = 0.05; // Minimum support threshold
  const minConfidence = 0.5; // Minimum confidence threshold

  // Get frequent itemsets with support
  const frequentItemsets = getFrequentItemsets(transactions, minSupport);

  const recommendations = [];
  const addedBookIds = new Set(); // Track added book IDs to avoid duplicates

  // Iterate through frequent itemsets to calculate confidence
  Object.keys(frequentItemsets).forEach((key) => {
    const itemset = key.split(',').map(Number);
    if (itemset.includes(bookId)) {
      const supportAB = frequentItemsets[key]; // Support of A ∪ B

      itemset.forEach((item) => {
        if (item !== bookId && !addedBookIds.has(item)) {
          // Calculate confidence for the rule: bookId => item
          const subsetKey = itemset.filter((i) => i !== item).sort().join(',');
          const supportA = frequentItemsets[subsetKey] || 0;

          const confidence = supportA > 0 ? supportAB / supportA : 0;

          if (confidence >= minConfidence) {
            addedBookIds.add(item); // Add to the set to prevent duplicates
            const bookDetails = books.find((book) => book.id === item); // Get full book details
            if (bookDetails) {
              recommendations.push({
                ...bookDetails, // Include all book details
                confidence: parseFloat(confidence.toFixed(2)),
              });
            }
          }
        }
      });
    }
  });

  // Sort recommendations by confidence (descending)
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

module.exports = { getRecommendations };
