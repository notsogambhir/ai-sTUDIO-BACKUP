# PRD 1: Product Overview and Goals

This document provides a comprehensive overview of the NBA OBE Portal, including its strategic goals, target audience, and a detailed breakdown of user roles and their permissions.

---

## 1. Introduction

The **NBA Outcome Based Education (OBE) Portal** is a comprehensive web application designed for educational institutions to manage, track, and calculate learning outcomes in accordance with the National Board of Accreditation (NBA) guidelines. It serves as a centralized platform for faculty and administrators to manage curriculum data, record student performance, and automate the complex process of calculating Course Outcome (CO) and Program Outcome (PO) attainment.

## 2. Problem Statement

Accreditation bodies like the NBA mandate a rigorous, data-driven approach to education. This process is often manual, relying on disparate spreadsheets, which is time-consuming, error-prone, inefficient, and creates a significant reporting burden. The NBA OBE Portal aims to solve these problems by providing a single, streamlined, and automated solution.

## 3. Vision & Goals

**Vision:** To be the definitive digital tool for educational institutions to seamlessly implement and manage Outcome Based Education, transforming the accreditation process from a burdensome chore into a continuous quality improvement cycle.

### Primary Goals
- **Automate Attainment Calculation:** To completely eliminate manual calculations for both CO and PO attainment.
- **Centralize Data Management:** To create a single source of truth for all academic data.
- **Streamline Accreditation Reporting:** To generate comprehensive, downloadable reports aligned with NBA requirements.

## 4. Target Audience & User Roles

The portal is designed for several key user roles within an academic institution:

- **Administrator (`Admin`):** The superuser of the system. Has complete control over the application's structure, user base, and system-wide settings.
- **University (`University`):** A high-level, read-only role (e.g., Dean, Vice-Chancellor) who can view data across all colleges and programs but cannot make changes.
- **Department Head (`Department`):** Manages an entire college or department. Responsible for assigning faculty (PCs and Teachers) and managing student sections at a high level.
- **Program Co-ordinator (`PC`):** The owner of a specific academic program. Manages the program's courses, outcomes (COs/POs), and the teachers assigned to those courses.
- **Teacher (`Teacher`):** The faculty member responsible for one or more courses. Manages course content, assessments, and student grading for their assigned classes.

---

## 5. Detailed Permissions Matrix

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
- 🔒 **View Own Only:** Can only see their own assigned entity.
- ❌ **No:** No access to the feature.
- **(Scoped):** Action is limited to the user's domain (college, program).
- **(Assigned):** Action is limited to the courses/sections the teacher is directly assigned to.
