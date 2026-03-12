export const LANGUAGES = [
  {
    id: 'java',
    name: 'Java',
    version: '4',
    monaco: 'java',
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Solution placeholder
        // Example for Two Sum input:
        // int n = sc.nextInt();
        // int[] nums = new int[n];
        // for(int i=0; i<n; i++) nums[i] = sc.nextInt();
        // int target = sc.nextInt();
    }
}`
  },
  {
    id: 'python',
    name: 'Python 3',
    version: '4',
    monaco: 'python',
    template: `import sys

def solve():
    # Read from stdin
    # input_data = sys.stdin.read().split()
    pass

if __name__ == "__main__":
    solve()`
  },
  {
    id: 'c',
    name: 'C',
    version: '5',
    monaco: 'c',
    template: `#include <stdio.h>

int main() {
    // Read from stdin using scanf
    return 0;
}`
  },
  {
    id: 'cpp',
    name: 'C++',
    version: '1',
    monaco: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: '4',
    monaco: 'javascript',
    template: `// Read inputs carefully

console.log("Hello World");
`
  }
];
