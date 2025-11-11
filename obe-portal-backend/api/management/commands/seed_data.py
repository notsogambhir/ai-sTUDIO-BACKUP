import os
from django.core.management.base import BaseCommand
from django.db import connection
from api.models import User
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Seeds the database with initial data from data_insertion.sql.txt'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Correct path to the SQL file, relative to the project root in the container
        sql_file_path = os.path.join(os.getcwd(), 'data_insertion.sql.txt')

        try:
            with connection.cursor() as cursor:
                # Clear existing data in the correct order to avoid foreign key violations
                cursor.execute("DELETE FROM marks;")
                cursor.execute("DELETE FROM assessments;")
                cursor.execute("DELETE FROM co_po_mapping;")
                cursor.execute("DELETE FROM program_outcomes;")
                cursor.execute("DELETE FROM course_outcomes;")
                cursor.execute("DELETE FROM enrollments;")
                cursor.execute("DELETE FROM students;")
                cursor.execute("DELETE FROM sections;")
                cursor.execute("DELETE FROM batches;")
                cursor.execute("DELETE FROM courses;")
                cursor.execute("DELETE FROM users;")
                cursor.execute("DELETE FROM programs;")
                cursor.execute("DELETE FROM colleges;")
                cursor.execute("DELETE FROM system_settings;")

            with open(sql_file_path, 'r') as f:
                sql = f.read()
                with connection.cursor() as cursor:
                    # Split SQL file into individual statements
                    sql_statements = sql.split(';')
                    for statement in sql_statements:
                        if statement.strip():
                            cursor.execute(statement)

            # Hash passwords for all users
            for user in User.objects.all():
                user.password = make_password(user.password)
                user.save()

            self.stdout.write(self.style.SUCCESS('Successfully seeded data and hashed passwords.'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Error: {sql_file_path} not found.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))
