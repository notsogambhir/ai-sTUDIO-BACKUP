from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.auth import CustomAuthToken, UserData
from .views.academic import CollegeViewSet, ProgramViewSet, BatchViewSet, SectionViewSet
from .views.course import CourseViewSet, CourseOutcomeViewSet, ProgramOutcomeViewSet, CoPoMappingViewSet
from .views.assessment import AssessmentViewSet, MarkViewSet
from .views.user import UserViewSet, StudentViewSet, EnrollmentViewSet, AppDataView

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'course-outcomes', CourseOutcomeViewSet, basename='courseoutcome')
router.register(r'program-outcomes', ProgramOutcomeViewSet, basename='programoutcome')
router.register(r'co-po-mapping', CoPoMappingViewSet, basename='copomapping')
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'marks', MarkViewSet, basename='mark')
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomAuthToken.as_view(), name='custom_auth_token'),
    path('auth/user/', UserData.as_view()),
    path('app-data/', AppDataView.as_view()),
]
