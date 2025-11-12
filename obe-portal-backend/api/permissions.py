from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'Admin' or request.user.is_superuser)

class IsDepartmentHead(BasePermission):
    """
    Allows access only to Department Head users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Department'

class IsProgramCoordinator(BasePermission):
    """
    Allows access only to Program Co-ordinator users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Program Co-ordinator'

class IsTeacher(BasePermission):
    """
    Allows access only to Teacher users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Teacher'

class ReadOnly(BasePermission):
    """
    Allows read-only access to any authenticated user.
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS and request.user and request.user.is_authenticated

class IsAdminOrReadOnly(BasePermission):
    """
    Allows read-only access to any authenticated user, but write access only to admins.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'Admin'

class IsTeacherOrAdmin(BasePermission):
    """
    Allows access to Teachers and Admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'Teacher' or request.user.role == 'Admin')
