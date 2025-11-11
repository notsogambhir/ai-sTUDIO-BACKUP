from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.contrib.postgres.fields import ArrayField

class UserManager(BaseUserManager):
    def create_user(self, employee_id, username, password=None, **extra_fields):
        if not employee_id:
            raise ValueError('The Employee ID must be set')
        if not username:
            raise ValueError('The Username must be set')

        user = self.model(
            employee_id=employee_id,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(employee_id, username, password, **extra_fields)

class College(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'colleges'

    def __str__(self):
        return self.name

class Program(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=255)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='programs')
    duration = models.IntegerField()

    class Meta:
        db_table = 'programs'

    def __str__(self):
        return self.name

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('Teacher', 'Teacher'),
        ('Program Co-ordinator', 'Program Co-ordinator'),
        ('University', 'University'),
        ('Admin', 'Admin'),
        ('Department', 'Department'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )

    id = models.CharField(max_length=20, primary_key=True)
    employee_id = models.CharField(max_length=50, unique=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128) # Store password hash
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True)
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_pcs')
    program_coordinator_ids = ArrayField(models.CharField(max_length=20), blank=True, null=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['employee_id', 'name', 'role']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.name

class Course(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Future', 'Future'),
    )
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    target = models.IntegerField()
    internal_weightage = models.IntegerField()
    external_weightage = models.IntegerField()
    attainment_level3 = models.IntegerField()
    attainment_level2 = models.IntegerField()
    attainment_level1 = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    section_teacher_ids = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'courses'

    def __str__(self):
        return self.name

class Batch(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=50)

    class Meta:
        db_table = 'batches'

    def __str__(self):
        return self.name

class Section(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=50)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='sections')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='sections')

    class Meta:
        db_table = 'sections'

    def __str__(self):
        return f"{self.program.name} - {self.batch.name} - {self.name}"

class Student(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=255)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='students')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    class Meta:
        db_table = 'students'

    def __str__(self):
        return self.name

class Enrollment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ('course', 'student')

class CourseOutcome(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_outcomes')
    number = models.CharField(max_length=10)
    description = models.TextField()

    class Meta:
        db_table = 'course_outcomes'

    def __str__(self):
        return f"{self.course.code} - {self.number}"

class ProgramOutcome(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='program_outcomes')
    number = models.CharField(max_length=10)
    description = models.TextField()

    class Meta:
        db_table = 'program_outcomes'

    def __str__(self):
        return f"{self.program.id} - {self.number}"

class CoPoMapping(models.Model):
    LEVEL_CHOICES = ((1, '1'), (2, '2'), (3, '3'))
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    co = models.ForeignKey(CourseOutcome, on_delete=models.CASCADE)
    po = models.ForeignKey(ProgramOutcome, on_delete=models.CASCADE)
    level = models.IntegerField(choices=LEVEL_CHOICES)

    class Meta:
        db_table = 'co_po_mapping'
        unique_together = ('co', 'po')

class Assessment(models.Model):
    TYPE_CHOICES = (
        ('Internal', 'Internal'),
        ('External', 'External'),
    )
    id = models.CharField(max_length=20, primary_key=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='assessments')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    questions = models.JSONField()

    class Meta:
        db_table = 'assessments'

    def __str__(self):
        return self.name

class Mark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    scores = models.JSONField()

    class Meta:
        db_table = 'marks'
        unique_together = ('student', 'assessment')

class SystemSettings(models.Model):
    id = models.IntegerField(primary_key=True, default=1)
    default_co_target = models.IntegerField()
    default_attainment_level3 = models.IntegerField()
    default_attainment_level2 = models.IntegerField()
    default_attainment_level1 = models.IntegerField()
    default_weight_direct = models.IntegerField()
    default_weight_indirect = models.IntegerField()

    class Meta:
        db_table = 'system_settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SystemSettings, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
