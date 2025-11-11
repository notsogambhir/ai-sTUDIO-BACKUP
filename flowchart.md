# Application Flowchart

This flowchart visualizes the structure and data flow of the NBA OBE Portal application. It shows how files are connected, how data is shared, and how users navigate through the app.

```mermaid
graph TD
    subgraph "1. App Initialization"
        A_HTML["index.html<br/>(The Front Door)"] --> B_IndexTSX["index.tsx<br/>(React App Starter)"];
        B_IndexTSX --> C_AppProvider["context/AppContext.tsx<br/>(Shared Data Backpack)"];
        D_MockData["mockData.json<br/>(Fake Database)"] --> C_AppProvider;
        C_AppProvider --> E_App["App.tsx<br/>(The Brain / Router)"];
    end

    subgraph "2. Routing & Authentication"
        E_App -- "User is NOT logged in" --> F_Login["pages/LoginScreen.tsx"];
        E_App -- "User IS logged in" --> G_Protected["ProtectedRoutes (in App.tsx)"];
        F_Login -- "Successful Login" --> G_Protected;
    end

    subgraph "3. Main Application Layout"
        G_Protected -- "Needs to select a program (e.g., Teacher, PC)" --> H_ProgramSelect["pages/ProgramSelectionScreen.tsx"];
        H_ProgramSelect -- "Program & Batch Selected" --> I_MainLayout["components/MainLayout.tsx"];
        G_Protected -- "Program already selected<br/>OR is high-level user (e.g., Admin, Dept)" --> I_MainLayout;
        
        I_MainLayout --> J_Header["components/Header.tsx<br/>(Top Bar)"];
        I_MainLayout --> K_Sidebar["components/Sidebar.tsx<br/>(Navigation Menu)"];
        I_MainLayout --> L_PageContent["[Current Page Component]"];
        
        J_Header -- "Logout" --> F_Login;
        K_Sidebar -- "User clicks a link" --> L_PageContent;
    end
    
    subgraph "4. Page Content & Data Flow"
        subgraph "Global Data 'Backpack'"
            style M_AppContext fill:#ccf,stroke:#333,stroke-width:2px
            style N_useAppContext fill:#ccf,stroke:#333,stroke-width:2px
            M_AppContext["context/AppContext.tsx<br/>(The 'Backpack' Logic)"];
            N_useAppContext["hooks/useAppContext.ts<br/>(Easy access to backpack)"];
        end

        subgraph "Smart Dashboard Router"
            DashboardRouter["pages/Dashboard.tsx"]
            TeacherDash["components/TeacherDashboard.tsx"]
            StatsDash["StatCards & Quick Actions"]
        end
        
        L_PageContent --> DashboardRouter;
        DashboardRouter -- "User is Teacher" --> TeacherDash;
        DashboardRouter -- "Other Roles" --> StatsDash;

        subgraph "Example Management Page: CoursesList"
            P_CoursesList["pages/CoursesList.tsx"];
        end

        L_PageContent --> P_CoursesList;
        
        P_CoursesList -- "Gets shared data & functions" --> N_useAppContext;
        P_CoursesList -- "User uploads file" --> O_ExcelUploader["components/ExcelUploader.tsx"];
        P_CoursesList -- "User confirms an action" --> Q_ConfirmModal["components/ConfirmationModal.tsx"];
        P_CoursesList -- "User clicks 'Manage'" --> R_CourseDetail["pages/CourseDetail.tsx"];
    end

    subgraph "5. Course Detail View (Tabbed Interface)"
        R_CourseDetail --> T1["components/CourseOverviewTab.tsx"];
        R_CourseDetail --> T2["components/ManageCourseOutcomes.tsx"];
        R_CourseDetail --> T3["components/ManageCourseAssessments.tsx"];
        R_CourseDetail --> T4["components/CoPoMappingMatrix.tsx"];
        R_CourseDetail --> T5["components/CourseCoAttainment.tsx"];
        R_CourseDetail --> T6["components/CourseFacultyAssignment.tsx"];
        
        T3 --> T3_Detail["components/AssessmentDetails.tsx"];
        
        subgraph "Save Mechanism"
            S_SaveBar["components/SaveBar.tsx<br/>(Appears on changes)"];
        end

        T1 --> S_SaveBar;
        T2 --> S_SaveBar;
        T3_Detail --> S_SaveBar;
        T4 --> S_SaveBar;
    end
    
    subgraph "6. Interactive Reporting"
        L_PageContent --> ReportDashboard["pages/AttainmentReports.tsx<br/>(Report Selector)"];
        ReportDashboard -- "Generate Report" --> ReportPreview["components/PrintableReport.tsx<br/>(Preview Modal)"];
        ReportPreview -- "Renders..." --> ReportContent{"components/reports/*<br/>- CourseAttainmentSummary<br/>- AssessmentComparison"};
    end

    subgraph "7. Role-Specific Pages"
       L_PageContent --> AdminPanel["pages/AdminPanel.tsx"];
       AdminPanel --> AdminTabs("components/admin/*<br/>- Academic Structure<br/>- User Management<br/>- System Settings");
       
       L_PageContent --> DeptFaculty["pages/DepartmentFacultyManagement.tsx"];
       L_PageContent --> DeptStudents["pages/DepartmentStudentManagement.tsx"];
    end

    style A_HTML fill:#f9f,stroke:#333,stroke-width:2px
    style B_IndexTSX fill:#f9f,stroke:#333,stroke-width:2px
    style E_App fill:#f9f,stroke:#333,stroke-width:2px
    style D_MockData fill:#fcf,stroke:#333,stroke-width:2px
```