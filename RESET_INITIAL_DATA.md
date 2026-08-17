# Initial data reset

Production requirements:
- Teacher accounts: EMPTY at first deployment.
- Demo teacher accounts: DO NOT seed.
- Demo classes/students: DO NOT seed unless explicitly requested.
- Super admin:
  - username: admin
  - password: admin@123456

If the project already contains hard-coded demo teacher seed data, remove it.
If a database migration/seed script inserts teachers, change it so it inserts zero teachers.
If a database already exists and must be reset, use a safe migration/reset procedure and verify the teacher table is empty before opening the service to users.
