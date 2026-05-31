import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { EXTENDED_PROBLEMS } from "./seed-extended";

const prisma = new PrismaClient();

interface Example {
  input: string;
  output: string;
  explanation?: string;
}
interface TestCase {
  input: string;
  expectedOutput: string;
}
interface StarterCode {
  python: string;
  javascript: string;
  java: string;
}
interface ProblemSeed {
  slug: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: Example[];
  constraints: string[];
  tags: string[];
  hints: string[];
  starterCode: StarterCode;
  testCases: TestCase[];
  acceptanceRate: number;
}

const PROBLEMS: ProblemSeed[] = [
  // ───────────────── EASY ─────────────────
  {
    slug: "two-sum",
    number: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to* \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    tags: ["Array", "Hash Table"],
    hints: [
      "Think about how you could reduce the problem to checking if something exists.",
      "A hash map can store values you've already seen. What would you store as the key vs the value?",
      "For each number, check if `target - number` already exists in your hash map before inserting the current number.",
    ],
    starterCode: {
      python: `import json, sys

def two_sum(nums, target):
    # Your code here
    pass

if __name__ == "__main__":
    data = sys.stdin.read().strip().split("\\n")
    nums = json.loads(data[0])
    target = int(data[1])
    result = two_sum(nums, target)
    print(json.dumps(result))
`,
      javascript: `function twoSum(nums, target) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1], 10);
console.log(JSON.stringify(twoSum(nums, target)));
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String numsLine = sc.nextLine().trim();
        int target = Integer.parseInt(sc.nextLine().trim());
        String inner = numsLine.substring(1, numsLine.length() - 1);
        int[] nums;
        if (inner.isEmpty()) nums = new int[0];
        else {
            String[] parts = inner.split(",");
            nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        }
        int[] r = twoSum(nums, target);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(","); sb.append(r[i]); }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1, 2]" },
      { input: "[3,3]\n6", expectedOutput: "[0, 1]" },
      { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2, 4]" },
      { input: "[0,4,3,0]\n0", expectedOutput: "[0, 3]" },
    ],
    acceptanceRate: 49.1,
  },

  {
    slug: "valid-parentheses",
    number: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    tags: ["String", "Stack"],
    hints: [
      "Think about what data structure naturally handles 'last in, first out' ordering.",
      "Push opening brackets onto a stack. When you see a closing bracket, what should you check?",
      "Pop from the stack when you see a closing bracket. If the popped character isn't the matching opener, return false. At the end, the stack must be empty.",
    ],
    starterCode: {
      python: `import sys

def is_valid(s):
    # Your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    result = is_valid(s)
    print("true" if result else "false")
`,
      javascript: `function isValid(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').trim();
console.log(isValid(s) ? "true" : "false");
`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(isValid(s) ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true" },
    ],
    acceptanceRate: 40.7,
  },

  {
    slug: "climbing-stairs",
    number: 70,
    title: "Climbing Stairs",
    difficulty: "Easy",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "Two ways: 1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1." },
      { input: "n = 5", output: "8" },
    ],
    constraints: ["1 <= n <= 45"],
    tags: ["Dynamic Programming", "Memoization", "Math"],
    hints: [
      "Think about smaller subproblems. How many ways are there to reach step 1? Step 2?",
      "The number of ways to reach step n depends on how many ways you can reach step n-1 and n-2.",
      "This is essentially Fibonacci. ways[i] = ways[i-1] + ways[i-2]. Base cases: ways[1]=1, ways[2]=2.",
    ],
    starterCode: {
      python: `import sys

def climb_stairs(n):
    # Your code here
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(climb_stairs(n))
`,
      javascript: `function climbStairs(n) {
    // Your code here
}

const n = parseInt(require('fs').readFileSync(0, 'utf8').trim(), 10);
console.log(climbStairs(n));
`,
      java: `import java.util.*;

public class Main {
    public static int climbStairs(int n) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        System.out.println(climbStairs(n));
    }
}
`,
    },
    testCases: [
      { input: "1", expectedOutput: "1" },
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
      { input: "5", expectedOutput: "8" },
      { input: "10", expectedOutput: "89" },
    ],
    acceptanceRate: 52.3,
  },

  {
    slug: "reverse-linked-list",
    number: 206,
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.

For this problem, the linked list is represented as an array on input. Output the reversed list as an array.`,
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    tags: ["Linked List", "Recursion"],
    hints: [
      "You need to flip every arrow in the chain. Think about what state you need to track as you walk through.",
      "Keep track of the previous node. For each node, save its next pointer, then point it back to previous.",
      "Use three pointers: prev = None, current = head. Loop: save next = current.next, set current.next = prev, then advance prev = current, current = next.",
    ],
    starterCode: {
      python: `import json, sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head

def list_to_array(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def reverse_list(head):
    # Your code here
    pass

if __name__ == "__main__":
    arr = json.loads(sys.stdin.read().strip())
    head = build_list(arr)
    new_head = reverse_list(head)
    print(json.dumps(list_to_array(new_head)))
`,
      javascript: `class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

function buildList(arr) {
    let head = null;
    for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
    return head;
}

function listToArray(head) {
    const out = [];
    while (head) { out.push(head.val); head = head.next; }
    return out;
}

function reverseList(head) {
    // Your code here
}

const arr = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
const head = buildList(arr);
console.log(JSON.stringify(listToArray(reverseList(head))));
`,
      java: `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { this.val = v; }
}

public class Main {
    public static ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.hasNextLine() ? sc.nextLine().trim() : "[]";
        String inner = line.substring(1, line.length() - 1).trim();
        ListNode head = null, tail = null;
        if (!inner.isEmpty()) {
            for (String p : inner.split(",")) {
                ListNode n = new ListNode(Integer.parseInt(p.trim()));
                if (head == null) { head = n; tail = n; }
                else { tail.next = n; tail = n; }
            }
        }
        ListNode r = reverseList(head);
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        while (r != null) { if (!first) sb.append(","); sb.append(r.val); first = false; r = r.next; }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[1,2,3,4,5]", expectedOutput: "[5, 4, 3, 2, 1]" },
      { input: "[1,2]", expectedOutput: "[2, 1]" },
      { input: "[]", expectedOutput: "[]" },
      { input: "[1]", expectedOutput: "[1]" },
      { input: "[1,2,3]", expectedOutput: "[3, 2, 1]" },
    ],
    acceptanceRate: 73.6,
  },

  {
    slug: "binary-search",
    number: 704,
    title: "Binary Search",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      { input: "nums = [5], target = 5", output: "0" },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    tags: ["Array", "Binary Search"],
    hints: [
      "The array is sorted. Can you eliminate half the search space with each comparison?",
      "Track left and right boundaries. Compute the middle index. Compare mid value with target.",
      "If nums[mid] == target return mid. If nums[mid] < target, move left to mid+1. Otherwise move right to mid-1. Repeat while left <= right.",
    ],
    starterCode: {
      python: `import json, sys

def search(nums, target):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    nums = json.loads(lines[0])
    target = int(lines[1])
    print(search(nums, target))
`,
      javascript: `function search(nums, target) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1], 10);
console.log(search(nums, target));
`,
      java: `import java.util.*;

public class Main {
    public static int search(int[] nums, int target) {
        // Your code here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        int target = Integer.parseInt(sc.nextLine().trim());
        String inner = line.substring(1, line.length() - 1);
        int[] nums = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(search(nums, target));
    }
}
`,
    },
    testCases: [
      { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4" },
      { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1" },
      { input: "[5]\n5", expectedOutput: "0" },
      { input: "[5]\n-5", expectedOutput: "-1" },
      { input: "[1,2,3,4,5,6,7,8,9,10]\n7", expectedOutput: "6" },
    ],
    acceptanceRate: 55.2,
  },

  // ───────────────── MEDIUM ─────────────────

  {
    slug: "longest-substring-without-repeating",
    number: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with length 3. Note "pwke" is a subsequence, not a substring.' },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    tags: ["String", "Sliding Window", "Hash Table"],
    hints: [
      "Think about a window that expands and contracts as you scan the string.",
      "Use a sliding window with two pointers. A hash map or set tracks which characters are currently in the window.",
      "When you find a duplicate character at right, shrink the window from left until the duplicate is removed. Track max(max_length, right - left + 1).",
    ],
    starterCode: {
      python: `import sys

def length_of_longest_substring(s):
    # Your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().rstrip("\\n")
    print(length_of_longest_substring(s))
`,
      javascript: `function lengthOfLongestSubstring(s) {
    // Your code here
}

const s = require('fs').readFileSync(0, 'utf8').replace(/\\n$/, '');
console.log(lengthOfLongestSubstring(s));
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
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
        System.out.println(lengthOfLongestSubstring(sb.toString()));
    }
}
`,
    },
    testCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
      { input: "pwwkew", expectedOutput: "3" },
      { input: "", expectedOutput: "0" },
      { input: "dvdf", expectedOutput: "3" },
    ],
    acceptanceRate: 33.8,
  },

  {
    slug: "3sum",
    number: 15,
    title: "3Sum",
    difficulty: "Medium",
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

Output the triplets sorted: each triplet sorted ascending, and the list of triplets sorted lexicographically.`,
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    tags: ["Array", "Two Pointers", "Sorting"],
    hints: [
      "If the array were sorted, could you reduce the 3-pointer problem to a 2-pointer problem?",
      "Sort the array. Fix one number at index i. Then use two pointers (left=i+1, right=end) to find pairs that sum to -nums[i].",
      "To avoid duplicates: skip nums[i] if it equals the previous element. After finding a triple, skip duplicates for left and right pointers too.",
    ],
    starterCode: {
      python: `import json, sys

def three_sum(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    result = three_sum(nums) or []
    result = [sorted(t) for t in result]
    result.sort()
    print(json.dumps(result))
`,
      javascript: `function threeSum(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
let result = threeSum(nums) || [];
result = result.map(t => [...t].sort((a,b) => a-b));
result.sort((a,b) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
});
console.log(JSON.stringify(result));
`,
      java: `import java.util.*;

public class Main {
    public static List<List<Integer>> threeSum(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] nums = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        List<List<Integer>> raw = threeSum(nums);
        List<List<Integer>> result = new ArrayList<>();
        for (List<Integer> t : raw) { List<Integer> c = new ArrayList<>(t); Collections.sort(c); result.add(c); }
        result.sort((a,b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++) if (!a.get(i).equals(b.get(i))) return a.get(i) - b.get(i);
            return a.size() - b.size();
        });
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < result.get(i).size(); j++) { if (j > 0) sb.append(","); sb.append(result.get(i).get(j)); }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());
    }
}
`,
    },
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1, -1, 2], [-1, 0, 1]]" },
      { input: "[0,1,1]", expectedOutput: "[]" },
      { input: "[0,0,0]", expectedOutput: "[[0, 0, 0]]" },
      { input: "[]", expectedOutput: "[]" },
      { input: "[-2,0,1,1,2]", expectedOutput: "[[-2, 0, 2], [-2, 1, 1]]" },
    ],
    acceptanceRate: 32.4,
  },

  {
    slug: "maximum-subarray",
    number: 53,
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: `Given an integer array \`nums\`, find the *subarray* with the largest sum, and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    hints: [
      "Think about what decision you make at each element: extend the current subarray or start fresh.",
      "Kadane's Algorithm: track the current running sum. If it drops below 0, reset it to 0 (starting fresh is better).",
      "For each element: current = max(nums[i], current + nums[i]). Update max_sum = max(max_sum, current). Initialize max_sum = nums[0].",
    ],
    starterCode: {
      python: `import json, sys

def max_sub_array(nums):
    # Your code here
    pass

if __name__ == "__main__":
    nums = json.loads(sys.stdin.read().strip())
    print(max_sub_array(nums))
`,
      javascript: `function maxSubArray(nums) {
    // Your code here
}

const nums = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(maxSubArray(nums));
`,
      java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] nums = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(maxSubArray(nums));
    }
}
`,
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" },
      { input: "[-1]", expectedOutput: "-1" },
      { input: "[-2,-1,-3,-4]", expectedOutput: "-1" },
    ],
    acceptanceRate: 49.6,
  },

  {
    slug: "coin-change",
    number: 322,
    title: "Coin Change",
    difficulty: "Medium",
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1." },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    tags: ["Dynamic Programming", "BFS", "Array"],
    hints: [
      "Think bottom-up: what's the fewest coins to make amount=1? amount=2? Build up to the target.",
      "Create a dp array of size (amount+1), initialized to infinity. dp[0] = 0. For each amount, try every coin.",
      "For each amount from 1 to target: for each coin, if coin <= amount, then dp[amount] = min(dp[amount], dp[amount - coin] + 1). Return dp[amount] if not infinity, else -1.",
    ],
    starterCode: {
      python: `import json, sys

def coin_change(coins, amount):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    coins = json.loads(lines[0])
    amount = int(lines[1])
    print(coin_change(coins, amount))
`,
      javascript: `function coinChange(coins, amount) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const coins = JSON.parse(lines[0]);
const amount = parseInt(lines[1], 10);
console.log(coinChange(coins, amount));
`,
      java: `import java.util.*;

public class Main {
    public static int coinChange(int[] coins, int amount) {
        // Your code here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        int amount = Integer.parseInt(sc.nextLine().trim());
        String inner = line.substring(1, line.length() - 1);
        int[] coins = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(coinChange(coins, amount));
    }
}
`,
    },
    testCases: [
      { input: "[1,2,5]\n11", expectedOutput: "3" },
      { input: "[2]\n3", expectedOutput: "-1" },
      { input: "[1]\n0", expectedOutput: "0" },
      { input: "[1,2,5]\n100", expectedOutput: "20" },
      { input: "[2,5,10,1]\n27", expectedOutput: "4" },
    ],
    acceptanceRate: 41.0,
  },

  {
    slug: "number-of-islands",
    number: 200,
    title: "Number of Islands",
    difficulty: "Medium",
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

Input format: rows of the grid as a JSON 2D array of strings.`,
    examples: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" },
      { input: '[["0"]]', output: "0" },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    tags: ["Array", "DFS", "BFS", "Matrix"],
    hints: [
      "Think of connected land cells as forming one island. How would you mark cells you've already counted?",
      "Iterate every cell. When you hit a '1', increment count and then 'sink' all connected land cells so they aren't counted again.",
      "Use DFS from any '1' cell: mark it as '0' (visited), then recursively DFS on all 4 neighbors that are '1'. Each DFS call represents one island.",
    ],
    starterCode: {
      python: `import json, sys

def num_islands(grid):
    # Your code here
    pass

if __name__ == "__main__":
    grid = json.loads(sys.stdin.read().strip())
    print(num_islands(grid))
`,
      javascript: `function numIslands(grid) {
    // Your code here
}

const grid = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(numIslands(grid));
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int numIslands(char[][] grid) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line; while ((line = br.readLine()) != null) sb.append(line);
        String s = sb.toString().trim();
        // parse [["1","0",...],...]
        List<List<Character>> rows = new ArrayList<>();
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == '[' && (i == 0 || s.charAt(i - 1) == ',' || s.charAt(i - 1) == '[')) {
                if (i > 0 && i + 1 < s.length() && s.charAt(i + 1) == '"') {
                    List<Character> row = new ArrayList<>();
                    int j = i + 1;
                    while (j < s.length() && s.charAt(j) != ']') {
                        if (s.charAt(j) == '"') {
                            row.add(s.charAt(j + 1));
                            j += 3;
                        } else j++;
                    }
                    rows.add(row);
                    i = j + 1;
                    continue;
                }
            }
            i++;
        }
        char[][] grid = new char[rows.size()][];
        for (int r = 0; r < rows.size(); r++) {
            grid[r] = new char[rows.get(r).size()];
            for (int c = 0; c < rows.get(r).size(); c++) grid[r][c] = rows.get(r).get(c);
        }
        System.out.println(numIslands(grid));
    }
}
`,
    },
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1" },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: "3" },
      { input: '[["0"]]', expectedOutput: "0" },
      { input: '[["1"]]', expectedOutput: "1" },
      { input: '[["1","0","1","0","1"]]', expectedOutput: "3" },
    ],
    acceptanceRate: 57.5,
  },

  {
    slug: "lru-cache",
    number: 146,
    title: "LRU Cache",
    difficulty: "Medium",
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class with the operations \`get\` and \`put\` (both must run in **O(1)** average time).

The input is given as two lines:
- A JSON array of operations: e.g. \`["LRUCache","put","put","get","put","get","put","get","get","get"]\`
- A JSON array of arguments: e.g. \`[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]\`

Output is the JSON array of return values (use \`null\` for void operations).`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]" },
      { input: '["LRUCache","put","get"]\n[[1],[1,1],[1]]', output: "[null,null,1]" },
      { input: '["LRUCache","put","put","get"]\n[[2],[1,1],[2,2],[3]]', output: "[null,null,null,-1]" },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    hints: [
      "You need O(1) get and put. Think about what data structures give O(1) access and O(1) ordered removal.",
      "A doubly linked list maintains order (most → least recently used). A hash map gives O(1) lookup by key.",
      "Combine both: the hash map stores key → node. The linked list orders nodes by recency. On get/put, move the node to the front. On eviction, remove from the back.",
    ],
    starterCode: {
      python: `import json, sys

class LRUCache:

    def __init__(self, capacity: int):
        # Your code here
        pass

    def get(self, key: int) -> int:
        # Your code here
        pass

    def put(self, key: int, value: int) -> None:
        # Your code here
        pass


if __name__ == "__main__":
    data = sys.stdin.read().strip().split("\\n")
    ops = json.loads(data[0])
    args = json.loads(data[1])
    out = []
    cache = None
    for i, op in enumerate(ops):
        a = args[i]
        if op == "LRUCache":
            cache = LRUCache(*a)
            out.append(None)
        elif op == "get":
            out.append(cache.get(*a))
        elif op == "put":
            cache.put(*a)
            out.append(None)
    print(json.dumps(out))
`,
      javascript: `class LRUCache {
    constructor(capacity) {
        // Your code here
    }
    get(key) {
        // Your code here
    }
    put(key, value) {
        // Your code here
    }
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const ops = JSON.parse(lines[0]);
const args = JSON.parse(lines[1]);
const out = [];
let cache = null;
for (let i = 0; i < ops.length; i++) {
    const a = args[i];
    if (ops[i] === "LRUCache") { cache = new LRUCache(...a); out.push(null); }
    else if (ops[i] === "get") { out.push(cache.get(...a)); }
    else if (ops[i] === "put") { cache.put(...a); out.push(null); }
}
console.log(JSON.stringify(out));
`,
      java: `import java.util.*;
import java.io.*;

class LRUCache {
    public LRUCache(int capacity) {
        // Your code here
    }

    public int get(int key) {
        // Your code here
        return -1;
    }

    public void put(int key, int value) {
        // Your code here
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();
        // Parse ops
        String inner1 = line1.substring(1, line1.length() - 1);
        String[] ops = Arrays.stream(inner1.split(",")).map(s -> s.trim().replace("\\"", "")).toArray(String[]::new);
        // Parse args (list of lists of ints)
        List<int[]> argList = new ArrayList<>();
        int i = 0; String s = line2;
        // Skip outer [
        i = s.indexOf('[', 1);
        while (i != -1) {
            int j = s.indexOf(']', i);
            String inner = s.substring(i + 1, j).trim();
            int[] arr = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(x -> Integer.parseInt(x.trim())).toArray();
            argList.add(arr);
            i = s.indexOf('[', j);
        }
        StringBuilder out = new StringBuilder("[");
        LRUCache cache = null;
        for (int k = 0; k < ops.length; k++) {
            if (k > 0) out.append(",");
            int[] a = argList.get(k);
            if (ops[k].equals("LRUCache")) { cache = new LRUCache(a[0]); out.append("null"); }
            else if (ops[k].equals("get")) { out.append(cache.get(a[0])); }
            else if (ops[k].equals("put")) { cache.put(a[0], a[1]); out.append("null"); }
        }
        out.append("]");
        System.out.println(out.toString());
    }
}
`,
    },
    testCases: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expectedOutput: "[null, null, null, 1, null, -1, null, -1, 3, 4]" },
      { input: '["LRUCache","put","get"]\n[[1],[1,1],[1]]', expectedOutput: "[null, null, 1]" },
      { input: '["LRUCache","put","put","get"]\n[[2],[1,1],[2,2],[3]]', expectedOutput: "[null, null, null, -1]" },
      { input: '["LRUCache","put","put","put","get","get"]\n[[2],[1,1],[2,2],[3,3],[1],[2]]', expectedOutput: "[null, null, null, null, -1, 2]" },
      { input: '["LRUCache","put","get","put","get","get"]\n[[1],[2,1],[2],[3,2],[2],[3]]', expectedOutput: "[null, null, 1, null, -1, 2]" },
    ],
    acceptanceRate: 43.2,
  },

  {
    slug: "word-search",
    number: 79,
    title: "Word Search",
    difficulty: "Medium",
    description: `Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` *if* \`word\` *exists in the grid*.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

Input format: line 1 = the board (JSON 2D array of single-letter strings); line 2 = the word.`,
    examples: [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"', output: "true" },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"', output: "true" },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"', output: "false" },
    ],
    constraints: [
      "m == board.length",
      "n == board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15",
      "board and word consists of only lowercase and uppercase English letters.",
    ],
    tags: ["Array", "Backtracking", "Matrix"],
    hints: [
      "You need to explore paths through the grid. What algorithmic technique explores all possible paths while backtracking when stuck?",
      "Use DFS/backtracking from every cell that matches the first letter. At each step, try all 4 directions.",
      "Mark cells as visited (e.g., temporarily change to '#') during DFS to avoid reuse. After the DFS call returns, restore the original character (backtrack).",
    ],
    starterCode: {
      python: `import json, sys

def exist(board, word):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    board = json.loads(lines[0])
    word = json.loads(lines[1])
    print("true" if exist(board, word) else "false")
`,
      javascript: `function exist(board, word) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const board = JSON.parse(lines[0]);
const word = JSON.parse(lines[1]);
console.log(exist(board, word) ? "true" : "false");
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static boolean exist(char[][] board, String word) {
        // Your code here
        return false;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine().trim();
        String word = line2.substring(1, line2.length() - 1);

        // Parse board
        List<List<Character>> rows = new ArrayList<>();
        int i = 0;
        while (i < line1.length()) {
            if (i + 1 < line1.length() && line1.charAt(i) == '[' && line1.charAt(i + 1) == '"') {
                List<Character> row = new ArrayList<>();
                int j = i + 1;
                while (j < line1.length() && line1.charAt(j) != ']') {
                    if (line1.charAt(j) == '"') { row.add(line1.charAt(j + 1)); j += 3; }
                    else j++;
                }
                rows.add(row);
                i = j + 1;
            } else i++;
        }
        char[][] board = new char[rows.size()][];
        for (int r = 0; r < rows.size(); r++) {
            board[r] = new char[rows.get(r).size()];
            for (int c = 0; c < rows.get(r).size(); c++) board[r][c] = rows.get(r).get(c);
        }
        System.out.println(exist(board, word) ? "true" : "false");
    }
}
`,
    },
    testCases: [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"', expectedOutput: "true" },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"', expectedOutput: "true" },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"', expectedOutput: "false" },
      { input: '[["a"]]\n"a"', expectedOutput: "true" },
      { input: '[["a","a"]]\n"aaa"', expectedOutput: "false" },
    ],
    acceptanceRate: 40.0,
  },

  // ───────────────── HARD ─────────────────

  {
    slug: "trapping-rain-water",
    number: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
      { input: "height = [0]", output: "0" },
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
    tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
    hints: [
      "Water trapped at any position is determined by the shorter of the tallest walls on its left and right.",
      "Two pointer approach: maintain left_max and right_max. The side with the smaller max determines how much water can be trapped at that pointer.",
      "Move the pointer on the shorter-max side inward. Water at that position = min(left_max, right_max) - height[i]. Update the max for that side.",
    ],
    starterCode: {
      python: `import json, sys

def trap(height):
    # Your code here
    pass

if __name__ == "__main__":
    height = json.loads(sys.stdin.read().strip())
    print(trap(height))
`,
      javascript: `function trap(height) {
    // Your code here
}

const height = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
console.log(trap(height));
`,
      java: `import java.util.*;

public class Main {
    public static int trap(int[] height) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        String inner = line.substring(1, line.length() - 1);
        int[] height = inner.isEmpty() ? new int[0] : Arrays.stream(inner.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(trap(height));
    }
}
`,
    },
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
      { input: "[4,2,0,3,2,5]", expectedOutput: "9" },
      { input: "[0]", expectedOutput: "0" },
      { input: "[]", expectedOutput: "0" },
      { input: "[3,0,2,0,4]", expectedOutput: "7" },
    ],
    acceptanceRate: 60.6,
  },

  {
    slug: "merge-k-sorted-lists",
    number: 23,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

Input format: a JSON 2D array (each inner array is one linked list).
Output: a JSON array of the merged values.`,
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[]]", output: "[]" },
    ],
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "lists[i] is sorted in ascending order.",
    ],
    tags: ["Linked List", "Divide and Conquer", "Heap", "Merge Sort"],
    hints: [
      "You've merged two sorted lists before. Can you extend that idea to K lists?",
      "Use a min-heap (priority queue) of size K. Initialize it with the head of each list. Always extract the minimum.",
      "Extract the minimum node from the heap, add it to your result, then push that node's .next into the heap (if it exists). Repeat until heap is empty.",
    ],
    starterCode: {
      python: `import json, sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head

def to_array(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def merge_k_lists(lists):
    # Your code here
    pass

if __name__ == "__main__":
    arrs = json.loads(sys.stdin.read().strip())
    lists = [build(a) for a in arrs]
    head = merge_k_lists(lists)
    print(json.dumps(to_array(head)))
`,
      javascript: `class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

function build(arr) {
    let head = null;
    for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);
    return head;
}

function toArray(head) {
    const out = [];
    while (head) { out.push(head.val); head = head.next; }
    return out;
}

function mergeKLists(lists) {
    // Your code here
}

const arrs = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
const lists = arrs.map(build);
console.log(JSON.stringify(toArray(mergeKLists(lists))));
`,
      java: `import java.util.*;
import java.io.*;

class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { this.val = v; }
}

public class Main {
    public static ListNode mergeKLists(ListNode[] lists) {
        // Your code here
        return null;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line; while ((line = br.readLine()) != null) sb.append(line);
        String s = sb.toString().trim();
        if (s.equals("[]")) { System.out.println("[]"); return; }
        List<ListNode> heads = new ArrayList<>();
        int i = 1;
        while (i < s.length() - 1) {
            if (s.charAt(i) == '[') {
                int j = s.indexOf(']', i);
                String inner = s.substring(i + 1, j).trim();
                ListNode head = null, tail = null;
                if (!inner.isEmpty()) {
                    for (String p : inner.split(",")) {
                        ListNode n = new ListNode(Integer.parseInt(p.trim()));
                        if (head == null) { head = n; tail = n; } else { tail.next = n; tail = n; }
                    }
                }
                heads.add(head);
                i = j + 1;
                if (i < s.length() && s.charAt(i) == ',') i++;
            } else i++;
        }
        ListNode merged = mergeKLists(heads.toArray(new ListNode[0]));
        StringBuilder out = new StringBuilder("[");
        boolean first = true;
        while (merged != null) { if (!first) out.append(","); out.append(merged.val); first = false; merged = merged.next; }
        out.append("]");
        System.out.println(out.toString());
    }
}
`,
    },
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1, 1, 2, 3, 4, 4, 5, 6]" },
      { input: "[]", expectedOutput: "[]" },
      { input: "[[]]", expectedOutput: "[]" },
      { input: "[[1]]", expectedOutput: "[1]" },
      { input: "[[-3,-1,0],[-2,2,3]]", expectedOutput: "[-3, -2, -1, 0, 2, 3]" },
    ],
    acceptanceRate: 52.7,
  },

  {
    slug: "median-of-two-sorted-arrays",
    number: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return *the median* of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.

Output should be the median as a number with exactly one decimal place if it ends in .0 (e.g., \`2.0\`), otherwise the standard decimal representation (e.g., \`2.5\`).`,
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "merged array = [1,2,3,4] and median is (2+3)/2 = 2.5." },
      { input: "nums1 = [], nums2 = [1]", output: "1.0" },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m, n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    hints: [
      "The brute force merges both arrays — O(m+n). Think about how you could find the median without fully merging.",
      "Binary search on the partition point. You're looking for a cut in both arrays so that the left halves combined have the same number of elements as the right halves.",
      "Binary search on the smaller array. For partition i in nums1, compute j = (m+n+1)//2 - i in nums2. The correct partition satisfies nums1[i-1] <= nums2[j] and nums2[j-1] <= nums1[i].",
    ],
    starterCode: {
      python: `import json, sys

def find_median_sorted_arrays(nums1, nums2):
    # Your code here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    nums1 = json.loads(lines[0])
    nums2 = json.loads(lines[1])
    result = find_median_sorted_arrays(nums1, nums2)
    if result == int(result):
        print(f"{result:.1f}")
    else:
        s = f"{result:.5f}".rstrip("0").rstrip(".")
        print(s)
`,
      javascript: `function findMedianSortedArrays(nums1, nums2) {
    // Your code here
}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums1 = JSON.parse(lines[0]);
const nums2 = JSON.parse(lines[1]);
const r = findMedianSortedArrays(nums1, nums2);
let s;
if (Number.isInteger(r)) s = r.toFixed(1);
else s = (Math.round(r * 100000) / 100000).toString();
console.log(s);
`,
      java: `import java.util.*;

public class Main {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        return 0.0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String l1 = sc.nextLine().trim();
        String l2 = sc.nextLine().trim();
        String i1 = l1.substring(1, l1.length() - 1);
        String i2 = l2.substring(1, l2.length() - 1);
        int[] a = i1.isEmpty() ? new int[0] : Arrays.stream(i1.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] b = i2.isEmpty() ? new int[0] : Arrays.stream(i2.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        double r = findMedianSortedArrays(a, b);
        if (r == (int) r) System.out.println(String.format("%.1f", r));
        else {
            String s = String.format("%.5f", r);
            while (s.endsWith("0")) s = s.substring(0, s.length() - 1);
            if (s.endsWith(".")) s = s.substring(0, s.length() - 1);
            System.out.println(s);
        }
    }
}
`,
    },
    testCases: [
      { input: "[1,3]\n[2]", expectedOutput: "2.0" },
      { input: "[1,2]\n[3,4]", expectedOutput: "2.5" },
      { input: "[]\n[1]", expectedOutput: "1.0" },
      { input: "[2]\n[]", expectedOutput: "2.0" },
      { input: "[1,2,3,4]\n[5,6,7,8]", expectedOutput: "4.5" },
    ],
    acceptanceRate: 36.5,
  },
];

async function main() {
  console.log("🌱 Seeding AlgoPath database...");

  // H-1 fix: upsert by slug instead of deleteMany. The previous behaviour
  // was disastrous in production — Submission and Progress have onDelete:
  // Cascade on Problem, so wiping problems also wiped every user's history.
  // Upsert preserves existing problem ids (so foreign keys stay valid) and
  // only updates the metadata + content.

  const allProblems = [...PROBLEMS, ...EXTENDED_PROBLEMS];
  console.log(
    `  → ${allProblems.length} problems to seed (${PROBLEMS.length} core + ${EXTENDED_PROBLEMS.length} extended)`
  );

  for (const p of allProblems) {
    const data = {
      number: p.number,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      examples: JSON.stringify(p.examples),
      constraints: JSON.stringify(p.constraints),
      tags: JSON.stringify(p.tags),
      hints: JSON.stringify(p.hints),
      starterCode: JSON.stringify(p.starterCode),
      testCases: JSON.stringify(p.testCases),
      // Note: acceptanceRate is only seeded as the *initial* display value.
      // Once real submissions roll in, the submit endpoint recomputes it
      // live from submissionCount / acceptedCount.
      acceptanceRate: p.acceptanceRate,
    };
    await prisma.problem.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
    console.log(`  ✓ ${p.number}. ${p.title}`);
  }

  // Demo user (helpful for local dev)
  const demoEmail = "demo@algopath.dev";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo User",
        password: await bcrypt.hash("demo1234", 10),
      },
    });
    console.log(`  ✓ created demo user (${demoEmail} / demo1234)`);
  }

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
