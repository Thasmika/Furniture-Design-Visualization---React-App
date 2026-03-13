# Bugfix Requirements Document

## Introduction

The furniture design visualizer application is incorrectly displaying prices with the US dollar symbol ($) instead of Sri Lankan Rupees (Rs or LKR). This affects the total cost display in the header, individual furniture prices in the property editor, and furniture variant prices in the library panel. Prices are stored in cents (e.g., 44997 represents 449.97 LKR), but the display formatting uses the wrong currency symbol and lacks proper thousands separators for readability.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the total cost is displayed in the header THEN the system shows "💰 Total: $479991.00" with dollar sign and incorrect decimal placement

1.2 WHEN individual furniture prices are displayed in the property editor THEN the system shows prices with the $ symbol instead of Rs or LKR

1.3 WHEN furniture variant prices are displayed in the library panel THEN the system shows prices with the $ symbol instead of Rs or LKR

1.4 WHEN prices are formatted THEN the system does not include thousands separators for readability

### Expected Behavior (Correct)

2.1 WHEN the total cost is displayed in the header THEN the system SHALL show "💰 Total: Rs 4,799.91" or "💰 Total: LKR 4,799.91" with proper conversion from cents and thousands separator

2.2 WHEN individual furniture prices are displayed in the property editor THEN the system SHALL show prices with Rs or LKR symbol and proper formatting

2.3 WHEN furniture variant prices are displayed in the library panel THEN the system SHALL show prices with Rs or LKR symbol and proper formatting

2.4 WHEN prices are formatted THEN the system SHALL include thousands separators (e.g., 4,799.91) for improved readability

### Unchanged Behavior (Regression Prevention)

3.1 WHEN prices are stored internally THEN the system SHALL CONTINUE TO store them in cents as integers

3.2 WHEN price calculations are performed THEN the system SHALL CONTINUE TO use the existing calculation logic

3.3 WHEN the total cost is calculated from multiple furniture items THEN the system SHALL CONTINUE TO sum prices correctly

3.4 WHEN furniture items are added or removed THEN the system SHALL CONTINUE TO update the total cost display automatically

3.5 WHEN the application renders other UI elements in the header, property editor, and library panel THEN the system SHALL CONTINUE TO display them unchanged
