from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated

from ..models import User, Student, Enrollment, College, Program, Course, Batch, Section, CourseOutcome, ProgramOutcome, CoPoMapping, Assessment, Mark, SystemSettings
from ..serializers import UserSerializer, StudentSerializer, EnrollmentSerializer, CollegeSerializer, ProgramSerializer, CourseSerializer, BatchSerializer, SectionSerializer, CourseOutcomeSerializer, ProgramOutcomeSerializer, CoPoMappingSerializer, AssessmentSerializer, MarkSerializer, SystemSettingsSerializer
from ..permissions import IsAdminUser, IsDepartmentHead, IsProgramCoordinator

class UserViewSet(viewsets.ModelViewSet):
    """
    Provides full CRUD functionality for User accounts.
    - Admin: Can perform all operations on any user.
    - Department Head: Can view and manage users within their college (PCs, Teachers).
    - Program Co-ordinator: Can view and manage teachers assigned to them.
    """
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        - Admin has full access.
        - Other authenticated users have read-only access to lists/details.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filters the queryset based on the role of the requesting user.
        """
        user = self.request.user
        queryset = User.objects.all().order_by('name')

        if user.is_superuser or user.role == 'Admin':
            return queryset

        # Department Head sees all users in their college
        if user.role == 'Department' and user.college:
            return queryset.filter(college=user.college)

        # Program Co-ordinator sees teachers assigned to their program
        if user.role == 'Program Co-ordinator' and user.program:
            return queryset.filter(program_coordinator_ids__contains=[user.id])

        # A teacher should only see their own profile, handled by detail view
        if user.role == 'Teacher':
            return queryset.filter(id=user.id)

        # Fallback for other roles or incomplete data, return empty
        return queryset.none()

    def perform_create(self, serializer):
        """
        Hashes the password before saving a new user.
        """
        password = make_password(serializer.validated_data['password'])
        serializer.save(password=password)

    def perform_update(self, serializer):
        """
        Hashes the password if it is being updated.
        """
        if 'password' in serializer.validated_data:
            password = make_password(serializer.validated_data['password'])
            serializer.save(password=password)
        else:
            serializer.save()

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Student.objects.all()

        if user.role == 'Department':
            queryset = queryset.filter(program__college=user.college)
        elif user.role in ['Program Co-ordinator', 'Teacher']:
            queryset = queryset.filter(program=user.program)

        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        college_id = self.request.query_params.get('college_id')
        if college_id:
            queryset = queryset.filter(program__college_id=college_id)

        batch_name = self.request.query_params.get('batch_name')
        if batch_name:
            queryset = queryset.filter(batch__name=batch_name)

        return queryset

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

class AppDataView(views.APIView):
    def get(self, request, *args, **kwargs):
        user = request.user

        # Base data for all users
        system_settings = SystemSettings.objects.first()

        # Scoped data based on user role
        if user.role == 'Admin' or user.role == 'University':
            colleges = College.objects.all()
            programs = Program.objects.all()
            courses = Course.objects.all()
            batches = Batch.objects.all()
            sections = Section.objects.all()
            students = Student.objects.all()
            users = User.objects.all()
            course_outcomes = CourseOutcome.objects.all()
            program_outcomes = ProgramOutcome.objects.all()
            co_po_mappings = CoPoMapping.objects.all()
            assessments = Assessment.objects.all()
            marks = Mark.objects.all()

        elif user.role == 'Department':
            colleges = College.objects.filter(id=user.college.id)
            programs = Program.objects.filter(college=user.college)
            program_ids = programs.values_list('id', flat=True)
            courses = Course.objects.filter(program__in=program_ids)
            batches = Batch.objects.filter(program__in=program_ids)
            sections = Section.objects.filter(program__in=program_ids)
            students = Student.objects.filter(program__in=program_ids)
            users = User.objects.filter(college=user.college)
            course_outcomes = CourseOutcome.objects.filter(course__program__in=program_ids)
            program_outcomes = ProgramOutcome.objects.filter(program__in=program_ids)
            co_po_mappings = CoPoMapping.objects.filter(course__program__in=program_ids)
            assessments = Assessment.objects.filter(section__program__in=program_ids)
            marks = Mark.objects.filter(assessment__section__program__in=program_ids)

        elif user.role == 'Program Co-ordinator':
            programs = Program.objects.filter(id=user.program.id)
            courses = Course.objects.filter(program=user.program)
            batches = Batch.objects.filter(program=user.program)
            sections = Section.objects.filter(program=user.program)
            students = Student.objects.filter(program=user.program)
            users = User.objects.filter(program=user.program)
            course_outcomes = CourseOutcome.objects.filter(course__program=user.program)
            program_outcomes = ProgramOutcome.objects.filter(program=user.program)
            co_po_mappings = CoPoMapping.objects.filter(course__program=user.program)
            assessments = Assessment.objects.filter(section__program=user.program)
            marks = Mark.objects.filter(assessment__section__program=user.program)
            colleges = College.objects.filter(id=user.program.college.id)

        elif user.role == 'Teacher':
            courses = Course.objects.filter(teacher=user)
            course_ids = courses.values_list('id', flat=True)
            sections = Section.objects.filter(course__in=course_ids)
            section_ids = sections.values_list('id', flat=True)
            students = Student.objects.filter(section__in=section_ids)
            course_outcomes = CourseOutcome.objects.filter(course__in=course_ids)
            program_ids = courses.values_list('program_id', flat=True).distinct()
            programs = Program.objects.filter(id__in=program_ids)
            program_outcomes = ProgramOutcome.objects.filter(program__in=program_ids)
            co_po_mappings = CoPoMapping.objects.filter(course__in=course_ids)
            assessments = Assessment.objects.filter(section__in=section_ids)
            marks = Mark.objects.filter(assessment__section__in=section_ids)

            # These are not directly scoped to the teacher, but are needed for context
            colleges = College.objects.filter(programs__in=program_ids).distinct()
            batches = Batch.objects.filter(program__in=program_ids)
            users = User.objects.filter(id=user.id) # Only the current user

        else: # Default for any other role
            colleges, programs, courses, batches, sections, students, users = [], [], [], [], [], [], []
            course_outcomes, program_outcomes, co_po_mappings, assessments, marks = [], [], [], [], []

        return Response({
            'systemSettings': SystemSettingsSerializer(system_settings).data,
            'colleges': CollegeSerializer(colleges, many=True).data,
            'programs': ProgramSerializer(programs, many=True).data,
            'courses': CourseSerializer(courses, many=True).data,
            'batches': BatchSerializer(batches, many=True).data,
            'sections': SectionSerializer(sections, many=True).data,
            'students': StudentSerializer(students, many=True).data,
            'users': UserSerializer(users, many=True).data,
            'courseOutcomes': CourseOutcomeSerializer(course_outcomes, many=True).data,
            'programOutcomes': ProgramOutcomeSerializer(program_outcomes, many=True).data,
            'coPoMappings': CoPoMappingSerializer(co_po_mappings, many=True).data,
            'assessments': AssessmentSerializer(assessments, many=True).data,
            'marks': MarkSerializer(marks, many=True).data,
        })
