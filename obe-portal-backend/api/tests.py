from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, College

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            id='testuser',
            employee_id='testemployee',
            username='testuser',
            password='testpassword',
            role='Admin'
        )

    def test_login(self):
        url = reverse('custom_auth_token')
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

class CollegeViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            id='testuser',
            employee_id='testemployee',
            username='testuser',
            password='testpassword',
            role='Admin'
        )
        self.client.force_authenticate(user=self.user)
        self.college = College.objects.create(id='C01', name='Test College')

    def test_get_colleges(self):
        url = reverse('college-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test College')

    def test_create_college(self):
        url = reverse('college-list')
        data = {'id': 'C02', 'name': 'New College'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(College.objects.count(), 2)
