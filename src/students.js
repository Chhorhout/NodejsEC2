import bcrypt from 'bcrypt';
import express from 'express';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase.js';

const router = express.Router();

// Register a new student
router.post('/register', async (req, res) => {
    try {
        const { sid, sname, semail, spass } = req.body;
        
        if (!sid || !sname || !semail || !spass) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        console.log('Attempting to register student:', { sid, sname, semail });
        
        // Check if student exists
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('semail', '==', semail));
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(spass, salt);

        // Create student
        const newStudent = await addDoc(studentsRef, {
            sid,
            sname,
            semail,
            spass: hashedPassword,
            created_at: new Date()
        });

        res.status(201).json({
            id: newStudent.id,
            sid,
            sname,
            semail
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login a student
router.post('/login', async (req, res) => {
    try {
        const { semail, spass } = req.body;

        // Check if student exists
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('semail', '==', semail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const studentDoc = querySnapshot.docs[0];
        const student = studentDoc.data();

        // Validate password
        const validPassword = await bcrypt.compare(spass, student.spass);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            id: studentDoc.id,
            sid: student.sid,
            sname: student.sname,
            semail: student.semail
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for students
router.get('/search', async (req, res) => {
    try {
        // Extract the query parameter and validate it
        const { query: searchQuery } = req.query;

        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid query parameter' });
        }

        // Reference to the Firestore collection
        const studentsRef = collection(db, 'students');
        const querySnapshot = await getDocs(studentsRef);

        // Process the documents
        const students = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(student => 
                student.sname && student.sname.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(({ id, sid, sname, semail }) => ({ id, sid, sname, semail }));

        // Return the filtered results
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student information
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sname, semail } = req.body;

        const studentRef = doc(db, 'students', id);
        await updateDoc(studentRef, {
            sname,
            semail
        });

        res.json({
            id,
            sname,
            semail
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a student
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const studentRef = doc(db, 'students', id);
        await deleteDoc(studentRef);
        
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
