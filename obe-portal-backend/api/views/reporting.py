from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Program, Course
from ..serializers import ProgramSerializer, CourseSerializer
from .attainment import ProgramAttainmentView, CourseAttainmentView

class ProgramReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        program_id = self.kwargs.get('program_id')
        try:
            program = Program.objects.get(id=program_id)
        except Program.DoesNotExist:
            return Response({"error": "Program not found"}, status=404)

        po_attainment_view = ProgramAttainmentView()
        po_attainment_data = po_attainment_view.get(request, *args, **kwargs).data

        report_data = {
            'program': po_attainment_data['program'],
            'po_attainment': po_attainment_data['po_attainment'],
        }

        return Response(report_data)

class CourseReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        co_attainment_view = CourseAttainmentView()
        co_attainment_data = co_attainment_view.get(request, *args, **kwargs).data

        report_data = {
            'course': co_attainment_data['course'],
            'co_attainment': co_attainment_data['co_attainment'],
        }

        return Response(report_data)
