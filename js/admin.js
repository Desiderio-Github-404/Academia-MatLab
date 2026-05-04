import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaPlPSIzBjjlMe46_XqkFfjaAJhQAvBac",
  authDomain: "mentorx-c28fd.firebaseapp.com",
  projectId: "mentorx-c28fd",
  storageBucket: "mentorx-c28fd.firebasestorage.app",
  messagingSenderId: "440701253556",
  appId: "1:440701253556:web:d718a8c4405a26a6a364e1",
  measurementId: "G-0HPK2ZS6BG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'adminmentorx2026@gmail.com';
const ADMIN_UID = 'adminmentorx';

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  initAdminPanel();
  initFirebase();
});

function initFirebase() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      loadAdminData();
    } else {
      const storedAdmin = JSON.parse(localStorage.getItem(`user_${ADMIN_UID}`) || '{}');
      if (storedAdmin && storedAdmin.userType === 'admin' && storedAdmin.email === ADMIN_EMAIL) {
        currentUser = { uid: ADMIN_UID, email: ADMIN_EMAIL };
        loadAdminData();
      } else {
        window.location.href = 'login.html';
      }
    }
  });
}

function initAdminPanel() {
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const sections = document.querySelectorAll('.admin-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const sectionId = `${btn.dataset.section}-section`;
      document.getElementById(sectionId).classList.add('active');
    });
  });
}

async function loadAdminData() {
  await Promise.all([
    loadOverviewStats(),
    loadTeacherApplications(),
    loadUsers(),
    loadCourses()
  ]);
}

async function loadOverviewStats() {
  try {
    const [studentsSnap, teachersSnap, coursesSnap, applicationsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'teachers')),
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'teacherApplications')),
      getDocs(collection(db, 'users'))
    ]);

    const studentsCount = studentsSnap.size;
    const teachersCount = teachersSnap.size;
    const coursesCount = coursesSnap.size;
    const applicationsCount = applicationsSnap.size;
    const usersCount = usersSnap.size;

    updateStat('students-count', studentsCount);
    updateStat('teachers-count', teachersCount);
    updateStat('courses-count', coursesCount);
    updateStat('users-count', usersCount);

    updateStat('students-count-overview', studentsCount);
    updateStat('teachers-count-overview', teachersCount);
    updateStat('courses-count-overview', coursesCount);
    updateStat('applications-count-overview', applicationsCount);
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

function updateStat(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

async function loadTeacherApplications() {
  const tableBody = document.querySelector('#applications-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  try {
    const applicationsSnap = await getDocs(collection(db, 'teacherApplications'));

    if (applicationsSnap.empty) {
      tableBody.innerHTML = `<tr><td colspan="5">Nenhuma adesão de professor encontrada.</td></tr>`;
      return;
    }

    applicationsSnap.forEach(docItem => {
      const data = docItem.data();
      const status = data.status || 'pending';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.name || 'Sem nome'}</td>
        <td>${data.email || '-'}</td>
        <td>${data.specialty || data.area || 'Não informado'}</td>
        <td><span class="status-badge ${status}">${status}</span></td>
        <td class="admin-actions">
          <button class="btn btn-primary" onclick="handleApplication('${docItem.id}', 'approved')">Aprovar</button>
          <button class="btn btn-secondary" onclick="handleApplication('${docItem.id}', 'rejected')">Rejeitar</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar adesões:', error);
    tableBody.innerHTML = `<tr><td colspan="5">Erro ao buscar dados.</td></tr>`;
  }
}

window.handleApplication = async function(applicationId, status) {
  try {
    const applicationRef = doc(db, 'teacherApplications', applicationId);
    await updateDoc(applicationRef, { status });
    loadTeacherApplications();
    loadOverviewStats();
  } catch (error) {
    console.error('Erro ao atualizar adesão:', error);
  }
};

async function loadUsers() {
  const tableBody = document.querySelector('#users-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      tableBody.innerHTML = `<tr><td colspan="5">Nenhum usuário cadastrado.</td></tr>`;
      return;
    }

    usersSnap.forEach(docItem => {
      const data = docItem.data();
      const status = data.status || 'active';
      const role = data.role || 'aluno';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.name || 'Usuário'}</td>
        <td>${data.email || '-'}</td>
        <td>${role}</td>
        <td><span class="status-badge ${status}">${status}</span></td>
        <td class="admin-actions">
          <button class="btn btn-primary" onclick="toggleUserStatus('${docItem.id}', '${status}')">${status === 'active' ? 'Bloquear' : 'Ativar'}</button>
          <button class="btn btn-secondary" onclick="promoteUser('${docItem.id}', '${role}')">${role === 'professor' ? 'Rebaixar' : 'Promover'}</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    tableBody.innerHTML = `<tr><td colspan="5">Erro ao buscar dados.</td></tr>`;
  }
}

window.toggleUserStatus = async function(userId, currentStatus) {
  try {
    const userRef = doc(db, 'users', userId);
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await updateDoc(userRef, { status: nextStatus });
    loadUsers();
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
  }
};

window.promoteUser = async function(userId, role) {
  try {
    const userRef = doc(db, 'users', userId);
    const nextRole = role === 'professor' ? 'aluno' : 'professor';
    await updateDoc(userRef, { role: nextRole });
    loadUsers();
    loadOverviewStats();
  } catch (error) {
    console.error('Erro ao alterar função do usuário:', error);
  }
};

async function loadCourses() {
  const tableBody = document.querySelector('#courses-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  try {
    const coursesSnap = await getDocs(query(collection(db, 'courses'), orderBy('title', 'asc')));
    if (coursesSnap.empty) {
      tableBody.innerHTML = `<tr><td colspan="4">Nenhum curso encontrado.</td></tr>`;
      return;
    }

    coursesSnap.forEach(docItem => {
      const data = docItem.data();
      const status = data.status || 'ativo';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.title || 'Sem título'}</td>
        <td>${data.category || 'Sem categoria'}</td>
        <td>${data.teacherName || 'Não informado'}</td>
        <td><span class="status-badge ${status === 'ativo' ? 'active' : 'blocked'}">${status}</span></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    tableBody.innerHTML = `<tr><td colspan="4">Erro ao buscar dados.</td></tr>`;
  }
}

window.logout = async function() {
  try {
    if (!auth.currentUser && currentUser && currentUser.uid === ADMIN_UID) {
      localStorage.removeItem(`user_${ADMIN_UID}`);
      window.location.href = 'login.html';
      return;
    }

    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Erro no logout:', error);
  }
};
