from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Program, Course, Student, Mark, Assessment, CoPoMapping
from ..serializers import ProgramSerializer, CourseSerializer, StudentSerializer

class ProgramAttainmentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        program_id = self.kwargs.get('program_id')
        try:
            program = Program.objects.get(id=program_id)
        except Program.DoesNotExist:
            return Response({"error": "Program not found"}, status=404)

        courses = Course.objects.filter(program=program)
        po_attainment = {}

        for course in courses:
            co_attainment = self.calculate_co_attainment(course)
            co_po_mappings = CoPoMapping.objects.filter(course=course)

            for mapping in co_po_mappings:
                po = mapping.po
                if po.id not in po_attainment:
                    po_attainment[po.id] = {'po': po, 'co_attainments': []}

                po_attainment[po.id]['co_attainments'].append({
                    'co': mapping.co,
                    'attainment': co_attainment.get(mapping.co.id, 0),
                    'mapping_level': mapping.level,
                })

        return Response({
            'program': ProgramSerializer(program).data,
            'po_attainment': po_attainment,
        })

    def calculate_co_attainment(self, course):
        co_attainment = {}
        assessments = Assessment.objects.filter(section__course=course)
        for assessment in assessments:
            marks = Mark.objects.filter(assessment=assessment)
            for mark in marks:
                for score in mark.scores:
                    question = next((q for q in assessment.questions if q['q'] == score['q']), None)
                    if question:
                        for co_id in question['coIds']:
                            if co_id not in co_attainment:
                                co_attainment[co_id] = {'total_marks': 0, 'scored_marks': 0}
                            co_attainment[co_id]['total_marks'] += question['maxMarks']
                            co_attainment[co_id]['scored_marks'] += score['marks']

        for co_id, data in co_attainment.items():
            co_attainment[co_id] = (data['scored_marks'] / data['total_marks']) * 100 if data['total_marks'] > 0 else 0

        return co_attainment

class CourseAttainmentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        co_attainment = self.calculate_co_attainment(course)

        return Response({
            'course': CourseSerializer(course).data,
            'co_attainment': co_attainment,
        })

    def calculate_co_attainment(self, course):
        co_attainment = {}
        assessments = Assessment.objects.filter(section__course=course)
        for assessment in assessments:
            marks = Mark.objects.filter(assessment=assessment)
            for mark in marks:
                for score in mark.scores:
                    question = next((q for q in assessment.questions if q['q'] == score['q']), None)
                    if question:
                        for co_id in question['coIds']:
                            if co_id not in co_attainment:
                                co_attainment[co_id] = {'total_marks': 0, 'scored_marks': 0}
                            co_attainment[co_id]['total_marks'] += question['maxMarks']
                            co_attainment[co_id]['scored_marks'] += score['marks']

        for co_id, data in co_attainment.items():
            co_attainment[co_id] = (data['scored_marks'] / data['total_marks']) * 100 if data['total_marks'] > 0 else 0

        return co_attainment

class StudentAttainmentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        student_id = self.kwargs.get('student_id')
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        enrollments = student.enrollment_set.all()
        co_attainment = {}

        for enrollment in enrollments:
            course = enrollment.course
            assessments = Assessment.objects.filter(section__course=course, section=enrollment.section)
            for assessment in assessments:
                try:
                    mark = Mark.objects.get(assessment=assessment, student=student)
                    for score in mark.scores:
                        question = next((q for q in assessment.questions if q['q'] == score['q']), None)
                        if question:
                            for co_id in question['coIds']:
                                if co_id not in co_attainment:
                                    co_attainment[co_id] = {'total_marks': 0, 'scored_marks': 0}
                                co_attainment[co_id]['total_marks'] += question['maxMarks']
                                co_attainment[co_id]['scored_marks'] += score['marks']
                except Mark.DoesNotExist:
                    pass

        for co_id, data in co_attainment.items():
            co_attainment[co_id] = (data['scored_marks'] / data['total_marks']) * 100 if data['total_marks'] > 0 else 0

        return Response({
            'student': StudentSerializer(student).data,
            'co_attainment': co_attainment,
        })
