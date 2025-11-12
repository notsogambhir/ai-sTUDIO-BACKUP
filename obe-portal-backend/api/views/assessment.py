from rest_framework import viewsets
from ..models import Assessment, Mark
from ..serializers import AssessmentSerializer, MarkSerializer
from ..permissions import IsTeacherOrAdmin

class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = Assessment.objects.all()

        if user.role == 'Teacher':
            queryset = queryset.filter(section__course__teacher=user)

        section_id = self.request.query_params.get('section_id')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return queryset

class MarkViewSet(viewsets.ModelViewSet):
    serializer_class = MarkSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = Mark.objects.all()

        if user.role == 'Teacher':
            queryset = queryset.filter(assessment__section__course__teacher=user)

        assessment_id = self.request.query_params.get('assessment_id')
        if assessment_id:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset
