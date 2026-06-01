"""
Backend tests for Music School Management System (Flask + SQLite)
Tests auth, admin CRUD (teachers/students/classes), teacher routes, dashboard, RBAC.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fallback to frontend/.env
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')

ADMIN_EMAIL = 'coordenador@escola.com'
ADMIN_PASSWORD = 'admin123'
TEACHER_EMAIL = 'maria.silva@escola.com'
TEACHER_PASSWORD = 'prof123'


# -------- Fixtures --------
@pytest.fixture(scope='session')
def session():
    s = requests.Session()
    s.headers.update({'Content-Type': 'application/json'})
    return s


@pytest.fixture(scope='session')
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()['token']


@pytest.fixture(scope='session')
def teacher_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={'email': TEACHER_EMAIL, 'password': TEACHER_PASSWORD})
    assert r.status_code == 200, f"Teacher login failed: {r.text}"
    return r.json()['token']


def H(token):
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


# -------- Auth --------
class TestAuth:
    def test_health(self, session):
        r = session.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_login_admin_success(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert 'token' in data and isinstance(data['token'], str) and len(data['token']) > 20
        assert data['user']['email'] == ADMIN_EMAIL
        assert data['user']['role'] == 'admin'
        assert 'password_hash' not in data['user']

    def test_login_invalid(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={'email': ADMIN_EMAIL, 'password': 'wrong'})
        assert r.status_code == 401
        assert 'error' in r.json()

    def test_login_missing_fields(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login", json={'email': ''})
        assert r.status_code == 400

    def test_me_with_token(self, session, admin_token):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()['email'] == ADMIN_EMAIL

    def test_me_no_token(self, session):
        r = session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, session):
        r = session.get(f"{BASE_URL}/api/auth/me",
                        headers={'Authorization': 'Bearer abc.def.ghi'})
        assert r.status_code == 401


# -------- RBAC --------
class TestRBAC:
    def test_teacher_cannot_access_admin_teachers(self, session, teacher_token):
        r = session.get(f"{BASE_URL}/api/admin/teachers", headers=H(teacher_token))
        assert r.status_code == 403

    def test_teacher_cannot_create_student(self, session, teacher_token):
        r = session.post(f"{BASE_URL}/api/admin/students",
                         headers=H(teacher_token), json={'name': 'X'})
        assert r.status_code == 403

    def test_admin_can_access_teacher_classes(self, session, admin_token):
        # teacher_required allows admin too per code
        r = session.get(f"{BASE_URL}/api/teacher/classes", headers=H(admin_token))
        # admin has no classes assigned -> returns 200 with empty list
        assert r.status_code == 200


# -------- Admin Teachers CRUD --------
class TestAdminTeachers:
    created_id = None

    def test_list_teachers(self, session, admin_token):
        r = session.get(f"{BASE_URL}/api/admin/teachers", headers=H(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        for t in data:
            assert 'password_hash' not in t
            assert t['role'] == 'teacher'

    def test_create_teacher(self, session, admin_token):
        ts = int(time.time())
        payload = {
            'name': 'TEST_Prof',
            'email': f'test_prof_{ts}@escola.com',
            'password': 'temp123'
        }
        r = session.post(f"{BASE_URL}/api/admin/teachers",
                         headers=H(admin_token), json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data['email'] == payload['email'].lower()
        assert data['role'] == 'teacher'
        assert 'id' in data
        TestAdminTeachers.created_id = data['id']

        # GET to verify
        r2 = session.get(f"{BASE_URL}/api/admin/teachers", headers=H(admin_token))
        emails = [t['email'] for t in r2.json()]
        assert payload['email'] in emails

    def test_create_teacher_duplicate(self, session, admin_token):
        r = session.post(f"{BASE_URL}/api/admin/teachers",
                         headers=H(admin_token),
                         json={'name': 'X', 'email': ADMIN_EMAIL, 'password': 'x'})
        assert r.status_code == 400

    def test_create_teacher_missing(self, session, admin_token):
        r = session.post(f"{BASE_URL}/api/admin/teachers",
                         headers=H(admin_token), json={'name': 'X'})
        assert r.status_code == 400

    def test_delete_teacher(self, session, admin_token):
        assert TestAdminTeachers.created_id is not None
        r = session.delete(f"{BASE_URL}/api/admin/teachers/{TestAdminTeachers.created_id}",
                           headers=H(admin_token))
        assert r.status_code == 200
        # verify soft-deleted: not in active list
        r2 = session.get(f"{BASE_URL}/api/admin/teachers", headers=H(admin_token))
        # Endpoint returns ALL teachers; checking active flag
        for t in r2.json():
            if t['id'] == TestAdminTeachers.created_id:
                assert t['active'] == 0


# -------- Admin Students CRUD --------
class TestAdminStudents:
    created_id = None

    def test_list_students(self, session, admin_token):
        r = session.get(f"{BASE_URL}/api/admin/students", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_student(self, session, admin_token):
        ts = int(time.time())
        payload = {'name': f'TEST_Aluno_{ts}', 'email': 'test@a.com', 'phone': '1234'}
        r = session.post(f"{BASE_URL}/api/admin/students",
                         headers=H(admin_token), json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data['name'] == payload['name']
        TestAdminStudents.created_id = data['id']

    def test_create_student_no_name(self, session, admin_token):
        r = session.post(f"{BASE_URL}/api/admin/students",
                         headers=H(admin_token), json={})
        assert r.status_code == 400

    def test_delete_student(self, session, admin_token):
        assert TestAdminStudents.created_id is not None
        r = session.delete(f"{BASE_URL}/api/admin/students/{TestAdminStudents.created_id}",
                           headers=H(admin_token))
        assert r.status_code == 200
        r2 = session.get(f"{BASE_URL}/api/admin/students", headers=H(admin_token))
        ids = [s['id'] for s in r2.json()]
        assert TestAdminStudents.created_id not in ids


# -------- Admin Classes CRUD --------
class TestAdminClasses:
    created_id = None

    def test_list_classes(self, session, admin_token):
        r = session.get(f"{BASE_URL}/api/admin/classes", headers=H(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for c in data:
            assert 'teacher_name' in c or c.get('teacher_id') is None

    def test_create_class(self, session, admin_token):
        # Get a teacher id
        r = session.get(f"{BASE_URL}/api/admin/teachers", headers=H(admin_token))
        teacher = next(t for t in r.json() if t['active'] == 1)
        ts = int(time.time())
        payload = {
            'name': f'TEST_Turma_{ts}',
            'instrument': 'Guitarra',
            'schedule': 'Seg 10h',
            'teacher_id': teacher['id']
        }
        r = session.post(f"{BASE_URL}/api/admin/classes",
                         headers=H(admin_token), json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data['name'] == payload['name']
        assert data['teacher_id'] == teacher['id']
        assert data.get('teacher_name') == teacher['name']
        TestAdminClasses.created_id = data['id']

    def test_enroll_student(self, session, admin_token):
        # Create temp student
        ts = int(time.time())
        rs = session.post(f"{BASE_URL}/api/admin/students",
                          headers=H(admin_token),
                          json={'name': f'TEST_Enroll_{ts}'})
        sid = rs.json()['id']

        r = session.post(f"{BASE_URL}/api/admin/classes/{TestAdminClasses.created_id}/enroll",
                         headers=H(admin_token), json={'student_id': sid})
        assert r.status_code == 201

        # Duplicate enroll
        r2 = session.post(f"{BASE_URL}/api/admin/classes/{TestAdminClasses.created_id}/enroll",
                          headers=H(admin_token), json={'student_id': sid})
        assert r2.status_code == 400

        # List class students
        r3 = session.get(f"{BASE_URL}/api/admin/classes/{TestAdminClasses.created_id}/students",
                         headers=H(admin_token))
        assert r3.status_code == 200
        ids = [s['id'] for s in r3.json()]
        assert sid in ids

        # Cleanup
        session.delete(f"{BASE_URL}/api/admin/students/{sid}", headers=H(admin_token))

    def test_delete_class(self, session, admin_token):
        r = session.delete(f"{BASE_URL}/api/admin/classes/{TestAdminClasses.created_id}",
                           headers=H(admin_token))
        assert r.status_code == 200


# -------- Teacher routes --------
class TestTeacher:
    def test_teacher_classes(self, session, teacher_token):
        r = session.get(f"{BASE_URL}/api/teacher/classes", headers=H(teacher_token))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Maria Silva should have 'Violão Iniciante'
        assert any('Violão' in c.get('name', '') for c in data)
        TestTeacher.class_id = data[0]['id']

    def test_create_session_and_attendance(self, session, teacher_token, admin_token):
        # get my class
        r = session.get(f"{BASE_URL}/api/teacher/classes", headers=H(teacher_token))
        cls = r.json()[0]
        class_id = cls['id']

        # Create session
        r2 = session.post(f"{BASE_URL}/api/teacher/sessions",
                          headers=H(teacher_token),
                          json={'class_id': class_id,
                                'scheduled_date': '2026-02-01 10:00',
                                'notes': 'TEST aula'})
        assert r2.status_code == 201, r2.text
        sess_id = r2.json()['id']

        # Students in class
        r3 = session.get(f"{BASE_URL}/api/teacher/classes/{class_id}/students",
                         headers=H(teacher_token))
        assert r3.status_code == 200
        students = r3.json()
        if students:
            sid = students[0]['id']
            # Mark attendance
            r4 = session.post(f"{BASE_URL}/api/teacher/sessions/{sess_id}/attendance",
                              headers=H(teacher_token),
                              json={'student_id': sid, 'status': 'present'})
            assert r4.status_code in (200, 201)

            # Toggle to absent (upsert)
            r5 = session.post(f"{BASE_URL}/api/teacher/sessions/{sess_id}/attendance",
                              headers=H(teacher_token),
                              json={'student_id': sid, 'status': 'absent'})
            assert r5.status_code in (200, 201)

            # Invalid status
            r6 = session.post(f"{BASE_URL}/api/teacher/sessions/{sess_id}/attendance",
                              headers=H(teacher_token),
                              json={'student_id': sid, 'status': 'maybe'})
            assert r6.status_code == 400

            # Note
            r7 = session.post(f"{BASE_URL}/api/teacher/students/{sid}/notes",
                              headers=H(teacher_token),
                              json={'note_text': 'TEST nota', 'class_session_id': sess_id})
            assert r7.status_code == 201

            r8 = session.get(f"{BASE_URL}/api/teacher/students/{sid}/notes",
                             headers=H(teacher_token))
            assert r8.status_code == 200
            assert any(n['note_text'] == 'TEST nota' for n in r8.json())

    def test_session_for_other_class_forbidden(self, session, teacher_token, admin_token):
        # Find a class NOT owned by teacher Maria (id 2 likely)
        r = session.get(f"{BASE_URL}/api/admin/classes", headers=H(admin_token))
        my = session.get(f"{BASE_URL}/api/teacher/classes", headers=H(teacher_token)).json()
        my_ids = {c['id'] for c in my}
        other = next((c for c in r.json() if c['id'] not in my_ids), None)
        if other:
            r2 = session.post(f"{BASE_URL}/api/teacher/sessions",
                              headers=H(teacher_token),
                              json={'class_id': other['id'],
                                    'scheduled_date': '2026-02-01'})
            assert r2.status_code == 403


# -------- Dashboard --------
class TestDashboard:
    def test_admin_stats(self, session, admin_token):
        r = session.get(f"{BASE_URL}/api/dashboard/stats", headers=H(admin_token))
        assert r.status_code == 200
        d = r.json()
        for k in ('total_teachers', 'total_students', 'total_classes',
                  'total_presences', 'total_absences'):
            assert k in d
            assert isinstance(d[k], int)

    def test_teacher_stats(self, session, teacher_token):
        r = session.get(f"{BASE_URL}/api/dashboard/stats", headers=H(teacher_token))
        assert r.status_code == 200
        d = r.json()
        for k in ('my_classes', 'my_students', 'my_presences', 'my_absences'):
            assert k in d
            assert isinstance(d[k], int)
        assert d['my_classes'] >= 1
