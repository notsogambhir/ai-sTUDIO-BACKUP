from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import User, College, Program, Batch, Section

class UserViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser('admin', 'admin', 'password', role='Admin')
        self.teacher_user = User.objects.create_user('teacher', 'teacher', 'password', role='Teacher')
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_user(self):
        """
        Ensure we can create a new user.
        """
        url = reverse('user-list')
        data = {'username': 'newuser', 'password': 'password', 'role': 'Teacher', 'employee_id': '12345', 'name': 'New User'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        self.assertEqual(User.objects.get(username='newuser').role, 'Teacher')

    def test_list_users(self):
        """
        Ensure we can list users.
        """
        # Verify the properties of the admin user created in setUp
        self.assertTrue(self.admin_user.is_superuser)
        self.assertEqual(self.admin_user.role, 'Admin')

        url = reverse('user-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The response should contain both the admin and the teacher user
        self.assertEqual(len(response.data), 2)

class CollegeViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'admin', 'password', role='Admin', is_staff=True, is_superuser=True)
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.college = College.objects.create(id='CUIET', name='CUIET')

    def test_create_college(self):
        """
        Ensure we can create a new college.
        """
        url = reverse('college-list')
        data = {'id': 'NEW', 'name': 'New College'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(College.objects.count(), 2)
        self.assertEqual(College.objects.get(id='NEW').name, 'New College')

    def test_list_colleges(self):
        """
        Ensure we can list colleges.
        """
        url = reverse('college-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class BatchViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'admin', 'password', role='Admin', is_staff=True)
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.college = College.objects.create(id='CUIET', name='CUIET')
        self.program = Program.objects.create(id='P1', name='BE ME', college=self.college, duration=4)
        self.batch = Batch.objects.create(id='B1', name='2025-2029', program=self.program)

    def test_create_batch(self):
        """
        Ensure we can create a new batch.
        """
        url = reverse('batch-list')
        data = {'id': 'B2', 'name': '2026-2030', 'program': 'P1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Batch.objects.count(), 2)
        self.assertEqual(Batch.objects.get(id='B2').name, '2026-2030')

    def test_list_batches(self):
        """
        Ensure we can list batches.
        """
        url = reverse('batch-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class SectionViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'admin', 'password', role='Admin', is_staff=True)
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.college = College.objects.create(id='CUIET', name='CUIET')
        self.program = Program.objects.create(id='P1', name='BE ME', college=self.college, duration=4)
        self.batch = Batch.objects.create(id='B1', name='2025-2029', program=self.program)
        self.section = Section.objects.create(id='S1', name='A', program=self.program, batch=self.batch)

    def test_create_section(self):
        """
        Ensure we can create a new section.
        """
        url = reverse('section-list')
        data = {'id': 'S2', 'name': 'B', 'program': 'P1', 'batch': 'B1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Section.objects.count(), 2)
        self.assertEqual(Section.objects.get(id='S2').name, 'B')

    def test_list_sections(self):
        """
        Ensure we can list sections.
        """
        url = reverse('section-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class ProgramViewSetTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'admin', 'password', role='Admin', is_staff=True)
        self.token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.college = College.objects.create(id='CUIET', name='CUIET')
        self.program = Program.objects.create(id='P1', name='BE ME', college=self.college, duration=4)

    def test_create_program(self):
        """
        Ensure we can create a new program.
        """
        url = reverse('program-list')
        data = {'id': 'P2', 'name': 'BE ECE', 'college': 'CUIET', 'duration': 4}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Program.objects.count(), 2)
        self.assertEqual(Program.objects.get(id='P2').name, 'BE ECE')

    def test_list_programs(self):
        """
        Ensure we can list programs.
        """
        url = reverse('program-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
