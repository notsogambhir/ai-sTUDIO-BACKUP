/**
 * @file types.ts
 * @description
 * This file is like a dictionary or a rulebook for all the data in our application.
 * It defines the "shape" of every piece of data we use, like what a 'User' should
 * look like, or what information a 'Course' must have.
 *
 * Think of an "interface" as a blueprint for an object. If we're building a car,
 * the blueprint says it MUST have 4 wheels, an engine, and doors. Our `User` interface
 * says a user object MUST have an `id`, a `name`, and a `role`. This helps us avoid
 * bugs by ensuring our data is always structured correctly everywhere in the app.
 */


// --- Enums and Basic Types ---
// These are simple lists of allowed values for certain properties.
// It's like saying a traffic light can only be 'Red', 'Yellow', or 'Green'.

// The different roles a user can have in the system.
export type Role = 'Teacher' | 'Program Co-ordinator' | 'University' | 'Admin' | 'Department';

// The different colleges available in the university.
export type College = 'CUIET' | 'CCP' | 'CBS';

// The possible statuses for a course.
export type CourseStatus = 'Active' | 'Completed' | 'Future';

// The possible statuses for a student.
export type StudentStatus = 'Active' | 'Inactive';


// --- System-wide Settings ---
// This is the blueprint for the application's overall default settings,
// which can be configured by an Admin. It's like the main settings menu on a phone.
export interface SystemSettings {
  // The default percentage a student needs to achieve on a Course Outcome.
  defaultCoTarget: number;
  // The default thresholds for calculating CO attainment levels.
  // This is the grading rule for how well the class is doing as a whole.
  defaultAttainmentLevels: {
    level3: number; // e.g., 80% of students must meet the target for Level 3
    level2: number; // e.g., 70% of students must meet the target for Level 2
    level1: number; // e.g., 50% of students must meet the target for Level 1
  };
  // The default weights for combining direct and indirect PO attainment.
  defaultWeights: {
    direct: number; // The part of the score from student tests.
    indirect: number; // The part of the score from surveys or other feedback.
  };
}


// --- Data Structures ---
// These interfaces are the blueprints for the main "objects" in our application.

// Blueprint for a User account.
export interface User {
  id: string; // A unique identifier for the user.
  employeeId: string; // The user's official employee ID.
  username: string; // The username they use to log in.
  password?: string; // The user's password (optional because we don't always send it from the database).
  role: Role; // The user's job title (e.g., 'Teacher').
  name: string; // The user's full name.
  programId?: string; // If the user is a PC, this is the ID of the program they manage.
  programCoordinatorIds?: string[]; // If a Teacher, these are the PCs they report to.
  status?: 'Active' | 'Inactive'; // Whether the user account is active.
  collegeId?: College; // If the user is a Department head, this is the college they manage.
  departmentId?: string; // If the user is a PC, this is the Department head they report to.
}

// Blueprint for an academic Program (e.g., "BE ECE").
export interface Program {
  id: string; // A unique identifier for the program.
  name: string; // The full name of the program.
  collegeId: College; // The college this program belongs to.
  duration: number; // The duration of the program in years.
}

// Blueprint for a Batch of students (e.g., the "2025-2029" batch).
export interface Batch {
  id: string; // A unique identifier for the batch.
  programId: string; // The program this batch belongs to.
  name: string; // The name of the batch, like "2025-2029".
}

// Blueprint for a Course (e.g., "Introduction to Programming").
export interface Course {
  id: string; // A unique identifier for the course.
  name: string; // The full name of the course.
  code: string; // The course code (e.g., "CS101").
  programId: string; // The program this course belongs to.
  target: number; // The target attainment percentage for this course's COs.
  internalWeightage: number; // Weightage of internal assessments (e.g., mid-terms).
  externalWeightage: number; // Weightage of external assessments (e.g., final exams).
  attainmentLevels: { // Thresholds for calculating CO attainment levels for this specific course.
    level3: number;
    level2: number;
    level1: number;
  };
  status: CourseStatus; // The current status of the course.
  teacherId?: string | null; // The default teacher assigned to the whole course.
  sectionTeacherIds?: { [sectionId: string]: string }; // Specific teacher assignments for each section.
}

// Blueprint for a Student.
export interface Student {
  id: string; // The student's unique ID or registration number.
  name: string; // The student's full name.
  programId: string; // The program the student is enrolled in.
  status: StudentStatus; // The student's current status.
  sectionId?: string | null; // The section the student belongs to (e.g., "Section A").
}

// Blueprint for an Enrollment record, which is like a ticket that links one student to one course.
export interface Enrollment {
  courseId: string;
  studentId: string;
  sectionId?: string | null; // The specific section the student is enrolled in for this course.
}

// Blueprint for a Section (a class group within a batch, e.g., "Section A").
export interface Section {
  id: string; // A unique identifier for the section.
  name: string; // The name of the section (e.g., "A").
  programId: string; // The program this section belongs to.
  batchId: string; // The batch this section is a part of.
}

// Blueprint for a Course Outcome (CO) - a specific skill students should learn in a course.
export interface CourseOutcome {
  id: string; // A unique identifier for the CO.
  courseId: string; // The course this CO belongs to.
  number: string; // The CO number (e.g., "CO1").
  description: string; // The description of the outcome (e.g., "Can write a basic program").
}

// Blueprint for a Program Outcome (PO) - a broad skill graduates should have after the whole program.
export interface ProgramOutcome {
  id: string; // A unique identifier for the PO.
  number: string; // The PO number (e.g., "PO1").
  description: string; // The description of the outcome (e.g., "Can work effectively in a team").
  programId: string; // The program this PO belongs to.
}

// Blueprint for a mapping between a CO and a PO. It's like a thread connecting a small skill to a big skill.
export interface CoPoMapping {
  courseId: string;
  coId: string;
  poId: string;
  level: number; // The strength of the connection (1=weak, 2=medium, 3=strong).
}

// Blueprint for a single question within an assessment.
export interface AssessmentQuestion {
  q: string; // The question number (e.g., "Q1").
  coIds: string[]; // A list of the COs that this question tests.
  maxMarks: number; // The maximum marks for this question.
}

// Blueprint for an Assessment (e.g., a test or exam).
export interface Assessment {
  id: string; // A unique identifier for the assessment.
  sectionId: string; // The section this assessment was for.
  name: string; // The name of the assessment (e.g., "Mid-Term Exam").
  type: 'Internal' | 'External'; // The type of assessment.
  questions: AssessmentQuestion[]; // The list of questions in the assessment.
}

// Blueprint for a student's score on a single question.
export interface MarkScore {
  q: string; // The question number.
  marks: number; // The marks obtained.
}

// Blueprint for a student's marks in a whole assessment. This is their answer sheet.
export interface Mark {
  studentId: string;
  assessmentId: string;
  scores: MarkScore[]; // A list of scores for each question.
}

// A helper type for the CO-PO mapping matrix, making it easier to look up levels.
// It's structured like a grid: { "co_id_1": { "po_id_1": 3, "po_id_2": 2 } }
export interface CoPoMap {
  [coId: string]: {
    [poId: string]: number;
  };
}

// A helper type for Excel uploads of student marks.
export interface StudentMark {
  studentId: string;
  [key: string]: string | number | 'U'; // Allows for dynamic question columns like "Q1", "Q2", etc. 'U' stands for unanswered/absent.
}

// This interface brings everything together, defining the shape of our entire "database" (`mockData.json`).
// It's the master blueprint for all the data in the app.
export interface AppData {
  users: User[];
  colleges: { id: College; name: string }[];
  programs: Program[];
  batches: Batch[];
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
  sections: Section[];
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
  coPoMapping: CoPoMapping[];
  assessments: Assessment[];
  marks: Mark[];
  settings: SystemSettings;
}