from rest_framework import viewsets
from ..models import Assessment, Mark
from ..serializers import AssessmentSerializer, MarkSerializer
from ..permissions import IsAdminOrReadOnly

class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Assessment.objects.all()
        section_id = self.request.query_params.get('section_id')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        return queryset

class MarkViewSet(viewsets.ModelViewSet):
    serializer_class = MarkSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Mark.objects.all()
        assessment_id = self.request.query_params.get('assessment_id')
        if assessment_id:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset
