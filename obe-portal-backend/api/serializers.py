from rest_framework import serializers
from .models import (
    User, College, Program, Course, Batch, Section, Student, Enrollment,
    CourseOutcome, ProgramOutcome, CoPoMapping, Assessment, Mark, SystemSettings
)

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'employee_id', 'username', 'password', 'role', 'name', 'status', 'program', 'college', 'department', 'program_coordinator_ids')
        extra_kwargs = {
            'password': {'write_only': True},
        }

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class CourseOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseOutcome
        fields = '__all__'

class ProgramOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramOutcome
        fields = '__all__'

class CoPoMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoPoMapping
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class MarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mark
        fields = '__all__'

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'
