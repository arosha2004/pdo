function buildScopeFilter(user, filters = {}) {
  const scope = {};

  // Employees can only see themselves
  if (user.appRole === 'employee') {
    scope.userId = user.id;
  } else if (user.appRole === 'manager') {
    // Managers are restricted to their branch/department
    scope.user = {
      branch: user.branch,
      department: user.department,
    };
  } else if (user.appRole === 'admin') {
    // Admins see everything, but can filter
    scope.user = {};
  }

  // Apply explicit filters if allowed (for managers and admins)
  if (user.appRole !== 'employee') {
    if (filters.branch) scope.user.branch = filters.branch;
    if (filters.department) scope.user.department = filters.department;
    if (filters.jobGroup) scope.user.jobGroup = filters.jobGroup;
  }

  // Cleanup empty user object
  if (scope.user && Object.keys(scope.user).length === 0) {
    delete scope.user;
  }

  return scope;
}

module.exports = { buildScopeFilter };
