# Currency Display Fix Design

## Overview

This bugfix addresses incorrect currency formatting across the furniture design visualizer application. Currently, prices are displayed with the US dollar symbol ($) instead of Sri Lankan Rupees (Rs or LKR), and lack proper thousands separators. The fix will create a centralized currency formatting utility that converts prices from cents to LKR with proper formatting, then update all three affected components (AppHeader, PropertyEditorPanel, FurnitureLibraryPanel) to use this utility.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when any price is displayed in the UI
- **Property (P)**: The desired behavior when prices are displayed - they should show Rs or LKR symbol with proper conversion from cents and thousands separators
- **Preservation**: Existing price storage (in cents), calculation logic, and non-price UI elements that must remain unchanged
- **formatCurrency**: A new utility function that will convert cents to LKR and format with thousands separators
- **totalCost**: The sum of all furniture prices in the current design, calculated in AppHeader and FurnitureLibraryPanel
- **selectedFurniture.price**: Individual furniture piece price displayed in PropertyEditorPanel
- **variant.price**: Furniture variant prices displayed in FurnitureLibraryPanel

## Bug Details

### Bug Condition

The bug manifests when any price value is displayed in the UI. The formatting code is using JavaScript's `toFixed(2)` method with a hardcoded dollar sign ($), or `toLocaleString('en-LK')` without proper conversion from cents to rupees.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { priceInCents: number, displayContext: string }
  OUTPUT: boolean
  
  RETURN input.priceInCents > 0
         AND input.displayContext IN ['header-total', 'property-editor', 'library-variant']
         AND currentFormatting uses '$' symbol
         AND NOT (priceInCents converted to LKR with proper formatting)
END FUNCTION
```

### Examples

- **Header Total**: Price 479991 cents displays as "$479991.00" instead of "Rs 4,799.91"
- **Property Editor**: Price 44997 cents displays as "$44997.00" instead of "Rs 449.97"
- **Library Variant**: Price 89997 cents displays as "Rs 89997" instead of "Rs 899.97"
- **Edge Case**: Price 0 cents should not display at all (current behavior is correct)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Prices must continue to be stored internally as integers in cents
- Total cost calculation logic (summing furniture prices) must remain unchanged
- Furniture count display and other non-price UI elements must remain unchanged
- Conditional rendering logic (e.g., only showing total when > 0) must remain unchanged
- All button functionality, tooltips, and interactions must continue to work exactly as before

**Scope:**
All code that does NOT involve price display formatting should be completely unaffected by this fix. This includes:
- Redux state management for prices
- Price assignment when adding furniture
- Price storage in furniture objects
- Room configuration and furniture manipulation logic
- All event handlers and user interactions

## Hypothesized Root Cause

Based on the code analysis, the issues are:

1. **Inconsistent Formatting Logic**: Each component implements its own price formatting
   - AppHeader uses: `${totalCost.toFixed(2)}`
   - PropertyEditorPanel uses: `${selectedFurniture.price.toFixed(2)}`
   - FurnitureLibraryPanel uses: `Rs {variant.price.toLocaleString('en-LK')}` and `Rs {totalCost.toLocaleString('en-LK')}`

2. **Missing Cents-to-Rupees Conversion**: Prices are stored in cents but displayed without dividing by 100

3. **Hardcoded Dollar Symbol**: AppHeader and PropertyEditorPanel use hardcoded '$' symbol

4. **Incomplete Formatting**: FurnitureLibraryPanel uses Rs symbol but doesn't convert from cents

## Correctness Properties

Property 1: Bug Condition - Currency Display Formatting

_For any_ price value in cents that is displayed in the UI (header total, property editor, or library variants), the fixed formatting function SHALL convert the value from cents to rupees by dividing by 100, prepend "Rs " symbol, and format with thousands separators (e.g., 44997 cents becomes "Rs 449.97").

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Price Storage and Calculation

_For any_ price-related operation that does NOT involve display formatting (storage, calculation, assignment), the fixed code SHALL produce exactly the same behavior as the original code, preserving all internal price handling in cents as integers.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/utils/currency.ts` (new file)

**Function**: `formatCurrency`

**Specific Changes**:
1. **Create Currency Utility**: Create a new utility file with a centralized formatting function
   - Function signature: `formatCurrency(priceInCents: number): string`
   - Convert cents to rupees: `priceInCents / 100`
   - Format with 2 decimal places and thousands separators
   - Prepend "Rs " symbol
   - Return formatted string

2. **Update AppHeader.tsx**: Replace inline formatting with utility function
   - Import `formatCurrency` from `../utils/currency`
   - Replace `${totalCost.toFixed(2)}` with `{formatCurrency(totalCost)}`

3. **Update PropertyEditorPanel.tsx**: Replace inline formatting with utility function
   - Import `formatCurrency` from `../utils/currency`
   - Replace `${selectedFurniture.price.toFixed(2)}` with `{formatCurrency(selectedFurniture.price)}`

4. **Update FurnitureLibraryPanel.tsx**: Replace inline formatting with utility function
   - Import `formatCurrency` from `../utils/currency`
   - Replace `Rs {variant.price.toLocaleString('en-LK')}` with `{formatCurrency(variant.price)}`
   - Replace `Rs {totalCost.toLocaleString('en-LK')}` with `{formatCurrency(totalCost)}`

5. **Add Unit Tests**: Create tests for the currency utility
   - Test conversion from cents to rupees
   - Test thousands separator formatting
   - Test edge cases (0, negative, large numbers)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render each component with known price values and assert that the displayed text contains the incorrect formatting. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Header Total Test**: Render AppHeader with totalCost of 479991 cents, assert display shows "$479991.00" (will fail on unfixed code)
2. **Property Editor Test**: Render PropertyEditorPanel with furniture price of 44997 cents, assert display shows "$44997.00" (will fail on unfixed code)
3. **Library Variant Test**: Render FurnitureLibraryPanel with variant price of 89997 cents, assert display shows "Rs 89997" without decimal (will fail on unfixed code)
4. **Zero Price Test**: Verify that zero prices are not displayed (should pass on unfixed code)

**Expected Counterexamples**:
- Dollar signs appear instead of Rs symbol
- Prices show full cent values without decimal conversion
- Missing thousands separators in some contexts
- Possible causes: inline formatting, missing conversion logic, inconsistent implementation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := formatCurrency(input.priceInCents)
  ASSERT result matches pattern "Rs [0-9,]+\.[0-9]{2}"
  ASSERT result equals expectedFormattedValue(input.priceInCents)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL operation WHERE NOT isDisplayFormatting(operation) DO
  ASSERT priceStorage_original(operation) = priceStorage_fixed(operation)
  ASSERT priceCalculation_original(operation) = priceCalculation_fixed(operation)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-display operations

**Test Plan**: Observe behavior on UNFIXED code first for price storage and calculations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Price Storage Preservation**: Verify that furniture prices are still stored as integers in cents after fix
2. **Calculation Preservation**: Verify that total cost calculation produces same numeric result after fix
3. **Conditional Rendering Preservation**: Verify that total cost badge only appears when totalCost > 0
4. **UI Interaction Preservation**: Verify that all buttons, tooltips, and interactions continue working

### Unit Tests

- Test `formatCurrency` utility with various cent values (0, 44997, 479991, 1000000)
- Test that formatted output matches expected pattern "Rs X,XXX.XX"
- Test edge cases (negative numbers, very large numbers, zero)
- Test that each component correctly imports and uses the utility
- Test that non-price UI elements remain unchanged

### Property-Based Tests

- Generate random price values in cents and verify formatting is consistent
- Generate random furniture configurations and verify total cost calculation remains correct
- Test that price storage in Redux state remains as integers in cents
- Test across many scenarios that non-display operations are unaffected

### Integration Tests

- Test full user flow: add furniture, verify price displays correctly in all three locations
- Test that total cost updates correctly when furniture is added/removed
- Test that visual layout and styling remain unchanged after fix
- Test that all existing functionality (undo/redo, save, etc.) continues to work
