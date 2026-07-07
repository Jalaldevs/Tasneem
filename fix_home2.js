const fs = require('fs');

const diffText = fs.readFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/Home_backup_head.txt', 'utf8');
const lines = diffText.split('\n');

let originalCode = '';
for (let line of lines) {
  if (line.startsWith('-')) {
    originalCode += line.substring(1) + '\n';
  } else if (line.startsWith('+')) {
    break; // Stop at the added part
  } else if (line.startsWith(' ') || line.startsWith('import')) {
    if (line.startsWith(' ')) {
      originalCode += line.substring(1) + '\n';
    } else {
      originalCode += line + '\n';
    }
  }
}

// Current broken Home.jsx
const currentHome = fs.readFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/app/main/Home.jsx', 'utf8');

// The user replaced lines 1 to 271 with a slightly modified version of lines 272-onwards.
// BUT wait, looking at currentHome (which starts with `const getUserLocationAndCalculate = ...`), 
// the user's diff basically removed all the React stuff and only left the bottom half.
// So we just prepend the `originalCode` to `currentHome`.
// Wait, the diff replaced up to `// Re-calculate with new offsets immediately` which was line 271.
// Let's check what `currentHome` starts with. It starts with `const getUserLocationAndCalculate = async ...`.
// In original code, what is after `// Re-calculate with new offsets immediately`?
// Let's look closely at originalCode.
// Ah, the user's diff actually removed lines 1-271, but the original code up to line 271 is in `originalCode`.
// However, did the user's paste remove anything after line 271?
// Let's find the string 'const getUserLocationAndCalculate = async ({ silent = false } = {}) => {' in original code? NO, original code didn't have it because it was further down.
// Let's check originalCode. It ends with:
//       await AsyncStorage.setItem(OFFSETS_KEY, JSON.stringify(newOffsets));
//       // Re-calculate with new offsets immediately
// 
// So, the original code is missing the rest of `handleSaveOffsets`.
// Let's recreate it:
//       if (coordsRef.current) {
//         setPrayerTimes(calculatePrayerTimes(
//           coordsRef.current.latitude,
//           coordsRef.current.longitude,
//           new Date(),
//           calculationMethod,
//           newOffsets
//         ));
//       }
//     } catch (error) {
//       console.error('Failed to save offsets:', error);
//     }
//   };
// 
// Then we append `currentHome`.

const reconstructed = originalCode + 
`      if (coordsRef.current) {
        setPrayerTimes(calculatePrayerTimes(
          coordsRef.current.latitude,
          coordsRef.current.longitude,
          new Date(),
          calculationMethod,
          newOffsets
        ));
      }
    } catch (error) {
      console.error('Failed to save offsets:', error);
    }
  };

` + currentHome;

fs.writeFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/app/main/Home.jsx', reconstructed);
console.log('Restored Home.jsx');
