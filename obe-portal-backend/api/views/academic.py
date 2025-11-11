from rest_framework import viewsets
from ..models import College, Program, Batch, Section
from ..serializers import CollegeSerializer, ProgramSerializer, BatchSerializer, SectionSerializer
from ..permissions import IsAdminOrReadOnly

class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [IsAdminOrReadOnly]

class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Program.objects.all()

        if user.role == 'Department':
            queryset = queryset.filter(college=user.college)
        elif user.role == 'Program Co-ordinator':
            queryset = queryset.filter(id=user.program.id)

        college_id = self.request.query_params.get('college_id')
        if college_id:
            queryset = queryset.filter(college_id=college_id)

        return queryset

class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Batch.objects.all()
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset

class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Section.objects.all()
        batch_id = self.request.query_params.get('batch_id')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
