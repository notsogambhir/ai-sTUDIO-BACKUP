# PRD 2: User Roles and Permissions

This document defines the user roles within the NBA OBE Portal and outlines their specific permissions for accessing and managing data. The permission system is hierarchical and designed to give each user access to only the information and actions relevant to their responsibilities.

## 2.1. User Role Definitions

- **Administrator (`Admin`):** The superuser of the system. Has complete control over the application's structure, user base, and system-wide settings.
- **University (`University`):** A high-level, read-only role (e.g., Dean, Vice-Chancellor) who can view data across all colleges and programs but cannot make changes.
- **Department Head (`Department`):** Manages an entire college or department. Responsible for assigning faculty (PCs and Teachers) and managing student sections at a high level.
- **Program Co-ordinator (`PC`):** The owner of a specific academic program. Manages the program's courses, outcomes (COs/POs), and the teachers assigned to those courses.
- **Teacher (`Teacher`):** The faculty member responsible for one or more courses. Manages course content, assessments, and student grading for their assigned classes.

## 2.2. Permissions Matrix

The following matrix details the permissions for each role across the application's key features.

| Feature / Action | Admin | University | Department | Program Co-ordinator | Teacher |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System-Wide Filtering** | | | | | |
| Select College (Sidebar) | ✅ Yes | ✅ Yes | 🔒 View Own Only | ❌ No | ❌ No |
| Select Program (Sidebar) | ✅ Yes | ✅ Yes | ✅ Yes | 🔒 View Own Only | ❌ No |
| Select Batch (Sidebar) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Academic Structure** | | | | | |
| Create/Edit/Delete Colleges | 👑 Full Control | ❌ No | ❌ No | ❌ No | ❌ No |
| Create/Edit/Delete Programs | 👑 Full Control | ❌ No | ❌ No | ❌ No | ❌ No |
| Create/Edit/Delete Batches | 👑 Full Control | ❌ No | ❌ No | ❌ No | ❌ No |
| Create/Edit/Delete Sections | 👑 Full Control | ❌ No | ✅ Yes (Scoped) | ❌ No | ❌ No |
| **User & Faculty Management** | | | | | |
| Create/Edit/Delete Any User | 👑 Full Control | ❌ No | ❌ No | ❌ No | ❌ No |
| Assign PC to Program | 👑 Full Control | ❌ No | ✅ Yes (Scoped) | ❌ No | ❌ No |
| Assign Teacher to PC | 👑 Full Control | ❌ No | ✅ Yes (Scoped) | ❌ No | ❌ No |
| View All Teachers | 👑 Full Control | 👁️ View Only | ✅ Yes (Scoped) | ✅ Yes (Scoped) | ❌ No |
| **Student Management** | | | | | |
| Add/Upload Students | ✅ Yes (Scoped) | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Scoped) | ❌ No |
| Assign Student to Section | ✅ Yes (Scoped) | ❌ No | ✅ Yes (Scoped) | ❌ No | ❌ No |
| Change Student Status | ✅ Yes (Scoped) | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Scoped) | ❌ No |
| View Student List | 👁️ View All | 👁️ View All | 👁️ View Scoped | 👁️ View Scoped | 👁️ View Scoped |
| **Course Management** | | | | | |
| Create/Upload Courses | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ❌ No |
| Edit Course Settings | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ❌ No |
| Change Course Status | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ❌ No |
| Assign Teacher to Course | ✅ Yes (Scoped) | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Scoped) | ❌ No |
| View Course List | 👁️ View All | 👁️ View All | 👁️ View Scoped | 👁️ View Scoped | 👁️ View Assigned |
| **Outcome Management** | | | | | |
| Create/Edit/Delete POs | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ❌ No |
| Create/Edit/Delete COs | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| Edit CO-PO Mapping | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| **Assessment & Grading** | | | | | |
| Create/Delete Assessments | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| Add/Edit/Delete Questions | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| Map Questions to COs | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| Upload Student Marks | ✅ Yes (Scoped) | ❌ No | ❌ No | ✅ Yes (Scoped) | ✅ Yes (Assigned) |
| **Reports & Attainment** | | | | | |
| View PO Attainment | 👁️ View All | 👁️ View All | 👁️ View Scoped | 👁️ View Scoped | 👁️ View Scoped |
| View CO Attainment | 👁️ View All | 👁️ View All | 👁️ View Scoped | 👁️ View Scoped | 👁️ View Assigned |
| Generate & Download Reports | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

**Legend:**
- 👑 **Full Control:** Can perform all CRUD operations on all entities.
- ✅ **Yes:** Can perform the action.
- 👁️ **View Only:** Can see the data but cannot modify it.
- 🔒 **View Own Only:** Can only see their own assigned entity (e.g., Department Head can't change their own college).
- ❌ **No:** No access to the feature.
- **(Scoped):** Action is limited to the user's domain (e.g., a PC can only manage courses within their own program).
- **(Assigned):** Action is limited to the courses/sections the teacher is directly assigned to.
