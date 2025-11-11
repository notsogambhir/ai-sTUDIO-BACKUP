from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow all methods for admins, but only safe methods (GET, HEAD, OPTIONS) for others.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'Admin'

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'Admin'

class IsProgramCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'Program Co-ordinator'

class IsDepartmentHead(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'Department'
