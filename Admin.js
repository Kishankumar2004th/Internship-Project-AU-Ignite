document.addEventListener('DOMContentLoaded', function() {
      // Check if admin is logged in
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) {
        alert('Please login first');
        window.location.href = 'Login.html';
        return;
      }

      // Get current user data
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const currentUser = users.find(u => u.id === currentUserId);
      
      if (!currentUser) {
        alert('User session expired. Please login again.');
        localStorage.removeItem('currentUserId');
        window.location.href = 'Login.html';
        return;
      }

      // FIXED: Check if user is admin using the role property
      if (!currentUser.role || currentUser.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'Dashboard.html';
        return;
      }

      // Initialize admin data
      initializeAdminData();
      loadAdminData(currentUser);
      
      // Set today's date as default for attendance
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('attendanceDate').value = today;

      // Menu navigation
      const menuItems = document.querySelectorAll('.menu-item');
      const pageContents = document.querySelectorAll('.page-content');
      const pageTitle = document.getElementById('pageTitle');

      menuItems.forEach(item => {
        item.addEventListener('click', function() {
          if (this.id === 'logoutBtn') {
            if (confirm('Are you sure you want to logout?')) {
              localStorage.removeItem('currentUserId');
              window.location.href = 'index.html';
            }
            return;
          }

          const targetPage = this.getAttribute('data-page');
          menuItems.forEach(i => i.classList.remove('active'));
          this.classList.add('active');

          pageContents.forEach(page => page.classList.remove('active'));
          document.getElementById(targetPage).classList.add('active');

          const pageName = this.querySelector('.menu-text').textContent;
          pageTitle.textContent = `Admin Dashboard - ${pageName}`;

          // Load page-specific data
          loadPageData(targetPage);
        });
      });

      // Sidebar toggle (mobile)
      const sidebarToggle = document.getElementById('sidebarToggle');
      const sidebar = document.getElementById('sidebar');
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });

      // Assignment creation
      document.getElementById('createAssignment').addEventListener('click', function() {
        createAssignment();
      });

      // Mock test creation
      document.getElementById('createTest').addEventListener('click', function() {
        createMockTest();
      });

      // Attendance saving
      document.getElementById('saveAttendance').addEventListener('click', function() {
        saveAttendance();
      });

      // Load initial data
      loadPageData('overview');
    });

    function initializeAdminData() {
      // Initialize admin-specific data if not exists
      if (!localStorage.getItem('adminAssignments')) {
        localStorage.setItem('adminAssignments', JSON.stringify([]));
      }
      if (!localStorage.getItem('adminTests')) {
        localStorage.setItem('adminTests', JSON.stringify([]));
      }
      if (!localStorage.getItem('attendanceRecords')) {
        localStorage.setItem('attendanceRecords', JSON.stringify({}));
      }
    }

    function loadAdminData(admin) {
      // Update header
      document.getElementById('userName').textContent = admin.name;
      const firstLetter = admin.name.charAt(0).toUpperCase();
      document.getElementById('userAvatar').textContent = firstLetter;
    }

    function loadPageData(page) {
      switch(page) {
        case 'overview':
          loadOverviewData();
          break;
        case 'students':
          loadStudentsList();
          break;
        case 'attendance':
          loadAttendanceData();
          break;
        case 'assignments':
          loadAssignmentsList();
          break;
        case 'tests':
          loadTestsList();
          break;
        case 'submissions':
          loadSubmissionsList();
          break;
      }
    }

    function loadOverviewData() {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // FIXED: Filter students by checking role property instead of email
      const students = users.filter(u => !u.role || u.role !== 'admin');
      
      document.getElementById('totalStudents').textContent = students.length;
      
      // Mock data for present students today
      document.getElementById('presentToday').textContent = Math.floor(students.length * 0.85);
      
      const assignments = JSON.parse(localStorage.getItem('adminAssignments')) || [];
      document.getElementById('totalAssignments').textContent = assignments.length;
      
      const tests = JSON.parse(localStorage.getItem('adminTests')) || [];
      document.getElementById('totalTests').textContent = tests.length;

      // Load recent activity
      loadRecentActivity();
    }

    function loadRecentActivity() {
      const activities = [
        'New student Tanya registered',
        '5 assignments submitted today',
        'Attendance marked for 25 students',
        'New mock test created: JavaScript Basics',
        '3 students completed React test'
      ];

      const activityHtml = activities.map(activity => 
        `<div style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <i class="fas fa-circle" style="color: var(--success); font-size: 0.5rem; margin-right: 1rem;"></i>
          ${activity}
        </div>`
      ).join('');

      document.getElementById('recentActivity').innerHTML = activityHtml;
    }

    function loadStudentsList() {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // FIXED: Filter students by checking role property instead of email
      const students = users.filter(u => !u.role || u.role !== 'admin');
      
      const container = document.getElementById('studentsList');
      
      if (students.length === 0) {
        container.innerHTML = '<p class="loading">No students registered yet.</p>';
        return;
      }

      container.innerHTML = students.map(student => `
        <div class="student-card">
          <div class="student-header">
            <div class="student-avatar">${student.name.charAt(0).toUpperCase()}</div>
            <div class="student-info">
              <h4>${student.name}</h4>
              <p>${student.email}</p>
              <p>Full Stack Web Development</p>
              <p>ID: ${student.id}</p>
            </div>
          </div>
        </div>
      `).join('');
    }

    function loadAttendanceData() {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // FIXED: Filter students by checking role property instead of email
      const students = users.filter(u => !u.role || u.role !== 'admin');
      const selectedDate = document.getElementById('attendanceDate').value;
      
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
      const todayAttendance = attendanceRecords[selectedDate] || {};

      const container = document.getElementById('attendanceGrid');
      
      container.innerHTML = students.map(student => {
        const currentStatus = todayAttendance[student.id] || 'present';
        return `
          <div class="attendance-item">
            <div class="student-info-attendance">
              <strong>${student.name}</strong>
              <div class="student-email">${student.email}</div>
            </div>
            <div class="radio-group">
              <label>
                <input type="radio" name="attendance_${student.id}" value="present" ${currentStatus === 'present' ? 'checked' : ''}>
                Present
              </label>
              <label>
                <input type="radio" name="attendance_${student.id}" value="absent" ${currentStatus === 'absent' ? 'checked' : ''}>
                Absent
              </label>
              <label>
                <input type="radio" name="attendance_${student.id}" value="leave" ${currentStatus === 'leave' ? 'checked' : ''}>
                Leave
              </label>
            </div>
          </div>
        `;
      }).join('');

      // Load attendance history
      loadAttendanceHistory();
    }

    function loadAttendanceHistory() {
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
      const tbody = document.getElementById('attendanceHistory');
      
      const historyHtml = Object.entries(attendanceRecords).map(([date, records]) => {
        const present = Object.values(records).filter(status => status === 'present').length;
        const absent = Object.values(records).filter(status => status === 'absent').length;
        const leave = Object.values(records).filter(status => status === 'leave').length;
        const total = present + absent + leave;

        return `
          <tr>
            <td>${date}</td>
            <td><span class="badge badge-present">${present}</span></td>
            <td><span class="badge badge-absent">${absent}</span></td>
            <td><span class="badge badge-leave">${leave}</span></td>
            <td>${total}</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = historyHtml || '<tr><td colspan="5">No attendance records yet.</td></tr>';
    }

    function saveAttendance() {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // FIXED: Filter students by checking role property instead of email
      const students = users.filter(u => !u.role || u.role !== 'admin');
      const selectedDate = document.getElementById('attendanceDate').value;
      
      const attendanceData = {};
      
      students.forEach(student => {
        const radios = document.getElementsByName(`attendance_${student.id}`);
        const selectedRadio = Array.from(radios).find(radio => radio.checked);
        attendanceData[student.id] = selectedRadio ? selectedRadio.value : 'present';
      });

      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
      attendanceRecords[selectedDate] = attendanceData;
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

      showSuccessMessage('attendanceSuccess');
      loadAttendanceHistory();
    }

    function createAssignment() {
      const title = document.getElementById('assignmentTitle').value.trim();
      const subject = document.getElementById('assignmentSubject').value;
      const description = document.getElementById('assignmentDescription').value.trim();
      const dueDate = document.getElementById('assignmentDueDate').value;

      if (!title || !subject || !description || !dueDate) {
        alert('Please fill in all fields');
        return;
      }

      const assignment = {
        id: Date.now().toString(),
        title,
        subject,
        description,
        dueDate,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      const assignments = JSON.parse(localStorage.getItem('adminAssignments')) || [];
      assignments.push(assignment);
      localStorage.setItem('adminAssignments', JSON.stringify(assignments));

      // Clear form
      document.getElementById('assignmentTitle').value = '';
      document.getElementById('assignmentSubject').value = '';
      document.getElementById('assignmentDescription').value = '';
      document.getElementById('assignmentDueDate').value = '';

      showSuccessMessage('assignmentSuccess');
      loadAssignmentsList();
    }

    function createMockTest() {
      const title = document.getElementById('testTitle').value.trim();
      const subject = document.getElementById('testSubject').value;
      const description = document.getElementById('testDescription').value.trim();
      const duration = document.getElementById('testDuration').value;
      const questions = document.getElementById('testQuestions').value;

      if (!title || !subject || !description || !duration || !questions) {
        alert('Please fill in all fields');
        return;
      }

      const test = {
        id: Date.now().toString(),
        title,
        subject,
        description,
        duration: parseInt(duration),
        questions: parseInt(questions),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      const tests = JSON.parse(localStorage.getItem('adminTests')) || [];
      tests.push(test);
      localStorage.setItem('adminTests', JSON.stringify(tests));

      // Clear form
      document.getElementById('testTitle').value = '';
      document.getElementById('testSubject').value = '';
      document.getElementById('testDescription').value = '';
      document.getElementById('testDuration').value = '';
      document.getElementById('testQuestions').value = '';

      showSuccessMessage('testSuccess');
      loadTestsList();
    }

    function loadAssignmentsList() {
      const assignments = JSON.parse(localStorage.getItem('adminAssignments')) || [];
      const container = document.getElementById('assignmentsList');

      if (assignments.length === 0) {
        container.innerHTML = '<p class="loading">No assignments created yet.</p>';
        return;
      }

      container.innerHTML = assignments.map(assignment => `
        <div class="test-card">
          <div class="test-header">
            <div class="test-title">${assignment.title}</div>
            <span class="badge badge-${assignment.status === 'active' ? 'present' : 'pending'}">${assignment.status}</span>
          </div>
          <div class="test-meta">
            <span><i class="fas fa-book"></i> ${assignment.subject}</span>
            <span><i class="fas fa-calendar"></i> Due: ${assignment.dueDate}</span>
            <span><i class="fas fa-clock"></i> Created: ${assignment.createdDate}</span>
          </div>
          <p style="color: #666; margin: 1rem 0;">${assignment.description}</p>
        </div>
      `).join('');
    }

    function loadTestsList() {
      const tests = JSON.parse(localStorage.getItem('adminTests')) || [];
      const container = document.getElementById('testsList');

      if (tests.length === 0) {
        container.innerHTML = '<p class="loading">No mock tests created yet.</p>';
        return;
      }

      container.innerHTML = tests.map(test => `
        <div class="test-card">
          <div class="test-header">
            <div class="test-title">${test.title}</div>
            <span class="badge badge-${test.status === 'active' ? 'present' : 'pending'}">${test.status}</span>
          </div>
          <div class="test-meta">
            <span><i class="fas fa-book"></i> ${test.subject}</span>
            <span><i class="fas fa-clock"></i> ${test.duration} minutes</span>
            <span><i class="fas fa-question-circle"></i> ${test.questions} questions</span>
          </div>
          <p style="color: #666; margin: 1rem 0;">${test.description}</p>
        </div>
      `).join('');
    }

    function loadSubmissionsList() {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // FIXED: Filter students by checking role property instead of email
      const students = users.filter(u => !u.role || u.role !== 'admin');
      const tbody = document.getElementById('submissionsList');
      
      let submissions = [];
      
      // Collect all student submissions
      students.forEach(student => {
        if (student.assignments) {
          student.assignments.forEach(assignment => {
            submissions.push({
              studentName: student.name,
              studentEmail: student.email,
              assignmentTitle: assignment.title,
              submittedDate: assignment.date,
              status: 'submitted'
            });
          });
        }
      });

      if (submissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No submissions yet.</td></tr>';
        return;
      }

      tbody.innerHTML = submissions.map(submission => `
        <tr>
          <td>
            <strong>${submission.studentName}</strong><br>
            <small style="color: #666;">${submission.studentEmail}</small>
          </td>
          <td>${submission.assignmentTitle}</td>
          <td>${submission.submittedDate}</td>
          <td><span class="badge badge-submitted">${submission.status}</span></td>
          <td>
            <button class="btn btn-success btn-sm" onclick="gradeSubmission('${submission.studentEmail}', '${submission.assignmentTitle}')">
              <i class="fas fa-check"></i> Grade
            </button>
          </td>
        </tr>
      `).join('');
    }

    function gradeSubmission(studentEmail, assignmentTitle) {
      alert(`Grading feature for ${assignmentTitle} by ${studentEmail} will be implemented in the full version.`);
    }

    function showSuccessMessage(elementId) {
      const element = document.getElementById(elementId);
      element.classList.add('show');
      setTimeout(() => {
        element.classList.remove('show');
      }, 3000);
    }