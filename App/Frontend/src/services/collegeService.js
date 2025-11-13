// Mock colleges data
const mockColleges = [
  { _id: '1', name: 'National Institute of Technology, Surat', code: 'NIT-SRT', status: 'approved' },
  { _id: '2', name: 'Sardar Vallabhbhai National Institute of Technology', code: 'SVNIT', status: 'approved' },
  { _id: '3', name: 'Indian Institute of Technology, Bombay', code: 'IITB', status: 'approved' },
  { _id: '4', name: 'Delhi Technological University', code: 'DTU', status: 'approved' },
  { _id: '5', name: 'Birla Institute of Technology and Science', code: 'BITS', status: 'approved' },
];

export const collegeService = {
  // Get all approved colleges
  async getAllColleges() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockColleges.filter(c => c.status === 'approved'),
        });
      }, 300);
    });
  },

  // Get college by ID
  async getCollegeById(collegeId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const college = mockColleges.find(c => c._id === collegeId);
        if (college) {
          resolve({ data: college });
        } else {
          reject(new Error('College not found'));
        }
      }, 300);
    });
  },

  // Register a new college
  async registerCollege(collegeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCollege = {
          _id: Date.now().toString(),
          name: collegeData.name || '',
          code: collegeData.code || '',
          address: collegeData.address,
          status: 'pending',
        };
        mockColleges.push(newCollege);
        resolve({ data: newCollege });
      }, 500);
    });
  },

  // Update college status
  async updateCollegeStatus(collegeId, status) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const college = mockColleges.find(c => c._id === collegeId);
        if (college) {
          college.status = status;
          resolve({ data: college });
        } else {
          reject(new Error('College not found'));
        }
      }, 300);
    });
  },
};
