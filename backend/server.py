from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timezone

# Load environment variables first
load_dotenv()

from database import get_db, init_db, dict_from_row
from auth import hash_password, verify_password, create_token, token_required, admin_required, teacher_required
from seed_data import seed_initial_data

app = Flask(__name__)

# CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": os.environ.get('CORS_ORIGINS', '*').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize database and seed data
init_db()
seed_initial_data()

# ============ AUTH ROUTES ============

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ? AND active = 1', (email,))
        user = dict_from_row(cursor.fetchone())
        
        if not user or not verify_password(password, user['password_hash']):
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        token = create_token(user['id'], user['email'], user['role'])
        user.pop('password_hash')
        
        return jsonify({
            'token': token,
            'user': user
        }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    return jsonify(request.current_user), 200

# ============ ADMIN ROUTES - TEACHERS ============

@app.route('/api/admin/teachers', methods=['GET'])
@token_required
@admin_required
def get_teachers():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, name, role, active, created_at FROM users WHERE role = "teacher" AND active = 1')
        teachers = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(teachers), 200

@app.route('/api/admin/teachers', methods=['POST'])
@token_required
@admin_required
def create_teacher():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    
    if not all([name, email, password]):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, role)
            VALUES (?, ?, ?, ?)
        ''', (email, password_hash, name, 'teacher'))
        
        teacher_id = cursor.lastrowid
        cursor.execute('SELECT id, email, name, role, active, created_at FROM users WHERE id = ?', (teacher_id,))
        teacher = dict_from_row(cursor.fetchone())
        
        return jsonify(teacher), 201

@app.route('/api/admin/teachers/<int:teacher_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_teacher(teacher_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET active = 0 WHERE id = ? AND role = "teacher"', (teacher_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Professor não encontrado'}), 404
        
        return jsonify({'message': 'Professor removido com sucesso'}), 200

@app.route('/api/admin/teachers/<int:teacher_id>/password', methods=['PUT'])
@token_required
@admin_required
def change_teacher_password(teacher_id):
    data = request.get_json()
    new_password = data.get('password', '')
    
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'A senha deve ter no mínimo 6 caracteres'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE id = ? AND role = "teacher" AND active = 1', (teacher_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Professor não encontrado'}), 404
        
        password_hash = hash_password(new_password)
        cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (password_hash, teacher_id))
        
        return jsonify({'message': 'Senha alterada com sucesso'}), 200

@app.route('/api/admin/teachers/<int:teacher_id>/absences', methods=['POST'])
@token_required
@admin_required
def register_teacher_absence(teacher_id):
    data = request.get_json()
    absence_date = data.get('absence_date')
    reason = data.get('reason', '')
    
    if not absence_date:
        return jsonify({'error': 'Data da ausência é obrigatória'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO teacher_absences (teacher_id, absence_date, reason)
            VALUES (?, ?, ?)
        ''', (teacher_id, absence_date, reason))
        
        return jsonify({'message': 'Ausência registrada com sucesso'}), 201

# ============ ADMIN ROUTES - STUDENTS ============

@app.route('/api/admin/students', methods=['GET'])
@token_required
@admin_required
def get_students():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE active = 1')
        students = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(students), 200

@app.route('/api/admin/students', methods=['POST'])
@token_required
@admin_required
def create_student():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    
    if not name:
        return jsonify({'error': 'Nome é obrigatório'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO students (name, email, phone)
            VALUES (?, ?, ?)
        ''', (name, email, phone))
        
        student_id = cursor.lastrowid
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        student = dict_from_row(cursor.fetchone())
        
        return jsonify(student), 201

@app.route('/api/admin/students/<int:student_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_student(student_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE students SET active = 0 WHERE id = ?', (student_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Aluno não encontrado'}), 404
        
        return jsonify({'message': 'Aluno removido com sucesso'}), 200

# ============ ADMIN ROUTES - CLASSES ============

@app.route('/api/admin/classes', methods=['GET'])
@token_required
@admin_required
def get_all_classes():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT c.*, u.name as teacher_name
            FROM classes c
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE c.active = 1
        ''')
        classes = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(classes), 200

@app.route('/api/admin/classes', methods=['POST'])
@token_required
@admin_required
def create_class():
    data = request.get_json()
    name = data.get('name', '').strip()
    instrument = data.get('instrument', '').strip()
    schedule = data.get('schedule', '').strip()
    teacher_id = data.get('teacher_id')
    
    if not name:
        return jsonify({'error': 'Nome da turma é obrigatório'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO classes (name, instrument, schedule, teacher_id)
            VALUES (?, ?, ?, ?)
        ''', (name, instrument, schedule, teacher_id))
        
        class_id = cursor.lastrowid
        cursor.execute('''
            SELECT c.*, u.name as teacher_name
            FROM classes c
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE c.id = ?
        ''', (class_id,))
        class_data = dict_from_row(cursor.fetchone())
        
        return jsonify(class_data), 201

@app.route('/api/admin/classes/<int:class_id>', methods=['PUT'])
@token_required
@admin_required
def update_class(class_id):
    data = request.get_json()
    name = data.get('name', '').strip()
    instrument = data.get('instrument', '').strip()
    schedule = data.get('schedule', '').strip()
    teacher_id = data.get('teacher_id')
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE classes
            SET name = ?, instrument = ?, schedule = ?, teacher_id = ?
            WHERE id = ? AND active = 1
        ''', (name, instrument, schedule, teacher_id, class_id))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Turma não encontrada'}), 404
        
        cursor.execute('''
            SELECT c.*, u.name as teacher_name
            FROM classes c
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE c.id = ?
        ''', (class_id,))
        class_data = dict_from_row(cursor.fetchone())
        
        return jsonify(class_data), 200

@app.route('/api/admin/classes/<int:class_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_class(class_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE classes SET active = 0 WHERE id = ?', (class_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Turma não encontrada'}), 404
        
        return jsonify({'message': 'Turma removida com sucesso'}), 200

@app.route('/api/admin/classes/<int:class_id>/enroll', methods=['POST'])
@token_required
@admin_required
def enroll_student(class_id):
    data = request.get_json()
    student_id = data.get('student_id')
    
    if not student_id:
        return jsonify({'error': 'ID do aluno é obrigatório'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO enrollments (student_id, class_id)
                VALUES (?, ?)
            ''', (student_id, class_id))
            return jsonify({'message': 'Aluno matriculado com sucesso'}), 201
        except Exception as e:
            return jsonify({'error': 'Aluno já matriculado nesta turma'}), 400

@app.route('/api/admin/classes/<int:class_id>/students', methods=['GET'])
@token_required
@admin_required
def get_class_students(class_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.*, e.enrolled_at
            FROM students s
            INNER JOIN enrollments e ON s.id = e.student_id
            WHERE e.class_id = ? AND s.active = 1
        ''', (class_id,))
        students = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(students), 200

# ============ TEACHER ROUTES ============

@app.route('/api/teacher/classes', methods=['GET'])
@token_required
@teacher_required
def get_teacher_classes():
    teacher_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT c.*
            FROM classes c
            WHERE c.teacher_id = ? AND c.active = 1
        ''', (teacher_id,))
        classes = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(classes), 200

@app.route('/api/teacher/classes/<int:class_id>/students', methods=['GET'])
@token_required
@teacher_required
def get_teacher_class_students(class_id):
    teacher_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify teacher owns this class
        cursor.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', (class_id, teacher_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Acesso negado a esta turma'}), 403
        
        cursor.execute('''
            SELECT s.*, e.enrolled_at
            FROM students s
            INNER JOIN enrollments e ON s.id = e.student_id
            WHERE e.class_id = ? AND s.active = 1
        ''', (class_id,))
        students = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(students), 200

@app.route('/api/teacher/classes/<int:class_id>/sessions', methods=['GET'])
@token_required
@teacher_required
def get_class_sessions(class_id):
    teacher_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify teacher owns this class
        cursor.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', (class_id, teacher_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Acesso negado a esta turma'}), 403
        
        cursor.execute('''
            SELECT cs.*,
                   (SELECT COUNT(*) FROM attendance WHERE class_session_id = cs.id) as attendance_count
            FROM class_sessions cs
            WHERE cs.class_id = ?
            ORDER BY cs.scheduled_date DESC
        ''', (class_id,))
        sessions = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(sessions), 200

@app.route('/api/teacher/sessions/<int:session_id>/attendance', methods=['GET'])
@token_required
@teacher_required
def get_session_attendance(session_id):
    teacher_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify teacher owns the class of this session
        cursor.execute('''
            SELECT cs.id FROM class_sessions cs
            INNER JOIN classes c ON cs.class_id = c.id
            WHERE cs.id = ? AND c.teacher_id = ?
        ''', (session_id, teacher_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Acesso negado a esta aula'}), 403
        
        # Get all students enrolled in the class with their attendance status
        cursor.execute('''
            SELECT s.id as student_id, s.name,
                   a.status, a.notes as attendance_notes
            FROM class_sessions cs
            INNER JOIN enrollments e ON cs.class_id = e.class_id
            INNER JOIN students s ON e.student_id = s.id
            LEFT JOIN attendance a ON a.class_session_id = cs.id AND a.student_id = s.id
            WHERE cs.id = ? AND s.active = 1
            ORDER BY s.name
        ''', (session_id,))
        attendance = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(attendance), 200

@app.route('/api/teacher/sessions', methods=['POST'])
@token_required
@teacher_required
def create_session():
    data = request.get_json()
    class_id = data.get('class_id')
    scheduled_date = data.get('scheduled_date')
    notes = data.get('notes', '')
    teacher_id = request.current_user['id']
    
    if not all([class_id, scheduled_date]):
        return jsonify({'error': 'ID da turma e data são obrigatórios'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify teacher owns this class
        cursor.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', (class_id, teacher_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Acesso negado a esta turma'}), 403
        
        cursor.execute('''
            INSERT INTO class_sessions (class_id, scheduled_date, notes, created_by_teacher_id)
            VALUES (?, ?, ?, ?)
        ''', (class_id, scheduled_date, notes, teacher_id))
        
        session_id = cursor.lastrowid
        cursor.execute('SELECT * FROM class_sessions WHERE id = ?', (session_id,))
        session = dict_from_row(cursor.fetchone())
        
        return jsonify(session), 201

@app.route('/api/teacher/sessions/<int:session_id>/attendance', methods=['POST'])
@token_required
@teacher_required
def mark_attendance(session_id):
    data = request.get_json()
    student_id = data.get('student_id')
    status = data.get('status')
    notes = data.get('notes', '')
    
    if not all([student_id, status]):
        return jsonify({'error': 'ID do aluno e status são obrigatórios'}), 400
    
    if status not in ['present', 'absent']:
        return jsonify({'error': 'Status inválido'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO attendance (class_session_id, student_id, status, notes)
                VALUES (?, ?, ?, ?)
            ''', (session_id, student_id, status, notes))
            return jsonify({'message': 'Presença registrada com sucesso'}), 201
        except Exception:
            # Update if already exists
            cursor.execute('''
                UPDATE attendance
                SET status = ?, notes = ?
                WHERE class_session_id = ? AND student_id = ?
            ''', (status, notes, session_id, student_id))
            return jsonify({'message': 'Presença atualizada com sucesso'}), 200

@app.route('/api/students/<int:student_id>/profile', methods=['GET'])
@token_required
def get_student_profile(student_id):
    user_role = request.current_user['role']
    user_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get student data
        cursor.execute('SELECT * FROM students WHERE id = ? AND active = 1', (student_id,))
        student = dict_from_row(cursor.fetchone())
        if not student:
            return jsonify({'error': 'Aluno não encontrado'}), 404
        
        # If teacher, verify they have access (student must be in one of their classes)
        if user_role == 'teacher':
            cursor.execute('''
                SELECT 1 FROM enrollments e
                INNER JOIN classes c ON e.class_id = c.id
                WHERE e.student_id = ? AND c.teacher_id = ?
                LIMIT 1
            ''', (student_id, user_id))
            if not cursor.fetchone():
                return jsonify({'error': 'Acesso negado a este aluno'}), 403
        
        # Get enrolled classes
        cursor.execute('''
            SELECT c.id, c.name, c.instrument, c.schedule, u.name as teacher_name
            FROM enrollments e
            INNER JOIN classes c ON e.class_id = c.id
            LEFT JOIN users u ON c.teacher_id = u.id
            WHERE e.student_id = ? AND c.active = 1
        ''', (student_id,))
        classes = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Get attendance statistics
        cursor.execute('''
            SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as total_present,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as total_absent,
                COUNT(*) as total_classes
            FROM attendance
            WHERE student_id = ?
        ''', (student_id,))
        stats_row = cursor.fetchone()
        total_present = stats_row[0] or 0
        total_absent = stats_row[1] or 0
        total = stats_row[2] or 0
        attendance_rate = round((total_present / total * 100), 1) if total > 0 else 0
        
        # Get attendance history (detailed)
        cursor.execute('''
            SELECT a.status, a.notes as attendance_notes,
                   cs.scheduled_date, cs.notes as session_notes,
                   c.name as class_name, c.instrument
            FROM attendance a
            INNER JOIN class_sessions cs ON a.class_session_id = cs.id
            INNER JOIN classes c ON cs.class_id = c.id
            WHERE a.student_id = ?
            ORDER BY cs.scheduled_date DESC
        ''', (student_id,))
        attendance_history = [dict_from_row(row) for row in cursor.fetchall()]
        
        # Get notes (performance/observations)
        cursor.execute('''
            SELECT sn.id, sn.note_text, sn.created_at,
                   u.name as teacher_name,
                   cs.scheduled_date
            FROM student_notes sn
            INNER JOIN users u ON sn.created_by_teacher_id = u.id
            LEFT JOIN class_sessions cs ON sn.class_session_id = cs.id
            WHERE sn.student_id = ?
            ORDER BY sn.created_at DESC
        ''', (student_id,))
        notes = [dict_from_row(row) for row in cursor.fetchall()]
        
        return jsonify({
            'student': student,
            'classes': classes,
            'stats': {
                'total_present': total_present,
                'total_absent': total_absent,
                'total_classes': total,
                'attendance_rate': attendance_rate
            },
            'attendance_history': attendance_history,
            'notes': notes
        }), 200

@app.route('/api/students/<int:student_id>/notes', methods=['POST'])
@token_required
@teacher_required
def add_note_for_student(student_id):
    data = request.get_json()
    note_text = data.get('note_text', '').strip()
    teacher_id = request.current_user['id']
    
    if not note_text:
        return jsonify({'error': 'Texto da anotação é obrigatório'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify teacher has access to this student
        cursor.execute('''
            SELECT 1 FROM enrollments e
            INNER JOIN classes c ON e.class_id = c.id
            WHERE e.student_id = ? AND c.teacher_id = ?
            LIMIT 1
        ''', (student_id, teacher_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Acesso negado a este aluno'}), 403
        
        cursor.execute('''
            INSERT INTO student_notes (student_id, note_text, created_by_teacher_id)
            VALUES (?, ?, ?)
        ''', (student_id, note_text, teacher_id))
        
        note_id = cursor.lastrowid
        cursor.execute('''
            SELECT sn.*, u.name as teacher_name
            FROM student_notes sn
            INNER JOIN users u ON sn.created_by_teacher_id = u.id
            WHERE sn.id = ?
        ''', (note_id,))
        note = dict_from_row(cursor.fetchone())
        
        return jsonify(note), 201

@app.route('/api/teacher/students/<int:student_id>/notes', methods=['POST'])
@token_required
@teacher_required
def add_student_note(student_id):
    data = request.get_json()
    note_text = data.get('note_text', '').strip()
    class_session_id = data.get('class_session_id')
    teacher_id = request.current_user['id']
    
    if not note_text:
        return jsonify({'error': 'Texto da anotação é obrigatório'}), 400
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO student_notes (student_id, class_session_id, note_text, created_by_teacher_id)
            VALUES (?, ?, ?, ?)
        ''', (student_id, class_session_id, note_text, teacher_id))
        
        note_id = cursor.lastrowid
        cursor.execute('SELECT * FROM student_notes WHERE id = ?', (note_id,))
        note = dict_from_row(cursor.fetchone())
        
        return jsonify(note), 201

@app.route('/api/teacher/students/<int:student_id>/notes', methods=['GET'])
@token_required
@teacher_required
def get_student_notes(student_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT sn.*, u.name as teacher_name, cs.scheduled_date
            FROM student_notes sn
            INNER JOIN users u ON sn.created_by_teacher_id = u.id
            LEFT JOIN class_sessions cs ON sn.class_session_id = cs.id
            WHERE sn.student_id = ?
            ORDER BY sn.created_at DESC
        ''', (student_id,))
        notes = [dict_from_row(row) for row in cursor.fetchall()]
        return jsonify(notes), 200

# ============ DASHBOARD ROUTES ============

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    user_role = request.current_user['role']
    user_id = request.current_user['id']
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        if user_role == 'admin':
            # Admin sees all stats
            cursor.execute('SELECT COUNT(*) as count FROM users WHERE role = "teacher" AND active = 1')
            total_teachers = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) as count FROM students WHERE active = 1')
            total_students = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) as count FROM classes WHERE active = 1')
            total_classes = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE status = "present"')
            total_presences = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE status = "absent"')
            total_absences = cursor.fetchone()[0]
            
            return jsonify({
                'total_teachers': total_teachers,
                'total_students': total_students,
                'total_classes': total_classes,
                'total_presences': total_presences,
                'total_absences': total_absences
            }), 200
        
        else:
            # Teacher sees only their stats
            cursor.execute('SELECT COUNT(*) as count FROM classes WHERE teacher_id = ? AND active = 1', (user_id,))
            my_classes = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT COUNT(DISTINCT e.student_id) as count
                FROM enrollments e
                INNER JOIN classes c ON e.class_id = c.id
                WHERE c.teacher_id = ? AND c.active = 1
            ''', (user_id,))
            my_students = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT COUNT(*) as count
                FROM attendance a
                INNER JOIN class_sessions cs ON a.class_session_id = cs.id
                WHERE cs.created_by_teacher_id = ? AND a.status = "present"
            ''', (user_id,))
            my_presences = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT COUNT(*) as count
                FROM attendance a
                INNER JOIN class_sessions cs ON a.class_session_id = cs.id
                WHERE cs.created_by_teacher_id = ? AND a.status = "absent"
            ''', (user_id,))
            my_absences = cursor.fetchone()[0]
            
            return jsonify({
                'my_classes': my_classes,
                'my_students': my_students,
                'my_presences': my_presences,
                'my_absences': my_absences
            }), 200

@app.route('/api/', methods=['GET'])
def health_check():
    return jsonify({'message': 'Sistema de Gestão Escolar - API funcionando'}), 200

# ASGI wrapper for uvicorn compatibility (Flask is WSGI)
from asgiref.wsgi import WsgiToAsgi
flask_app = app
app = WsgiToAsgi(flask_app)

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=8001, debug=True)