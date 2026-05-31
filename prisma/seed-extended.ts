// Extended problem set — 25 additional problems appended to the original 15.
// Same shape as seed.ts so the seed runner can iterate both.

export interface ProblemSeed {
  slug: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  tags: string[];
  hints: string[];
  starterCode: { python: string; javascript: string; java: string };
  testCases: { input: string; expectedOutput: string }[];
  acceptanceRate: number;
}

export const EXTENDED_PROBLEMS: ProblemSeed[] = [
  // ─────── EASY (10) ───────
  {
    slug: "best-time-to-buy-sell-stock",
    number: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description: `Given an array \`prices\` where \`prices[i]\` is the price of a stock on day \`i\`, find the maximum profit you could achieve from a single buy and a single sell.

If no profit is possible, return \`0\`. You must buy before you sell.`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1), sell on day 5 (price=6). Profit = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "Prices only go down; no profitable transaction exists." },
      { input: "prices = [1,2]", output: "1" },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    tags: ["Array", "Dynamic Programming"],
    hints: [
      "You only have one buy and one sell — at any day, what do you really need to remember about the past?",
      "Track the lowest price you've seen so far. At each day, the best sale-on-this-day profit is current price minus that minimum.",
      "Walk once through the array. Maintain `min_so_far` and `best`. For each price p: best = max(best, p - min_so_far); min_so_far = min(min_so_far, p).",
    ],
    starterCode: {
      python: `import json, sys

def max_profit(prices):
    # Your code here
    pass

if __name__ == "__main__":
    prices = json.loads(sys.stdin.read().strip())
    print(max_profit(prices))
`,
      javascript: `function maxProfit(prices) {
    // Your code here
}

const prices = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(maxProfit(prices));
`,
      java: `import java.util.*;
public class Main {
    public static int maxProfit(int[] prices) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] p = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(maxProfit(p));
    }
}
`,
    },
    testCases: [
      { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
      { input: "[7,6,4,3,1]", expectedOutput: "0" },
      { input: "[1]", expectedOutput: "0" },
      { input: "[2,4,1]", expectedOutput: "2" },
      { input: "[3,2,6,5,0,3]", expectedOutput: "4" },
    ],
    acceptanceRate: 54.8,
  },

  {
    slug: "contains-duplicate",
    number: 217,
    title: "Contains Duplicate",
    difficulty: "Easy",
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice, and return \`false\` if every element is distinct.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    tags: ["Array", "Hash Table", "Sorting"],
    hints: [
      "What's the simplest way to know whether you've seen a value before as you walk the array?",
      "A set tracks elements you've already encountered with O(1) lookup.",
      "Iterate once. Before adding `nums[i]` to the set, check if it's already there — if so, return true. Return false at the end.",
    ],
    starterCode: {
      python: `import json, sys

def contains_duplicate(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    print("true" if contains_duplicate(nums) else "false")
`,
      javascript: `function containsDuplicate(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(containsDuplicate(nums) ? "true" : "false");
`,
      java: `import java.util.*;
public class Main {
    public static boolean containsDuplicate(int[] nums) {
        // Your code here
        return false;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(containsDuplicate(n) ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3,1]", expectedOutput: "true" },
      { input: "[1,2,3,4]", expectedOutput: "false" },
      { input: "[1,1,1,3,3,4,3,2,4,2]", expectedOutput: "true" },
      { input: "[1]", expectedOutput: "false" },
      { input: "[]", expectedOutput: "false" },
    ],
    acceptanceRate: 62.0,
  },

  {
    slug: "palindrome-number",
    number: 9,
    title: "Palindrome Number",
    difficulty: "Easy",
    description: `Given an integer \`x\`, return \`true\` if \`x\` reads the same forwards and backwards, otherwise return \`false\`.

Negative numbers are never palindromes (the minus sign breaks symmetry).`,
    examples: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false", explanation: "Reversed it would be 121-, which doesn't match." },
      { input: "x = 10", output: "false" },
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    tags: ["Math"],
    hints: [
      "You don't need to convert to a string. Could you build the reversed number digit by digit?",
      "Repeatedly take `x % 10` to get the last digit, then divide x by 10 to drop it. Build the reversed number as you go.",
      "Stop early once your reversed half is >= the remaining `x`. Then compare half-by-half — accounts for both odd and even digit counts.",
    ],
    starterCode: {
      python: `import sys

def is_palindrome(x):
    # Your code here
    pass

if __name__ == "__main__":
    x = int(sys.stdin.read().strip())
    print("true" if is_palindrome(x) else "false")
`,
      javascript: `function isPalindrome(x) {
    // Your code here
}

const x = parseInt(require('fs').readFileSync(0, 'utf8').trim(), 10);
console.log(isPalindrome(x) ? "true" : "false");
`,
      java: `import java.util.*;
public class Main {
    public static boolean isPalindrome(int x) {
        // Your code here
        return false;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = Integer.parseInt(sc.nextLine().trim());
        System.out.println(isPalindrome(x) ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
      { input: "10", expectedOutput: "false" },
      { input: "0", expectedOutput: "true" },
      { input: "1234321", expectedOutput: "true" },
    ],
    acceptanceRate: 56.7,
  },

  {
    slug: "merge-two-sorted-lists",
    number: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: `Given the heads of two sorted linked lists \`list1\` and \`list2\`, merge them into a single sorted list and return its head.

Input format: each list is given as a JSON array on its own line. Return the merged values as a JSON array.`,
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    tags: ["Linked List", "Recursion"],
    hints: [
      "At each step, compare the heads of both lists — which one belongs next in the merged result?",
      "Maintain a tail pointer. Append the smaller head, advance that list, and repeat until one list runs out.",
      "When one list is exhausted, you can attach the remainder of the other directly. Use a dummy head node to simplify edge cases (empty merged list).",
    ],
    starterCode: {
      python: `import json, sys

def merge_two_lists(l1, l2):
    # Your code here. l1 and l2 are Python lists representing sorted linked lists.
    # Return the merged sorted list.
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    l1 = json.loads(lines[0])
    l2 = json.loads(lines[1])
    print(json.dumps(merge_two_lists(l1, l2)))
`,
      javascript: `function mergeTwoLists(l1, l2) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const l1 = JSON.parse(lines[0]);
const l2 = JSON.parse(lines[1]);
console.log(JSON.stringify(mergeTwoLists(l1, l2)));
`,
      java: `import java.util.*;
public class Main {
    public static List<Integer> mergeTwoLists(List<Integer> l1, List<Integer> l2) {
        // Your code here
        return new ArrayList<>();
    }
    public static List<Integer> parse(String s) {
        s = s.trim();
        String inner = s.substring(1, s.length() - 1).trim();
        List<Integer> r = new ArrayList<>();
        if (!inner.isEmpty()) for (String p : inner.split(",")) r.add(Integer.parseInt(p.trim()));
        return r;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> a = parse(sc.nextLine());
        List<Integer> b = parse(sc.nextLine());
        List<Integer> out = mergeTwoLists(a, b);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < out.size(); i++) { if (i > 0) sb.append(","); sb.append(out.get(i)); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1, 1, 2, 3, 3, 4, 4]" },
      { input: "[]\n[]", expectedOutput: "[]" },
      { input: "[]\n[0]", expectedOutput: "[0]" },
      { input: "[1]\n[2]", expectedOutput: "[1, 2]" },
      { input: "[5,10,15]\n[1,2,3]", expectedOutput: "[1, 2, 3, 5, 10, 15]" },
    ],
    acceptanceRate: 65.2,
  },

  {
    slug: "single-number",
    number: 136,
    title: "Single Number",
    difficulty: "Easy",
    description: `Given a non-empty array of integers \`nums\` where every element appears twice except for one, find the element that appears only once.

Solve it in O(n) time and O(1) extra space.`,
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" },
      { input: "nums = [1]", output: "1" },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Every element appears exactly twice except one.",
    ],
    tags: ["Array", "Bit Manipulation"],
    hints: [
      "Hash maps would work but use O(n) space. Is there a trick using how arithmetic or bits behave with duplicates?",
      "XOR has a useful property: `a ^ a = 0` and `a ^ 0 = a`. Operation order doesn't matter.",
      "XOR every element together. Pairs cancel to 0; the single element survives. Done in one pass, no extra storage.",
    ],
    starterCode: {
      python: `import json, sys

def single_number(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    print(single_number(nums))
`,
      javascript: `function singleNumber(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(singleNumber(nums));
`,
      java: `import java.util.*;
public class Main {
    public static int singleNumber(int[] nums) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(singleNumber(n));
    }
}
`,
    },
    testCases: [
      { input: "[2,2,1]", expectedOutput: "1" },
      { input: "[4,1,2,1,2]", expectedOutput: "4" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[7,3,3,7,5]", expectedOutput: "5" },
      { input: "[-1,-1,-2]", expectedOutput: "-2" },
    ],
    acceptanceRate: 70.4,
  },

  {
    slug: "reverse-string",
    number: 344,
    title: "Reverse String",
    difficulty: "Easy",
    description: `Given a string \`s\`, return its characters in reverse order.

Try to do it with O(1) extra memory by working with the characters in place (conceptually — we'll accept a returned string here).`,
    examples: [
      { input: 's = "hello"', output: '"olleh"' },
      { input: 's = "Hannah"', output: '"hannaH"' },
      { input: 's = "a"', output: '"a"' },
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s consists of printable ASCII characters.",
    ],
    tags: ["Two Pointers", "String"],
    hints: [
      "Think about pairs of characters that need to swap places.",
      "Use two pointers — one at the start, one at the end. Swap, then move them toward each other.",
      "Continue while `left < right`. After they cross, the string is reversed in place.",
    ],
    starterCode: {
      python: `import sys

def reverse_string(s):
    # Your code here. Return the reversed string.
    pass

if __name__ == "__main__":
    s = sys.stdin.read().rstrip("\\n")
    print(reverse_string(s))
`,
      javascript: `function reverseString(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').replace(/\\n$/, '');
console.log(reverseString(s));
`,
      java: `import java.util.*;
import java.io.*;
public class Main {
    public static String reverseString(String s) {
        // Your code here
        return "";
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line; boolean first = true;
        while ((line = br.readLine()) != null) {
            if (!first) sb.append("\\n");
            sb.append(line);
            first = false;
        }
        System.out.println(reverseString(sb.toString()));
    }
}
`,
    },
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "Hannah", expectedOutput: "hannaH" },
      { input: "a", expectedOutput: "a" },
      { input: "ab", expectedOutput: "ba" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
    acceptanceRate: 78.5,
  },

  {
    slug: "first-unique-character",
    number: 387,
    title: "First Unique Character in a String",
    difficulty: "Easy",
    description: `Given a string \`s\`, find the index of the first character that appears exactly once in \`s\`. If no such character exists, return \`-1\`.`,
    examples: [
      { input: 's = "leetcode"', output: "0" },
      { input: 's = "loveleetcode"', output: "2" },
      { input: 's = "aabb"', output: "-1" },
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s consists of only lowercase English letters.",
    ],
    tags: ["String", "Hash Table", "Queue", "Counting"],
    hints: [
      "You need to know how many times each character occurs and the first position where each appears.",
      "Walk the string once and tally character counts in a map.",
      "Walk it again and return the first index whose character has count 1.",
    ],
    starterCode: {
      python: `import sys

def first_uniq_char(s):
    # Your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().rstrip("\\n")
    print(first_uniq_char(s))
`,
      javascript: `function firstUniqChar(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').replace(/\\n$/, '');
console.log(firstUniqChar(s));
`,
      java: `import java.util.*;
import java.io.*;
public class Main {
    public static int firstUniqChar(String s) {
        // Your code here
        return -1;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line; boolean first = true;
        while ((line = br.readLine()) != null) {
            if (!first) sb.append("\\n");
            sb.append(line);
            first = false;
        }
        System.out.println(firstUniqChar(sb.toString()));
    }
}
`,
    },
    testCases: [
      { input: "leetcode", expectedOutput: "0" },
      { input: "loveleetcode", expectedOutput: "2" },
      { input: "aabb", expectedOutput: "-1" },
      { input: "z", expectedOutput: "0" },
      { input: "abcabcd", expectedOutput: "6" },
    ],
    acceptanceRate: 60.4,
  },

  {
    slug: "plus-one",
    number: 66,
    title: "Plus One",
    difficulty: "Easy",
    description: `You are given a non-negative integer represented as an array of digits, with the most significant digit at the front. Increment the integer by one and return the resulting array of digits.

Each element is a single digit; the integer has no leading zeros except for the number \`0\` itself.`,
    examples: [
      { input: "digits = [1,2,3]", output: "[1,2,4]", explanation: "123 + 1 = 124." },
      { input: "digits = [9]", output: "[1,0]", explanation: "9 + 1 = 10." },
      { input: "digits = [4,3,2,1]", output: "[4,3,2,2]" },
    ],
    constraints: ["1 <= digits.length <= 100", "0 <= digits[i] <= 9", "No leading zeros."],
    tags: ["Array", "Math"],
    hints: [
      "Think about how addition works on paper, starting from the rightmost digit.",
      "Walk from the end. If you see a digit < 9, just increment it and you're done.",
      "If a digit is 9, set it to 0 and carry the +1 to the next position. If the carry propagates past the front, prepend a 1.",
    ],
    starterCode: {
      python: `import json, sys

def plus_one(digits):
    # Your code here
    pass

if __name__ == "__main__":
    digits = json.loads(sys.stdin.read().strip())
    print(json.dumps(plus_one(digits)))
`,
      javascript: `function plusOne(digits) {
    // Your code here
}

const d = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(JSON.stringify(plusOne(d)));
`,
      java: `import java.util.*;
public class Main {
    public static int[] plusOne(int[] digits) {
        // Your code here
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] d = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] r = plusOne(d);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(","); sb.append(r[i]); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3]", expectedOutput: "[1, 2, 4]" },
      { input: "[9]", expectedOutput: "[1, 0]" },
      { input: "[4,3,2,1]", expectedOutput: "[4, 3, 2, 2]" },
      { input: "[9,9,9]", expectedOutput: "[1, 0, 0, 0]" },
      { input: "[0]", expectedOutput: "[1]" },
    ],
    acceptanceRate: 47.1,
  },

  {
    slug: "move-zeroes",
    number: 283,
    title: "Move Zeroes",
    difficulty: "Easy",
    description: `Given an integer array \`nums\`, move all the \`0\`s to the end while keeping the relative order of the non-zero elements. Return the modified array.`,
    examples: [
      { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]" },
      { input: "nums = [0]", output: "[0]" },
      { input: "nums = [1,2,3]", output: "[1,2,3]" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    tags: ["Array", "Two Pointers"],
    hints: [
      "Think about a slow pointer that tracks where the next non-zero should land.",
      "Walk a fast pointer through the array. Every time it finds a non-zero, write it at the slow pointer and advance both.",
      "After the first pass, fill the remaining positions (from slow to end) with zeroes.",
    ],
    starterCode: {
      python: `import json, sys

def move_zeroes(nums):
    # Your code here. Return the modified array.
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    print(json.dumps(move_zeroes(nums)))
`,
      javascript: `function moveZeroes(nums) {
    // Your code here. Return the modified array.
}

const n = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(JSON.stringify(moveZeroes(n)));
`,
      java: `import java.util.*;
public class Main {
    public static int[] moveZeroes(int[] nums) {
        // Your code here. Modify in place and return.
        return nums;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] r = moveZeroes(n);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(","); sb.append(r[i]); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[0,1,0,3,12]", expectedOutput: "[1, 3, 12, 0, 0]" },
      { input: "[0]", expectedOutput: "[0]" },
      { input: "[1,2,3]", expectedOutput: "[1, 2, 3]" },
      { input: "[0,0,1]", expectedOutput: "[1, 0, 0]" },
      { input: "[1,0,2,0,3]", expectedOutput: "[1, 2, 3, 0, 0]" },
    ],
    acceptanceRate: 61.2,
  },

  {
    slug: "roman-to-integer",
    number: 13,
    title: "Roman to Integer",
    difficulty: "Easy",
    description: `Convert a Roman numeral to an integer.

Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.

Subtractive cases: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900. In all other cases, sum left to right.`,
    examples: [
      { input: 's = "III"', output: "3" },
      { input: 's = "LVIII"', output: "58", explanation: "L=50, V=5, III=3." },
      { input: 's = "MCMXCIV"', output: "1994", explanation: "M=1000, CM=900, XC=90, IV=4." },
    ],
    constraints: ["1 <= s.length <= 15", "s contains only valid Roman characters: I, V, X, L, C, D, M."],
    tags: ["String", "Hash Table", "Math"],
    hints: [
      "Think about when a symbol's value should be subtracted vs. added based on what comes next.",
      "If a symbol's value is less than the next symbol's value, subtract it; otherwise, add it.",
      "Walk left to right. Total = sum of (value(s[i]) with sign based on whether s[i] < s[i+1]).",
    ],
    starterCode: {
      python: `import sys

def roman_to_int(s):
    # Your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(roman_to_int(s))
`,
      javascript: `function romanToInt(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').trim();
console.log(romanToInt(s));
`,
      java: `import java.util.*;
public class Main {
    public static int romanToInt(String s) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().trim() : "";
        System.out.println(romanToInt(s));
    }
}
`,
    },
    testCases: [
      { input: "III", expectedOutput: "3" },
      { input: "LVIII", expectedOutput: "58" },
      { input: "MCMXCIV", expectedOutput: "1994" },
      { input: "IV", expectedOutput: "4" },
      { input: "MMMDCCXLIX", expectedOutput: "3749" },
    ],
    acceptanceRate: 59.3,
  },

  // ─────── MEDIUM (12) ───────
  {
    slug: "add-two-numbers",
    number: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    description: `You're given two non-negative integers represented as linked lists where each node holds a single digit and the digits are stored in **reverse order** (least-significant first). Add them together and return the sum as a linked list in the same format.

Input format: each list is a JSON array on its own line. Output: a JSON array of the resulting digits.`,
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
      { input: "l1 = [9,9,9,9], l2 = [9,9,9]", output: "[8,9,9,0,1]", explanation: "9999 + 999 = 10998." },
    ],
    constraints: [
      "Each list has 1 to 100 nodes.",
      "0 <= Node.val <= 9",
      "No leading zeros (except the number 0 itself).",
    ],
    tags: ["Linked List", "Math", "Recursion"],
    hints: [
      "It's grade-school addition. What's the cleanest way to walk both lists in parallel and track a carry?",
      "Iterate both lists together. Sum corresponding digits plus a carry; the new digit is sum%10, the new carry is sum/10.",
      "When one list is shorter, treat its missing digits as 0. Don't forget a final carry of 1 if the last addition overflows.",
    ],
    starterCode: {
      python: `import json, sys

def add_two_numbers(l1, l2):
    # Your code here. l1 and l2 are reversed-digit lists.
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    l1 = json.loads(lines[0])
    l2 = json.loads(lines[1])
    print(json.dumps(add_two_numbers(l1, l2)))
`,
      javascript: `function addTwoNumbers(l1, l2) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const l1 = JSON.parse(lines[0]);
const l2 = JSON.parse(lines[1]);
console.log(JSON.stringify(addTwoNumbers(l1, l2)));
`,
      java: `import java.util.*;
public class Main {
    public static List<Integer> addTwoNumbers(List<Integer> l1, List<Integer> l2) {
        // Your code here
        return new ArrayList<>();
    }
    public static List<Integer> parse(String s) {
        s = s.trim();
        String inner = s.substring(1, s.length() - 1).trim();
        List<Integer> r = new ArrayList<>();
        if (!inner.isEmpty()) for (String p : inner.split(",")) r.add(Integer.parseInt(p.trim()));
        return r;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> a = parse(sc.nextLine());
        List<Integer> b = parse(sc.nextLine());
        List<Integer> out = addTwoNumbers(a, b);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < out.size(); i++) { if (i > 0) sb.append(","); sb.append(out.get(i)); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[2,4,3]\n[5,6,4]", expectedOutput: "[7, 0, 8]" },
      { input: "[0]\n[0]", expectedOutput: "[0]" },
      { input: "[9,9,9,9]\n[9,9,9]", expectedOutput: "[8, 9, 9, 0, 1]" },
      { input: "[5]\n[5]", expectedOutput: "[0, 1]" },
      { input: "[1,8]\n[0]", expectedOutput: "[1, 8]" },
    ],
    acceptanceRate: 41.6,
  },

  {
    slug: "group-anagrams",
    number: 49,
    title: "Group Anagrams",
    difficulty: "Medium",
    description: `Given an array of strings \`strs\`, group together the strings that are anagrams of each other. You may return the answer in any order — for output, sort each group lexicographically and the list of groups lexicographically by first element.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["ate","eat","tea"],["bat"],["nat","tan"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters.",
    ],
    tags: ["Array", "Hash Table", "String", "Sorting"],
    hints: [
      "Two strings are anagrams if and only if some canonical form of them is identical. What canonical forms can you think of?",
      "The simplest canonical form: the sorted characters. \"eat\" → \"aet\", \"tea\" → \"aet\".",
      "Use a hash map keyed by the sorted-character canonical form. Each map value is the list of original strings that produced that key.",
    ],
    starterCode: {
      python: `import json, sys

def group_anagrams(strs):
    # Your code here. Return list of groups.
    pass

if __name__ == "__main__":
    strs = json.loads(sys.stdin.read().strip())
    groups = group_anagrams(strs) or []
    groups = [sorted(g) for g in groups]
    groups.sort(key=lambda g: (g[0] if g else "", g))
    print(json.dumps(groups))
`,
      javascript: `function groupAnagrams(strs) {
    // Your code here
}

const strs = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
let groups = groupAnagrams(strs) || [];
groups = groups.map(g => [...g].sort());
groups.sort((a, b) => {
    const af = a[0] ?? "", bf = b[0] ?? "";
    if (af !== bf) return af < bf ? -1 : 1;
    return a.length - b.length;
});
console.log(JSON.stringify(groups));
`,
      java: `import java.util.*;
public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        // parse JSON array of strings
        List<String> ss = new ArrayList<>();
        int i = 0;
        while (i < line.length()) {
            if (line.charAt(i) == '"') {
                int j = i + 1;
                StringBuilder cur = new StringBuilder();
                while (j < line.length() && line.charAt(j) != '"') { cur.append(line.charAt(j)); j++; }
                ss.add(cur.toString());
                i = j + 1;
            } else i++;
        }
        List<List<String>> groups = groupAnagrams(ss.toArray(new String[0]));
        List<List<String>> norm = new ArrayList<>();
        for (List<String> g : groups) { List<String> c = new ArrayList<>(g); Collections.sort(c); norm.add(c); }
        norm.sort((a, b) -> {
            String af = a.isEmpty() ? "" : a.get(0);
            String bf = b.isEmpty() ? "" : b.get(0);
            int cmp = af.compareTo(bf);
            return cmp != 0 ? cmp : Integer.compare(a.size(), b.size());
        });
        StringBuilder sb = new StringBuilder("[");
        for (int k = 0; k < norm.size(); k++) {
            if (k > 0) sb.append(",");
            sb.append("[");
            for (int m = 0; m < norm.get(k).size(); m++) {
                if (m > 0) sb.append(",");
                sb.append("\\"").append(norm.get(k).get(m)).append("\\"");
            }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]' },
      { input: '[""]', expectedOutput: '[[""]]' },
      { input: '["a"]', expectedOutput: '[["a"]]' },
      { input: '["abc","bca","xyz"]', expectedOutput: '[["abc", "bca"], ["xyz"]]' },
      { input: '["",""]', expectedOutput: '[["", ""]]' },
    ],
    acceptanceRate: 67.4,
  },

  {
    slug: "container-with-most-water",
    number: 11,
    title: "Container With Most Water",
    difficulty: "Medium",
    description: `Given \`n\` non-negative integers \`height\` where each represents a vertical line at position \`i\`, find two lines that, with the x-axis, form a container that holds the most water. Return the maximum amount of water it can store.

The container's water level is determined by the shorter of the two chosen lines.`,
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" },
      { input: "height = [4,3,2,1,4]", output: "16" },
    ],
    constraints: ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
    tags: ["Array", "Two Pointers", "Greedy"],
    hints: [
      "Brute force tries every pair — O(n²). Can you avoid checking ones that obviously can't beat your best?",
      "Use two pointers, one at each end. The area is `min(h[l], h[r]) * (r - l)`.",
      "Move the pointer at the shorter line inward. Moving the taller one can never improve the area, since the shorter line still caps you AND the width has shrunk.",
    ],
    starterCode: {
      python: `import json, sys

def max_area(height):
    # Your code here
    pass

if __name__ == "__main__":
    h = json.loads(sys.stdin.read().strip())
    print(max_area(h))
`,
      javascript: `function maxArea(height) {
    // Your code here
}

const h = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(maxArea(h));
`,
      java: `import java.util.*;
public class Main {
    public static int maxArea(int[] height) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] h = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(maxArea(h));
    }
}
`,
    },
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
      { input: "[1,1]", expectedOutput: "1" },
      { input: "[4,3,2,1,4]", expectedOutput: "16" },
      { input: "[1,2,1]", expectedOutput: "2" },
      { input: "[2,3,4,5,18,17,6]", expectedOutput: "17" },
    ],
    acceptanceRate: 56.0,
  },

  {
    slug: "rotate-image",
    number: 48,
    title: "Rotate Image",
    difficulty: "Medium",
    description: `You are given an \`n × n\` 2D matrix representing an image. Rotate the image **90 degrees clockwise** in place and return the rotated matrix.`,
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
      { input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
      { input: "matrix = [[1]]", output: "[[1]]" },
    ],
    constraints: [
      "n == matrix.length == matrix[i].length",
      "1 <= n <= 20",
      "-1000 <= matrix[i][j] <= 1000",
    ],
    tags: ["Array", "Math", "Matrix"],
    hints: [
      "What two simple matrix operations could compose to a 90° rotation?",
      "Transpose the matrix (swap m[i][j] with m[j][i] for j > i), then reverse each row.",
      "After transposition, what was a column is now a row. Reversing each row aligns it to a 90° clockwise rotation.",
    ],
    starterCode: {
      python: `import json, sys

def rotate(matrix):
    # Your code here. Mutate and return the matrix.
    pass

if __name__ == "__main__":
    m = json.loads(sys.stdin.read().strip())
    print(json.dumps(rotate(m)))
`,
      javascript: `function rotate(matrix) {
    // Your code here. Mutate and return the matrix.
}

const m = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(JSON.stringify(rotate(m)));
`,
      java: `import java.util.*;
import java.io.*;
public class Main {
    public static int[][] rotate(int[][] matrix) {
        // Your code here
        return matrix;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder buf = new StringBuilder();
        String line; while ((line = br.readLine()) != null) buf.append(line);
        String s = buf.toString().trim();
        List<List<Integer>> rows = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '[' && i + 1 < s.length() && (Character.isDigit(s.charAt(i + 1)) || s.charAt(i + 1) == '-')) {
                int j = s.indexOf(']', i);
                String inner = s.substring(i + 1, j).trim();
                List<Integer> row = new ArrayList<>();
                if (!inner.isEmpty()) for (String p : inner.split(",")) row.add(Integer.parseInt(p.trim()));
                rows.add(row);
                i = j + 1;
            } else i++;
        }
        int n = rows.size();
        int[][] m = new int[n][];
        for (int r = 0; r < n; r++) { m[r] = new int[rows.get(r).size()]; for (int c = 0; c < rows.get(r).size(); c++) m[r][c] = rows.get(r).get(c); }
        int[][] out = rotate(m);
        StringBuilder sb = new StringBuilder("[");
        for (int r = 0; r < out.length; r++) {
            if (r > 0) sb.append(",");
            sb.append("[");
            for (int c = 0; c < out[r].length; c++) { if (c > 0) sb.append(","); sb.append(out[r][c]); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]" },
      { input: "[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", expectedOutput: "[[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]" },
      { input: "[[1]]", expectedOutput: "[[1]]" },
      { input: "[[1,2],[3,4]]", expectedOutput: "[[3, 1], [4, 2]]" },
      { input: "[[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25]]", expectedOutput: "[[21, 16, 11, 6, 1], [22, 17, 12, 7, 2], [23, 18, 13, 8, 3], [24, 19, 14, 9, 4], [25, 20, 15, 10, 5]]" },
    ],
    acceptanceRate: 73.5,
  },

  {
    slug: "set-matrix-zeroes",
    number: 73,
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    description: `Given an \`m × n\` integer matrix, if an element is \`0\`, set its entire row and column to \`0\`. Return the modified matrix.`,
    examples: [
      { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
      { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
      { input: "matrix = [[1]]", output: "[[1]]" },
    ],
    constraints: [
      "m == matrix.length",
      "n == matrix[0].length",
      "1 <= m, n <= 200",
      "-2^31 <= matrix[i][j] <= 2^31 - 1",
    ],
    tags: ["Array", "Hash Table", "Matrix"],
    hints: [
      "First instinct: use two sets to record which rows and columns must be zeroed. That's O(m+n) extra space.",
      "Walk the matrix once, collecting which rows and columns contain a zero.",
      "Then walk it again. For each cell, if its row OR column was marked, set it to 0.",
    ],
    starterCode: {
      python: `import json, sys

def set_zeroes(matrix):
    # Your code here. Mutate and return.
    pass

if __name__ == "__main__":
    m = json.loads(sys.stdin.read().strip())
    print(json.dumps(set_zeroes(m)))
`,
      javascript: `function setZeroes(matrix) {
    // Your code here
}

const m = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(JSON.stringify(setZeroes(m)));
`,
      java: `import java.util.*;
import java.io.*;
public class Main {
    public static int[][] setZeroes(int[][] matrix) {
        // Your code here
        return matrix;
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder buf = new StringBuilder();
        String line; while ((line = br.readLine()) != null) buf.append(line);
        String s = buf.toString().trim();
        List<List<Integer>> rows = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '[' && i + 1 < s.length() && (Character.isDigit(s.charAt(i + 1)) || s.charAt(i + 1) == '-')) {
                int j = s.indexOf(']', i);
                String inner = s.substring(i + 1, j).trim();
                List<Integer> row = new ArrayList<>();
                if (!inner.isEmpty()) for (String p : inner.split(",")) row.add(Integer.parseInt(p.trim()));
                rows.add(row);
                i = j + 1;
            } else i++;
        }
        int[][] m = new int[rows.size()][];
        for (int r = 0; r < rows.size(); r++) { m[r] = new int[rows.get(r).size()]; for (int c = 0; c < rows.get(r).size(); c++) m[r][c] = rows.get(r).get(c); }
        int[][] out = setZeroes(m);
        StringBuilder sb = new StringBuilder("[");
        for (int r = 0; r < out.length; r++) {
            if (r > 0) sb.append(",");
            sb.append("[");
            for (int c = 0; c < out[r].length; c++) { if (c > 0) sb.append(","); sb.append(out[r][c]); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[[1,1,1],[1,0,1],[1,1,1]]", expectedOutput: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]" },
      { input: "[[0,1,2,0],[3,4,5,2],[1,3,1,5]]", expectedOutput: "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]" },
      { input: "[[1]]", expectedOutput: "[[1]]" },
      { input: "[[0]]", expectedOutput: "[[0]]" },
      { input: "[[1,2],[0,4]]", expectedOutput: "[[0, 2], [0, 0]]" },
    ],
    acceptanceRate: 53.4,
  },

  {
    slug: "longest-palindromic-substring",
    number: 5,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    description: `Given a string \`s\`, return the longest palindromic substring of \`s\`. If multiple substrings tie for the longest length, return the one that starts at the lowest index.`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also valid; we return the earlier-starting one.' },
      { input: 's = "cbbd"', output: '"bb"' },
      { input: 's = "a"', output: '"a"' },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of only digits and English letters."],
    tags: ["String", "Dynamic Programming", "Two Pointers"],
    hints: [
      "Every palindrome has a center. How many possible centers are there in a string?",
      "There are 2n - 1 centers (n single characters + n-1 between pairs). For each center, expand outward as long as the characters match.",
      "Track the longest expansion seen and its starting index. Total time is O(n²) in the worst case.",
    ],
    starterCode: {
      python: `import sys

def longest_palindrome(s):
    # Your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().rstrip("\\n")
    print(longest_palindrome(s))
`,
      javascript: `function longestPalindrome(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').replace(/\\n$/, '');
console.log(longestPalindrome(s));
`,
      java: `import java.util.*;
import java.io.*;
public class Main {
    public static String longestPalindrome(String s) {
        // Your code here
        return "";
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line; boolean first = true;
        while ((line = br.readLine()) != null) {
            if (!first) sb.append("\\n");
            sb.append(line);
            first = false;
        }
        System.out.println(longestPalindrome(sb.toString()));
    }
}
`,
    },
    testCases: [
      { input: "babad", expectedOutput: "bab" },
      { input: "cbbd", expectedOutput: "bb" },
      { input: "a", expectedOutput: "a" },
      { input: "ac", expectedOutput: "a" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
    acceptanceRate: 35.7,
  },

  {
    slug: "generate-parentheses",
    number: 22,
    title: "Generate Parentheses",
    difficulty: "Medium",
    description: `Given \`n\` pairs of parentheses, return all combinations of well-formed parentheses strings.

Output the strings sorted lexicographically.`,
    examples: [
      { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]' },
      { input: "n = 1", output: '["()"]' },
      { input: "n = 2", output: '["(())","()()"]' },
    ],
    constraints: ["1 <= n <= 8"],
    tags: ["String", "Backtracking", "Dynamic Programming"],
    hints: [
      "What's the rule that distinguishes a valid prefix from an invalid one?",
      "At any point, the number of `(` placed so far must be ≥ the number of `)` placed.",
      "Backtrack: at each position, you can place `(` if you have any left, and `)` if there are unmatched `(`. Stop when the string has length 2n.",
    ],
    starterCode: {
      python: `import json, sys

def generate_parenthesis(n):
    # Your code here
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    result = generate_parenthesis(n) or []
    print(json.dumps(sorted(result)))
`,
      javascript: `function generateParenthesis(n) {
    // Your code here
}

const n = parseInt(require('fs').readFileSync(0, 'utf8').trim(), 10);
const result = (generateParenthesis(n) || []).slice().sort();
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;
public class Main {
    public static List<String> generateParenthesis(int n) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        List<String> r = new ArrayList<>(generateParenthesis(n));
        Collections.sort(r);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.size(); i++) { if (i > 0) sb.append(","); sb.append("\\"").append(r.get(i)).append("\\""); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "3", expectedOutput: '["((()))", "(()())", "(())()", "()(())", "()()()"]' },
      { input: "1", expectedOutput: '["()"]' },
      { input: "2", expectedOutput: '["(())", "()()"]' },
      { input: "4", expectedOutput: '["(((())))", "((()()))", "((())())", "((()))()", "(()(()))", "(()()())", "(()())()", "(())(())", "(())()()", "()((()))", "()(()())", "()(())()", "()()(())", "()()()()"]' },
      { input: "0", expectedOutput: '[""]' },
    ],
    acceptanceRate: 75.0,
  },

  {
    slug: "permutations",
    number: 46,
    title: "Permutations",
    difficulty: "Medium",
    description: `Given an array of distinct integers \`nums\`, return all possible permutations.

Output: a JSON array of permutations sorted lexicographically.`,
    examples: [
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
      { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
      { input: "nums = [1]", output: "[[1]]" },
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All integers in nums are unique."],
    tags: ["Array", "Backtracking"],
    hints: [
      "How many permutations of n distinct items are there? That tells you something about the search shape.",
      "Backtrack: build a permutation one element at a time, marking elements as used. Recurse. Unmark on the way back up.",
      "Base case: when the partial permutation has length n, save a copy to the result list.",
    ],
    starterCode: {
      python: `import json, sys

def permute(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    result = permute(nums) or []
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function permute(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
let result = permute(nums) || [];
result.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
});
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;
public class Main {
    public static List<List<Integer>> permute(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        List<List<Integer>> r = new ArrayList<>(permute(n));
        r.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++)
                if (!a.get(i).equals(b.get(i))) return a.get(i) - b.get(i);
            return a.size() - b.size();
        });
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < r.get(i).size(); j++) { if (j > 0) sb.append(","); sb.append(r.get(i).get(j)); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3]", expectedOutput: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]" },
      { input: "[0,1]", expectedOutput: "[[0, 1], [1, 0]]" },
      { input: "[1]", expectedOutput: "[[1]]" },
      { input: "[5,4]", expectedOutput: "[[4, 5], [5, 4]]" },
      { input: "[1,2]", expectedOutput: "[[1, 2], [2, 1]]" },
    ],
    acceptanceRate: 76.8,
  },

  {
    slug: "subsets",
    number: 78,
    title: "Subsets",
    difficulty: "Medium",
    description: `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set).

Output the subsets sorted: each subset sorted ascending, and the list of subsets sorted lexicographically.`,
    examples: [
      { input: "nums = [1,2,3]", output: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]" },
      { input: "nums = [0]", output: "[[],[0]]" },
      { input: "nums = [1,2]", output: "[[],[1],[1,2],[2]]" },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All integers in nums are unique."],
    tags: ["Array", "Backtracking", "Bit Manipulation"],
    hints: [
      "How many subsets does a set of n elements have? That number is a hint about a clever encoding.",
      "Iterative idea: start with [[]]. For each new element, append it to a copy of every subset already seen.",
      "Recursive idea: at each index, either include `nums[i]` or skip it. Recurse to the next index. Save the path when you reach the end.",
    ],
    starterCode: {
      python: `import json, sys

def subsets(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    result = subsets(nums) or []
    result = [sorted(s) for s in result]
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function subsets(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
let r = subsets(nums) || [];
r = r.map(s => [...s].sort((a, b) => a - b));
r.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
});
console.log(JSON.stringify(r));
`,
      java: `import java.util.*;
public class Main {
    public static List<List<Integer>> subsets(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        List<List<Integer>> r = new ArrayList<>();
        for (List<Integer> s : subsets(n)) { List<Integer> c = new ArrayList<>(s); Collections.sort(c); r.add(c); }
        r.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++)
                if (!a.get(i).equals(b.get(i))) return a.get(i) - b.get(i);
            return a.size() - b.size();
        });
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < r.get(i).size(); j++) { if (j > 0) sb.append(","); sb.append(r.get(i).get(j)); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3]", expectedOutput: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]" },
      { input: "[0]", expectedOutput: "[[], [0]]" },
      { input: "[1,2]", expectedOutput: "[[], [1], [1, 2], [2]]" },
      { input: "[5]", expectedOutput: "[[], [5]]" },
      { input: "[-1,1]", expectedOutput: "[[], [-1], [-1, 1], [1]]" },
    ],
    acceptanceRate: 78.0,
  },

  {
    slug: "combination-sum",
    number: 39,
    title: "Combination Sum",
    difficulty: "Medium",
    description: `Given an array of distinct integers \`candidates\` and a target integer \`target\`, return all unique combinations of \`candidates\` whose sum is \`target\`. The same number may be chosen any number of times.

Output: list of combinations sorted (each combination ascending; outer list lexicographically).`,
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]" },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]" },
      { input: "candidates = [2], target = 1", output: "[]" },
    ],
    constraints: [
      "1 <= candidates.length <= 30",
      "2 <= candidates[i] <= 40",
      "All elements of candidates are distinct.",
      "1 <= target <= 40",
    ],
    tags: ["Array", "Backtracking"],
    hints: [
      "Same number reusable means you don't decrement an index after picking — but you do pin a starting index to avoid permutation duplicates.",
      "Backtrack with parameters (start_index, current_combination, remaining_target). At each step try each candidate from start_index.",
      "Skip candidates greater than the remaining target. When remaining hits 0, save a copy of the current combination.",
    ],
    starterCode: {
      python: `import json, sys

def combination_sum(candidates, target):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    candidates = json.loads(lines[0])
    target = int(lines[1])
    result = combination_sum(candidates, target) or []
    result = [sorted(c) for c in result]
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function combinationSum(candidates, target) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const candidates = JSON.parse(lines[0]);
const target = parseInt(lines[1], 10);
let r = combinationSum(candidates, target) || [];
r = r.map(c => [...c].sort((a, b) => a - b));
r.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++)
        if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
});
console.log(JSON.stringify(r));
`,
      java: `import java.util.*;
public class Main {
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        int target = Integer.parseInt(sc.nextLine().trim());
        String inner = line.substring(1, line.length() - 1);
        int[] c = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        List<List<Integer>> r = new ArrayList<>();
        for (List<Integer> x : combinationSum(c, target)) { List<Integer> cp = new ArrayList<>(x); Collections.sort(cp); r.add(cp); }
        r.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++)
                if (!a.get(i).equals(b.get(i))) return a.get(i) - b.get(i);
            return a.size() - b.size();
        });
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < r.get(i).size(); j++) { if (j > 0) sb.append(","); sb.append(r.get(i).get(j)); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[2,3,6,7]\n7", expectedOutput: "[[2, 2, 3], [7]]" },
      { input: "[2,3,5]\n8", expectedOutput: "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]" },
      { input: "[2]\n1", expectedOutput: "[]" },
      { input: "[2]\n4", expectedOutput: "[[2, 2]]" },
      { input: "[3,5]\n9", expectedOutput: "[[3, 3, 3]]" },
    ],
    acceptanceRate: 73.8,
  },

  {
    slug: "product-of-array-except-self",
    number: 238,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is the product of all elements of \`nums\` except \`nums[i]\`.

Solve it without using division and in O(n) time.`,
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
      { input: "nums = [2,3]", output: "[3,2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The product of any prefix or suffix of nums fits in a 32-bit integer.",
    ],
    tags: ["Array", "Prefix Sum"],
    hints: [
      "Without division, what kind of pre-computed information for each index could help?",
      "Two passes: first build the prefix product (everything to the left of i), then the suffix product (everything to the right of i).",
      "Combine them: answer[i] = prefix[i] * suffix[i]. With clever reuse of the answer array, you can do it with O(1) extra space (output not counted).",
    ],
    starterCode: {
      python: `import json, sys

def product_except_self(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    print(json.dumps(product_except_self(nums)))
`,
      javascript: `function productExceptSelf(nums) {
    // Your code here
}

const n = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(JSON.stringify(productExceptSelf(n)));
`,
      java: `import java.util.*;
public class Main {
    public static int[] productExceptSelf(int[] nums) {
        // Your code here
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] r = productExceptSelf(n);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(","); sb.append(r[i]); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3,4]", expectedOutput: "[24, 12, 8, 6]" },
      { input: "[-1,1,0,-3,3]", expectedOutput: "[0, 0, 9, 0, 0]" },
      { input: "[2,3]", expectedOutput: "[3, 2]" },
      { input: "[5,5,5]", expectedOutput: "[25, 25, 25]" },
      { input: "[1,1]", expectedOutput: "[1, 1]" },
    ],
    acceptanceRate: 65.6,
  },

  {
    slug: "top-k-frequent-elements",
    number: 347,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    description: `Given a non-empty integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements.

Output: a JSON array of the \`k\` most frequent integers, sorted ascending.`,
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]" },
      { input: "nums = [1], k = 1", output: "[1]" },
      { input: "nums = [4,4,1,2,2,3], k = 2", output: "[2,4]" },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "k is in the range [1, the number of unique elements].",
      "The answer is guaranteed to be unique.",
    ],
    tags: ["Array", "Hash Table", "Heap", "Bucket Sort"],
    hints: [
      "First step: count occurrences. Second step: surface only the top k.",
      "Build a frequency map. Then find the top k by some method.",
      "Bucket sort approach: index buckets by frequency (0..n). Walk down from highest frequency, collecting elements until you have k. O(n) total.",
    ],
    starterCode: {
      python: `import json, sys

def top_k_frequent(nums, k):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    nums = json.loads(lines[0])
    k = int(lines[1])
    result = top_k_frequent(nums, k) or []
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function topKFrequent(nums, k) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const k = parseInt(lines[1], 10);
const result = (topKFrequent(nums, k) || []).slice().sort((a, b) => a - b);
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;
public class Main {
    public static int[] topKFrequent(int[] nums, int k) {
        // Your code here
        return new int[]{};
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        int k = Integer.parseInt(sc.nextLine().trim());
        String inner = line.substring(1, line.length() - 1);
        int[] n = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] r = topKFrequent(n, k);
        Arrays.sort(r);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(","); sb.append(r[i]); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,1,1,2,2,3]\n2", expectedOutput: "[1, 2]" },
      { input: "[1]\n1", expectedOutput: "[1]" },
      { input: "[4,4,1,2,2,3]\n2", expectedOutput: "[2, 4]" },
      { input: "[5,5,5,5]\n1", expectedOutput: "[5]" },
      { input: "[1,2,3]\n3", expectedOutput: "[1, 2, 3]" },
    ],
    acceptanceRate: 64.0,
  },

  // ─────── HARD (3) ───────
  {
    slug: "n-queens",
    number: 51,
    title: "N-Queens",
    difficulty: "Hard",
    description: `The N-Queens puzzle asks you to place \`n\` queens on an \`n × n\` chessboard such that no two queens threaten each other (no two share a row, column, or diagonal).

Return all distinct solutions to the n-queens puzzle. Each solution is represented as an array of strings showing the board (each string is a row, with \`'Q'\` for a queen and \`'.'\` for empty).

Output: a JSON 2D array of strings, sorted lexicographically by the joined-rows representation.`,
    examples: [
      { input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
      { input: "n = 1", output: '[["Q"]]' },
      { input: "n = 2", output: '[]' },
    ],
    constraints: ["1 <= n <= 9"],
    tags: ["Array", "Backtracking"],
    hints: [
      "Place one queen per row. What constraints rule out a column at the current row?",
      "Track which columns and diagonals are already attacked. Two diagonals are identifiable by `row + col` and `row - col`.",
      "Backtrack: at each row, try every column not in any attacked set. Add to sets, recurse to next row, remove on the way back. Save the board on row n.",
    ],
    starterCode: {
      python: `import json, sys

def solve_n_queens(n):
    # Your code here. Return list of boards, each a list of row strings.
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    result = solve_n_queens(n) or []
    result.sort(key=lambda b: "/".join(b))
    print(json.dumps(result))
`,
      javascript: `function solveNQueens(n) {
    // Your code here
}

const n = parseInt(require('fs').readFileSync(0, 'utf8').trim(), 10);
const result = (solveNQueens(n) || []).slice();
result.sort((a, b) => {
    const ja = a.join("/"), jb = b.join("/");
    return ja < jb ? -1 : ja > jb ? 1 : 0;
});
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;
public class Main {
    public static List<List<String>> solveNQueens(int n) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        List<List<String>> r = new ArrayList<>(solveNQueens(n));
        r.sort((a, b) -> String.join("/", a).compareTo(String.join("/", b)));
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < r.get(i).size(); j++) {
                if (j > 0) sb.append(",");
                sb.append("\\"").append(r.get(i).get(j)).append("\\"");
            }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "4", expectedOutput: '[[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]' },
      { input: "1", expectedOutput: '[["Q"]]' },
      { input: "2", expectedOutput: '[]' },
      { input: "3", expectedOutput: '[]' },
      { input: "5", expectedOutput: '[["Q....", "..Q..", "....Q", ".Q...", "...Q."], ["Q....", "...Q.", ".Q...", "....Q", "..Q.."], [".Q...", "...Q.", "Q....", "..Q..", "....Q"], [".Q...", "....Q", "..Q..", "Q....", "...Q."], ["..Q..", "Q....", "...Q.", ".Q...", "....Q"], ["..Q..", "....Q", ".Q...", "...Q.", "Q...."], ["...Q.", "Q....", "..Q..", "....Q", ".Q..."], ["...Q.", ".Q...", "....Q", "..Q..", "Q...."], ["....Q", ".Q...", "...Q.", "Q....", "..Q.."], ["....Q", "..Q..", "Q....", "...Q.", ".Q..."]]' },
    ],
    acceptanceRate: 70.5,
  },

  {
    slug: "edit-distance",
    number: 72,
    title: "Edit Distance",
    difficulty: "Hard",
    description: `Given two strings \`word1\` and \`word2\`, return the minimum number of operations needed to convert \`word1\` to \`word2\`.

You may insert a character, delete a character, or replace a character. Each counts as one operation.

Input format: two lines, each a JSON-quoted string.`,
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: "3", explanation: "horse → rorse → rose → ros." },
      { input: 'word1 = "intention", word2 = "execution"', output: "5" },
      { input: 'word1 = "", word2 = "abc"', output: "3" },
    ],
    constraints: [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters.",
    ],
    tags: ["String", "Dynamic Programming"],
    hints: [
      "Let dp[i][j] = the minimum number of operations to turn word1[0..i] into word2[0..j]. What's the recurrence at cell (i, j)?",
      "If word1[i-1] == word2[j-1], dp[i][j] = dp[i-1][j-1] (no op needed).",
      "Otherwise dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) — corresponding to delete, insert, replace.",
    ],
    starterCode: {
      python: `import json, sys

def min_distance(word1, word2):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    w1 = json.loads(lines[0])
    w2 = json.loads(lines[1])
    print(min_distance(w1, w2))
`,
      javascript: `function minDistance(word1, word2) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const w1 = JSON.parse(lines[0]);
const w2 = JSON.parse(lines[1]);
console.log(minDistance(w1, w2));
`,
      java: `import java.util.*;
public class Main {
    public static int minDistance(String word1, String word2) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String l1 = sc.nextLine().trim();
        String l2 = sc.nextLine().trim();
        String w1 = l1.substring(1, l1.length() - 1);
        String w2 = l2.substring(1, l2.length() - 1);
        System.out.println(minDistance(w1, w2));
    }
}
`,
    },
    testCases: [
      { input: '"horse"\n"ros"', expectedOutput: "3" },
      { input: '"intention"\n"execution"', expectedOutput: "5" },
      { input: '""\n"abc"', expectedOutput: "3" },
      { input: '"abc"\n""', expectedOutput: "3" },
      { input: '"same"\n"same"', expectedOutput: "0" },
    ],
    acceptanceRate: 56.8,
  },

  {
    slug: "word-break-ii",
    number: 140,
    title: "Word Break II",
    difficulty: "Hard",
    description: `Given a string \`s\` and a dictionary of strings \`wordDict\`, add spaces in \`s\` to construct sentences where each word is a valid dictionary word. Return all such possible sentences in any order.

Input format: line 1 = string s as JSON; line 2 = wordDict as JSON array of strings.

Output: JSON array of result sentences, sorted lexicographically.`,
    examples: [
      { input: 's = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]', output: '["cat sand dog","cats and dog"]' },
      { input: 's = "pineapplepenapple", wordDict = ["apple","pen","applepen","pine","pineapple"]', output: '["pine apple pen apple","pine applepen apple","pineapple pen apple"]' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: '[]' },
    ],
    constraints: [
      "1 <= s.length <= 20",
      "1 <= wordDict.length <= 1000",
      "All strings of wordDict are unique.",
    ],
    tags: ["String", "Dynamic Programming", "Backtracking", "Memoization"],
    hints: [
      "What if you split at every position where the prefix is a dictionary word, and recurse on the remainder?",
      "Memoize by suffix (or by start index): the answers for any given suffix don't depend on context above.",
      "For each starting index, try every prefix length. If prefix is in dict, recursively solve the suffix and prepend prefix to each result.",
    ],
    starterCode: {
      python: `import json, sys

def word_break(s, word_dict):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    s = json.loads(lines[0])
    words = json.loads(lines[1])
    result = word_break(s, words) or []
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function wordBreak(s, wordDict) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const s = JSON.parse(lines[0]);
const dict = JSON.parse(lines[1]);
const result = (wordBreak(s, dict) || []).slice().sort();
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;
public class Main {
    public static List<String> wordBreak(String s, List<String> wordDict) {
        // Your code here
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String l1 = sc.nextLine().trim();
        String l2 = sc.nextLine().trim();
        String s = l1.substring(1, l1.length() - 1);
        // parse word dict
        List<String> dict = new ArrayList<>();
        int i = 0;
        while (i < l2.length()) {
            if (l2.charAt(i) == '"') {
                int j = i + 1;
                StringBuilder cur = new StringBuilder();
                while (j < l2.length() && l2.charAt(j) != '"') { cur.append(l2.charAt(j)); j++; }
                dict.add(cur.toString());
                i = j + 1;
            } else i++;
        }
        List<String> r = new ArrayList<>(wordBreak(s, dict));
        Collections.sort(r);
        StringBuilder sb = new StringBuilder("[");
        for (int k = 0; k < r.size(); k++) { if (k > 0) sb.append(","); sb.append("\\"").append(r.get(k)).append("\\""); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: '"catsanddog"\n["cat","cats","and","sand","dog"]', expectedOutput: '["cat sand dog", "cats and dog"]' },
      { input: '"pineapplepenapple"\n["apple","pen","applepen","pine","pineapple"]', expectedOutput: '["pine apple pen apple", "pine applepen apple", "pineapple pen apple"]' },
      { input: '"catsandog"\n["cats","dog","sand","and","cat"]', expectedOutput: '[]' },
      { input: '"a"\n["a"]', expectedOutput: '["a"]' },
      { input: '"ab"\n["a","b"]', expectedOutput: '["a b"]' },
    ],
    acceptanceRate: 51.5,
  },
];
