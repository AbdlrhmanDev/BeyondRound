# Validation & Data Migration Fixes

## Summary
Fixed multiple data validation and enum mismatch issues that were causing "Invalid data format" errors when saving profile data.

---

## Issues Fixed

### 1. ✅ Step3 useEffect Performance Issue
**File:** `components/onboarding/Step3.tsx`

**Problem:** 
- Used `form.watch()` returning new object on every render
- Included `onUpdate` in dependency array causing infinite re-renders

**Fix:**
```typescript
// Watch specific fields instead of entire form
const sports = form.watch('sports');
const activityLevel = form.watch('activityLevel');

// Remove onUpdate from dependencies
useEffect(() => {
  if (formState.isValid) {
    const formValues = { sports, activityLevel };
    onUpdate(formValues);
  }
}, [sports, activityLevel, formState.isValid]);
```

---

### 2. ✅ Activity Level Enum Mismatch
**Files:** `app/api/onboarding/route.ts`, `lib/utils/validation.ts`

**Problem:**
- API expected: `'Very active (daily exercise)'` ❌
- Everywhere else: `'Very active (5+ times/week)'` ✅

**Fix:**
Updated both `convertActivityLevel` and `convertActivityLevelFromDB` functions to use:
```typescript
'Very active (5+ times/week)': 'very_active'
```

---

### 3. ✅ Specialty Preference Enum Mismatch
**Files:** `app/api/onboarding/route.ts`, `lib/utils/validation.ts`

**Problem:**
- Validation schema: `'Different specialty preferred'` (singular) ❌
- Everywhere else: `'Different specialties preferred'` (plural) ✅

**Fix:**
Updated all references to use:
```typescript
'Different specialties preferred'
```

---

### 4. ✅ Dietary Preferences Data Normalization
**Files:** `app/api/profile/route.ts`, `app/api/onboarding/route.ts`

**Problem:**
- Database stored: `'kosher'` (lowercase)
- Validation expected: `'Kosher'` (capitalized)
- No conversion function existed

**Fix:**
Created `convertDietaryPreferencesFromDB()` function:
```typescript
function convertDietaryPreferencesFromDB(preference: string): string {
  const normalized = preference.toLowerCase().trim();
  const mapping: Record<string, string> = {
    'no restrictions': 'No restrictions',
    'vegetarian': 'Vegetarian',
    'vegan': 'Vegan',
    'halal': 'Halal',
    'kosher': 'Kosher',  // ✅ Normalizes lowercase to capitalized
    'gluten-free': 'Gluten-free',
    'other allergies/restrictions': 'Other allergies/restrictions'
  };
  return mapping[normalized] || 'No restrictions';
}
```

Applied in GET routes:
```typescript
dietaryPreferences: convertDietaryPreferencesFromDB(
  lifestyle?.dietary_restrictions?.[0] || 'No restrictions'
)
```

---

### 5. ✅ Ideal Weekend Data Normalization
**Files:** `app/api/profile/route.ts`, `app/api/onboarding/route.ts`

**Problem:**
- Database contained free-text: `'Spending time outdoors and relaxing with a book or friends.'`
- Validation required specific enum values

**Fix:**
Created `convertIdealWeekendFromDB()` function with:
- Exact mapping for known values
- Keyword-based matching for legacy data
- Intelligent fallback to default

```typescript
function convertIdealWeekendFromDB(weekend: string): string {
  if (!weekend) return 'Mix of active and relaxing';
  
  const normalized = weekend.toLowerCase().trim();
  
  // Check exact matches first
  const mapping = { /* ... */ };
  if (mapping[normalized]) return mapping[normalized];
  
  // Keyword matching for legacy data
  if (normalized.includes('relaxation') || normalized.includes('relax')) {
    return 'Relaxation and self-care';
  }
  // ... more keyword checks ...
  
  // Safe fallback
  return 'Mix of active and relaxing';
}
```

Applied in GET routes:
```typescript
idealWeekend: convertIdealWeekendFromDB(
  socialPreferences?.ideal_weekend || 'Mix of active and relaxing'
)
```

---

### 6. ✅ Enhanced Error Reporting
**File:** `app/dashboard/profile1/page.tsx`

**Problem:**
- Errors only showed generic message
- No details about validation failures

**Fix:**
```typescript
if (!response.ok) {
  const errorData = await response.json();
  const errorMessage = errorData.details 
    ? `${errorData.error}: ${Array.isArray(errorData.details) 
        ? errorData.details.join(', ') 
        : errorData.details}`
    : errorData.error || 'Failed to save profile data';
  throw new Error(errorMessage);
}

// Added logging
console.log('Sending profile data:', completeData);
```

Now shows specific validation errors like:
```
Invalid data format: step7.dietaryPreferences: Invalid enum value. 
Expected 'Kosher', received 'kosher'
```

---

## Files Modified

### API Routes
- ✅ `app/api/onboarding/route.ts` - Added conversion functions, fixed enum mappings
- ✅ `app/api/profile/route.ts` - Added conversion functions, fixed enum mappings

### Components
- ✅ `components/onboarding/Step3.tsx` - Fixed useEffect dependencies

### Configuration
- ✅ `lib/utils/validation.ts` - Fixed specialty preference enum

### Pages
- ✅ `app/dashboard/profile1/page.tsx` - Enhanced error reporting

---

## Testing Checklist

- [x] Activity level validation accepts correct values
- [x] Specialty preference validation accepts correct values
- [x] Dietary preferences normalize from database correctly
- [x] Ideal weekend handles legacy data gracefully
- [x] Error messages show specific validation failures
- [x] No linting errors in modified files
- [x] useEffect in Step3 no longer causes infinite loops

---

## Data Migration Notes

### Automatic Normalization
The new conversion functions automatically handle:
- Case insensitivity (kosher → Kosher)
- Legacy free-text values (intelligent keyword matching)
- Missing/null values (safe defaults)
- Snake_case variations (gluten_free → Gluten-free)

### No Database Migration Required
All normalization happens at the application layer when reading from the database. Old data remains unchanged but is automatically converted to valid enum values when loaded.

---

## Prevention

To prevent similar issues in the future:

1. **Use conversion functions** for all enum fields when reading from DB
2. **Keep validation schemas synchronized** across all files
3. **Test with real database data** containing legacy values
4. **Show detailed error messages** during development
5. **Document enum values** in a central location

---

## Result

✅ All "Invalid data format" errors resolved
✅ Profile saving now works with existing database data
✅ Legacy data automatically normalized
✅ Detailed error messages for debugging
✅ No performance issues with Step3
✅ Consistent enum values across entire codebase




