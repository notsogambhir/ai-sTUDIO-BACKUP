# User Guide 6: A Guide for Administrators

This guide covers the powerful, system-wide features available exclusively to the Administrator role. As an Admin, you have full control over the entire application's structure, user base, and default settings.

Your tools are located in the sidebar under the "Admin" section.

## 1. Managing Academic Structure

This is where you define the foundational hierarchy of the institution.

-   **Location:** `Admin > Academic Structure`

### 1.1. Manage Colleges
-   **Function:** Create, edit, and delete the top-level academic units (e.g., "CUIET", "College of Pharmacy").
-   **Actions:**
    -   **Add:** Use the "Add New College" form.
    -   **Edit:** Click the edit icon next to a college to modify its name.
    -   **Delete:** Click the trash icon. A confirmation will be required, as this is a destructive action.

### 1.2. Manage Programs
-   **Function:** Create, edit, and delete academic programs.
-   **Actions:**
    -   **Add:** Use the "Add New Program" form to provide a name, assign it to a **College**, and set its **Duration** in years.
    -   **Edit/Delete:** Use the icons next to each program in the list.

### 1.3. Manage Batches
-   **Function:** Create and delete student cohorts for each program.
-   **Actions:**
    1.  First, select a program from the **"Select Program"** dropdown.
    2.  The "Existing Batches" list will update.
    3.  To add a new batch, enter the **Start Year** in the form. The end year and batch name (e.g., "2025-2029") will be calculated automatically based on the program's duration.
    4.  Click "Add Batch".

## 2. Managing Users

This panel gives you complete control over all user accounts in the system.

-   **Location:** `Admin > User Management`

-   **Viewing Users:** The main table lists all users. You can use the search bar at the top to quickly find a specific user by name, username, role, or ID.

-   **Adding a New User:**
    1.  Click the **"Add New User"** button.
    2.  A modal will appear. Fill in the user's details (Name, Employee ID, Username, Password).
    3.  Select a **Role**. The form will dynamically change to show relevant assignment fields based on the role you choose (e.g., selecting "Department" will show a "College" dropdown).
    4.  Click "Create User".

-   **Editing a User:**
    1.  Click the **Edit** icon next to any user in the table.
    2.  The same modal will appear, pre-filled with their information.
    3.  You can update any detail, including their role and assignments. If you leave the password field blank, their current password will be kept.
    4.  Click "Save Changes".

-   **Deleting a User:** Click the **Trash** icon next to a user. A confirmation will be required.

## 3. Managing System Settings

This panel allows you to configure the default values used for calculations across the entire application.

-   **Location:** `Admin > System Settings`

-   **Editable Settings:**
    -   **Default CO Attainment Target:** The default percentage a student must achieve on a CO. This value is used as the default for all newly created courses.
    -   **Default Attainment Level Thresholds:** The default percentages of students required to meet the target to achieve Level 1, 2, or 3. These are also used as defaults for new courses.
    -   **Default PO Attainment Weights:** The default weights for combining Direct (calculated from student marks) and Indirect (manually entered) attainment data to get the final PO attainment score.

-   **Saving Changes:** All changes on this page are temporary. A **Save Bar** will appear at the bottom. You must click **"Save Changes"** to apply the new defaults system-wide.