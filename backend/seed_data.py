from database import get_db, init_db
from auth import hash_password
import os

def seed_initial_data():
    init_db()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if data already exists
        cursor.execute('SELECT COUNT(*) as count FROM users')
        user_count = cursor.fetchone()[0]
        
        if user_count > 0:
            print("Data already seeded. Skipping...")
            return
        
        # Create admin (coordenador)
        admin_password = hash_password('admin123')
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('coordenador@escola.com', admin_password, 'Coordenador Principal', 'admin'))
        
        # Create 2 teachers
        teacher1_password = hash_password('prof123')
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('maria.silva@escola.com', teacher1_password, 'Maria Silva', 'teacher'))
        teacher1_id = cursor.lastrowid
        
        teacher2_password = hash_password('prof123')
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, role)
            VALUES (?, ?, ?, ?)
        ''', ('joao.santos@escola.com', teacher2_password, 'João Santos', 'teacher'))
        teacher2_id = cursor.lastrowid
        
        # Create 3 students
        cursor.execute('''
            INSERT INTO students (name, email, phone)
            VALUES (?, ?, ?)
        ''', ('Ana Costa', 'ana.costa@email.com', '(11) 98765-4321'))
        student1_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO students (name, email, phone)
            VALUES (?, ?, ?)
        ''', ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 98765-4322'))
        student2_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO students (name, email, phone)
            VALUES (?, ?, ?)
        ''', ('Carla Mendes', 'carla.mendes@email.com', '(11) 98765-4323'))
        student3_id = cursor.lastrowid
        
        # Create 2 classes
        cursor.execute('''
            INSERT INTO classes (name, instrument, schedule, teacher_id)
            VALUES (?, ?, ?, ?)
        ''', ('Violão Iniciante', 'Violão', 'Segunda e Quarta 14h-15h', teacher1_id))
        class1_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO classes (name, instrument, schedule, teacher_id)
            VALUES (?, ?, ?, ?)
        ''', ('Piano Intermediário', 'Piano', 'Terça e Quinta 16h-17h', teacher2_id))
        class2_id = cursor.lastrowid
        
        # Enroll students in classes
        cursor.execute('''
            INSERT INTO enrollments (student_id, class_id)
            VALUES (?, ?)
        ''', (student1_id, class1_id))
        
        cursor.execute('''
            INSERT INTO enrollments (student_id, class_id)
            VALUES (?, ?)
        ''', (student2_id, class1_id))
        
        cursor.execute('''
            INSERT INTO enrollments (student_id, class_id)
            VALUES (?, ?)
        ''', (student3_id, class2_id))
        
        conn.commit()
        print("\n" + "="*60)
        print("DADOS INICIAIS CRIADOS COM SUCESSO!")
        print("="*60)
        print("\nCREDENCIAIS DE ACESSO:")
        print("\n1. COORDENADOR (Admin):")
        print("   Email: coordenador@escola.com")
        print("   Senha: admin123")
        print("\n2. PROFESSOR - Maria Silva:")
        print("   Email: maria.silva@escola.com")
        print("   Senha: prof123")
        print("\n3. PROFESSOR - João Santos:")
        print("   Email: joao.santos@escola.com")
        print("   Senha: prof123")
        print("\n" + "="*60)
        print("\nALUNOS CADASTRADOS:")
        print("- Ana Costa")
        print("- Pedro Oliveira")
        print("- Carla Mendes")
        print("\nTURMAS CRIADAS:")
        print("- Violão Iniciante (Prof. Maria Silva)")
        print("- Piano Intermediário (Prof. João Santos)")
        print("="*60 + "\n")

if __name__ == '__main__':
    seed_initial_data()