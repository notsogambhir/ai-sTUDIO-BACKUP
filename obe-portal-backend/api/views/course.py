from rest_framework import viewsets
from ..models import Course, CourseOutcome, ProgramOutcome, CoPoMapping
from ..serializers import CourseSerializer, CourseOutcomeSerializer, ProgramOutcomeSerializer, CoPoMappingSerializer
from ..permissions import IsAdminOrReadOnly, IsProgramCoordinator

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.all()

        if user.role == 'Department':
            queryset = queryset.filter(program__college=user.college)
        elif user.role in ['Program Co-ordinator', 'Teacher']:
            queryset = queryset.filter(program=user.program)

        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset

class CourseOutcomeViewSet(viewsets.ModelViewSet):
    serializer_class = CourseOutcomeSerializer
    permission_classes = [IsProgramCoordinator]

    def get_queryset(self):
        queryset = CourseOutcome.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class ProgramOutcomeViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramOutcomeSerializer
    permission_classes = [IsProgramCoordinator]

    def get_queryset(self):
        queryset = ProgramOutcome.objects.all()
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

class CoPoMappingViewSet(viewsets.ModelViewSet):
    queryset = CoPoMapping.objects.all()
    serializer_class = CoPoMappingSerializer
    permission_classes = [IsProgramCoordinator]
