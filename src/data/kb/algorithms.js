export const algorithms = [
  {
    keywords: ["needleman", "wunsch", "global alignment"],
    content: "The Needleman-Wunsch algorithm performs global sequence alignment. It uses dynamic programming to find the optimal alignment of two sequences, maximizing the score based on matches, mismatches, and gap penalties. Complexity: O(nm)."
  },
  {
    keywords: ["smith", "waterman", "local alignment"],
    content: "The Smith-Waterman algorithm performs local sequence alignment. Unlike Needleman-Wunsch, it resets negative scores to zero in the dynamic programming matrix, allowing it to find the best matching subsequences. Useful for dissimilar sequences."
  },
  {
    keywords: ["blast", "heuristic"],
    content: "BLAST (Basic Local Alignment Search Tool) is a heuristic algorithm. Instead of a full matrix, it finds short 'seeds' (k-mers) of high similarity and extends them. It is much faster than dynamic programming but not guaranteed to find the mathematically optimal alignment."
  }
];