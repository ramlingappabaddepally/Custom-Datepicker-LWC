# Custom LWC Date Picker Component

Production-ready Lightning Web Component (LWC) for a custom date picker. This component was refactored from an existing solution to align with Salesforce best practices, ensuring a reliable, accessible, and easily maintainable component. It includes features for dynamic date validation and restricted day selection, which are not available in the standard lightning-input component.
<img width="610" height="460" alt="image" src="https://github.com/user-attachments/assets/287f069a-6ce3-46c3-b5ea-59e858652ebd" />

### Key Features

- **Customizable Day Selection**: The dayToSelect property allows developers to restrict user selections to a specific day of the week (e.g., only Sundays).

- **Minimum Date Validation**: The min property prevents users from selecting dates before a specified minimum date.

- **Standard SLDS Styling**: Styled using the Salesforce Lightning Design System (SLDS) for a consistent look and feel.

- **Extensible Code**: Written with modular functions for easy modification and future enhancements.

- **Customizable Year Range**: Allows for an extended year range beyond the default.

### Installation

1. Clone or download this repository.

2. In VS Code, navigate to the project directory.

3. Deploy the component to your Salesforce org using the Salesforce CLI:
```
Bash

sf project deploy start
```
### Usage

Add the component to a parent component or a Lightning App Builder page.

**Example in a Parent LWC**:
```
HTML

<template>
    <c-custom-date-picker-lwc
        label="Select an Appointment Date"
        placeholder="MM/DD/YYYY"
        min="2025-01-01"
        day-to-select="1" ondatechange={handleDateChange}>
    </c-custom-date-picker-lwc>
</template>
```
**Component Properties (@api)**

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| label	   | String	|  "" |	          The label displayed for the date picker. |
| placeholder	|         String	|   "MM/DD/YYYY"| 	The placeholder text for the input field.| 
| min	       |          String	|   ""	        |   The minimum selectable date in 'YYYY-MM-DD' format.| 
| dayToSelect	 |        Number	|   -1	        |   The day of the week to enable (0 = Sunday, 1 = Monday, etc.). Set to -1 to enable all days.| 
| showTodayHyperlink| 	Boolean	|   false	      |   Shows a "Today" link in the calendar footer.| 
| extendedYearRange	|   Boolean	|   false	      |   Enables a custom year range defined by startYear and finishYear.| 
| startYear	     |      Number	|   0	          |   The starting year for the picker, used with extendedYearRange.| 
| finishYear	  |       Number	|   0	          |   The finishing year for the picker, used with extendedYearRange.| 
